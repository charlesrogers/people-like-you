import { NextRequest, NextResponse } from 'next/server'
import { saveExitSurvey, updateUser } from '@/lib/db'
import type { ExitReason } from '@/lib/types'

// POST: Submit exit survey
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, reason, foundMatchId, details } = body

    if (!userId || !reason) {
      return NextResponse.json({ error: 'userId and reason required' }, { status: 400 })
    }

    const validReasons: ExitReason[] = [
      'found_someone_ply', 'found_someone_elsewhere', 'taking_break',
      'matches_wrong', 'not_enough_people', 'other'
    ]
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    }

    const survey = await saveExitSurvey({
      user_id: userId,
      reason,
      found_match_id: foundMatchId || null,
      details: details || null,
    })

    // Deactivate the user's profile
    await updateUser(userId, { profile_status: 'deactivated' })

    return NextResponse.json({ ok: true, survey })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
