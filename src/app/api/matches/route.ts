import { NextRequest, NextResponse } from 'next/server'
import {
  getUser,
  getUserPhotos,
  getCurrentDailyIntro,
  getCurrentBonusIntro,
  getIntroHistory,
  getUserCadence,
  ensureUserCadence,
  updateDailyIntro,
  getActiveMutualMatches,
  getGhostNudges,
} from '@/lib/db'
import { getLocationTier, userToLocation, haversineDistance } from '@/lib/geo'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const user = await getUser(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const cadence = await ensureUserCadence(userId)

    // Get current daily intro
    const dailyIntro = await getCurrentDailyIntro(userId)
    const bonusIntro = await getCurrentBonusIntro(userId)

    // Mark as delivered if first view
    if (dailyIntro?.status === 'pending' && !dailyIntro.delivered_at) {
      await updateDailyIntro(dailyIntro.id, { delivered_at: new Date().toISOString() })
    }
    if (bonusIntro?.status === 'pending' && !bonusIntro.delivered_at) {
      await updateDailyIntro(bonusIntro.id, { delivered_at: new Date().toISOString() })
    }

    // Enrich current intro with photos + proximity
    async function enrichIntro(intro: typeof dailyIntro) {
      if (!intro) return null
      const matchedUser = await getUser(intro.matched_user_id)
      if (!matchedUser) {
        // User was deleted — expire this intro silently
        await updateDailyIntro(intro.id, { status: 'expired' })
        return null
      }
      const photos = await getUserPhotos(intro.matched_user_id)

      // Compute proximity
      const uLoc = userToLocation(user!)
      const mLoc = userToLocation(matchedUser)
      const locationTier = getLocationTier(uLoc, mLoc)
      let distanceMiles: number | null = null
      let proximityLabel: string | null = null
      if (uLoc.latitude != null && uLoc.longitude != null && mLoc.latitude != null && mLoc.longitude != null) {
        distanceMiles = Math.round(haversineDistance(uLoc.latitude, uLoc.longitude, mLoc.latitude, mLoc.longitude) * 10) / 10
        if (distanceMiles <= 5) proximityLabel = `${Math.round(distanceMiles)} mi away`
        else if (locationTier === 2) proximityLabel = 'Same metro area'
        else if (distanceMiles <= 150) proximityLabel = `${Math.round(distanceMiles)} mi away`
        else if (locationTier === 4) proximityLabel = matchedUser.state || 'Same country'
      }

      return {
        id: intro.id,
        matchId: intro.match_id,
        matchedUserId: intro.matched_user_id,
        name: matchedUser.first_name || 'Someone',
        narrative: intro.narrative,
        photoUrl: photos[0]?.public_url || null,
        status: intro.status,
        introType: intro.intro_type,
        scheduledAt: intro.scheduled_at,
        expiresAt: intro.expires_at,
        voiceMessageRequired: intro.voice_message_required,
        locationTier,
        distanceMiles,
        proximityLabel,
      }
    }

    const currentIntro = await enrichIntro(dailyIntro)
    const currentBonus = await enrichIntro(bonusIntro)

    // History
    const rawHistory = await getIntroHistory(userId)
    const history = await Promise.all(
      rawHistory.map(async (intro) => {
        const matchedUser = await getUser(intro.matched_user_id)
        return {
          id: intro.id,
          name: matchedUser?.first_name || 'Someone',
          narrativePreview: intro.narrative.substring(0, 120) + (intro.narrative.length > 120 ? '...' : ''),
          status: intro.status,
          actedAt: intro.acted_at,
        }
      })
    )

    // Calculate next delivery time
    const now = new Date()
    const nextDelivery = new Date(now)
    nextDelivery.setUTCHours(cadence.delivery_hour, 0, 0, 0)
    if (nextDelivery <= now) nextDelivery.setDate(nextDelivery.getDate() + 1)

    // Check for active mutual match (chatting, deciding, planning, date_scheduled)
    const activeMutualMatches = await getActiveMutualMatches(userId)
    const chatStatuses = ['chatting', 'deciding', 'planning', 'date_scheduled']
    const activeChatMatch = activeMutualMatches.find(mm => chatStatuses.includes(mm.status))

    let activeChatState = null
    if (activeChatMatch) {
      const isUserA = activeChatMatch.user_a_id === userId
      const partnerId = isUserA ? activeChatMatch.user_b_id : activeChatMatch.user_a_id
      const partner = await getUser(partnerId)
      activeChatState = {
        id: activeChatMatch.id,
        matchedUserId: partnerId,
        matchedUserName: partner?.first_name || 'Your match',
        isUserA,
        status: activeChatMatch.status,
      }
    }

    // Check for ghost nudges (user hasn't messaged in an active mutual match)
    const ghostNudges = await getGhostNudges(userId)

    return NextResponse.json({
      currentIntro,
      bonusIntro: currentBonus,
      nextDeliveryAt: nextDelivery.toISOString(),
      cadenceState: {
        isPaused: cadence.is_paused,
        isHidden: cadence.is_hidden,
        consecutiveInactiveDays: cadence.consecutive_inactive_days,
        poolState: cadence.pool_state || 'normal',
        poolStateReason: cadence.pool_state_reason || null,
      },
      history,
      activeChatState,
      ghostNudges,
    })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
