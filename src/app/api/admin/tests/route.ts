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

  // Parallel queries
  const [profilesRes, matchesRes, introsRes, mutualRes, usersRes] = await Promise.all([
    db.from('composite_profiles').select('life_stage'),
    db.from('matches').select('id, life_stage_score, created_at').gte('created_at', '2026-03-25'),
    db.from('daily_intros').select('match_id, status, hook_type, created_at'),
    db.from('mutual_matches').select('match_id'),
    db.from('users').select('id', { count: 'exact', head: true }).eq('is_seed', false),
  ])

  const profiles = profilesRes.data ?? []
  const matches = matchesRes.data ?? []
  const intros = introsRes.data ?? []
  const mutuals = mutualRes.data ?? []
  const userCount = usersRes.count ?? 0

  // --- Life-Stage Extraction Health ---
  const hasLifeStage = profiles.filter(p => p.life_stage != null).length
  const scoreable = profiles.filter(p => {
    const ls = p.life_stage
    return ls && typeof ls === 'object' && (ls as Record<string, unknown>).confidence != null &&
      Number((ls as Record<string, unknown>).confidence) > 0.3
  }).length

  const chapters: Record<string, number> = { launching: 0, building: 0, established: 0, reinventing: 0 }
  for (const p of profiles) {
    const ls = p.life_stage as Record<string, unknown> | null
    const ch = ls?.life_chapter as string | null
    if (ch && ch in chapters) chapters[ch]++
  }

  // --- Life-Stage Funnel: scored vs skipped ---
  const matchIds = new Set(matches.map(m => m.id))
  const mutualMatchIds = new Set(mutuals.map(mm => mm.match_id))

  // Partition matches
  const scored = matches.filter(m => m.life_stage_score != null)
  const skipped = matches.filter(m => m.life_stage_score == null)

  function funnelStats(matchSubset: typeof matches) {
    const ids = new Set(matchSubset.map(m => m.id))
    const relevantIntros = intros.filter(i => ids.has(i.match_id))
    const liked = relevantIntros.filter(i => i.status === 'liked').length
    const total = relevantIntros.length
    const mms = matchSubset.filter(m => mutualMatchIds.has(m.id)).length
    return {
      intros: total,
      likeRate: total > 0 ? Math.round((liked / total) * 1000) / 10 : 0,
      mutualMatches: mms,
    }
  }

  // --- Hook Type Performance ---
  const hookPopulated = intros.some(i => i.hook_type != null)
  const hookGroups: Record<string, { total: number; liked: number; passed: number; expired: number; pending: number }> = {}

  for (const i of intros) {
    const ht = i.hook_type ?? 'unknown'
    if (!hookGroups[ht]) hookGroups[ht] = { total: 0, liked: 0, passed: 0, expired: 0, pending: 0 }
    hookGroups[ht].total++
    if (i.status === 'liked') hookGroups[ht].liked++
    else if (i.status === 'passed') hookGroups[ht].passed++
    else if (i.status === 'expired') hookGroups[ht].expired++
    else if (i.status === 'pending') hookGroups[ht].pending++
  }

  const byType = Object.entries(hookGroups)
    .filter(([key]) => key !== 'unknown')
    .map(([hookType, counts]) => ({
      hookType,
      ...counts,
      likeRate: counts.total > 0 ? Math.round((counts.liked / counts.total) * 1000) / 10 : 0,
      passRate: counts.total > 0 ? Math.round((counts.passed / counts.total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.likeRate - a.likeRate)

  return NextResponse.json({
    lifeStage: {
      totalProfiles: profiles.length,
      hasLifeStage,
      scoreable,
      chapters,
      funnel: {
        scored: funnelStats(scored),
        skipped: funnelStats(skipped),
      },
    },
    hookType: {
      totalIntros: intros.length,
      byType,
      populated: hookPopulated,
    },
    userCount,
  })
}
