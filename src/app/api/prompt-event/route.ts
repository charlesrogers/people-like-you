import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const EVENTS = new Set(['shown', 'picked', 'passed', 'skipped', 'recorded'])

/** Voice-step instrumentation (migration 025). One row per picker/recorder event. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, promptId, promptSource, event, angle, position, exampleShown } = body ?? {}
    if (typeof userId !== 'string' || typeof promptId !== 'string' || !EVENTS.has(event)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 })
    }

    const { error } = await createServerClient().from('prompt_events').insert({
      user_id: userId,
      prompt_id: promptId.slice(0, 64),
      prompt_source: promptSource === 'fished' ? 'fished' : 'bank',
      event,
      angle: typeof angle === 'string' ? angle.slice(0, 32) : null,
      position: Number.isInteger(position) ? position : null,
      example_shown: typeof exampleShown === 'boolean' ? exampleShown : null,
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('prompt-event error:', err)
    const message = err instanceof Error ? err.message : 'Failed to record event'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
