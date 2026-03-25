import { NextRequest, NextResponse } from 'next/server'
import { getExpiredChats, updateMutualMatch } from '@/lib/db'
import { recordGhosting } from '@/lib/trust'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expiredChats = await getExpiredChats()
  console.log(`Chat expiry cron: ${expiredChats.length} expired chats`)

  let expired = 0
  let ghosting = 0

  for (const match of expiredChats) {
    try {
      const aEngaged = match.user_a_msg_count > 0
      const bEngaged = match.user_b_msg_count > 0

      // Record ghosting if one person engaged but the other didn't
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

  return NextResponse.json({ ok: true, expired, ghosting })
}
