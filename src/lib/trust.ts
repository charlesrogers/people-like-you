import type { TrustScore, TrustTier, DateFeedback } from './types'
import { getTrustScore, ensureTrustScore, updateTrustScore } from './db'

/**
 * Trust score computation and tier assignment.
 *
 * Trust is earned through real-world interaction outcomes,
 * not platform engagement metrics.
 */

const WEIGHTS = {
  dates_completed: 3,
  safety_positive: 5,
  safety_negative: -20,
  photo_accuracy_positive: 2,
  photo_accuracy_negative: -5,
  positive_surprises: 3,
  no_shows: -15,
  ghosting_incidents: -3,
  disclosure_rounds_completed: 1,
}

const TIER_THRESHOLDS: { tier: TrustTier; minScore: number; minDates?: number }[] = [
  { tier: 'trusted', minScore: 50, minDates: 5 },
  { tier: 'verified', minScore: 30, minDates: 3 },
  { tier: 'established', minScore: 10 },
  { tier: 'new', minScore: 0 },
]

export function computeTrustScore(ts: TrustScore): number {
  return (
    ts.dates_completed * WEIGHTS.dates_completed +
    ts.safety_positive * WEIGHTS.safety_positive +
    ts.safety_negative * WEIGHTS.safety_negative +
    ts.photo_accuracy_positive * WEIGHTS.photo_accuracy_positive +
    ts.photo_accuracy_negative * WEIGHTS.photo_accuracy_negative +
    ts.positive_surprises * WEIGHTS.positive_surprises +
    ts.no_shows * WEIGHTS.no_shows +
    ts.ghosting_incidents * WEIGHTS.ghosting_incidents +
    ts.disclosure_rounds_completed * WEIGHTS.disclosure_rounds_completed
  )
}

export function computeTier(score: number, datesCompleted: number): TrustTier {
  for (const t of TIER_THRESHOLDS) {
    if (score >= t.minScore && (!t.minDates || datesCompleted >= t.minDates)) {
      return t.tier
    }
  }
  return 'new'
}

/**
 * Process date feedback and update the OTHER user's trust score.
 */
export async function processDateFeedback(feedback: DateFeedback): Promise<TrustScore> {
  const ts = await ensureTrustScore(feedback.about_user_id)

  const updates: Partial<TrustScore> = {
    dates_completed: ts.dates_completed + 1,
  }

  // Safety
  if (feedback.felt_safe === true) {
    updates.safety_positive = ts.safety_positive + 1
  } else if (feedback.felt_safe === false) {
    updates.safety_negative = ts.safety_negative + 1
  }

  // Photo accuracy
  if (feedback.looked_like_photos === 'yes') {
    updates.photo_accuracy_positive = ts.photo_accuracy_positive + 1
  } else if (feedback.looked_like_photos === 'no') {
    updates.photo_accuracy_negative = ts.photo_accuracy_negative + 1
  }

  // Surprise sentiment
  if (feedback.surprise_sentiment === 'positive') {
    updates.positive_surprises = ts.positive_surprises + 1
  }

  // Recompute score and tier
  const merged = { ...ts, ...updates } as TrustScore
  const newScore = computeTrustScore(merged)
  const newTier = computeTier(newScore, merged.dates_completed)

  updates.score = newScore
  updates.tier = newTier

  // Set verified_at if newly reaching verified tier
  if (newTier === 'verified' && ts.tier !== 'verified' && ts.tier !== 'trusted') {
    updates.verified_at = new Date().toISOString() as unknown as undefined
  }

  return updateTrustScore(feedback.about_user_id, updates)
}

/**
 * Record a no-show against a user.
 */
export async function recordNoShow(userId: string): Promise<TrustScore> {
  const ts = await ensureTrustScore(userId)
  const updates: Partial<TrustScore> = {
    no_shows: ts.no_shows + 1,
  }

  const merged = { ...ts, ...updates } as TrustScore
  updates.score = computeTrustScore(merged)
  updates.tier = computeTier(updates.score, merged.dates_completed)

  return updateTrustScore(userId, updates)
}

/**
 * Record a ghosting incident (expired mutual match with no response).
 */
export async function recordGhosting(userId: string): Promise<TrustScore> {
  const ts = await ensureTrustScore(userId)
  const updates: Partial<TrustScore> = {
    ghosting_incidents: ts.ghosting_incidents + 1,
  }

  const merged = { ...ts, ...updates } as TrustScore
  updates.score = computeTrustScore(merged)
  updates.tier = computeTier(updates.score, merged.dates_completed)

  return updateTrustScore(userId, updates)
}

/**
 * Record disclosure round completion for a user.
 */
export async function recordDisclosureCompletion(userId: string): Promise<void> {
  const ts = await ensureTrustScore(userId)
  await updateTrustScore(userId, {
    disclosure_rounds_completed: ts.disclosure_rounds_completed + 1,
  })
}
