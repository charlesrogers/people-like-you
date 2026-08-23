import { NextRequest, NextResponse } from 'next/server'
import { saveQuizResponses, saveReaderTraits, getQuizResponses } from '@/lib/db'
import { getItem, INSTRUMENT_VERSION } from '@/lib/quiz-battery'
import { scoreQuiz, type QuizResponse } from '@/lib/quiz-scoring'

interface IncomingResponse {
  itemId?: unknown
  optionIndex?: unknown
  polarityFlipped?: unknown
  responseMs?: unknown
}

/**
 * Buffered quiz writes. The client POSTs once per block card (5 writes) and once
 * at the end — never between items, so the flow has zero network round-trips
 * inside a block. Every write is an upsert, so a resumed or replayed block is safe.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, complete, m9Text, m9AudioUrl } = body as {
      userId?: string; complete?: boolean; m9Text?: string | null; m9AudioUrl?: string | null
    }
    const incoming: IncomingResponse[] = Array.isArray(body.responses) ? body.responses : []

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const responses: QuizResponse[] = []
    for (const r of incoming) {
      if (typeof r.itemId !== 'string') continue
      const item = getItem(r.itemId)
      if (!item) continue

      let optionIndex: number | null = null
      if (typeof r.optionIndex === 'number' && Number.isInteger(r.optionIndex)) {
        // Bounds-check against the item's own option list. Free-response items
        // (Q19) have no options and always store null.
        if (item.kind === 'choice' && r.optionIndex >= 0 && r.optionIndex < item.options.length) {
          optionIndex = r.optionIndex
        }
      }

      responses.push({
        itemId: r.itemId,
        optionIndex,
        polarityFlipped: r.polarityFlipped === true,
        responseMs: typeof r.responseMs === 'number' ? Math.max(0, Math.round(r.responseMs)) : null,
      })
    }

    if (responses.length > 0) {
      await saveQuizResponses(responses.map(r => ({
        user_id: userId,
        item_id: r.itemId,
        option_index: r.optionIndex,
        polarity_flipped: r.polarityFlipped,
        response_ms: r.responseMs ?? null,
        instrument_version: INSTRUMENT_VERSION,
      })))
    }

    if (!complete) {
      return NextResponse.json({ ok: true, saved: responses.length })
    }

    // Score off everything persisted, not just this request's batch, so a
    // replayed or partial final write still produces complete traits.
    const stored = await getQuizResponses(userId)
    const all: QuizResponse[] = stored.map(r => ({
      itemId: r.item_id,
      optionIndex: r.option_index,
      polarityFlipped: r.polarity_flipped,
      responseMs: r.response_ms,
    }))

    const traits = scoreQuiz(all, {
      m9Text: m9Text ?? null,
      m9AudioUrl: m9AudioUrl ?? null,
    })

    await saveReaderTraits({
      user_id: userId,
      big5: traits.big5,
      milieu: traits.milieu as Record<string, unknown>,
      homogamy: traits.homogamy,
      convo: traits.convo as Record<string, unknown>,
      taste_priors: null,   // V2-T3
      pickiness: null,      // V2-T3
      scale_use: null,      // V2-T3
      register: traits.register,
      instrument_version: traits.instrument_version,
    })

    return NextResponse.json({ ok: true, saved: responses.length, itemsStored: stored.length, traits })
  } catch (err) {
    console.error('[quiz] save failed:', err)
    const message = err instanceof Error ? err.message : 'Failed to save quiz'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  const responses = await getQuizResponses(userId)
  return NextResponse.json({ responses, instrumentVersion: INSTRUMENT_VERSION })
}
