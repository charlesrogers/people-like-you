import { NextRequest, NextResponse } from 'next/server'
import {
  getUser,
  updateUserElo,
  saveMatchFeedback,
  updateDailyIntro,
  updateUserCadence,
  ensureUserCadence,
  saveDailyIntro,
  saveMatch,
  getUserPhotos,
  getCompositeProfile,
  checkForMutualMatch,
  updateMutualMatch,
} from '@/lib/db'
import { updateRatings } from '@/lib/elo'
import { selectNextCandidate } from '@/lib/matchmaker'
import { generateTrailer } from '@/lib/intro-engine-v2'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { introId, matchId, userId, action, reason, details, photoRevealedBeforeDecision } = body

  if (!userId || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Save feedback record
  if (matchId) {
    await saveMatchFeedback({
      match_id: matchId,
      user_id: userId,
      action,
      reason: reason || null,
      details: details || null,
      photo_revealed_before_decision: photoRevealedBeforeDecision || false,
    })
  }

  const cadence = await ensureUserCadence(userId)
  const now = new Date().toISOString()

  // Update daily intro status if provided
  if (introId) {
    const newStatus = action === 'interested' ? 'liked' : 'passed'
    await updateDailyIntro(introId, { status: newStatus, acted_at: now })
  }

  // Handle LIKE
  if (action === 'interested') {
    await updateUserCadence(userId, {
      last_action_at: now,
      consecutive_inactive_days: 0,
      consecutive_passes: 0,
      total_likes: cadence.total_likes + 1,
    })

    // Generate bonus match
    const result = await selectNextCandidate(userId)
    if (result) {
      const { candidate, score, lifeStageScore } = result
      const user = await getUser(userId)
      if (user) {
        const userComposite = await getCompositeProfile(userId)
        const candidateComposite = await getCompositeProfile(candidate.id)

        let narrative = "There's someone here you should meet. Trust us on this one."
        let hookType: 'quote' | 'contradiction' | 'scene' | null = null
        if (userComposite && candidateComposite) {
          try {
            const trailer = await generateTrailer(user, candidate, userComposite, candidateComposite)
            narrative = trailer.narrative
            hookType = trailer.hookType
          } catch {
            // use fallback
          }
        }

        const match = await saveMatch({
          user_a_id: userId,
          user_b_id: candidate.id,
          angle_narrative: null,
          angle_style: userComposite?.excitement_type || null,
          expansion_points: candidateComposite?.interest_tags
            .filter(t => !userComposite?.interest_tags.includes(t))
            .slice(0, 5) || [],
          life_stage_score: lifeStageScore ?? null,
        })

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 1)

        const bonusIntro = await saveDailyIntro({
          user_id: userId,
          match_id: match.id,
          matched_user_id: candidate.id,
          narrative,
          status: 'pending',
          intro_type: 'bonus',
          scheduled_at: now,
          delivered_at: null,
          acted_at: null,
          expires_at: expiresAt.toISOString(),
          voice_message_required: false,
          voice_message_path: null,
          hook_type: hookType,
        })

        const photos = await getUserPhotos(candidate.id)
        return NextResponse.json({
          ok: true,
          bonusIntro: {
            id: bonusIntro.id,
            matchId: match.id,
            matchedUserId: candidate.id,
            name: candidate.first_name,
            narrative,
            photoUrl: photos[0]?.public_url || null,
            status: 'pending',
            introType: 'bonus',
            expiresAt: expiresAt.toISOString(),
            voiceMessageRequired: false,
          },
        })
      }
    }

    // Check for mutual match (both users expressed interest)
    let mutualMatch = null
    if (matchId && body.matchedUserId) {
      mutualMatch = await checkForMutualMatch(matchId, userId, body.matchedUserId)
      if (mutualMatch) {
        // Set up constrained chat (replaces disclosure exchange)
        const chatExpiresAt = new Date()
        chatExpiresAt.setHours(chatExpiresAt.getHours() + 72)
        await updateMutualMatch(mutualMatch.id, {
          status: 'chatting',
          chat_started_at: new Date().toISOString(),
          chat_expires_at: chatExpiresAt.toISOString(),
        } as Partial<typeof mutualMatch>)

      }
    }

    return NextResponse.json({
      ok: true,
      bonusIntro: null,
      mutualMatch: mutualMatch ? {
        id: mutualMatch.id,
        matchedUserId: body.matchedUserId,
      } : null,
    })
  }

  // Handle PASS
  if (action === 'not_interested') {
    const newPassStreak = cadence.consecutive_passes + 1
    await updateUserCadence(userId, {
      last_action_at: now,
      consecutive_inactive_days: 0,
      consecutive_passes: newPassStreak,
      total_passes: cadence.total_passes + 1,
    })

    // Elo adjustment for physical attraction feedback
    if (reason === 'not_attracted' && matchId) {
      const rejector = await getUser(userId)
      const rejected = await getUser(body.matchedUserId || matchId)
      if (rejector && rejected) {
        const { newRatingB } = updateRatings(
          rejector.elo_score,
          rejected.elo_score,
          0,
          rejector.elo_interactions,
          8
        )
        await updateUserElo(rejected.id, newRatingB)
      }
    }

    // After 5 consecutive passes, prompt voice memo to improve matches
    let passStreakAction: string | null = null
    if (newPassStreak >= 5) passStreakAction = 'tell_us_more'

    return NextResponse.json({ ok: true, passStreakAction })
  }

  // Other actions (opened, read_full, etc.) — just save feedback
  return NextResponse.json({ ok: true })
}
