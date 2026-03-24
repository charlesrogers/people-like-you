import { NextRequest, NextResponse } from 'next/server'
import {
  getExpiredDisclosureRounds,
  updateMutualMatch,
  getMutualMatch,
} from '@/lib/db'
import { recordGhosting } from '@/lib/trust'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expiredRounds = await getExpiredDisclosureRounds()
  console.log(`Disclosure expiry cron: ${expiredRounds.length} expired rounds`)

  let expired = 0
  let ghosting = 0

  for (const round of expiredRounds) {
    try {
      const mutualMatch = await getMutualMatch(round.mutual_match_id)
      if (!mutualMatch || mutualMatch.status === 'expired') continue

      const aResponded = round.user_a_responded_at !== null
      const bResponded = round.user_b_responded_at !== null

      if (!aResponded && !bResponded) {
        // Neither responded — expire the match
        await updateMutualMatch(round.mutual_match_id, {
          status: 'expired',
          expired_at: new Date().toISOString(),
        })
        expired++
      } else if (aResponded && !bResponded) {
        // B ghosted
        await recordGhosting(mutualMatch.user_b_id)
        await updateMutualMatch(round.mutual_match_id, {
          status: 'expired',
          expired_at: new Date().toISOString(),
        })
        expired++
        ghosting++
      } else if (!aResponded && bResponded) {
        // A ghosted
        await recordGhosting(mutualMatch.user_a_id)
        await updateMutualMatch(round.mutual_match_id, {
          status: 'expired',
          expired_at: new Date().toISOString(),
        })
        expired++
        ghosting++
      }
    } catch (err) {
      console.error(`Disclosure expiry: error processing round ${round.id}`, err)
    }
  }

  return NextResponse.json({ ok: true, expired, ghosting })
}
