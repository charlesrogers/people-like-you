import { NextRequest, NextResponse } from 'next/server'
import { getCompositeProfile } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const composite = await getCompositeProfile(userId)
  return NextResponse.json({ composite })
}
