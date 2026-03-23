import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId, narrativeId, vote, attributesSelected, narrativeStyle } = await req.json()

  if (!userId || !narrativeId || vote === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

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
}
