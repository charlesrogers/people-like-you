import { NextRequest, NextResponse } from 'next/server'
import { getUser, updateUserElo, saveCalibrationVote } from '@/lib/db'
import { updateRatings } from '@/lib/elo'

// Server-side Elo + vote persistence (EXECUTION.md T6).
// Elo is now computed on the server (was client-computed — a trust hole: the
// client could POST any elo). The per-pair vote is persisted for the taste model.
// Elo formula/K-factors are unchanged (frozen model) — see src/lib/elo.ts.
export async function POST(req: NextRequest) {
  try {
    const { userId, targetId, vote } = await req.json()

    if (!userId || !targetId || vote === undefined) {
      return NextResponse.json({ error: 'Missing fields (userId, targetId, vote)' }, { status: 400 })
    }
    const outcome: 0 | 1 = vote ? 1 : 0

    const [voter, target] = await Promise.all([getUser(userId), getUser(targetId)])
    if (!voter || !target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { newRatingA, newRatingB } = updateRatings(
      voter.elo_score,
      target.elo_score,
      outcome,
      voter.elo_interactions,
    )

    await Promise.all([
      updateUserElo(userId, newRatingA, true),    // voter: increment interactions
      updateUserElo(targetId, newRatingB, false), // target: rating only
      saveCalibrationVote(userId, targetId, outcome === 1),
    ])

    return NextResponse.json({ ok: true, newElo: newRatingA })
  } catch (err) {
    console.error('Calibrate route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
