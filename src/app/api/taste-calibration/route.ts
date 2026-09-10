import { captureActorAllowed } from '@/lib/model-data/auth'
import { captureMemberFeedback } from '@/lib/model-data/member-feedback'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { userId, narrativeId, vote, attributesSelected, narrativeStyle,feedbackText,displayedNarrative,eventId } = await req.json()

    if (!userId || !narrativeId || vote === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if(!await captureActorAllowed(req.headers,userId))return NextResponse.json({error:'Authentication required'},{status:401})
    await captureMemberFeedback(userId,'taste_feedback',{narrativeId,vote,attributesSelected,narrativeStyle,feedbackText,displayedNarrative:typeof displayedNarrative==='string'?displayedNarrative.slice(0,10000):null},undefined,eventId)
    const db = createServerClient()
    const { error } = await db.from('taste_calibration').insert({
      user_id: userId,
      narrative_id: narrativeId,
      vote,
      attributes_selected: attributesSelected || [],
      narrative_style: narrativeStyle || null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
