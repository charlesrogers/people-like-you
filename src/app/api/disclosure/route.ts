import { NextRequest, NextResponse } from 'next/server'
import {
  getMutualMatch, getDisclosureExchanges, getCurrentDisclosureRound,
  submitDisclosureResponse, createDisclosureRound, getCompositeProfile
} from '@/lib/db'
import { generateDisclosurePrompt } from '@/lib/disclosure-prompts'
import { recordDisclosureCompletion } from '@/lib/trust'

// GET: Fetch current disclosure exchange state for a mutual match
export async function GET(req: NextRequest) {
  try {
    const mutualMatchId = req.nextUrl.searchParams.get('mutualMatchId')
    if (!mutualMatchId) {
      return NextResponse.json({ error: 'mutualMatchId required' }, { status: 400 })
    }

    const mutualMatch = await getMutualMatch(mutualMatchId)
    if (!mutualMatch) {
      return NextResponse.json({ error: 'Mutual match not found' }, { status: 404 })
    }

    const exchanges = await getDisclosureExchanges(mutualMatchId)
    const currentRound = await getCurrentDisclosureRound(mutualMatchId)

    return NextResponse.json({
      mutualMatch,
      exchanges,
      currentRound,
    })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: Submit a response to the current disclosure round
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mutualMatchId, userId, response, voicePath } = body

    if (!mutualMatchId || !userId || !response) {
      return NextResponse.json({ error: 'mutualMatchId, userId, and response required' }, { status: 400 })
    }

    const mutualMatch = await getMutualMatch(mutualMatchId)
    if (!mutualMatch) {
      return NextResponse.json({ error: 'Mutual match not found' }, { status: 404 })
    }

    // Verify user is part of this mutual match
    if (mutualMatch.user_a_id !== userId && mutualMatch.user_b_id !== userId) {
      return NextResponse.json({ error: 'User not part of this match' }, { status: 403 })
    }

    let currentRound = await getCurrentDisclosureRound(mutualMatchId)

    // If no round exists yet, create Round 1
    if (!currentRound) {
      const profileA = await getCompositeProfile(mutualMatch.user_a_id)
      const profileB = await getCompositeProfile(mutualMatch.user_b_id)

      if (!profileA || !profileB) {
        return NextResponse.json({ error: 'Profiles not found' }, { status: 404 })
      }

      const promptText = await generateDisclosurePrompt(1, profileA, profileB)
      currentRound = await createDisclosureRound(mutualMatchId, 1, promptText)
    }

    // Check if this round has expired
    if (new Date(currentRound.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This round has expired' }, { status: 410 })
    }

    // Submit the response
    const updated = await submitDisclosureResponse(
      currentRound.id,
      userId,
      mutualMatch,
      response,
      voicePath
    )

    // Record trust point for completing a disclosure round
    await recordDisclosureCompletion(userId)

    // Check if both have now responded
    const bothResponded = updated.user_a_responded_at && updated.user_b_responded_at

    let nextRound = null
    if (bothResponded && currentRound.round_number < 3) {
      // Generate next round prompt
      const profileA = await getCompositeProfile(mutualMatch.user_a_id)
      const profileB = await getCompositeProfile(mutualMatch.user_b_id)

      if (profileA && profileB) {
        // Gather previous responses for context
        const allExchanges = await getDisclosureExchanges(mutualMatchId)
        const previousResponses = allExchanges
          .filter(e => e.user_a_responded_at && e.user_b_responded_at)
          .map(e => ({
            round: e.round_number,
            responseA: e.user_a_response || '',
            responseB: e.user_b_response || '',
          }))

        const nextPrompt = await generateDisclosurePrompt(
          currentRound.round_number + 1,
          profileA,
          profileB,
          previousResponses
        )
        nextRound = await createDisclosureRound(
          mutualMatchId,
          currentRound.round_number + 1,
          nextPrompt
        )
      }
    }

    const exchangeComplete = bothResponded && currentRound.round_number >= 3

    return NextResponse.json({
      ok: true,
      exchange: updated,
      bothResponded,
      nextRound,
      exchangeComplete,
      readyForDate: exchangeComplete,
    })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
