import { NextRequest, NextResponse } from 'next/server'
import { getUserVoiceMemos } from '@/lib/db'
import { processVoiceMemo } from '@/lib/extraction'

// Allow up to 60 seconds for transcription + extraction
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const memos = await getUserVoiceMemos(userId)
  const unprocessed = memos.filter(m => !m.transcript)

  if (unprocessed.length === 0) {
    return NextResponse.json({ processed: 0, total: memos.length })
  }

  console.log(`Processing ${unprocessed.length} memos for user ${userId}`)

  let processed = 0
  const errors: string[] = []

  // Process all memos — sequentially to avoid rate limits
  for (const memo of unprocessed) {
    try {
      await processVoiceMemo(memo.id)
      processed++
      console.log(`Processed memo ${memo.id} (${processed}/${unprocessed.length})`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) : JSON.stringify(err)
      console.error(`Failed to process memo ${memo.id}:`, msg)
      errors.push(`${memo.prompt_id}: ${msg}`)
    }
  }

  return NextResponse.json({
    processed,
    failed: errors.length,
    total: memos.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
