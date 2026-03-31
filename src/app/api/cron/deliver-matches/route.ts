import { NextRequest, NextResponse } from 'next/server'
import {
  getEligibleUsersForDelivery,
  getUser,
  getCompositeProfile,
  getCompatibleUsers,
  expirePendingIntros,
  saveDailyIntro,
  saveMatch,
  updateUserCadence,
  getCurrentDailyIntro,
  createAdminAlert,
  updatePoolState,
} from '@/lib/db'
import { selectNextCandidate } from '@/lib/matchmaker'
import { generateTrailer } from '@/lib/intro-engine-v2'
import type { CompositeProfile } from '@/lib/types'

/** Classify profile richness: thin / adequate / rich */
function computeRichnessTier(profile: CompositeProfile | null): string {
  if (!profile) return 'thin'
  const quoteCount = profile.notable_quotes?.length ?? 0
  const hasVouches = (profile.friend_vouch_quotes?.length ?? 0) > 0
  const hasLifeStage = profile.life_stage && profile.life_stage.confidence > 0.3
  const memoCount = profile.memo_count ?? 0

  if (memoCount >= 6 && quoteCount >= 8 && (hasVouches || hasLifeStage)) return 'rich'
  if (memoCount >= 4 && quoteCount >= 4) return 'adequate'
  return 'thin'
}

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this automatically)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentHourUtc = new Date().getUTCHours()
  const eligible = await getEligibleUsersForDelivery(currentHourUtc)
  console.log(`Cron: ${eligible.length} users eligible for delivery at hour ${currentHourUtc}`)

  let delivered = 0
  let expired = 0
  let paused = 0

  for (const cadence of eligible) {
    try {
      // Check if user already has a pending intro today
      const existing = await getCurrentDailyIntro(cadence.user_id)
      if (existing?.status === 'pending') continue // already has one

      // Expire any old pending intros
      const expiredCount = await expirePendingIntros(cadence.user_id)
      expired += expiredCount

      // If yesterday's expired, increment inactive days
      if (expiredCount > 0) {
        const newInactiveDays = cadence.consecutive_inactive_days + 1

        // Check pause threshold (3 days)
        if (newInactiveDays >= 3) {
          await updateUserCadence(cadence.user_id, {
            is_paused: true,
            paused_at: new Date().toISOString(),
            consecutive_inactive_days: newInactiveDays,
          })
          paused++
          continue
        }

        await updateUserCadence(cadence.user_id, {
          consecutive_inactive_days: newInactiveDays,
        })
      }

      // Select best candidate
      const result = await selectNextCandidate(cadence.user_id)
      if (!result) {
        // Determine why: check if pool is empty vs all shown
        const user = await getUser(cadence.user_id)
        const userComposite = await getCompositeProfile(cadence.user_id)

        let reason = 'unknown'
        if (!userComposite) {
          reason = 'no_composite'
        } else if (user) {
          const allCompatible = await getCompatibleUsers(user, 300)
          if (allCompatible.length === 0) {
            reason = 'no_compatible_users'
          } else {
            reason = 'all_candidates_shown'
          }
        }

        await createAdminAlert({
          user_id: cadence.user_id,
          alert_type: 'empty_pool',
          metadata: { reason, checked_at: new Date().toISOString() },
        })
        await updatePoolState(cadence.user_id, 'empty_pool', reason)

        console.log(`Cron: No candidates for user ${cadence.user_id} (reason: ${reason})`)
        continue
      }

      const { candidate, score, lifeStageScore } = result
      const user = await getUser(cadence.user_id)
      if (!user) continue

      const userComposite = await getCompositeProfile(user.id)
      const candidateComposite = await getCompositeProfile(candidate.id)

      // Generate intro trailer with hook type
      let narrativeForUser = "There's someone here you should meet. Trust us on this one."
      let hookType: 'quote' | 'contradiction' | 'scene' | null = null
      let criticScore: number | null = null
      let criticSubscores: { hookPower: number; intrigue: number; specificity: number; mystery: number } | null = null
      let generationAttempts = 1
      let quoteUsed = false
      if (userComposite && candidateComposite) {
        try {
          const trailer = await generateTrailer(user, candidate, userComposite, candidateComposite)
          narrativeForUser = trailer.narrative
          hookType = trailer.hookType
          criticScore = trailer.criticScore
          criticSubscores = trailer.criticSubscores
          generationAttempts = trailer.generationAttempts
          quoteUsed = trailer.quoteUsed
        } catch (err) {
          console.error(`Cron: Failed to generate trailer for ${user.id} <> ${candidate.id}`, err)
        }
      }

      // Compute match pairing metadata
      const sharedInterests = candidateComposite && userComposite
        ? userComposite.interest_tags.filter(t => candidateComposite.interest_tags.includes(t))
        : []
      const eloDelta = Math.abs((user.elo_score ?? 1200) - (candidate.elo_score ?? 1200))
      const readerRichness = computeRichnessTier(userComposite)
      const subjectRichness = computeRichnessTier(candidateComposite)

      // Life stage delta
      let lifeStageDelta: Record<string, number> | null = null
      if (userComposite?.life_stage && candidateComposite?.life_stage) {
        lifeStageDelta = {
          rootedness: Math.abs(userComposite.life_stage.rootedness - candidateComposite.life_stage.rootedness),
          life_pace: Math.abs(userComposite.life_stage.life_pace - candidateComposite.life_stage.life_pace),
          trajectory_momentum: Math.abs(userComposite.life_stage.trajectory_momentum - candidateComposite.life_stage.trajectory_momentum),
        }
      }

      // Save match record
      const match = await saveMatch({
        user_a_id: user.id,
        user_b_id: candidate.id,
        angle_narrative: null,
        angle_style: userComposite?.excitement_type || null,
        expansion_points: candidateComposite?.interest_tags
          .filter(t => !userComposite?.interest_tags.includes(t))
          .slice(0, 5) || [],
        life_stage_score: lifeStageScore ?? null,
        elo_delta: eloDelta,
        shared_interest_count: sharedInterests.length,
        life_stage_delta: lifeStageDelta,
        subject_richness_tier: subjectRichness,
        reader_richness_tier: readerRichness,
      })

      // Calculate expires_at (next delivery time = tomorrow same hour)
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setUTCHours(currentHourUtc, 0, 0, 0)
      expiresAt.setDate(expiresAt.getDate() + 1)

      // Create daily intro with quality tracking metadata
      await saveDailyIntro({
        user_id: user.id,
        match_id: match.id,
        matched_user_id: candidate.id,
        narrative: narrativeForUser,
        status: 'pending',
        intro_type: 'daily',
        scheduled_at: now.toISOString(),
        delivered_at: null,
        acted_at: null,
        expires_at: expiresAt.toISOString(),
        voice_message_required: false,
        voice_message_path: null,
        hook_type: hookType,
        narrative_tier: null, // TODO: populate when strategy-based pipeline is used in cron
        narrative_strategy: null,
        critic_score: criticScore,
        critic_hook_power: criticSubscores?.hookPower ?? null,
        critic_intrigue: criticSubscores?.intrigue ?? null,
        critic_specificity: criticSubscores?.specificity ?? null,
        critic_mystery: criticSubscores?.mystery ?? null,
        generation_attempts: generationAttempts,
        quote_used: quoteUsed,
        repitch_attempt: 0,
        slot_position: 1,
      })

      await updatePoolState(cadence.user_id, 'normal')

      // Email notification (non-blocking)
      import('@/lib/email').then(({ sendMatchNotification }) => {
        if (user.email) sendMatchNotification(user.email, user.first_name).catch(console.error)
      })

      delivered++
      console.log(`Cron: Delivered intro for ${user.first_name} → ${candidate.first_name} (score: ${score}, hook: ${hookType})`)
    } catch (err) {
      console.error(`Cron: Error processing user ${cadence.user_id}`, err)
    }
  }

  return NextResponse.json({
    ok: true,
    hour: currentHourUtc,
    eligible: eligible.length,
    delivered,
    expired,
    paused,
  })
}
