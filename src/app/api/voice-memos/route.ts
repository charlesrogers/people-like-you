import { NextRequest, NextResponse } from 'next/server'
import { getUserVoiceMemos } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const memos = await getUserVoiceMemos(userId)
  return NextResponse.json({
    memos: memos.map(m => ({
      id: m.id,
      prompt_id: m.prompt_id,
      transcript: m.transcript,
      duration_seconds: m.duration_seconds,
      extraction: m.extraction,
      created_at: m.created_at,
    })),
  })
}
