import { NextRequest, NextResponse } from 'next/server'
import {
  getOpenReports, getReport, resolveReport, setProfileStatus, getUser,
  getChatMessages, adjustTrustForViolation,
} from '@/lib/db'
import { sendWarningEmail, sendBanEmail } from '@/lib/email'

function checkAuth(req: NextRequest): boolean {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

// GET /api/admin/reports → open reports with reporter/reported context + transcript
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reports = await getOpenReports()
  const enriched = await Promise.all(reports.map(async (r) => {
    const [reporter, reported] = await Promise.all([getUser(r.reporter_id), getUser(r.reported_id)])
    const transcript = r.mutual_match_id ? await getChatMessages(r.mutual_match_id).catch(() => []) : []
    return {
      ...r,
      reporter_name: reporter?.first_name ?? null,
      reported_name: reported?.first_name ?? null,
      reported_status: reported?.profile_status ?? null,
      reported_email: reported?.email ?? null,
      transcript,
    }
  }))
  return NextResponse.json({ reports: enriched })
}

// POST /api/admin/reports { reportId, action: 'dismiss'|'warn'|'pause'|'ban', notes? }
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reportId, action, notes } = await req.json()
  if (!reportId || !['dismiss', 'warn', 'pause', 'ban'].includes(action)) {
    return NextResponse.json({ error: 'reportId and valid action required' }, { status: 400 })
  }
  const report = await getReport(reportId)
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  const reported = await getUser(report.reported_id)
  const nowIso = new Date().toISOString()

  switch (action) {
    case 'dismiss':
      await resolveReport(reportId, {
        status: 'dismissed', action_taken: 'none', admin_notes: notes ?? null, resolved_at: nowIso,
      })
      break
    case 'warn':
      if (reported?.email) await sendWarningEmail(reported.email, reported.first_name ?? 'there').catch(console.error)
      await resolveReport(reportId, {
        status: 'resolved', action_taken: 'warned', admin_notes: notes ?? null, resolved_at: nowIso,
      })
      break
    case 'pause':
      await setProfileStatus(report.reported_id, 'paused')
      await resolveReport(reportId, {
        status: 'resolved', action_taken: 'paused', admin_notes: notes ?? null, resolved_at: nowIso,
      })
      break
    case 'ban':
      await setProfileStatus(report.reported_id, 'banned')
      await adjustTrustForViolation(report.reported_id).catch(console.error)
      if (reported?.email) await sendBanEmail(reported.email, reported.first_name ?? 'there').catch(console.error)
      await resolveReport(reportId, {
        status: 'resolved', action_taken: 'banned', admin_notes: notes ?? null, resolved_at: nowIso,
      })
      break
  }
  return NextResponse.json({ ok: true })
}
