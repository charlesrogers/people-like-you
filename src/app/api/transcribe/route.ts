import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { moderateText, screenAndLog } from '@/lib/moderation'

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const formData = await req.formData()
  const audio = formData.get('audio') as File | null
  const userId = (formData.get('userId') as string | null) || null

  if (!audio) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
  }

  if (audio.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      model: 'gpt-4o-mini-transcribe',
      file: audio,
    })

    // Content moderation (Apple 1.2): profile voice memos become member-visible narratives.
    const modResult = await moderateText(transcription.text)
    if (userId) await screenAndLog(userId, 'voice_transcript', 'onboarding_memo', modResult)
    else if (modResult.rejected) console.warn('[transcribe] rejected memo with no userId:', modResult.categories)
    if (modResult.rejected) {
      return NextResponse.json(
        { error: 'That recording goes against our community standards. Please try again.' },
        { status: 422 },
      )
    }

    return NextResponse.json({ text: transcription.text })
  } catch {
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
