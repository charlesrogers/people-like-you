import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { saveDateFeedback, getScheduledDate, getMutualMatch } from '@/lib/db'
import { processDateFeedback } from '@/lib/trust'
import type { DateFeedback } from '@/lib/types'

const anthropic = new Anthropic()

// POST: Submit post-date feedback
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      scheduledDateId, userId, aboutUserId,
      whatSurprisedYou, feltSafe, lookedLikePhotos,
      wantToSeeAgain, additionalNotes
    } = body

    if (!scheduledDateId || !userId || !aboutUserId || !whatSurprisedYou) {
      return NextResponse.json({
        error: 'scheduledDateId, userId, aboutUserId, and whatSurprisedYou required'
      }, { status: 400 })
    }

    // Verify the date exists and is completed
    const date = await getScheduledDate(scheduledDateId)
    if (!date || date.status !== 'completed') {
      return NextResponse.json({ error: 'Date not found or not completed' }, { status: 404 })
    }

    // Extract sentiment and traits from the surprise response
    const extraction = await extractSurpriseSignals(whatSurprisedYou)

    const feedback: Omit<DateFeedback, 'id' | 'created_at'> = {
      scheduled_date_id: scheduledDateId,
      user_id: userId,
      about_user_id: aboutUserId,
      what_surprised_you: whatSurprisedYou,
      surprise_sentiment: extraction.sentiment,
      surprise_extracted_traits: extraction.traits,
      felt_safe: feltSafe ?? null,
      looked_like_photos: lookedLikePhotos ?? null,
      want_to_see_again: wantToSeeAgain ?? null,
      additional_notes: additionalNotes ?? null,
    }

    const saved = await saveDateFeedback(feedback)

    // Process trust score update for the OTHER user
    await processDateFeedback(saved)

    return NextResponse.json({ ok: true, feedback: saved })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function extractSurpriseSignals(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral'
  traits: Record<string, unknown>
}> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Analyze this post-date "what surprised you" response. Extract:
1. sentiment: "positive", "negative", or "neutral"
2. traits: specific qualities or attributes mentioned about the other person (as key-value pairs)
3. match_hypothesis_confirmed: was the match introduction's premise validated? true/false/unknown

Response: "${text}"

Return JSON only:
{"sentiment": "...", "traits": {...}, "match_hypothesis_confirmed": ...}`
      }]
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const parsed = JSON.parse(content)
    return {
      sentiment: parsed.sentiment || 'neutral',
      traits: parsed.traits || {},
    }
  } catch {
    return { sentiment: 'neutral', traits: {} }
  }
}
