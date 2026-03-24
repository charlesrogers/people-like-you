import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAuth(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()

  const { data: metrics, error } = await db
    .from('prompt_metrics')
    .select('prompt_id, word_count, sentence_count, duration_seconds')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Aggregate per prompt
  const byPrompt: Record<string, {
    prompt_id: string
    responses: number
    avg_word_count: number
    min_word_count: number
    max_word_count: number
    avg_duration: number
    total_words: number[]
  }> = {}

  for (const m of metrics || []) {
    if (!byPrompt[m.prompt_id]) {
      byPrompt[m.prompt_id] = {
        prompt_id: m.prompt_id,
        responses: 0,
        avg_word_count: 0,
        min_word_count: Infinity,
        max_word_count: 0,
        avg_duration: 0,
        total_words: [],
      }
    }
    const p = byPrompt[m.prompt_id]
    p.responses++
    p.total_words.push(m.word_count)
    p.min_word_count = Math.min(p.min_word_count, m.word_count)
    p.max_word_count = Math.max(p.max_word_count, m.word_count)
  }

  const results = Object.values(byPrompt).map(p => {
    const totalWords = p.total_words.reduce((a, b) => a + b, 0)
    const avgWords = p.responses > 0 ? Math.round(totalWords / p.responses) : 0
    const variance = p.responses > 1
      ? Math.round(Math.sqrt(p.total_words.reduce((sum, w) => sum + (w - avgWords) ** 2, 0) / p.responses))
      : 0

    return {
      prompt_id: p.prompt_id,
      responses: p.responses,
      avg_word_count: avgWords,
      min_word_count: p.min_word_count === Infinity ? 0 : p.min_word_count,
      max_word_count: p.max_word_count,
      word_count_stddev: variance,
      triaging_power: variance, // high variance = good triaging question
    }
  })

  // Sort by responses desc, then by triaging power
  results.sort((a, b) => b.responses - a.responses || b.triaging_power - a.triaging_power)

  return NextResponse.json({ metrics: results })
}
