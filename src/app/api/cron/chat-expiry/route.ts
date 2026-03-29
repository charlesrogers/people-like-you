import { NextRequest, NextResponse } from 'next/server'
import { getExpiredChats, getStaleChats, updateMutualMatch, getUser } from '@/lib/db'
import { recordGhosting } from '@/lib/trust'
import { sendPush } from '@/lib/push'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let nudged = 0
  let pauseOffered = 0
  let expired = 0
  let ghosting = 0

  // ─── Phase 1: 24h nudge (gentle reminder) ───
  try {
    const stale24h = await getStaleChats(24)
    for (const match of stale24h) {
      if (match.nudge_sent_at) continue // already nudged

      const aEngaged = match.user_a_msg_count > 0
      const bEngaged = match.user_b_msg_count > 0

      // Only nudge if exactly one side is silent
      if (aEngaged === bEngaged) continue

      const ghostId = aEngaged ? match.user_b_id : match.user_a_id
      const activeId = aEngaged ? match.user_a_id : match.user_b_id
      const activeUser = await getUser(activeId)
      const activeName = activeUser?.first_name || 'Your match'

      await updateMutualMatch(match.id, {
        nudge_sent_at: new Date().toISOString(),
      })

      await sendPush(
        ghostId,
        `${activeName} is waiting`,
        `${activeName} is waiting to hear from you. Your chat expires in 48 hours.`,
        { type: 'ghost_nudge', matchId: match.id },
      )

      nudged++
      console.log(`Chat nudge: 24h reminder sent to ${ghostId} for match ${match.id}`)
    }
  } catch (err) {
    console.error('Chat nudge: error in 24h phase', err)
  }

  // ─── Phase 2: 48h pause offer ───
  try {
    const stale48h = await getStaleChats(48)
    for (const match of stale48h) {
      if (!match.nudge_sent_at || match.pause_offered_at) continue // skip if not nudged yet or already offered

      const aEngaged = match.user_a_msg_count > 0
      const bEngaged = match.user_b_msg_count > 0
      if (aEngaged === bEngaged) continue

      const ghostId = aEngaged ? match.user_b_id : match.user_a_id
      const activeId = aEngaged ? match.user_a_id : match.user_b_id
      const activeUser = await getUser(activeId)
      const activeName = activeUser?.first_name || 'your match'

      await updateMutualMatch(match.id, {
        pause_offered_at: new Date().toISOString(),
      })

      await sendPush(
        ghostId,
        'Not the right time?',
        `Your chat with ${activeName} expires tomorrow. Would you like to pause matches for a bit?`,
        { type: 'pause_offer', matchId: match.id },
      )

      pauseOffered++
      console.log(`Chat nudge: 48h pause offer sent to ${ghostId} for match ${match.id}`)
    }
  } catch (err) {
    console.error('Chat nudge: error in 48h phase', err)
  }

  // ─── Phase 3: 72h expiry (existing logic) ───
  const expiredChats = await getExpiredChats()

  for (const match of expiredChats) {
    try {
      const aEngaged = match.user_a_msg_count > 0
      const bEngaged = match.user_b_msg_count > 0

      if (aEngaged && !bEngaged) {
        await recordGhosting(match.user_b_id)
        ghosting++
      } else if (!aEngaged && bEngaged) {
        await recordGhosting(match.user_a_id)
        ghosting++
      }

      await updateMutualMatch(match.id, {
        status: 'expired',
        expired_at: new Date().toISOString(),
      })
      expired++
    } catch (err) {
      console.error(`Chat expiry: error processing match ${match.id}`, err)
    }
  }

  console.log(`Chat cron: nudged=${nudged}, pauseOffered=${pauseOffered}, expired=${expired}, ghosting=${ghosting}`)

  return NextResponse.json({ ok: true, nudged, pauseOffered, expired, ghosting })
}
