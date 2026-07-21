import { NextRequest, NextResponse } from 'next/server'
import {
  createReport, enforceBlock, getUser, countDistinctOpenReporters, setProfileStatus,
} from '@/lib/db'
import { sendDiscordAlert } from '@/lib/alert'
import { shouldAutoPause } from '@/lib/safety-logic'
import type { ReportReason } from '@/lib/types'

const VALID_REASONS: ReportReason[] = [
  'inappropriate_messages', 'harassment', 'fake_profile', 'inappropriate_photos',
  'safety_concern', 'underage', 'married_or_taken', 'spam_or_scam', 'other',
]

// POST /api/report { userId, targetUserId, reason, details?, mutualMatchId? }
// A report always implies a block. Charles is alerted immediately (solo-ops: no silent queue).
export async function POST(req: NextRequest) {
  try {
    const { userId, targetUserId, reason, details, mutualMatchId } = await req.json()
    if (!userId || !targetUserId || !reason) {
      return NextResponse.json({ error: 'userId, targetUserId, and reason required' }, { status: 400 })
    }
    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
    }
    const [reporter, reported] = await Promise.all([getUser(userId), getUser(targetUserId)])
    if (!reported) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const report = await createReport({
      reporterId: userId, reportedId: targetUserId, mutualMatchId: mutualMatchId ?? null,
      reason, details: details ?? null, source: 'user',
    })

    // Report implies block.
    await enforceBlock(userId, targetUserId, 'report')

    // Auto-guard: if enough distinct people have open reports, pull them from the pool now.
    const distinctReporters = await countDistinctOpenReporters(targetUserId)
    const autoPaused = shouldAutoPause(distinctReporters, reported.profile_status)
    if (autoPaused) await setProfileStatus(targetUserId, 'paused')

    const base = process.env.NEXT_PUBLIC_APP_URL || 'https://people-like-you.com'
    await sendDiscordAlert(
      `🚩 **New report** (${reason})\n` +
      `Reporter: ${reporter?.first_name ?? '?'} (${userId})\n` +
      `Reported: ${reported.first_name ?? '?'} (${targetUserId})\n` +
      (details ? `Details: ${details}\n` : '') +
      `Distinct open reporters: ${distinctReporters}${autoPaused ? ' → AUTO-PAUSED' : ''}\n` +
      `Review: ${base}/admin?tab=reports (report ${report.id})`
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Report error:', err)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
