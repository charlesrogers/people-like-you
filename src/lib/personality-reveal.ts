import type { CompositeProfile } from './types'

// ─── The 5 Personality Dimensions ───

export interface PersonalityDimension {
  id: 'explorer' | 'connector' | 'builder' | 'nurturer' | 'wildcard'
  emoji: string
  label: string
  tagline: string
  description: string
  score: number // 0-100
}

export interface PersonalityReveal {
  dimensions: PersonalityDimension[]
  primary: PersonalityDimension
  secondary: PersonalityDimension
  headline: string      // "You're an Explorer with a side of Builder"
  richness: number      // 0-100 data quality score
  needsMoreData: boolean
  weakestDimension: string
}

const DIMENSION_META: Record<string, { emoji: string; label: string; tagline: string; description: string }> = {
  explorer: {
    emoji: '🧭',
    label: 'Explorer',
    tagline: 'you light up when you discover something new',
    description: 'Curiosity-driven, novelty-seeking, always down a rabbit hole. You expand the world of anyone lucky enough to know you.',
  },
  connector: {
    emoji: '💜',
    label: 'Connector',
    tagline: 'you bond over shared vibes and inside jokes',
    description: 'You sync with people on a wavelength most can\'t explain. Shared humor, shared taste, shared chills — that\'s your love language.',
  },
  builder: {
    emoji: '⭐',
    label: 'Builder',
    tagline: 'people admire your drive and how you show up',
    description: 'You bet on yourself and back it up. Your values aren\'t theoretical — they show up in your stories, your work, and how you treat people.',
  },
  nurturer: {
    emoji: '🏠',
    label: 'Nurturer',
    tagline: 'you make people feel safe just by being around',
    description: 'Warm, steady, genuinely caring. You\'re the friend who shows up — not just texts. People relax when you\'re in the room.',
  },
  wildcard: {
    emoji: '⚡',
    label: 'Wildcard',
    tagline: 'your energy is contagious and unpredictable',
    description: 'Funny, spontaneous, a little unhinged in the best way. You make boring things fun and fun things unforgettable.',
  },
}

// ─── Score composite → 5 dimensions ───

export function computePersonalityReveal(composite: CompositeProfile): PersonalityReveal {
  const big5 = composite.big_five_proxy || {}

  // Explorer: openness + passion count + interest diversity
  const explorerRaw =
    (big5.openness ?? 0.5) * 40 +
    Math.min((composite.passion_indicators?.length || 0) / 5, 1) * 30 +
    Math.min((composite.interest_tags?.length || 0) / 8, 1) * 30

  // Connector: humor signature + aesthetic resonance + emotional processing signals
  const hasHumor = composite.humor_signature ? 1 : 0
  const hasAesthetic = composite.aesthetic_resonance ? 1 : 0
  const hasEmotional = composite.emotional_processing ? 1 : 0
  const connectorRaw =
    (big5.extraversion ?? 0.5) * 20 +
    hasHumor * 25 +
    hasAesthetic * 25 +
    hasEmotional * 15 +
    Math.min((composite.notable_quotes?.length || 0) / 4, 1) * 15

  // Builder: values-in-action + competence + vulnerability + ambition signals
  const viaCount = composite.values_in_action?.length || 0
  const compCount = composite.demonstrated_competence?.length || 0
  const builderRaw =
    (big5.conscientiousness ?? 0.5) * 25 +
    Math.min(viaCount / 3, 1) * 25 +
    Math.min(compCount / 3, 1) * 20 +
    (composite.vulnerability_authenticity ?? 0.5) * 15 +
    (composite.storytelling_ability ?? 0.5) * 15

  // Nurturer: warmth + agreeableness + kindness markers
  const nurturerRaw =
    (composite.communication_warmth ?? 0.5) * 30 +
    (big5.agreeableness ?? 0.5) * 30 +
    Math.min((composite.kindness_markers?.length || 0) / 4, 1) * 25 +
    (1 - (big5.neuroticism ?? 0.5)) * 15  // emotional stability

  // Wildcard: humor variety + energy + fun signals
  const wildcardRaw =
    (composite.energy_enthusiasm ?? 0.5) * 30 +
    (big5.extraversion ?? 0.5) * 20 +
    (composite.humor_style ? 20 : 0) +
    Math.min((composite.notable_quotes?.length || 0) / 3, 1) * 15 +
    (1 - (big5.conscientiousness ?? 0.5)) * 15  // spontaneity

  // Normalize to 0-100, ensure minimum of 15 (nobody scores 0)
  const clamp = (v: number) => Math.max(15, Math.min(100, Math.round(v)))

  const scores: Record<string, number> = {
    explorer: clamp(explorerRaw),
    connector: clamp(connectorRaw),
    builder: clamp(builderRaw),
    nurturer: clamp(nurturerRaw),
    wildcard: clamp(wildcardRaw),
  }

  // Build dimension objects
  const dimensions: PersonalityDimension[] = Object.entries(scores)
    .map(([id, score]) => ({
      id: id as PersonalityDimension['id'],
      ...DIMENSION_META[id],
      score,
    }))
    .sort((a, b) => b.score - a.score)

  const primary = dimensions[0]
  const secondary = dimensions[1]
  const weakest = dimensions[dimensions.length - 1]

  // Data richness score
  const richness =
    Math.min(composite.memo_count || 0, 6) * 20 +
    ((composite.notable_quotes?.length || 0) > 2 ? 15 : 0) +
    ((composite.values?.length || 0) > 3 ? 15 : 0) +
    ((composite.interest_tags?.length || 0) > 5 ? 15 : 0) +
    (composite.humor_signature ? 15 : 0) +
    ((composite.values_in_action?.length || 0) > 0 ? 20 : 0)

  return {
    dimensions,
    primary,
    secondary,
    headline: `You're ${aOrAn(primary.label)} ${primary.emoji} ${primary.label} with a side of ${secondary.emoji} ${secondary.label}`,
    richness: Math.min(richness, 100),
    needsMoreData: richness < 80,
    weakestDimension: weakest.id,
  }
}

function aOrAn(word: string): string {
  return 'AEIOU'.includes(word[0].toUpperCase()) ? 'an' : 'a'
}

// ─── Dimension → prompt tier mapping ───

export const DIMENSION_TO_TIER: Record<string, string> = {
  explorer: 'self_expansion',
  connector: 'i_sharing',
  builder: 'admiration',
  nurturer: 'comfort',
  wildcard: 'fun',
}
