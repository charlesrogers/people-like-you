import { NextRequest, NextResponse } from 'next/server'
import { getUserVoiceMemos, getCompositeProfile } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const memos = await getUserVoiceMemos(userId)
  const composite = await getCompositeProfile(userId)

  const total = memos.length
  const transcribed = memos.filter(m => m.transcript !== null).length
  const extracted = memos.filter(m => m.extraction !== null).length

  return NextResponse.json({
    total,
    transcribed,
    extracted,
    compositeReady: composite !== null,
    excitementType: composite?.excitement_type || null,
    memoCount: composite?.memo_count || 0,
  })
}
