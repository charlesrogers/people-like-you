import { NextRequest, NextResponse } from 'next/server'
import {
  getUser,
  updateUserElo,
  saveMatchFeedback,
  updateDailyIntro,
  getUserCadence,
  updateUserCadence,
  ensureUserCadence,
  saveDailyIntro,
  saveMatch,
  getUserPhotos,
  getCompositeProfile,
  checkForMutualMatch,
  createDisclosureRound,
} from '@/lib/db'
import { updateRatings } from '@/lib/elo'
import { selectNextCandidate, generateMatchAngle } from '@/lib/matchmaker'
import { generateDisclosurePrompt } from '@/lib/disclosure-prompts'

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
      const { candidate, score } = result
      const user = await getUser(userId)
      if (user) {
        const userComposite = await getCompositeProfile(userId)
        const candidateComposite = await getCompositeProfile(candidate.id)

        let narrative = "There's someone here you should meet. Trust us on this one."
        if (userComposite && candidateComposite) {
          try {
            const angles = await generateMatchAngle(user, candidate, userComposite, candidateComposite)
            narrative = angles.narrativeForA
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
        })

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 1)

        // Check anti-gaming: voice message required after 3 unresponded likes
        const voiceRequired = cadence.consecutive_unresponded_likes >= 3

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
          voice_message_required: voiceRequired,
          voice_message_path: null,
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
            voiceMessageRequired: voiceRequired,
          },
        })
      }
    }

    // Check for mutual match (both users expressed interest)
    let mutualMatch = null
    if (matchId && body.matchedUserId) {
      mutualMatch = await checkForMutualMatch(matchId, userId, body.matchedUserId)
      if (mutualMatch) {
        // Generate Round 1 disclosure prompt
        const profileA = await getCompositeProfile(mutualMatch.user_a_id)
        const profileB = await getCompositeProfile(mutualMatch.user_b_id)
        if (profileA && profileB) {
          try {
            const promptText = await generateDisclosurePrompt(1, profileA, profileB)
            await createDisclosureRound(mutualMatch.id, 1, promptText)
          } catch {
            // Non-blocking: mutual match still created even if prompt generation fails
          }
        }
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

    // Check pass streak thresholds
    let passStreakAction: string | null = null
    if (newPassStreak >= 12) passStreakAction = 'reset'
    else if (newPassStreak >= 8) passStreakAction = 'refresh_profile'
    else if (newPassStreak >= 5) passStreakAction = 'help_us_help_you'

    return NextResponse.json({ ok: true, passStreakAction })
  }

  // Other actions (opened, read_full, etc.) — just save feedback
  return NextResponse.json({ ok: true })
}
