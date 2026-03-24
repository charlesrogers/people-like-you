import { NextRequest, NextResponse } from 'next/server'
import {
  createScheduledDate, getScheduledDate, updateScheduledDate,
  getMutualMatch, updateMutualMatch
} from '@/lib/db'

// POST: Propose a date
export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    mutualMatchId, proposedBy, scheduledAt,
    activityType, venueName, venueAddress, venuePlaceId,
    conversationStarter
  } = body

  if (!mutualMatchId || !proposedBy || !scheduledAt) {
    return NextResponse.json({ error: 'mutualMatchId, proposedBy, scheduledAt required' }, { status: 400 })
  }

  const mutualMatch = await getMutualMatch(mutualMatchId)
  if (!mutualMatch) {
    return NextResponse.json({ error: 'Mutual match not found' }, { status: 404 })
  }

  const date = await createScheduledDate({
    mutual_match_id: mutualMatchId,
    proposed_by: proposedBy,
    confirmed_by: null,
    scheduled_at: scheduledAt,
    activity_type: activityType || null,
    venue_name: venueName || null,
    venue_address: venueAddress || null,
    venue_place_id: venuePlaceId || null,
    status: 'proposed',
    conversation_starter: conversationStarter || null,
  })

  return NextResponse.json({ ok: true, date })
}

// PUT: Confirm, cancel, or complete a date
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { dateId, action, userId } = body

  if (!dateId || !action) {
    return NextResponse.json({ error: 'dateId and action required' }, { status: 400 })
  }

  const date = await getScheduledDate(dateId)
  if (!date) {
    return NextResponse.json({ error: 'Date not found' }, { status: 404 })
  }

  if (action === 'confirm') {
    const updated = await updateScheduledDate(dateId, {
      status: 'confirmed',
      confirmed_by: userId,
    })
    return NextResponse.json({ ok: true, date: updated })
  }

  if (action === 'cancel') {
    const updated = await updateScheduledDate(dateId, { status: 'cancelled' })
    return NextResponse.json({ ok: true, date: updated })
  }

  if (action === 'complete') {
    const updated = await updateScheduledDate(dateId, { status: 'completed' })
    // Update mutual match status
    await updateMutualMatch(date.mutual_match_id, { status: 'date_completed' } as Parameters<typeof updateMutualMatch>[1])
    return NextResponse.json({ ok: true, date: updated })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
