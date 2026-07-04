import { NextRequest, NextResponse } from 'next/server'
import { updateScheduledDate, getMutualMatch, updateMutualMatch } from '@/lib/db'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find confirmed dates where scheduled_at + 2.5 hours < now AND post_checkin_sent = false
  const cutoff = new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()

  const supabase = createServerClient()
  const { data: dates, error } = await supabase
    .from('scheduled_dates')
    .select()
    .eq('status', 'confirmed')
    .eq('post_checkin_sent', false)
    .lt('scheduled_at', cutoff)

  if (error) {
    console.error('Post-date check-in: query error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`Post-date check-in cron: ${dates?.length ?? 0} dates to mark completed`)

  let checkedIn = 0

  for (const date of dates ?? []) {
    try {
      await updateScheduledDate(date.id, {
        status: 'completed',
        post_checkin_sent: true,
      })
      // Advance the mutual match so downstream crons (second-date-check) see the
      // completion — previously only the manual complete action ever set this.
      // Guarded so a later status ('relationship') is never downgraded.
      const mm = await getMutualMatch(date.mutual_match_id)
      if (mm && mm.status === 'date_scheduled') {
        await updateMutualMatch(mm.id, { status: 'date_completed' })
      }
      checkedIn++
      console.log(`Post-date check-in: marked date ${date.id} completed`)
    } catch (err) {
      console.error(`Post-date check-in: error processing date ${date.id}`, err)
    }
  }

  return NextResponse.json({ ok: true, checkedIn })
}
