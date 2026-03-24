import { NextRequest, NextResponse } from 'next/server'
import { getMutualMatch, getUserAvailability, getCompositeProfile } from '@/lib/db'
import { buildDateSuggestions } from '@/lib/activity-matcher'

// GET: Get 4 date suggestions (time + activity) for a mutual match
export async function GET(req: NextRequest) {
  const mutualMatchId = req.nextUrl.searchParams.get('mutualMatchId')
  if (!mutualMatchId) {
    return NextResponse.json({ error: 'mutualMatchId required' }, { status: 400 })
  }

  const mutualMatch = await getMutualMatch(mutualMatchId)
  if (!mutualMatch) {
    return NextResponse.json({ error: 'Mutual match not found' }, { status: 404 })
  }

  const [availA, availB, profileA, profileB] = await Promise.all([
    getUserAvailability(mutualMatch.user_a_id),
    getUserAvailability(mutualMatch.user_b_id),
    getCompositeProfile(mutualMatch.user_a_id),
    getCompositeProfile(mutualMatch.user_b_id),
  ])

  if (!availA || !availB) {
    return NextResponse.json({
      error: 'Both users need to set their availability first',
      missingAvailability: {
        userA: !availA,
        userB: !availB,
      }
    }, { status: 400 })
  }

  if (!profileA || !profileB) {
    return NextResponse.json({ error: 'Profiles not found' }, { status: 404 })
  }

  const suggestions = buildDateSuggestions(
    availA.availability,
    availB.availability,
    profileA,
    profileB,
    4
  )

  if (suggestions.length === 0) {
    return NextResponse.json({
      suggestions: [],
      message: 'No overlapping availability found in the next 7 days. Try adding more time slots.',
    })
  }

  return NextResponse.json({ suggestions })
}
