import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const audio = formData.get('audio') as File | null

  if (!audio) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
  }

  if (audio.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audio,
    })

    return NextResponse.json({ text: transcription.text })
  } catch {
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
