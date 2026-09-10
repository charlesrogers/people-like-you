import { captureActorAllowed } from '@/lib/model-data/auth'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { saveVoiceMemo, getUserVoiceMemos, markReplacedMemosForPrompt } from '@/lib/db'
import { measureAudioDuration } from '@/lib/audio-duration'
import { meetsRecordingMinimum, MIN_RECORDING_SECONDS } from '@/lib/recording-requirements'
import { QUESTION_BANK } from '@/lib/prompts'
import { FISHED_PROMPTS, NERD_OUT } from '@/lib/voice-prompt-map'

import { snapshotTranscript,captureQuestion } from '@/lib/model-data/sources'

import { captureStore } from '@/lib/model-data/store'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as File | null
    const userId = formData.get('userId') as string | null
    const promptId = formData.get('promptId') as string | null
    const dayNumber = parseInt(formData.get('dayNumber') as string || '0', 10)
    // V2-T4: which prompt bank this came from, and the quiz answer that fished it.
    const rawSource = formData.get('promptSource') as string | null
    const promptSource = rawSource === 'bank' || rawSource === 'fished' ? rawSource : null
    let promptSeed: { itemId: string; optionIndex: number } | null = null
    const rawSeed = formData.get('promptSeed') as string | null
    if (rawSeed) {
      try {
        const parsed = JSON.parse(rawSeed)
        if (parsed && typeof parsed.itemId === 'string' && typeof parsed.optionIndex === 'number') {
          promptSeed = { itemId: parsed.itemId, optionIndex: parsed.optionIndex }
        }
      } catch {
        // Provenance is analytics-only — never fail an upload over it.
      }
    }

    if (!(audio instanceof File) || !userId || !promptId) {
      return NextResponse.json({ error: 'Missing required fields: audio, userId, promptId' }, { status: 400 })
    }

    if(!await captureActorAllowed(req.headers,userId))return NextResponse.json({error:'Authentication required'},{status:401})

    if (audio.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
    }

    // Validate before uploading or replacing an existing answer. Client-supplied
    // durationSeconds is deliberately ignored, including from older app builds.
    let measuredSeconds: number
    try {
      measuredSeconds = await measureAudioDuration(audio)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        console.error('Audio duration validator is unavailable')
        return NextResponse.json({ error: 'Recording validation is temporarily unavailable. Please try saving again.' }, { status: 503 })
      }
      return NextResponse.json({ error: 'We could not read this recording. Please record it again.' }, { status: 422 })
    }
    if (!meetsRecordingMinimum(measuredSeconds)) {
      return NextResponse.json({
        error: `Record at least ${MIN_RECORDING_SECONDS} seconds before saving.`,
        minimum_seconds: MIN_RECORDING_SECONDS,
        duration_seconds: measuredSeconds,
      }, { status: 422 })
    }
    const durationSeconds = Math.floor(measuredSeconds)

    let displayed: unknown = null
    try { displayed = JSON.parse(String(formData.get('promptSnapshot') || 'null')) } catch { /* legacy client */ }
    const questionRecordId = await captureQuestion(userId,promptId,displayed,{source:promptSource,seed:promptSeed})
    const supabase = createServerClient()

    const extMap: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/m4a': 'm4a',
      'audio/x-m4a': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/ogg': 'ogg',
    }
    const ext = extMap[audio.type.split(';')[0]] || 'webm'

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
      ...(questionRecordId ? {question_record_id:questionRecordId} : {}),
      user_id: userId,
      prompt_id: promptId,
      audio_storage_path: fileName,
      duration_seconds: durationSeconds,
      transcript: null,
      extraction: null,
      day_number: dayNumber,
      prompt_source: promptSource,
      prompt_seed: promptSeed,
    })

    return NextResponse.json({ id: memo.id, status: 'uploaded', duration_seconds: durationSeconds })
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
  const tiers = new Map([...QUESTION_BANK, ...Object.values(FISHED_PROMPTS), NERD_OUT].map(p => [p.id, p.tier]))
  return NextResponse.json({
    memos: memos.filter(m => m.processing_status !== 'replaced').map(m => ({
      id: m.id,
      prompt_id: m.prompt_id,
      duration_seconds: m.duration_seconds,
      processing_status: m.processing_status,
      tier: tiers.get(m.prompt_id) ?? null,
    })),
  })
}

// Corrections create a new immutable transcript and invalidate the old analysis tree.
export async function PATCH(req: NextRequest) {
  const db=createServerClient()
  const token=req.headers.get('authorization')?.replace(/^Bearer /,'')
  const auth=token?await db.auth.getUser(token):null
  if(!auth?.data.user)return NextResponse.json({error:'Authentication required'},{status:401})
  const body=await req.json()
  if(typeof body.memoId!=='string' || typeof body.transcript!=='string' || !body.transcript.trim() || body.transcript.length>50000)return NextResponse.json({error:'Invalid correction'},{status:400})
  const {data:memo,error}=await db.from('voice_memos').select('*').eq('id',body.memoId).eq('user_id',auth.data.user.id).single()
  if(error || !memo || memo.processing_status==='replaced')return NextResponse.json({error:'Answer not found'},{status:404})
  if(!await captureStore().enabled())return NextResponse.json({error:'Correction capture is not enabled yet'},{status:503})
  const record=await snapshotTranscript(memo,body.transcript)
  const {error:saveError}=await db.rpc('model_data_set_transcript',{p_memo:memo.id,p_person:auth.data.user.id,p_text:body.transcript,p_record:record})
  if(saveError)return NextResponse.json({error:'Could not save correction; please retry'},{status:500})
  return NextResponse.json({ok:true,transcriptRecordId:record,status:'pending'})
}
