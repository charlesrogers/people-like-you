import Anthropic from '@anthropic-ai/sdk'
import type { CompositeProfile, User, NarrativeStrategy, NarrativeDraft, HardPreferences } from './types'
import { selectStrategy } from './narrative-strategy'
import { scoreDrafts } from './narrative-critic'
import { scoreWithEmbedding } from './embedding'

const anthropic = new Anthropic()

// ─── Multi-Stage Narrative Pipeline ───

export async function generateMatchAngle(
  userA: User,
  userB: User,
  compositeA: CompositeProfile,
  compositeB: CompositeProfile,
): Promise<{
  narrativeForA: string
  narrativeForB: string
  strategyForA: NarrativeStrategy | null
  strategyForB: NarrativeStrategy | null
  criticScoreA: number | null
  criticScoreB: number | null
  generationAttemptsA: number
  generationAttemptsB: number
  usedQuoteA: boolean
  usedQuoteB: boolean
}> {
  // Compute compatibility breakdown for strategy selection
  const breakdown = computeCompatibilityBreakdown(compositeA, compositeB)

  // Generate both angles in parallel using the multi-stage pipeline
  const [resultA, resultB] = await Promise.all([
    generateNarrativeWithPipeline(userA, userB, compositeA, compositeB, breakdown),
    generateNarrativeWithPipeline(userB, userA, compositeB, compositeA, breakdown),
  ])

  return {
    narrativeForA: resultA.narrative,
    narrativeForB: resultB.narrative,
    strategyForA: resultA.strategy,
    strategyForB: resultB.strategy,
    criticScoreA: resultA.criticScore,
    criticScoreB: resultB.criticScore,
    generationAttemptsA: resultA.generationAttempts,
    generationAttemptsB: resultB.generationAttempts,
    usedQuoteA: resultA.usedQuote,
    usedQuoteB: resultB.usedQuote,
  }
}

export async function generateNarrativeWithPipeline(
  recipient: User,
  subject: User,
  recipientProfile: CompositeProfile,
  subjectProfile: CompositeProfile,
  compatibilityBreakdown: Record<string, number>,
): Promise<{
  narrative: string
  strategy: NarrativeStrategy | null
  criticScore: number | null
  criticSubscores: { specificity: number; emotional_arc: number; authenticity: number; brevity: number; connection: number } | null
  generationAttempts: number
  usedQuote: boolean
}> {
  try {
    // Stage 1: Select strategy
    const strategy = selectStrategy(recipientProfile, subjectProfile, compatibilityBreakdown)

    // Stage 2: Select best quote
    const bestQuote = selectBestQuote(subjectProfile, strategy)

    // Stage 3: Generate 3 drafts in parallel
    const drafts = await generateDrafts(recipient, subject, recipientProfile, subjectProfile, strategy, bestQuote)

    // Stage 4: Score drafts with critic
    const { scores, winnerIndex, shouldRegenerate } = await scoreDrafts(
      drafts, recipientProfile, subjectProfile, strategy
    )

    let finalNarrative = drafts[winnerIndex].text
    let criticScore = scores[winnerIndex].total
    let winnerScores = scores[winnerIndex]
    let generationAttempts = 1

    // If below threshold, regenerate once with feedback
    if (shouldRegenerate) {
      generationAttempts = 2
      const feedback = scores[winnerIndex].feedback
      const regen = await regenerateWithFeedback(
        recipient, subject, recipientProfile, subjectProfile, strategy, bestQuote, feedback
      )
      if (regen) {
        const regenResult = await scoreDrafts(
          [regen], recipientProfile, subjectProfile, strategy
        )
        if (regenResult.scores[0].total > criticScore) {
          finalNarrative = regen.text
          criticScore = regenResult.scores[0].total
          winnerScores = regenResult.scores[0]
        }
      }
    }

    return {
      narrative: finalNarrative,
      strategy,
      criticScore,
      criticSubscores: {
        specificity: winnerScores.specificity,
        emotional_arc: winnerScores.emotional_arc,
        authenticity: winnerScores.authenticity,
        brevity: winnerScores.brevity,
        connection: winnerScores.connection,
      },
      generationAttempts,
      usedQuote: bestQuote !== null && finalNarrative.includes(bestQuote),
    }
  } catch {
    // Fallback to single-shot generation if pipeline fails
    const narrative = await writeAngleFallback(recipient, subject, recipientProfile, subjectProfile)
    return { narrative, strategy: null, criticScore: null, criticSubscores: null, generationAttempts: 1, usedQuote: false }
  }
}

// ─── Draft Generation ───

async function generateDrafts(
  recipient: User,
  subject: User,
  recipientProfile: CompositeProfile,
  subjectProfile: CompositeProfile,
  strategy: NarrativeStrategy,
  bestQuote: string | null,
): Promise<NarrativeDraft[]> {
  const emphases: Array<{ style: NarrativeDraft['styleEmphasis']; instruction: string }> = [
    {
      style: 'specificity',
      instruction: 'Prioritize specificity above all. Use concrete details from their voice memos — named interests, actual quotes, particular stories. Every detail should be something only THIS person could have said.',
    },
    {
      style: 'emotional_arc',
      instruction: 'Prioritize emotional arc. Build anticipation in the first sentence, create curiosity in the middle, and deliver a payoff at the end. The reader should feel something.',
    },
    {
      style: 'brevity',
      instruction: 'Prioritize brevity and punch. Make every single word earn its place. If you can say it in 2 sentences, do not use 3. The shortest draft wins if it hits as hard.',
    },
  ]

  const basePrompt = buildNarrativePrompt(recipient, subject, recipientProfile, subjectProfile, strategy, bestQuote)

  const drafts = await Promise.all(
    emphases.map(async ({ style, instruction }) => {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `${basePrompt}\n\n## Style emphasis for this draft:\n${instruction}`,
        }],
      })

      return {
        text: message.content[0].type === 'text'
          ? message.content[0].text
          : 'There\'s someone here you need to meet.',
        styleEmphasis: style,
      } as NarrativeDraft
    })
  )

  return drafts
}

async function regenerateWithFeedback(
  recipient: User,
  subject: User,
  recipientProfile: CompositeProfile,
  subjectProfile: CompositeProfile,
  strategy: NarrativeStrategy,
  bestQuote: string | null,
  feedback: string,
): Promise<NarrativeDraft | null> {
  try {
    const basePrompt = buildNarrativePrompt(recipient, subject, recipientProfile, subjectProfile, strategy, bestQuote)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `${basePrompt}\n\n## IMPORTANT — Previous drafts were too generic. Fix this:\n${feedback}\n\nWrite a MORE SPECIFIC version that addresses the feedback above.`,
      }],
    })

    return {
      text: message.content[0].type === 'text' ? message.content[0].text : null,
      styleEmphasis: 'specificity',
    } as NarrativeDraft
  } catch {
    return null
  }
}

function buildNarrativePrompt(
  recipient: User,
  subject: User,
  recipientProfile: CompositeProfile,
  subjectProfile: CompositeProfile,
  strategy: NarrativeStrategy,
  bestQuote: string | null,
): string {
  const quoteInstruction = bestQuote
    ? `\n## Best quote from ${subject.first_name}:\n"${bestQuote}"\nWeave this quote naturally into the narrative as the emotional peak — don't just drop it in, set it up with context.`
    : ''

  return `You are the world's best matchmaker — the friend who just GETS it. You're writing a pitch TO ${recipient.first_name} about why they should be genuinely excited to meet ${subject.first_name}.

## Narrative Strategy: ${strategy.type} (${strategy.tier})
${strategy.rationale}

## Key data points to use:
${strategy.dataPoints.map(d => `- ${d}`).join('\n')}

## MANDATORY elements (must include BOTH):
- Self-expansion signal: ${strategy.mandatoryElements.selfExpansionSignal}
- Admiration signal: ${strategy.mandatoryElements.admirationSignal}

## ${recipient.first_name} (who you're writing TO):
- Excitement type: ${recipientProfile.excitement_type || 'explorer'}
- Values: ${recipientProfile.values.join(', ') || 'unknown'}
- Interests: ${recipientProfile.interest_tags.join(', ') || 'unknown'}
- What they notice/are moved by: ${recipientProfile.aesthetic_resonance?.what_moves_them?.join(', ') || 'unknown'}

## ${subject.first_name} (who you're writing ABOUT):
- Passions: ${subjectProfile.passion_indicators.join(', ') || 'unknown'}
- Values: ${subjectProfile.values.join(', ') || 'unknown'}
- Interests: ${subjectProfile.interest_tags.join(', ') || 'unknown'}
- Humor: ${subjectProfile.humor_signature?.what_makes_them_laugh?.join(', ') || subjectProfile.humor_style || 'unknown'}
- Vulnerability/authenticity: ${subjectProfile.vulnerability_authenticity}/1.0
- Their own words: ${subjectProfile.notable_quotes.slice(0, 3).map(q => `"${q}"`).join(' | ') || 'none'}
- Values-in-action: ${(subjectProfile.values_in_action ?? []).slice(0, 2).join('; ') || 'none'}
- Friend vouches: ${(subjectProfile.friend_vouch_quotes ?? []).slice(0, 2).map(q => `"${q}"`).join(' | ') || 'none'}
${quoteInstruction}

## Rules:
- Write 3-4 sentences MAX. Every word earns its place.
- Connect a specific detail from ${subject.first_name} to something ${recipient.first_name} would care about.
- Feel like a friend pulling them aside at a party: "Okay, you need to meet someone."
- NO physical appearance. NO generic phrases like "you both enjoy" or "compatible personalities."
- The reader should finish and secretly hope this person says yes to them.
- Write in second person ("you").`
}

// ─── Quote Selection ───

function selectBestQuote(profile: CompositeProfile, strategy: NarrativeStrategy): string | null {
  const allQuotes = [
    ...(profile.friend_vouch_quotes ?? []).map(q => ({ text: q, source: 'vouch' as const })),
    ...profile.notable_quotes.map(q => ({ text: q, source: 'self' as const })),
  ]

  if (allQuotes.length === 0) return null

  // Score each quote
  const scored = allQuotes.map(({ text, source }) => {
    let score = 0

    // Brevity: under 15 words = +2, 15-30 = +1, over 30 = 0
    const wordCount = text.split(/\s+/).length
    if (wordCount <= 15) score += 2
    else if (wordCount <= 30) score += 1

    // Source: vouch quotes get +1 (third-party credibility)
    if (source === 'vouch') score += 1

    // Relevance to strategy: check if quote relates to strategy tier
    const lowerText = text.toLowerCase()
    if (strategy.tier === 'admiration' && (lowerText.includes('proud') || lowerText.includes('always'))) score += 1
    if (strategy.tier === 'i_sharing' && (lowerText.includes('laugh') || lowerText.includes('notice'))) score += 1
    if (strategy.tier === 'comfort' && (lowerText.includes('safe') || lowerText.includes('feel'))) score += 1
    if (strategy.tier === 'self_expansion' && (lowerText.includes('learn') || lowerText.includes('discover'))) score += 1

    // Specificity: quotes with concrete nouns score higher
    if (/\b(morning|night|year|day|time|place|people|friend)\b/.test(lowerText)) score += 1

    return { text, score }
  })

  scored.sort((a, b) => b.score - a.score)

  // Only return if score >= 3 (threshold)
  return scored[0].score >= 3 ? scored[0].text : null
}

// ─── Compatibility Scoring ───

export function computeCompatibilityBreakdown(a: CompositeProfile, b: CompositeProfile): Record<string, number> {
  const breakdown: Record<string, number> = {}

  // Values overlap
  if (a.values.length && b.values.length) {
    const shared = a.values.filter(v => b.values.includes(v)).length
    const total = new Set([...a.values, ...b.values]).size
    breakdown.values_overlap = shared / total
  }

  // Interest novelty
  if (a.interest_tags.length && b.interest_tags.length) {
    const novelForA = b.interest_tags.filter(t => !a.interest_tags.includes(t)).length
    breakdown.interest_novelty = novelForA / Math.max(b.interest_tags.length, 1)
  }

  // Communication compatibility
  if (a.communication_warmth !== null && b.communication_warmth !== null) {
    breakdown.communication_fit = 1 - Math.abs(a.communication_warmth - b.communication_warmth)
  }

  // Vulnerability match
  if (a.vulnerability_authenticity !== null && b.vulnerability_authenticity !== null) {
    breakdown.vulnerability_match = Math.min(a.vulnerability_authenticity, b.vulnerability_authenticity)
  }

  return breakdown
}

/**
 * Score compatibility — uses embedding-based scoring when available,
 * falls back to hand-tuned scorer.
 * Optional User params enable life-stage age sanity check + kids/faith soft bonuses.
 */
export function scoreCompatibility(
  a: CompositeProfile, b: CompositeProfile,
  userA?: User, userB?: User,
  userAPrefs?: HardPreferences | null, userBPrefs?: HardPreferences | null,
): number {
  // Try embedding-based scoring first (Phase 5)
  if (a.embedding && b.embedding) {
    return scoreWithEmbedding(a, b)
  }

  // Fall back to hand-tuned scorer
  let score = scoreCompatibilityHandTuned(a, b, userA, userB)

  // Kids/faith soft bonuses (Rule 9) — small multipliers for aligned preferences
  if (userAPrefs && userBPrefs) {
    score *= getPreferenceAlignmentMultiplier(userAPrefs, userBPrefs, userA, userB)
  }

  return Math.round(score * 100) / 100
}

function scoreCompatibilityHandTuned(
  a: CompositeProfile, b: CompositeProfile,
  userA?: User, userB?: User,
): number {
  let score = 0
  let factors = 0

  // 1. Values overlap (shared values are strong signal)
  if (a.values.length && b.values.length) {
    const shared = a.values.filter(v => b.values.includes(v)).length
    const total = new Set([...a.values, ...b.values]).size
    score += (shared / total) * 1.5
    factors += 1.5
  }

  // 2. Complementary Big Five (some distance = self-expansion, but not too much)
  const a5 = a.big_five_proxy as Record<string, number>
  const b5 = b.big_five_proxy as Record<string, number>
  if (a5.openness !== undefined && b5.openness !== undefined) {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
    let traitScore = 0
    for (const t of traits) {
      const diff = Math.abs((a5[t] || 0.5) - (b5[t] || 0.5))
      if (diff >= 0.1 && diff <= 0.3) traitScore += 1
      else if (diff < 0.1) traitScore += 0.7
      else if (diff <= 0.5) traitScore += 0.4
      else traitScore += 0.1
    }
    score += (traitScore / traits.length)
    factors += 1
  }

  // 3. Interest intersection (novel overlap > obvious overlap)
  if (a.interest_tags.length && b.interest_tags.length) {
    const shared = a.interest_tags.filter(t => b.interest_tags.includes(t)).length
    const novelForA = b.interest_tags.filter(t => !a.interest_tags.includes(t)).length
    const interestScore = (shared * 0.3 + novelForA * 0.7) / Math.max(b.interest_tags.length, 1)
    score += Math.min(interestScore, 1)
    factors += 1
  }

  // 4. Communication style compatibility
  if (a.communication_warmth !== null && b.communication_warmth !== null) {
    const warmthDiff = Math.abs(a.communication_warmth - b.communication_warmth)
    score += (1 - warmthDiff) * 0.5
    factors += 0.5
  }

  // 5. Life-stage alignment (TEST: half weight — 0.35)
  // See ongoing_tests.md Test 1, model-rules.md Rule 9
  if (userA && userB) {
    const lifeStageScore = scoreLifeStageAlignment(a, b, userA, userB)
    if (lifeStageScore !== null) {
      score += lifeStageScore * 0.35
      factors += 0.35
    }
  }

  return factors > 0 ? Math.round((score / factors) * 100) / 100 : 0.5
}

// --- Life-Stage Scoring (Rule 9, Layer 2) ---

const CHAPTER_COMPAT: Record<string, Record<string, number>> = {
  launching:    { launching: 1.0, building: 0.8, established: 0.4, reinventing: 0.6 },
  building:     { launching: 0.8, building: 1.0, established: 0.7, reinventing: 0.5 },
  established:  { launching: 0.4, building: 0.7, established: 1.0, reinventing: 0.6 },
  reinventing:  { launching: 0.6, building: 0.5, established: 0.6, reinventing: 1.0 },
}

function getChapterCompatibility(a: string | null, b: string | null): number {
  if (!a || !b) return 0.5
  return CHAPTER_COMPAT[a]?.[b] ?? 0.5
}

function scoreLifeStageAlignment(
  a: CompositeProfile, b: CompositeProfile,
  userA: User, userB: User,
): number | null {
  if (!a.life_stage || !b.life_stage) return null
  if (a.life_stage.confidence <= 0.3 || b.life_stage.confidence <= 0.3) return null

  // Age sanity check (Rule 9 safeguard): if chapter is "launching" but user is 35+, skip
  const currentYear = new Date().getFullYear()
  for (const [profile, user] of [[a, userA], [b, userB]] as [CompositeProfile, User][]) {
    if (
      profile.life_stage?.life_chapter === 'launching' &&
      user.birth_year &&
      (currentYear - user.birth_year) >= 35
    ) {
      return null
    }
  }

  let score = 0

  // Rootedness proximity (30%)
  const rootednessDiff = Math.abs(a.life_stage.rootedness - b.life_stage.rootedness)
  score += (1 - rootednessDiff) * 0.3

  // Life pace proximity (30%)
  const paceDiff = Math.abs(a.life_stage.life_pace - b.life_stage.life_pace)
  score += (1 - paceDiff) * 0.3

  // Life chapter compatibility (20%)
  score += getChapterCompatibility(a.life_stage.life_chapter, b.life_stage.life_chapter) * 0.2

  // Trajectory momentum proximity (20%) — penalized less
  const momentumDiff = Math.abs(a.life_stage.trajectory_momentum - b.life_stage.trajectory_momentum)
  score += (1 - momentumDiff * 0.5) * 0.2

  return score
}

// --- Preference Alignment Soft Bonuses (Rule 9) ---

function getPreferenceAlignmentMultiplier(
  prefsA: HardPreferences, prefsB: HardPreferences,
  userA?: User, userB?: User,
): number {
  let multiplier = 1.0

  // Kids alignment bonus
  if (prefsA.kids && prefsB.kids) {
    if (prefsA.kids === prefsB.kids) multiplier *= 1.05
    else if (prefsA.kids === 'open' || prefsB.kids === 'open') multiplier *= 1.02
  }

  // Faith alignment bonus
  if (userA && userB && prefsA.faith_importance && prefsB.faith_importance) {
    if (
      prefsA.faith_importance === prefsB.faith_importance &&
      userA.religion && userB.religion && userA.religion === userB.religion
    ) {
      multiplier *= 1.05
    }
    if (
      (prefsA.observance_match === 'prefer_same' || prefsB.observance_match === 'prefer_same') &&
      userA.observance_level && userB.observance_level &&
      userA.observance_level === userB.observance_level
    ) {
      multiplier *= 1.03
    }
  }

  return multiplier
}

// ─── Candidate Selection ───

export async function selectNextCandidate(
  userId: string
): Promise<{ candidate: User; score: number; lifeStageScore: number | null } | null> {
  const { getUser, getCompatibleUsers, getCompositeProfile, getPreviouslyShownUserIds, getHardPreferences, getHardPreferencesForUsers } = await import('./db')

  const user = await getUser(userId)
  if (!user) return null

  const userComposite = await getCompositeProfile(userId)
  const previouslyShown = await getPreviouslyShownUserIds(userId)
  let candidates = await getCompatibleUsers(user)
  let fresh = candidates.filter(c => !previouslyShown.includes(c.id))

  // If too few fresh candidates after filtering shown users, widen Elo range
  let allCompatible = candidates
  if (fresh.length < 3) {
    allCompatible = await getCompatibleUsers(user, 300)
    fresh = allCompatible.filter(c => !previouslyShown.includes(c.id))
  }

  if (fresh.length === 0) {
    // Re-pitch: candidates who were passed 60+ days ago get a second chance with fresh narrative
    const { getRePitchCandidateIds } = await import('./db')
    const rePitchIds = await getRePitchCandidateIds(userId, 60)
    const rePitchCandidates = allCompatible.filter(c => rePitchIds.includes(c.id))
    if (rePitchCandidates.length === 0) return null
    fresh = rePitchCandidates
  }

  // Fetch hard preferences for soft bonus scoring
  const userPrefs = await getHardPreferences(userId)
  const candidatePrefsMap = await getHardPreferencesForUsers(fresh.map(c => c.id))

  // Location tier scoring
  const { getLocationTier, getTierMultiplier, userToLocation } = await import('./geo')
  const userLoc = userToLocation(user)

  const scored = await Promise.all(
    fresh.map(async (candidate) => {
      const candidateComposite = await getCompositeProfile(candidate.id)
      const candPrefs = candidatePrefsMap.get(candidate.id)
      let score = userComposite && candidateComposite
        ? scoreCompatibility(userComposite, candidateComposite, user, candidate, userPrefs, candPrefs)
        : 0.5
      // Compute life-stage sub-score for logging on match record (Test 1)
      const lifeStageScore = userComposite && candidateComposite
        ? scoreLifeStageAlignment(userComposite, candidateComposite, user, candidate)
        : null
      // Apply location tier multiplier
      const candLoc = userToLocation(candidate)
      const locationTier = getLocationTier(userLoc, candLoc)
      score *= getTierMultiplier(locationTier)
      return { candidate, score, lifeStageScore }
    })
  )

  scored.sort((a, b) => b.score - a.score)
  return scored[0] || null
}

// ─── Legacy Fallback ───

async function writeAngleFallback(
  recipient: User,
  subject: User,
  recipientProfile: CompositeProfile,
  subjectProfile: CompositeProfile,
): Promise<string> {
  const excitementType = recipientProfile.excitement_type || 'explorer'
  const styleMap: Record<string, string> = {
    explorer: 'Lead with the most unexpected, novel detail.',
    nester: 'Lead with character, warmth, and values alignment.',
    intellectual: 'Lead with what this person is passionate or deeply skilled at.',
    spark: 'Lead with personality, humor, and energy.',
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `You are a matchmaker writing a 3-4 sentence pitch TO ${recipient.first_name} about ${subject.first_name}.

Style: ${styleMap[excitementType] || styleMap.explorer}

${subject.first_name}'s data:
- Passions: ${subjectProfile.passion_indicators.join(', ') || 'unknown'}
- Values: ${subjectProfile.values.join(', ') || 'unknown'}
- Quotes: ${subjectProfile.notable_quotes.slice(0, 2).map(q => `"${q}"`).join(' | ') || 'none'}

Rules: 3-4 sentences, specific, no physical appearance, no generic phrases. Write in second person.`,
    }],
  })

  return message.content[0].type === 'text'
    ? message.content[0].text
    : 'There\'s someone here you need to meet. Trust us on this one.'
}
