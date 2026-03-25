import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import {
  getMutualMatch, getChatMessages, sendChatMessage,
  getChatMessageCount, updateMutualMatch
} from '@/lib/db'
import type { MutualMatch } from '@/lib/types'
import OpenAI from 'openai'

const MAX_MESSAGES_PER_USER = 10

// GET: Fetch chat state for a mutual match
export async function GET(req: NextRequest) {
  const mutualMatchId = req.nextUrl.searchParams.get('mutualMatchId')
  const userId = req.nextUrl.searchParams.get('userId')

  if (!mutualMatchId || !userId) {
    return NextResponse.json({ error: 'mutualMatchId and userId required' }, { status: 400 })
  }

  const mutualMatch = await getMutualMatch(mutualMatchId)
  if (!mutualMatch) {
    return NextResponse.json({ error: 'Mutual match not found' }, { status: 404 })
  }

  if (mutualMatch.user_a_id !== userId && mutualMatch.user_b_id !== userId) {
    return NextResponse.json({ error: 'User not part of this match' }, { status: 403 })
  }

  const messages = await getChatMessages(mutualMatchId)
  const isUserA = mutualMatch.user_a_id === userId
  const myCount = isUserA ? mutualMatch.user_a_msg_count : mutualMatch.user_b_msg_count
  const partnerCount = isUserA ? mutualMatch.user_b_msg_count : mutualMatch.user_a_msg_count

  const timeRemaining = mutualMatch.chat_expires_at
    ? Math.max(0, new Date(mutualMatch.chat_expires_at).getTime() - Date.now())
    : null

  return NextResponse.json({
    messages,
    myCount,
    partnerCount,
    maxMessages: MAX_MESSAGES_PER_USER,
    status: mutualMatch.status,
    timeRemaining,
    chatExpiresAt: mutualMatch.chat_expires_at,
  })
}

// POST: Send a chat message (text or voice)
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  let mutualMatchId: string
  let userId: string
  let content: string
  let voiceUrl: string | null = null
  let transcript: string | null = null

  if (contentType.includes('multipart/form-data')) {
    // Voice message
    const formData = await req.formData()
    mutualMatchId = formData.get('mutualMatchId') as string
    userId = formData.get('userId') as string
    const audio = formData.get('audio') as File | null

    if (!mutualMatchId || !userId || !audio) {
      return NextResponse.json({ error: 'mutualMatchId, userId, and audio required' }, { status: 400 })
    }

    if (audio.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
    }

    // Upload to Supabase Storage
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
    const fileName = `chat/${mutualMatchId}/${userId}_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('voice-memos')
      .upload(fileName, audio, { contentType: audio.type })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload audio: ' + uploadError.message }, { status: 500 })
    }

    voiceUrl = fileName

    // Transcribe
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const transcription = await openai.audio.transcriptions.create({
        model: 'gpt-4o-mini-transcribe',
        file: audio,
      })
      transcript = transcription.text
      content = transcript
    } catch {
      content = '[Voice message]'
    }
  } else {
    // Text message
    const body = await req.json()
    mutualMatchId = body.mutualMatchId
    userId = body.userId
    content = body.content

    if (!mutualMatchId || !userId || !content) {
      return NextResponse.json({ error: 'mutualMatchId, userId, and content required' }, { status: 400 })
    }
  }

  const mutualMatch = await getMutualMatch(mutualMatchId)
  if (!mutualMatch) {
    return NextResponse.json({ error: 'Mutual match not found' }, { status: 404 })
  }

  if (mutualMatch.user_a_id !== userId && mutualMatch.user_b_id !== userId) {
    return NextResponse.json({ error: 'User not part of this match' }, { status: 403 })
  }

  if (mutualMatch.status !== 'chatting') {
    return NextResponse.json({ error: 'Chat is not active' }, { status: 400 })
  }

  // Check expiry
  if (mutualMatch.chat_expires_at && new Date(mutualMatch.chat_expires_at) < new Date()) {
    await updateMutualMatch(mutualMatch.id, { status: 'expired' } as Partial<MutualMatch>)
    return NextResponse.json({ error: 'Chat has expired' }, { status: 410 })
  }

  // Check message limit
  const isUserA = mutualMatch.user_a_id === userId
  const currentCount = isUserA ? mutualMatch.user_a_msg_count : mutualMatch.user_b_msg_count

  if (currentCount >= MAX_MESSAGES_PER_USER) {
    return NextResponse.json({ error: 'Message limit reached' }, { status: 400 })
  }

  const messageNumber = currentCount + 1

  // Save message
  const message = await sendChatMessage({
    mutual_match_id: mutualMatchId,
    sender_id: userId,
    content,
    voice_url: voiceUrl,
    transcript,
    message_number: messageNumber,
  })

  // Update message count on mutual match
  const countUpdate: Partial<MutualMatch> = isUserA
    ? { user_a_msg_count: messageNumber }
    : { user_b_msg_count: messageNumber }

  // Check if both users have now hit the limit
  const partnerCount = isUserA ? mutualMatch.user_b_msg_count : mutualMatch.user_a_msg_count
  if (messageNumber >= MAX_MESSAGES_PER_USER && partnerCount >= MAX_MESSAGES_PER_USER) {
    countUpdate.status = 'deciding'
  }

  await updateMutualMatch(mutualMatchId, countUpdate)

  // Return updated state
  const messages = await getChatMessages(mutualMatchId)

  return NextResponse.json({
    ok: true,
    message,
    messages,
    myCount: messageNumber,
    partnerCount,
    status: countUpdate.status || mutualMatch.status,
    maxMessages: MAX_MESSAGES_PER_USER,
  })
}
