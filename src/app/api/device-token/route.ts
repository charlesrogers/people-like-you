import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getAuthUserId } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token, platform } = await req.json()

  if (!token || !platform) {
    return NextResponse.json({ error: 'token and platform are required' }, { status: 400 })
  }

  if (!['ios', 'web'].includes(platform)) {
    return NextResponse.json({ error: 'platform must be ios or web' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Upsert to avoid duplicates
  const { error } = await supabase
    .from('device_tokens')
    .upsert(
      { user_id: userId, token, platform },
      { onConflict: 'user_id,token' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuthUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await req.json()

  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 })
  }

  const supabase = createServerClient()

  await supabase
    .from('device_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('token', token)

  return NextResponse.json({ ok: true })
}
