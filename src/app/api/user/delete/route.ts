import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { userId, confirmEmail } = await req.json()

    if (!userId || !confirmEmail) {
      return NextResponse.json({ error: 'Missing userId or confirmEmail' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verify user exists and email matches (confirmation check)
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.email && user.email !== confirmEmail) {
      return NextResponse.json({ error: 'Email does not match' }, { status: 400 })
    }

    // Delete all user data in order (respecting foreign keys)
    // Most tables have ON DELETE CASCADE, but be explicit

    // 1. Voice memos — delete audio files from storage first
    const { data: memos } = await supabase
      .from('voice_memos')
      .select('audio_storage_path')
      .eq('user_id', userId)

    if (memos?.length) {
      const paths = memos.map(m => m.audio_storage_path).filter(Boolean)
      if (paths.length) {
        await supabase.storage.from('voice-memos').remove(paths)
      }
    }

    // 2. Photos — delete from storage
    const { data: photos } = await supabase
      .from('photos')
      .select('storage_path')
      .eq('user_id', userId)

    if (photos?.length) {
      const paths = photos.map(p => p.storage_path).filter(Boolean)
      if (paths.length) {
        await supabase.storage.from('photos').remove(paths)
      }
    }

    // 3. Delete user row (cascades to all related tables)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      console.error('Failed to delete user:', deleteError)
      return NextResponse.json({ error: 'Failed to delete account: ' + deleteError.message }, { status: 500 })
    }

    // 4. Delete Supabase Auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      console.error('Failed to delete auth user (non-blocking):', authDeleteError)
      // Non-blocking — user data is already gone
    }

    return NextResponse.json({ ok: true, message: 'Account and all data permanently deleted.' })
  } catch (err) {
    console.error('Account deletion error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
