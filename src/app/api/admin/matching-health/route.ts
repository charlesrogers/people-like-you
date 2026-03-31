import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAuth(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()

  // ─── Proximity Impact: interest rate by location tier ───
  const { data: feedbackByTier } = await db
    .from('match_feedback')
    .select('action, location_tier, distance_miles')
    .in('action', ['interested', 'not_interested'])
    .not('location_tier', 'is', null)

  const tierStats: Record<number, { total: number; interested: number; avgDistance: number; distances: number[] }> = {}
  for (const fb of feedbackByTier || []) {
    const tier = fb.location_tier as number
    if (!tierStats[tier]) tierStats[tier] = { total: 0, interested: 0, avgDistance: 0, distances: [] }
    tierStats[tier].total++
    if (fb.action === 'interested') tierStats[tier].interested++
    if (fb.distance_miles != null) tierStats[tier].distances.push(fb.distance_miles as number)
  }

  const proximityImpact = Object.entries(tierStats)
    .map(([tier, s]) => ({
      tier: Number(tier),
      tierName: ['', 'Neighborhood', 'Metro', 'Regional', 'National', 'Hemisphere', 'Global'][Number(tier)] || `Tier ${tier}`,
      total: s.total,
      interested: s.interested,
      interestRate: s.total > 0 ? Math.round(1000 * s.interested / s.total) / 10 : 0,
      avgDistanceMiles: s.distances.length > 0 ? Math.round(s.distances.reduce((a, b) => a + b, 0) / s.distances.length) : null,
    }))
    .sort((a, b) => a.tier - b.tier)

  // Overall proximity stats
  const totalWithLocation = (feedbackByTier || []).length
  const totalWithoutLocation = await db
    .from('match_feedback')
    .select('id', { count: 'exact', head: true })
    .in('action', ['interested', 'not_interested'])
    .is('location_tier', null)
  const locationCoverage = totalWithLocation + (totalWithoutLocation.count || 0) > 0
    ? Math.round(100 * totalWithLocation / (totalWithLocation + (totalWithoutLocation.count || 0)))
    : 0

  // ─── Intro Quality: critic scores + hook type performance ───
  const { data: intros } = await db
    .from('daily_intros')
    .select('id, status, hook_type, critic_score, critic_hook_power, critic_intrigue, critic_specificity, critic_mystery, generation_attempts, quote_used, photo_revealed_at')
    .not('status', 'eq', 'pending')
    .order('created_at', { ascending: false })
    .limit(500)

  // Critic score distribution
  const criticScores = (intros || []).filter(i => i.critic_score != null).map(i => i.critic_score as number)
  const avgCriticScore = criticScores.length > 0 ? Math.round(10 * criticScores.reduce((a, b) => a + b, 0) / criticScores.length) / 10 : null
  const belowThreshold = criticScores.filter(s => s < 30).length
  const aboveThreshold = criticScores.filter(s => s >= 30).length
  const regeneratedCount = (intros || []).filter(i => (i.generation_attempts as number) >= 2).length

  // Critic subscore averages
  const withSubscores = (intros || []).filter(i => i.critic_hook_power != null)
  const avgSubscores = withSubscores.length > 0 ? {
    hookPower: Math.round(10 * withSubscores.reduce((a, i) => a + (i.critic_hook_power as number), 0) / withSubscores.length) / 10,
    intrigue: Math.round(10 * withSubscores.reduce((a, i) => a + (i.critic_intrigue as number), 0) / withSubscores.length) / 10,
    specificity: Math.round(10 * withSubscores.reduce((a, i) => a + (i.critic_specificity as number), 0) / withSubscores.length) / 10,
    mystery: Math.round(10 * withSubscores.reduce((a, i) => a + (i.critic_mystery as number), 0) / withSubscores.length) / 10,
  } : null

  // Hook type breakdown with conversion
  const hookTypes: Record<string, { total: number; liked: number; passed: number; expired: number; photoRevealed: number }> = {}
  for (const intro of intros || []) {
    const ht = (intro.hook_type as string) || 'unknown'
    if (!hookTypes[ht]) hookTypes[ht] = { total: 0, liked: 0, passed: 0, expired: 0, photoRevealed: 0 }
    hookTypes[ht].total++
    if (intro.status === 'liked') hookTypes[ht].liked++
    else if (intro.status === 'passed') hookTypes[ht].passed++
    else if (intro.status === 'expired') hookTypes[ht].expired++
    if (intro.photo_revealed_at) hookTypes[ht].photoRevealed++
  }

  const hookTypeStats = Object.entries(hookTypes).map(([type, s]) => ({
    hookType: type,
    total: s.total,
    liked: s.liked,
    passed: s.passed,
    expired: s.expired,
    photoRevealed: s.photoRevealed,
    likeRate: s.total > 0 ? Math.round(1000 * s.liked / s.total) / 10 : 0,
    photoRevealRate: s.total > 0 ? Math.round(1000 * s.photoRevealed / s.total) / 10 : 0,
    convictionRate: s.liked > 0 ? Math.round(1000 * (s.liked - s.photoRevealed) / s.liked) / 10 : 0,
  }))

  // Quote usage impact
  const quotedIntros = (intros || []).filter(i => i.quote_used === true)
  const unquotedIntros = (intros || []).filter(i => i.quote_used === false)
  const quoteImpact = {
    quoted: { total: quotedIntros.length, liked: quotedIntros.filter(i => i.status === 'liked').length },
    unquoted: { total: unquotedIntros.length, liked: unquotedIntros.filter(i => i.status === 'liked').length },
    quotedLikeRate: quotedIntros.length > 0 ? Math.round(1000 * quotedIntros.filter(i => i.status === 'liked').length / quotedIntros.length) / 10 : 0,
    unquotedLikeRate: unquotedIntros.length > 0 ? Math.round(1000 * unquotedIntros.filter(i => i.status === 'liked').length / unquotedIntros.length) / 10 : 0,
  }

  // ─── Match Quality: compatibility score vs outcomes ───
  const { data: matchesWithScores } = await db
    .from('matches')
    .select('id, compatibility_score, location_tier, distance_miles, life_stage_score, shared_interest_count')
    .not('compatibility_score', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500)

  // Get outcomes for these matches
  const matchIds = (matchesWithScores || []).map(m => m.id)
  const { data: matchOutcomes } = matchIds.length > 0
    ? await db.from('match_feedback').select('match_id, action').in('match_id', matchIds)
    : { data: [] }

  const outcomeMap = new Map<string, string>()
  for (const o of matchOutcomes || []) {
    outcomeMap.set(o.match_id, o.action)
  }

  // Compatibility score buckets
  const compatBuckets: Record<string, { total: number; interested: number }> = {
    'Low (<0.5)': { total: 0, interested: 0 },
    'Medium (0.5-0.7)': { total: 0, interested: 0 },
    'High (0.7-0.85)': { total: 0, interested: 0 },
    'Very High (>0.85)': { total: 0, interested: 0 },
  }
  for (const m of matchesWithScores || []) {
    const score = m.compatibility_score as number
    const outcome = outcomeMap.get(m.id)
    let bucket: string
    if (score < 0.5) bucket = 'Low (<0.5)'
    else if (score < 0.7) bucket = 'Medium (0.5-0.7)'
    else if (score < 0.85) bucket = 'High (0.7-0.85)'
    else bucket = 'Very High (>0.85)'
    compatBuckets[bucket].total++
    if (outcome === 'interested') compatBuckets[bucket].interested++
  }

  const compatibilityImpact = Object.entries(compatBuckets).map(([bucket, s]) => ({
    bucket,
    total: s.total,
    interested: s.interested,
    interestRate: s.total > 0 ? Math.round(1000 * s.interested / s.total) / 10 : 0,
  }))

  return NextResponse.json({
    proximity: {
      tiers: proximityImpact,
      locationCoverage,
      totalDecisions: totalWithLocation,
    },
    introQuality: {
      totalIntros: (intros || []).length,
      avgCriticScore,
      belowThreshold,
      aboveThreshold,
      regeneratedCount,
      regeneratedRate: (intros || []).length > 0 ? Math.round(1000 * regeneratedCount / (intros || []).length) / 10 : 0,
      avgSubscores,
      hookTypeStats,
      quoteImpact,
    },
    matchQuality: {
      compatibilityImpact,
      totalScoredMatches: (matchesWithScores || []).length,
    },
  })
}
