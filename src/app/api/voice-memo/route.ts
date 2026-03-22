import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { saveVoiceMemo, updateVoiceMemo } from '@/lib/db'
import OpenAI from 'openai'

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

  // Upload audio to Supabase Storage
  const fileName = `${userId}/${promptId}_${Date.now()}.webm`
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

  // Kick off transcription async (don't block the response)
  transcribeAsync(memo.id, fileName).catch(err =>
    console.error('Async transcription failed for memo', memo.id, err)
  )

  return NextResponse.json({ id: memo.id, status: 'uploaded' })
}

async function transcribeAsync(memoId: string, storagePath: string) {
  const supabase = createServerClient()

  // Download audio from storage
  const { data: audioData, error: dlError } = await supabase.storage
    .from('voice-memos')
    .download(storagePath)

  if (dlError || !audioData) {
    console.error('Failed to download audio for transcription:', dlError)
    return
  }

  // Convert Blob to File for OpenAI
  const file = new File([audioData], 'audio.webm', { type: 'audio/webm' })

  // Transcribe with GPT-4o Mini Transcribe
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const transcription = await openai.audio.transcriptions.create({
    model: 'gpt-4o-mini-transcribe',
    file,
  })

  // Update memo with transcript
  await updateVoiceMemo(memoId, { transcript: transcription.text })
  console.log(`Transcribed memo ${memoId}: ${transcription.text.substring(0, 80)}...`)
}
