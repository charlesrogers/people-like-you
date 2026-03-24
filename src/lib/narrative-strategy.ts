import type {
  CompositeProfile,
  NarrativeStrategy,
  NarrativeStrategyTier,
  NarrativeStrategyType,
} from './types'

interface StrategyCandidate {
  tier: NarrativeStrategyTier
  type: NarrativeStrategyType
  score: number
  rationale: string
  dataPoints: string[]
  selfExpansionSignal: string
  admirationSignal: string
}

// Map strategy types to their tier
const STRATEGY_TIERS: Record<NarrativeStrategyType, NarrativeStrategyTier> = {
  novel_world: 'self_expansion',
  complementary_growth: 'self_expansion',
  perspective_gap: 'self_expansion',
  humor_resonance: 'i_sharing',
  aesthetic_sync: 'i_sharing',
  emotional_processing_match: 'i_sharing',
  values_in_action: 'admiration',
  demonstrated_mastery: 'admiration',
  social_proof: 'admiration',
  vulnerability_anchor: 'admiration',
  warmth_priming: 'comfort',
  communication_fit: 'comfort',
}

/**
 * Select the best narrative strategy for presenting a subject to a recipient.
 *
 * Scores all 12 strategies across 4 tiers, applies excitement-type modifiers,
 * ensures mandatory elements, and returns the winning strategy.
 */
export function selectStrategy(
  recipient: CompositeProfile,
  subject: CompositeProfile,
  compatibilityBreakdown: Record<string, number>,
): NarrativeStrategy {
  const candidates = scoreAllStrategies(recipient, subject, compatibilityBreakdown)

  // Apply excitement_type modifiers
  applyExcitementModifiers(candidates, recipient.excitement_type)

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score)

  // If top two are within 10%, randomly pick one (exploration)
  let winner = candidates[0]
  if (candidates.length >= 2) {
    const top = candidates[0].score
    const second = candidates[1].score
    if (top > 0 && (top - second) / top <= 0.1) {
      winner = Math.random() < 0.5 ? candidates[0] : candidates[1]
    }
  }

  return {
    tier: winner.tier,
    type: winner.type,
    rationale: winner.rationale,
    dataPoints: winner.dataPoints,
    mandatoryElements: {
      selfExpansionSignal: winner.selfExpansionSignal,
      admirationSignal: winner.admirationSignal,
    },
  }
}

export function scoreAllStrategies(
  recipient: CompositeProfile,
  subject: CompositeProfile,
  breakdown: Record<string, number>,
): StrategyCandidate[] {
  const candidates: StrategyCandidate[] = []

  // -------------------------------------------------------
  // Tier 1: Self-Expansion
  // -------------------------------------------------------

  // novel_world: count subject interests NOT in recipient
  const novelInterests = subject.interest_tags.filter(
    (t) => !recipient.interest_tags.includes(t),
  )
  const novelScore = Math.min(novelInterests.length / 5, 1) // cap at 5 novel interests = 1.0
  candidates.push({
    tier: 'self_expansion',
    type: 'novel_world',
    score: novelScore,
    rationale: `${subject.interest_tags.length > 0 ? novelInterests.length : 0} interests the recipient hasn't encountered yet`,
    dataPoints: novelInterests.slice(0, 5),
    selfExpansionSignal: novelInterests.length > 0
      ? `Introduces entirely new worlds: ${novelInterests.slice(0, 3).join(', ')}`
      : 'Brings fresh perspectives to shared interests',
    admirationSignal: buildAdmirationSignal(subject),
  })

  // complementary_growth: strength→growth edge mappings
  const growthMappings = findComplementaryGrowth(recipient, subject)
  const compGrowthScore = Math.min(growthMappings.length / 3, 1)
  candidates.push({
    tier: 'self_expansion',
    type: 'complementary_growth',
    score: compGrowthScore,
    rationale: `${growthMappings.length} complementary strength-to-growth-edge mappings found`,
    dataPoints: growthMappings,
    selfExpansionSignal: growthMappings.length > 0
      ? `Their strength in ${growthMappings[0]} complements your growth edge`
      : 'Complementary strengths create mutual growth potential',
    admirationSignal: buildAdmirationSignal(subject),
  })

  // perspective_gap: (1 - surface_similarity) * deep_compatibility
  const surfaceSimilarity = breakdown['surface_similarity'] ?? computeSurfaceSimilarity(recipient, subject)
  const deepCompatibility = breakdown['deep_compatibility'] ?? computeDeepCompatibility(recipient, subject)
  const perspectiveGapScore = (1 - surfaceSimilarity) * deepCompatibility
  candidates.push({
    tier: 'self_expansion',
    type: 'perspective_gap',
    score: perspectiveGapScore,
    rationale: `Low surface similarity (${(surfaceSimilarity * 100).toFixed(0)}%) but high deep compatibility (${(deepCompatibility * 100).toFixed(0)}%) — the "wouldn't expect it" angle`,
    dataPoints: [
      `Surface similarity: ${(surfaceSimilarity * 100).toFixed(0)}%`,
      `Deep compatibility: ${(deepCompatibility * 100).toFixed(0)}%`,
    ],
    selfExpansionSignal: 'Different on the surface, deeply aligned where it counts',
    admirationSignal: buildAdmirationSignal(subject),
  })

  // -------------------------------------------------------
  // Tier 2: I-Sharing
  // -------------------------------------------------------

  // humor_resonance: humor_signature similarity
  const humorScore = scoreHumorResonance(recipient, subject)
  candidates.push({
    tier: 'i_sharing',
    type: 'humor_resonance',
    score: humorScore.score,
    rationale: humorScore.rationale,
    dataPoints: humorScore.dataPoints,
    selfExpansionSignal: buildSelfExpansionSignal(recipient, subject),
    admirationSignal: buildAdmirationSignal(subject),
  })

  // aesthetic_sync: aesthetic_resonance overlap
  const aestheticScore = scoreAestheticSync(recipient, subject)
  candidates.push({
    tier: 'i_sharing',
    type: 'aesthetic_sync',
    score: aestheticScore.score,
    rationale: aestheticScore.rationale,
    dataPoints: aestheticScore.dataPoints,
    selfExpansionSignal: buildSelfExpansionSignal(recipient, subject),
    admirationSignal: buildAdmirationSignal(subject),
  })

  // emotional_processing_match: processing style similarity
  const emotionalScore = scoreEmotionalProcessingMatch(recipient, subject)
  candidates.push({
    tier: 'i_sharing',
    type: 'emotional_processing_match',
    score: emotionalScore.score,
    rationale: emotionalScore.rationale,
    dataPoints: emotionalScore.dataPoints,
    selfExpansionSignal: buildSelfExpansionSignal(recipient, subject),
    admirationSignal: buildAdmirationSignal(subject),
  })

  // -------------------------------------------------------
  // Tier 3: Admiration
  // -------------------------------------------------------

  // values_in_action: count stories
  const via = subject.values_in_action ?? []
  const viaCount = via.length
  const viaScore = Math.min(viaCount / 3, 1)
  candidates.push({
    tier: 'admiration',
    type: 'values_in_action',
    score: viaScore,
    rationale: `${viaCount} values-in-action stories available to showcase character`,
    dataPoints: via.slice(0, 3),
    selfExpansionSignal: buildSelfExpansionSignal(recipient, subject),
    admirationSignal: viaCount > 0
      ? `Lives their values: ${via[0]}`
      : 'Character shines through in how they treat people',
  })

  // demonstrated_mastery: competence stories available
  const comp = subject.demonstrated_competence ?? []
  const compCount = comp.length
  const masteryScore = Math.min(compCount / 3, 1)
  candidates.push({
    tier: 'admiration',
    type: 'demonstrated_mastery',
    score: masteryScore,
    rationale: `${compCount} competence stories demonstrate real depth`,
    dataPoints: comp.slice(0, 3),
    selfExpansionSignal: buildSelfExpansionSignal(recipient, subject),
    admirationSignal: compCount > 0
      ? `Has mastered: ${comp[0]}`
      : 'Brings genuine expertise and depth',
  })

  // social_proof: friend vouch data available
  const vouches = subject.friend_vouch_quotes ?? []
  const vouchCount = vouches.length
  const socialScore = Math.min(vouchCount / 2, 1) // 2 vouches = max
  candidates.push({
    tier: 'admiration',
    type: 'social_proof',
    score: socialScore,
    rationale: `${vouchCount} friend vouches provide third-party validation`,
    dataPoints: vouches.slice(0, 3),
    selfExpansionSignal: buildSelfExpansionSignal(recipient, subject),
    admirationSignal: vouchCount > 0
      ? `Their friends say: "${vouches[0]}"`
      : 'Valued and vouched for by those who know them best',
  })

  // vulnerability_anchor: vulnerability/authenticity score
  const vulnScore = subject.vulnerability_authenticity ?? 0
  candidates.push({
    tier: 'admiration',
    type: 'vulnerability_anchor',
    score: vulnScore,
    rationale: `Vulnerability/authenticity signal at ${(vulnScore * 100).toFixed(0)}% — ${vulnScore > 0.7 ? 'strong anchor for genuine connection' : 'moderate openness detected'}`,
    dataPoints: vulnScore > 0.5
      ? ['High authenticity in self-disclosure', ...subject.notable_quotes.slice(0, 2)]
      : ['Some authentic moments detected'],
    selfExpansionSignal: buildSelfExpansionSignal(recipient, subject),
    admirationSignal: vulnScore > 0.7
      ? 'Refreshingly honest and self-aware'
      : 'Shows genuine authenticity',
  })

  // -------------------------------------------------------
  // Tier 4: Comfort
  // -------------------------------------------------------

  // warmth_priming: subject warmth * recipient needs reassurance
  const subjectWarmth = subject.communication_warmth ?? 0.5
  const recipientReassurance = recipient.attachment_proxy?.reassurance_seeking ?? 0.5
  const warmthScore = subjectWarmth * recipientReassurance
  candidates.push({
    tier: 'comfort',
    type: 'warmth_priming',
    score: warmthScore,
    rationale: `Subject warmth (${(subjectWarmth * 100).toFixed(0)}%) meets recipient's reassurance need (${(recipientReassurance * 100).toFixed(0)}%)`,
    dataPoints: [
      `Subject communication warmth: ${(subjectWarmth * 100).toFixed(0)}%`,
      ...subject.kindness_markers.slice(0, 2),
    ],
    selfExpansionSignal: buildSelfExpansionSignal(recipient, subject),
    admirationSignal: buildAdmirationSignal(subject),
  })

  // communication_fit: style compatibility
  const commFitScore = scoreCommFit(recipient, subject)
  candidates.push({
    tier: 'comfort',
    type: 'communication_fit',
    score: commFitScore.score,
    rationale: commFitScore.rationale,
    dataPoints: commFitScore.dataPoints,
    selfExpansionSignal: buildSelfExpansionSignal(recipient, subject),
    admirationSignal: buildAdmirationSignal(subject),
  })

  return candidates
}

// -------------------------------------------------------
// Excitement-type modifiers
// -------------------------------------------------------

export function applyExcitementModifiers(
  candidates: StrategyCandidate[],
  excitementType: CompositeProfile['excitement_type'],
): void {
  if (!excitementType) return

  for (const c of candidates) {
    switch (excitementType) {
      case 'explorer':
        // Boost Tier 1 (self-expansion) by 1.5x
        if (c.tier === 'self_expansion') c.score *= 1.5
        break
      case 'intellectual':
        // Boost Tier 1 + Tier 3
        if (c.tier === 'self_expansion' || c.tier === 'admiration') c.score *= 1.3
        break
      case 'spark':
        // Boost Tier 2 (i-sharing) by 1.5x
        if (c.tier === 'i_sharing') c.score *= 1.5
        break
      case 'nester':
        // Boost Tier 3 + Tier 4
        if (c.tier === 'admiration' || c.tier === 'comfort') c.score *= 1.3
        break
    }
  }
}

// -------------------------------------------------------
// Scoring helpers
// -------------------------------------------------------

function computeSurfaceSimilarity(a: CompositeProfile, b: CompositeProfile): number {
  if (!a.interest_tags.length || !b.interest_tags.length) return 0.5
  const shared = a.interest_tags.filter((t) => b.interest_tags.includes(t)).length
  const total = new Set([...a.interest_tags, ...b.interest_tags]).size
  return total > 0 ? shared / total : 0.5
}

function computeDeepCompatibility(a: CompositeProfile, b: CompositeProfile): number {
  let score = 0
  let factors = 0

  // Values overlap
  if (a.values.length && b.values.length) {
    const shared = a.values.filter((v) => b.values.includes(v)).length
    const total = new Set([...a.values, ...b.values]).size
    score += shared / total
    factors += 1
  }

  // Emotional processing alignment
  if (a.emotional_processing && b.emotional_processing) {
    const logicDiff = Math.abs(a.emotional_processing.logic_vs_emotion - b.emotional_processing.logic_vs_emotion)
    score += 1 - logicDiff
    factors += 1
  }

  // Communication warmth proximity
  if (a.communication_warmth !== null && b.communication_warmth !== null) {
    score += 1 - Math.abs(a.communication_warmth - b.communication_warmth)
    factors += 1
  }

  return factors > 0 ? score / factors : 0.5
}

function findComplementaryGrowth(recipient: CompositeProfile, subject: CompositeProfile): string[] {
  const mappings: string[] = []
  const r5 = recipient.big_five_proxy
  const s5 = subject.big_five_proxy

  const traitLabels: Record<string, [string, string]> = {
    openness: ['curiosity', 'open-mindedness'],
    conscientiousness: ['discipline', 'organization'],
    extraversion: ['social energy', 'outgoingness'],
    agreeableness: ['empathy', 'warmth'],
    neuroticism: ['emotional sensitivity', 'emotional awareness'],
  }

  for (const [trait, [strengthLabel]] of Object.entries(traitLabels)) {
    const rVal = r5[trait] ?? 0.5
    const sVal = s5[trait] ?? 0.5
    // Subject is strong where recipient has a growth edge (>0.2 diff, subject higher)
    if (sVal - rVal > 0.2) {
      mappings.push(`${strengthLabel} (their ${(sVal * 100).toFixed(0)}% vs your ${(rVal * 100).toFixed(0)}%)`)
    }
  }

  return mappings
}

function scoreHumorResonance(
  recipient: CompositeProfile,
  subject: CompositeProfile,
): { score: number; rationale: string; dataPoints: string[] } {
  if (!recipient.humor_signature || !subject.humor_signature) {
    // Fall back to humor_style string match
    if (recipient.humor_style && subject.humor_style && recipient.humor_style === subject.humor_style) {
      return {
        score: 0.6,
        rationale: `Both share "${recipient.humor_style}" humor style`,
        dataPoints: [`Shared humor style: ${recipient.humor_style}`],
      }
    }
    return {
      score: 0.2,
      rationale: 'Insufficient humor data for strong signal',
      dataPoints: [],
    }
  }

  // Compare laugh triggers overlap
  const rTriggers = new Set(recipient.humor_signature.laugh_triggers.map((s) => s.toLowerCase()))
  const sTriggers = subject.humor_signature.laugh_triggers.map((s) => s.toLowerCase())
  const sharedTriggers = sTriggers.filter((t) => rTriggers.has(t))

  // Compare what makes them laugh
  const rLaugh = new Set(recipient.humor_signature.what_makes_them_laugh.map((s) => s.toLowerCase()))
  const sLaugh = subject.humor_signature.what_makes_them_laugh.map((s) => s.toLowerCase())
  const sharedLaugh = sLaugh.filter((l) => rLaugh.has(l))

  const totalShared = sharedTriggers.length + sharedLaugh.length
  const score = Math.min(totalShared / 4, 1)

  return {
    score,
    rationale: `${totalShared} shared humor signals — ${score > 0.7 ? 'they will make each other genuinely laugh' : 'some humor alignment detected'}`,
    dataPoints: [
      ...sharedTriggers.map((t) => `Shared trigger: ${t}`),
      ...sharedLaugh.map((l) => `Both laugh at: ${l}`),
      ...subject.humor_signature.humor_examples.slice(0, 2),
    ],
  }
}

function scoreAestheticSync(
  recipient: CompositeProfile,
  subject: CompositeProfile,
): { score: number; rationale: string; dataPoints: string[] } {
  if (!recipient.aesthetic_resonance || !subject.aesthetic_resonance) {
    return {
      score: 0.2,
      rationale: 'Insufficient aesthetic data for signal',
      dataPoints: [],
    }
  }

  const rMoves = new Set(recipient.aesthetic_resonance.what_moves_them.map((s) => s.toLowerCase()))
  const sMoves = subject.aesthetic_resonance.what_moves_them.map((s) => s.toLowerCase())
  const sharedMoves = sMoves.filter((m) => rMoves.has(m))

  const rChills = new Set(recipient.aesthetic_resonance.chills_triggers.map((s) => s.toLowerCase()))
  const sChills = subject.aesthetic_resonance.chills_triggers.map((s) => s.toLowerCase())
  const sharedChills = sChills.filter((c) => rChills.has(c))

  const totalShared = sharedMoves.length + sharedChills.length
  const score = Math.min(totalShared / 4, 1)

  return {
    score,
    rationale: `${totalShared} shared aesthetic resonance points — ${score > 0.7 ? 'they experience beauty the same way' : 'some aesthetic overlap'}`,
    dataPoints: [
      ...sharedMoves.map((m) => `Both moved by: ${m}`),
      ...sharedChills.map((c) => `Shared chills trigger: ${c}`),
    ],
  }
}

function scoreEmotionalProcessingMatch(
  recipient: CompositeProfile,
  subject: CompositeProfile,
): { score: number; rationale: string; dataPoints: string[] } {
  if (!recipient.emotional_processing || !subject.emotional_processing) {
    return {
      score: 0.2,
      rationale: 'Insufficient emotional processing data',
      dataPoints: [],
    }
  }

  const rEP = recipient.emotional_processing
  const sEP = subject.emotional_processing

  const logicDiff = Math.abs(rEP.logic_vs_emotion - sEP.logic_vs_emotion)
  const intExtDiff = Math.abs(rEP.internal_vs_external - sEP.internal_vs_external)

  // Closer = better for emotional processing match
  const score = 1 - (logicDiff * 0.5 + intExtDiff * 0.5)

  const logicLabel = (v: number) => v > 0.6 ? 'logic-first' : v < 0.4 ? 'emotion-first' : 'balanced'
  const intExtLabel = (v: number) => v > 0.6 ? 'external processor' : v < 0.4 ? 'internal processor' : 'adaptable'

  return {
    score,
    rationale: `Emotional processing alignment at ${(score * 100).toFixed(0)}% — both ${logicLabel(rEP.logic_vs_emotion)} and ${intExtLabel(rEP.internal_vs_external)}`,
    dataPoints: [
      `Both: ${logicLabel(rEP.logic_vs_emotion)}, ${intExtLabel(rEP.internal_vs_external)}`,
      `Logic alignment: ${((1 - logicDiff) * 100).toFixed(0)}%`,
      `Processing style alignment: ${((1 - intExtDiff) * 100).toFixed(0)}%`,
    ],
  }
}

function scoreCommFit(
  recipient: CompositeProfile,
  subject: CompositeProfile,
): { score: number; rationale: string; dataPoints: string[] } {
  let score = 0
  let factors = 0
  const dataPoints: string[] = []

  if (recipient.communication_warmth !== null && subject.communication_warmth !== null) {
    const warmthAlign = 1 - Math.abs(recipient.communication_warmth - subject.communication_warmth)
    score += warmthAlign
    factors += 1
    dataPoints.push(`Warmth alignment: ${(warmthAlign * 100).toFixed(0)}%`)
  }

  if (recipient.communication_directness !== null && subject.communication_directness !== null) {
    const directAlign = 1 - Math.abs(recipient.communication_directness - subject.communication_directness)
    score += directAlign
    factors += 1
    dataPoints.push(`Directness alignment: ${(directAlign * 100).toFixed(0)}%`)
  }

  const finalScore = factors > 0 ? score / factors : 0.3

  return {
    score: finalScore,
    rationale: `Communication style fit at ${(finalScore * 100).toFixed(0)}% — ${finalScore > 0.7 ? 'natural conversational rhythm' : 'workable communication styles'}`,
    dataPoints,
  }
}

// -------------------------------------------------------
// Mandatory element builders
// -------------------------------------------------------

function buildSelfExpansionSignal(recipient: CompositeProfile, subject: CompositeProfile): string {
  const novelInterests = subject.interest_tags.filter(
    (t) => !recipient.interest_tags.includes(t),
  )
  if (novelInterests.length > 0) {
    return `Opens new doors: ${novelInterests.slice(0, 2).join(', ')}`
  }
  if (subject.passion_indicators.length > 0) {
    return `Passionate about: ${subject.passion_indicators[0]}`
  }
  return 'Brings a fresh perspective to the table'
}

function buildAdmirationSignal(subject: CompositeProfile): string {
  if ((subject.values_in_action ?? []).length > 0) {
    return `Lives their values: ${subject.values_in_action![0]}`
  }
  if ((subject.demonstrated_competence ?? []).length > 0) {
    return `Deeply skilled: ${subject.demonstrated_competence![0]}`
  }
  if ((subject.friend_vouch_quotes ?? []).length > 0) {
    return `Friends say: "${subject.friend_vouch_quotes![0]}"`
  }
  if (subject.kindness_markers.length > 0) {
    return `Known for: ${subject.kindness_markers[0]}`
  }
  return 'Genuine character that shows in how they move through the world'
}
