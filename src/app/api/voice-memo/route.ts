import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { saveVoiceMemo } from '@/lib/db'
import { processVoiceMemo } from '@/lib/extraction'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const audio = formData.get('audio') as File | null
  const userId = formData.get('userId') as string | null
  const promptId = formData.get('promptId') as string | null
  const dayNumber = parseInt(formData.get('dayNumber') as string || '0', 10)
  const durationSeconds = parseInt(formData.get('durationSeconds') as string || '0', 10)

  if (!audio || !userId || !promptId) {
    return NextResponse.json({ error: 'Missing required fields: audio, userId, promptId' }, { status: 400 })
  }

  if (audio.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Derive file extension from content type
  const extMap: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp4': 'm4a',
    'audio/m4a': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
  }
  const ext = extMap[audio.type] || 'webm'

  // Upload audio to Supabase Storage
  const fileName = `${userId}/${promptId}_${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('voice-memos')
    .upload(fileName, audio, { contentType: audio.type })

  if (uploadError) {
    return NextResponse.json({ error: 'Failed to upload audio: ' + uploadError.message }, { status: 500 })
  }

  // Create voice memo record
  const memo = await saveVoiceMemo({
    user_id: userId,
    prompt_id: promptId,
    audio_storage_path: fileName,
    duration_seconds: durationSeconds,
    transcript: null,
    extraction: null,
    day_number: dayNumber,
  })

  // Processing happens via /api/process-memos after all uploads complete
  // (fire-and-forget here gets killed by Vercel after response returns)

  return NextResponse.json({ id: memo.id, status: 'uploaded' })
}
