import { NextRequest, NextResponse } from 'next/server'
import { getUserVoiceMemos, getCompositeProfile } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
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
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
