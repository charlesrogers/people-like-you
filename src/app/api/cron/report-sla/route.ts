import { NextRequest, NextResponse } from 'next/server'
import { getOverdueReports, resolveReport } from '@/lib/db'
import { sendDiscordAlert } from '@/lib/alert'

// Apple 1.2 requires timely response to reports. Any report still OPEN past 24h is
// escalated to Discord (once) so a report can never sit unseen. Run hourly server-side.
const SLA_HOURS = 24

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - SLA_HOURS * 3600_000).toISOString()
  const overdue = await getOverdueReports(cutoff)

  if (overdue.length > 0) {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'https://people-like-you.com'
    await sendDiscordAlert(
      `⏰ **${overdue.length} report(s) past the 24h SLA and still unreviewed.**\n` +
      overdue.map(r => `• ${r.reason} (report ${r.id}, opened ${r.created_at})`).join('\n') +
      `\nReview now: ${base}/admin?tab=reports`
    )
    const nowIso = new Date().toISOString()
    for (const r of overdue) {
      await resolveReport(r.id, { escalated_at: nowIso }).catch(console.error)
    }
  }

  console.log(`Report SLA cron: ${overdue.length} overdue report(s) escalated`)
  return NextResponse.json({ ok: true, escalated: overdue.length })
}
