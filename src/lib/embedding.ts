// Embedding infrastructure for People Like You
// Converts CompositeProfile into 128-dim feature vectors for similarity scoring

import type { CompositeProfile, FeatureVector } from './types'

// ============================================================================
// Constants
// ============================================================================

const VECTOR_DIMS = 128

const HUMOR_STYLE_CATEGORIES = [
  'witty_dry',
  'goofy',
  'sarcastic',
  'wholesome',
  'deadpan',
  'storytelling',
] as const

// ============================================================================
// Hash Helpers
// ============================================================================

/**
 * Simple deterministic string hash (djb2 variant).
 * Returns a positive integer.
 */
function djb2(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Deterministically hashes an array of strings into a fixed-length vector.
 * For each string, hashes to a dim index (djb2 mod dims) and increments
 * that dimension by 1. The result is L2-normalized.
 */
export function hashStringsToVector(strings: string[], dims: number): number[] {
  const vec = new Array<number>(dims).fill(0)

  for (const s of strings) {
    const idx = djb2(s.toLowerCase().trim()) % dims
    vec[idx] += 1
  }

  // L2 normalize
  const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
  if (magnitude > 0) {
    for (let i = 0; i < dims; i++) {
      vec[i] /= magnitude
    }
  }

  return vec
}

// ============================================================================
// Core Embedding
// ============================================================================

/**
 * Converts a CompositeProfile into a 128-dimensional FeatureVector.
 *
 * Layout:
 *   [0-31]    Tier 1 — Self-Expansion
 *   [32-55]   Tier 2 — I-Sharing
 *   [56-87]   Tier 3 — Admiration
 *   [88-99]   Tier 4 — Comfort/Stability
 *   [100-111] Demographics (reserved)
 *   [112-127] Behavioral (reserved)
 */
export function compositeToFeatureVector(profile: CompositeProfile): FeatureVector {
  const vec = new Array<number>(VECTOR_DIMS).fill(0)

  // ------------------------------------------------------------------
  // Tier 1 — Self-Expansion (dims 0-31)
  // ------------------------------------------------------------------

  // interest_tags → 16 dims (0-15)
  const interestVec = hashStringsToVector(profile.interest_tags ?? [], 16)
  for (let i = 0; i < 16; i++) vec[i] = interestVec[i]

  // passion_indicators → 8 dims (16-23)
  const passionVec = hashStringsToVector(profile.passion_indicators ?? [], 8)
  for (let i = 0; i < 8; i++) vec[16 + i] = passionVec[i]

  // goals → 8 dims (24-31)
  const goalsVec = hashStringsToVector(profile.goals ?? [], 8)
  for (let i = 0; i < 8; i++) vec[24 + i] = goalsVec[i]

  // ------------------------------------------------------------------
  // Tier 2 — I-Sharing (dims 32-55)
  // ------------------------------------------------------------------

  // humor_signature → 8 dims (32-39)
  if (profile.humor_signature) {
    const humorStrings = [
      ...(profile.humor_signature.what_makes_them_laugh ?? []),
      ...(profile.humor_signature.laugh_triggers ?? []),
    ]
    const humorVec = hashStringsToVector(humorStrings, 8)
    for (let i = 0; i < 8; i++) vec[32 + i] = humorVec[i]
  }

  // aesthetic_resonance → 8 dims (40-47)
  if (profile.aesthetic_resonance) {
    const aestheticStrings = [
      ...(profile.aesthetic_resonance.what_moves_them ?? []),
      ...(profile.aesthetic_resonance.what_they_notice ?? []),
    ]
    const aestheticVec = hashStringsToVector(aestheticStrings, 8)
    for (let i = 0; i < 8; i++) vec[40 + i] = aestheticVec[i]
  }

  // emotional_processing → 2 floats (48-49)
  if (profile.emotional_processing) {
    vec[48] = profile.emotional_processing.logic_vs_emotion ?? 0.5
    vec[49] = profile.emotional_processing.internal_vs_external ?? 0.5
  } else {
    vec[48] = 0.5
    vec[49] = 0.5
  }

  // humor_style one-hot → 6 dims (50-55)
  if (profile.humor_style) {
    const idx = HUMOR_STYLE_CATEGORIES.indexOf(
      profile.humor_style as (typeof HUMOR_STYLE_CATEGORIES)[number]
    )
    if (idx >= 0) {
      vec[50 + idx] = 1
    }
  }

  // ------------------------------------------------------------------
  // Tier 3 — Admiration (dims 56-87)
  // ------------------------------------------------------------------

  // values → 16 dims (56-71)
  const valuesVec = hashStringsToVector(profile.values ?? [], 16)
  for (let i = 0; i < 16; i++) vec[56 + i] = valuesVec[i]

  // values_in_action count normalized (72)
  vec[72] = Math.min((profile.values_in_action ?? []).length / 5, 1)

  // demonstrated_competence count normalized (73)
  vec[73] = Math.min((profile.demonstrated_competence ?? []).length / 5, 1)

  // friend_vouch_quotes available — binary (74)
  vec[74] = (profile.friend_vouch_quotes ?? []).length > 0 ? 1 : 0

  // kindness_markers count normalized (75)
  vec[75] = Math.min((profile.kindness_markers ?? []).length / 5, 1)

  // vulnerability_authenticity (76)
  vec[76] = profile.vulnerability_authenticity ?? 0.5

  // Big Five proxy: openness, conscientiousness, extraversion, agreeableness, neuroticism (77-81)
  const bigFive = profile.big_five_proxy ?? {}
  vec[77] = bigFive.openness ?? 0.5
  vec[78] = bigFive.conscientiousness ?? 0.5
  vec[79] = bigFive.extraversion ?? 0.5
  vec[80] = bigFive.agreeableness ?? 0.5
  vec[81] = bigFive.neuroticism ?? 0.5

  // storytelling_ability (82)
  vec[82] = profile.storytelling_ability ?? 0.5

  // energy_enthusiasm (83)
  vec[83] = profile.energy_enthusiasm ?? 0.5

  // dims 84-87: padding (remain 0)

  // ------------------------------------------------------------------
  // Tier 4 — Comfort/Stability (dims 88-99)
  // ------------------------------------------------------------------

  // communication_warmth (88)
  vec[88] = profile.communication_warmth ?? 0.5

  // communication_directness (89)
  vec[89] = profile.communication_directness ?? 0.5

  // attachment_proxy (90-92)
  if (profile.attachment_proxy) {
    vec[90] = profile.attachment_proxy.comfort_with_closeness ?? 0.5
    vec[91] = profile.attachment_proxy.comfort_with_independence ?? 0.5
    vec[92] = profile.attachment_proxy.reassurance_seeking ?? 0.5
  } else {
    vec[90] = 0.5
    vec[91] = 0.5
    vec[92] = 0.5
  }

  // agreeableness (from big five, repeated for comfort weighting) (93)
  vec[93] = bigFive.agreeableness ?? 0.5

  // neuroticism (from big five, repeated for comfort weighting) (94)
  vec[94] = bigFive.neuroticism ?? 0.5

  // dims 95-99: padding (remain 0)

  // ------------------------------------------------------------------
  // Demographics (dims 100-111) — Life Stage signals (Rule 9)
  // ------------------------------------------------------------------
  if (profile.life_stage && profile.life_stage.confidence > 0.3) {
    vec[100] = profile.life_stage.rootedness
    vec[101] = profile.life_stage.life_pace
    vec[102] = profile.life_stage.trajectory_momentum
    // life_chapter one-hot (103-106)
    const chapters = ['launching', 'building', 'established', 'reinventing']
    const chapIdx = chapters.indexOf(profile.life_stage.life_chapter ?? '')
    if (chapIdx >= 0) vec[103 + chapIdx] = 1
    // trajectory_directions hashed (107)
    if (profile.life_stage.trajectory_directions.length > 0) {
      const trajVec = hashStringsToVector(profile.life_stage.trajectory_directions, 1)
      vec[107] = trajVec[0]
    }
    // 108-111: padding (remain 0)
  } else {
    for (let i = 100; i < 112; i++) vec[i] = 0.5
  }

  // ------------------------------------------------------------------
  // Behavioral (dims 112-127) — reserved, fill with 0
  // ------------------------------------------------------------------
  // Already 0 from initialization

  return {
    vector: vec,
    metadata: {
      userId: profile.user_id,
      computedAt: new Date().toISOString(),
      version: 1,
    },
  }
}

// ============================================================================
// Similarity
// ============================================================================

/**
 * Standard cosine similarity between two vectors.
 * Returns a value between -1 and 1.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length)
  let dot = 0
  let magA = 0
  let magB = 0

  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  if (denom === 0) return 0

  return dot / denom
}

// ============================================================================
// Scoring
// ============================================================================

/**
 * Computes compatibility between two profiles using embedding cosine similarity.
 * Returns a score in 0-1 range.
 */
export function scoreWithEmbedding(
  profileA: CompositeProfile,
  profileB: CompositeProfile
): number {
  const vecA = compositeToFeatureVector(profileA)
  const vecB = compositeToFeatureVector(profileB)

  const raw = cosineSimilarity(vecA.vector, vecB.vector)

  // Map from [-1, 1] to [0, 1]
  return (raw + 1) / 2
}
