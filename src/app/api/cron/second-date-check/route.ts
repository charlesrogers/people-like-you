import { NextRequest, NextResponse } from 'next/server'
import {
  getMutualMatchesByStatus,
  getCompletedDatesForMutualMatch,
  getDateFeedback,
  getOpenDateForMutualMatch,
  updateMutualMatch,
} from '@/lib/db'

// Second-date check (roadmap-2026-07 Phase 0).
//
// Spec: a mutual match is promoted to 'relationship' when the pair has ≥2
// completed dates AND both sides' feedback on the most recent completed date
// says want_to_see_again = 'yes'. Conservative, fully derivable from data we
// already collect. ('relationship' existed in the status enum but nothing
// ever wrote it before this cron.)
//
// Also counts pairs who mutually said "want to see again" after their first
// date but have no next date scheduled — the second-date broker (spec §5f)
// will auto-propose for these in Phase 1.5. For now we log and report them.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const candidates = await getMutualMatchesByStatus('date_completed')
  console.log(`Second-date check: ${candidates.length} mutual matches in date_completed`)

  let promoted = 0
  let secondDatePending = 0
  let checked = 0

  for (const mm of candidates) {
    checked++
    try {
      const completedDates = await getCompletedDatesForMutualMatch(mm.id)
      if (completedDates.length === 0) continue

      const latest = completedDates[completedDates.length - 1]
      const feedback = await getDateFeedback(latest.id)
      // Both DISTINCT users said yes (DB has UNIQUE(scheduled_date_id, user_id),
      // this is defense-in-depth against dupes)
      const yesUsers = new Set(
        feedback.filter(f => f.want_to_see_again === 'yes').map(f => f.user_id)
      )
      const bothWantMore = yesUsers.size === 2 && feedback.length === 2

      if (!bothWantMore) continue

      if (completedDates.length >= 2) {
        await updateMutualMatch(mm.id, { status: 'relationship' })
        promoted++
        console.log(`Second-date check: promoted mutual match ${mm.id} to relationship (${completedDates.length} completed dates, mutual yes)`)
      } else {
        const openDate = await getOpenDateForMutualMatch(mm.id)
        if (!openDate) {
          secondDatePending++
          console.log(`Second-date check: mutual match ${mm.id} mutual-yes with no next date — second-date broker candidate`)
        }
      }
    } catch (err) {
      console.error(`Second-date check: error processing mutual match ${mm.id}`, err)
    }
    if (checked % 50 === 0) {
      console.log(`Second-date check: progress ${checked}/${candidates.length}`)
    }
  }

  console.log(`Second-date check: done — ${promoted} promoted, ${secondDatePending} awaiting second-date proposal`)
  return NextResponse.json({ ok: true, checked, promoted, secondDatePending })
}
