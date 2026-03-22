import { NextRequest, NextResponse } from 'next/server'
import { getUser, updateUserElo, saveMatchFeedback } from '@/lib/db'
import { updateRatings } from '@/lib/elo'

export async function POST(req: NextRequest) {
  const { matchId, userId, action, reason, details, photoRevealedBeforeDecision } = await req.json()

  if (!matchId || !userId || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Store feedback
  await saveMatchFeedback({
    match_id: matchId,
    user_id: userId,
    action,
    reason: reason || null,
    details: details || null,
    photo_revealed_before_decision: photoRevealedBeforeDecision || false,
  })

  // If "not attracted", adjust Elo gently
  if (reason === 'not_attracted') {
    const rejector = await getUser(userId)
    const rejected = await getUser(matchId)

    if (rejector && rejected) {
      const { newRatingB } = updateRatings(
        rejector.elo_score,
        rejected.elo_score,
        0,
        rejector.elo_interactions,
        8
      )
      await updateUserElo(matchId, newRatingB)
    }
  }

  return NextResponse.json({ ok: true })
}
