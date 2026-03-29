import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { saveVoiceMemo, getUserVoiceMemos, markReplacedMemosForPrompt } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
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

    const extMap: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/m4a': 'm4a',
      'audio/x-m4a': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/ogg': 'ogg',
    }
    const ext = extMap[audio.type] || 'webm'

    const fileName = `${userId}/${promptId}_${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('voice-memos')
      .upload(fileName, audio, { contentType: audio.type })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload audio: ' + uploadError.message }, { status: 500 })
    }

    // Mark any existing memos for this prompt as replaced (prevent duplicates)
    await markReplacedMemosForPrompt(userId, promptId)

    const memo = await saveVoiceMemo({
      user_id: userId,
      prompt_id: promptId,
      audio_storage_path: fileName,
      duration_seconds: durationSeconds,
      transcript: null,
      extraction: null,
      day_number: dayNumber,
    })

    return NextResponse.json({ id: memo.id, status: 'uploaded' })
  } catch (err) {
    console.error('Voice memo upload error:', err)
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET: Fetch memos for a user (used by onboarding to restore state after refresh)
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const memos = await getUserVoiceMemos(userId)
  return NextResponse.json({
    memos: memos.map(m => ({
      id: m.id,
      prompt_id: m.prompt_id,
      duration_seconds: m.duration_seconds,
      processing_status: m.processing_status,
    })),
  })
}
