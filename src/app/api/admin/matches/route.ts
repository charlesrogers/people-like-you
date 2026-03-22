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

  // Get matches with user names
  const { data: matches, error: matchErr } = await db
    .from('matches')
    .select('*, user_a:users!matches_user_a_id_fkey(first_name, last_name), user_b:users!matches_user_b_id_fkey(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (matchErr) {
    // Fallback: fetch without joins if FK names differ
    const { data: fallback } = await db
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    // Manually resolve names
    const userIds = new Set<string>()
    for (const m of fallback ?? []) {
      userIds.add(m.user_a_id)
      userIds.add(m.user_b_id)
    }
    const { data: users } = await db
      .from('users')
      .select('id, first_name, last_name')
      .in('id', [...userIds])

    const nameMap: Record<string, string> = {}
    for (const u of users ?? []) {
      nameMap[u.id] = `${u.first_name} ${u.last_name || ''}`.trim()
    }

    return NextResponse.json({
      matches: (fallback ?? []).map(m => ({
        ...m,
        user_a_name: nameMap[m.user_a_id] || m.user_a_id,
        user_b_name: nameMap[m.user_b_id] || m.user_b_id,
      })),
    })
  }

  // Get all feedback
  const matchIds = (matches ?? []).map(m => m.id)
  const { data: feedback } = matchIds.length
    ? await db.from('match_feedback').select('*').in('match_id', matchIds)
    : { data: [] }

  const feedbackByMatch: Record<string, Array<Record<string, unknown>>> = {}
  for (const f of feedback ?? []) {
    if (!feedbackByMatch[f.match_id]) feedbackByMatch[f.match_id] = []
    feedbackByMatch[f.match_id].push(f)
  }

  return NextResponse.json({
    matches: (matches ?? []).map(m => ({
      id: m.id,
      user_a_id: m.user_a_id,
      user_b_id: m.user_b_id,
      user_a_name: m.user_a ? `${m.user_a.first_name} ${m.user_a.last_name || ''}`.trim() : m.user_a_id,
      user_b_name: m.user_b ? `${m.user_b.first_name} ${m.user_b.last_name || ''}`.trim() : m.user_b_id,
      angle_narrative: m.angle_narrative,
      angle_style: m.angle_style,
      expansion_points: m.expansion_points,
      created_at: m.created_at,
      feedback: feedbackByMatch[m.id] || [],
    })),
  })
}
