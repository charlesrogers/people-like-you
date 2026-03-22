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

  const [
    usersRes,
    matchesRes,
    feedbackRes,
  ] = await Promise.all([
    db.from('users').select('id, created_at, onboarding_stage, is_seed, elo_score, gender'),
    db.from('matches').select('id, created_at'),
    db.from('match_feedback').select('id, action, reason, photo_revealed_before_decision'),
  ])

  const users = usersRes.data ?? []
  const matches = matchesRes.data ?? []
  const feedback = feedbackRes.data ?? []

  // Signup counts
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString()

  const realUsers = users.filter(u => !u.is_seed)
  const signupsToday = realUsers.filter(u => u.created_at?.slice(0, 10) === todayStr).length
  const signupsThisWeek = realUsers.filter(u => u.created_at >= weekAgo).length

  // Signups by day (last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
  const signupsByDay: Record<string, number> = {}
  for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
    signupsByDay[d.toISOString().slice(0, 10)] = 0
  }
  for (const u of realUsers) {
    const day = u.created_at?.slice(0, 10)
    if (day && day in signupsByDay) signupsByDay[day]++
  }

  // Funnel
  const stages = ['basics', 'voice', 'preferences', 'photos', 'calibrate', 'complete']
  const funnel: Record<string, number> = {}
  for (const s of stages) funnel[s] = 0
  for (const u of realUsers) {
    const stage = u.onboarding_stage || 'basics'
    if (stage in funnel) funnel[stage]++
  }

  // Elo distribution
  const eloValues = users.map(u => u.elo_score).filter(Boolean).sort((a, b) => a - b)
  const eloBuckets: Record<string, number> = {}
  for (const e of eloValues) {
    const bucket = `${Math.floor(e / 100) * 100}-${Math.floor(e / 100) * 100 + 99}`
    eloBuckets[bucket] = (eloBuckets[bucket] || 0) + 1
  }

  // Match feedback breakdown
  const interested = feedback.filter(f => f.action === 'interested').length
  const passed = feedback.filter(f => f.action === 'not_interested').length
  const photoRevealed = feedback.filter(f => f.photo_revealed_before_decision).length

  const passReasons: Record<string, number> = {}
  for (const f of feedback) {
    if (f.action === 'not_interested' && f.reason) {
      passReasons[f.reason] = (passReasons[f.reason] || 0) + 1
    }
  }

  return NextResponse.json({
    users: {
      total: users.length,
      real: realUsers.length,
      seed: users.length - realUsers.length,
      men: users.filter(u => u.gender === 'Man').length,
      women: users.filter(u => u.gender === 'Woman').length,
      signupsToday,
      signupsThisWeek,
      signupsByDay,
    },
    funnel,
    elo: {
      min: eloValues[0] ?? 0,
      max: eloValues[eloValues.length - 1] ?? 0,
      avg: eloValues.length ? Math.round(eloValues.reduce((a, b) => a + b, 0) / eloValues.length) : 0,
      buckets: eloBuckets,
    },
    matches: {
      total: matches.length,
      feedbackTotal: feedback.length,
      interested,
      passed,
      photoRevealed,
      responseRate: matches.length ? Math.round((feedback.length / matches.length) * 100) : 0,
      interestRate: feedback.length ? Math.round((interested / feedback.length) * 100) : 0,
      passReasons,
    },
  })
}
