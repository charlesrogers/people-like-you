import { NextRequest, NextResponse } from 'next/server'
import { getFriendVouchByToken, updateFriendVouch } from '@/lib/db'
import { createServerClient } from '@/lib/supabase'

// POST: Friend uploads a vouch recording
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const audio = formData.get('audio') as File | null
  const token = formData.get('token') as string | null

  if (!audio || !token) {
    return NextResponse.json({ error: 'audio and token required' }, { status: 400 })
  }

  // Validate token
  const vouch = await getFriendVouchByToken(token)
  if (!vouch) {
    return NextResponse.json({ error: 'Invalid invite token' }, { status: 404 })
  }

  if (vouch.status !== 'invited') {
    return NextResponse.json({ error: 'This vouch has already been recorded' }, { status: 400 })
  }

  // Check file size (max 25MB)
  if (audio.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
  }

  // Upload to Supabase Storage
  const supabase = createServerClient()
  const storagePath = `vouches/${vouch.user_id}/${token}_${Date.now()}.webm`

  const arrayBuffer = await audio.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('voice-memos')
    .upload(storagePath, arrayBuffer, { contentType: 'audio/webm' })

  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
  }

  // Update vouch record
  await updateFriendVouch(vouch.id, {
    audio_storage_path: storagePath,
    duration_seconds: Number(formData.get('durationSeconds')) || null,
    status: 'recorded',
  })

  // Kick off async processing (transcription + extraction)
  // This will be handled by the extraction pipeline similarly to voice memos
  processVouchAsync(vouch.id).catch(console.error)

  return NextResponse.json({ ok: true, status: 'recorded' })
}

async function processVouchAsync(vouchId: string) {
  // Import dynamically to avoid circular deps
  const { transcribeAudio, extractFromVouch } = await import('@/lib/extraction')
  const { getFriendVouchByToken, updateFriendVouch, getCompositeProfile, saveCompositeProfile } = await import('@/lib/db')

  // For now, we need to get the vouch by ID — this is a simplified version
  // In production, we'd have a getVouchById function
  console.log(`Processing vouch ${vouchId}...`)
}
