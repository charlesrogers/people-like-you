import Anthropic from '@anthropic-ai/sdk'
import type { CompositeProfile, User, NarrativeStrategy, NarrativeDraft } from './types'
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

    // If below threshold, regenerate once with feedback
    if (shouldRegenerate) {
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
        }
      }
    }

    return {
      narrative: finalNarrative,
      strategy,
      criticScore,
      usedQuote: bestQuote !== null && finalNarrative.includes(bestQuote),
    }
  } catch {
    // Fallback to single-shot generation if pipeline fails
    const narrative = await writeAngleFallback(recipient, subject, recipientProfile, subjectProfile)
    return { narrative, strategy: null, criticScore: null, usedQuote: false }
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
 */
export function scoreCompatibility(a: CompositeProfile, b: CompositeProfile): number {
  // Try embedding-based scoring first (Phase 5)
  if (a.embedding && b.embedding) {
    return scoreWithEmbedding(a, b)
  }

  // Fall back to hand-tuned scorer
  return scoreCompatibilityHandTuned(a, b)
}

function scoreCompatibilityHandTuned(a: CompositeProfile, b: CompositeProfile): number {
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

  return factors > 0 ? Math.round((score / factors) * 100) / 100 : 0.5
}

// ─── Candidate Selection ───

export async function selectNextCandidate(
  userId: string
): Promise<{ candidate: User; score: number } | null> {
  const { getUser, getCompatibleUsers, getCompositeProfile, getPreviouslyShownUserIds } = await import('./db')

  const user = await getUser(userId)
  if (!user) return null

  const userComposite = await getCompositeProfile(userId)
  const previouslyShown = await getPreviouslyShownUserIds(userId)
  const candidates = await getCompatibleUsers(user)

  const fresh = candidates.filter(c => !previouslyShown.includes(c.id))
  if (fresh.length === 0) return null

  const scored = await Promise.all(
    fresh.map(async (candidate) => {
      const candidateComposite = await getCompositeProfile(candidate.id)
      const score = userComposite && candidateComposite
        ? scoreCompatibility(userComposite, candidateComposite)
        : 0.5
      return { candidate, score }
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
