import { NextRequest, NextResponse } from 'next/server'
import { getHardPreferences } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const preferences = await getHardPreferences(userId)
  return NextResponse.json({ preferences })
}
