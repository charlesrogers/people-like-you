import { NextRequest, NextResponse } from 'next/server'
import { getCalibrationCandidates } from '@/lib/db'

export async function GET(req: NextRequest) {
  const gender = req.nextUrl.searchParams.get('gender')
  const excludeUserId = req.nextUrl.searchParams.get('excludeUserId')

  if (!gender || !excludeUserId) {
    return NextResponse.json({ error: 'Missing gender or excludeUserId' }, { status: 400 })
  }

  const results = await getCalibrationCandidates(gender, excludeUserId, 15)

  const candidates = results.map(user => ({
    id: user.id,
    first_name: user.first_name,
    elo_score: user.elo_score,
    photoUrl: user.photos?.[0]?.public_url || null,
  }))

  return NextResponse.json({ candidates })
}
