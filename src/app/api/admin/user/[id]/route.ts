import { NextRequest, NextResponse } from 'next/server'
import { updateUser } from '@/lib/db'
import { createServerClient } from '@/lib/supabase'

function checkAuth(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  // Only allow specific fields
  const allowed = ['elo_score', 'onboarding_stage', 'is_seed', 'first_name', 'email', 'elo_interactions']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const user = await updateUser(id, updates)
  return NextResponse.json({ user })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const db = createServerClient()

  // Cascade delete related records
  const tables = [
    'match_feedback',
    'daily_intros',
    'matches',
    'composite_profiles',
    'voice_memos',
    'photos',
    'soft_preferences',
    'hard_preferences',
    'user_cadence',
  ]

  for (const table of tables) {
    // matches use user_a_id / user_b_id
    if (table === 'matches') {
      await db.from(table).delete().or(`user_a_id.eq.${id},user_b_id.eq.${id}`)
    } else if (table === 'match_feedback' || table === 'daily_intros') {
      await db.from(table).delete().eq('user_id', id)
    } else {
      await db.from(table).delete().eq('user_id', id)
    }
  }

  // Delete user last
  await db.from('users').delete().eq('id', id)

  return NextResponse.json({ ok: true })
}
