import { NextRequest, NextResponse } from 'next/server'
import {
  getMutualMatch, saveMeetDecision, getMeetDecision,
  getMeetDecisions, updateMutualMatch
} from '@/lib/db'
import type { MutualMatch } from '@/lib/types'

// GET: Check decision state (never reveals partner's decision directly)
export async function GET(req: NextRequest) {
  const mutualMatchId = req.nextUrl.searchParams.get('mutualMatchId')
  const userId = req.nextUrl.searchParams.get('userId')

  if (!mutualMatchId || !userId) {
    return NextResponse.json({ error: 'mutualMatchId and userId required' }, { status: 400 })
  }

  const mutualMatch = await getMutualMatch(mutualMatchId)
  if (!mutualMatch) {
    return NextResponse.json({ error: 'Mutual match not found' }, { status: 404 })
  }

  const myDecision = await getMeetDecision(mutualMatchId, userId)

  // Determine phase based on current status
  if (mutualMatch.status === 'planning' || mutualMatch.status === 'date_scheduled') {
    return NextResponse.json({ phase: 'planning', hasDecided: true })
  }

  if (mutualMatch.status === 'declined') {
    return NextResponse.json({ phase: 'ended', hasDecided: true })
  }

  return NextResponse.json({
    phase: myDecision ? 'waiting' : 'pending',
    hasDecided: !!myDecision,
    status: mutualMatch.status,
  })
}

// POST: Submit yes/no decision
export async function POST(req: NextRequest) {
  const { mutualMatchId, userId, decision } = await req.json()

  if (!mutualMatchId || !userId || !decision) {
    return NextResponse.json({ error: 'mutualMatchId, userId, and decision required' }, { status: 400 })
  }

  // Early decline from ghost nudge — close the match without recording ghosting
  if (decision === 'decline_early') {
    const mm = await getMutualMatch(mutualMatchId)
    if (!mm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await updateMutualMatch(mutualMatchId, {
      status: 'declined',
      expired_at: new Date().toISOString(),
    } as Partial<MutualMatch>)
    return NextResponse.json({ ok: true, phase: 'ended' })
  }

  if (decision !== 'yes' && decision !== 'no') {
    return NextResponse.json({ error: 'Decision must be yes or no' }, { status: 400 })
  }

  const mutualMatch = await getMutualMatch(mutualMatchId)
  if (!mutualMatch) {
    return NextResponse.json({ error: 'Mutual match not found' }, { status: 404 })
  }

  if (mutualMatch.user_a_id !== userId && mutualMatch.user_b_id !== userId) {
    return NextResponse.json({ error: 'User not part of this match' }, { status: 403 })
  }

  // Check if already decided
  const existing = await getMeetDecision(mutualMatchId, userId)
  if (existing) {
    return NextResponse.json({ error: 'Already decided' }, { status: 400 })
  }

  // Save decision
  await saveMeetDecision({ mutual_match_id: mutualMatchId, user_id: userId, decision })

  // Check if both have now decided
  const allDecisions = await getMeetDecisions(mutualMatchId)

  if (allDecisions.length >= 2) {
    const bothYes = allDecisions.every(d => d.decision === 'yes')
    const newStatus = bothYes ? 'planning' : 'declined'
    await updateMutualMatch(mutualMatchId, { status: newStatus } as Partial<MutualMatch>)

    return NextResponse.json({
      ok: true,
      phase: bothYes ? 'planning' : 'ended',
    })
  }

  // Only one decision so far
  return NextResponse.json({
    ok: true,
    phase: 'waiting',
  })
}
