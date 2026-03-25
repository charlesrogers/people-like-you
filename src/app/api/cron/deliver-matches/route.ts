import { NextRequest, NextResponse } from 'next/server'
import {
  getEligibleUsersForDelivery,
  getUser,
  getUserPhotos,
  getCompositeProfile,
  expirePendingIntros,
  saveDailyIntro,
  saveMatch,
  updateUserCadence,
  updateUser,
  getCurrentDailyIntro,
} from '@/lib/db'
import { selectNextCandidate, generateMatchAngle } from '@/lib/matchmaker'

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
          // 14-day hide
          if (newInactiveDays >= 14) {
            await updateUserCadence(cadence.user_id, { is_hidden: true })
            await updateUser(cadence.user_id, { profile_status: 'hidden' })
          }
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
        console.log(`Cron: No candidates for user ${cadence.user_id}`)
        continue
      }

      const { candidate, score, lifeStageScore } = result
      const user = await getUser(cadence.user_id)
      if (!user) continue

      const userComposite = await getCompositeProfile(user.id)
      const candidateComposite = await getCompositeProfile(candidate.id)

      // Generate match angle
      let narrativeForUser = "There's someone here you should meet. Trust us on this one."
      if (userComposite && candidateComposite) {
        try {
          const angles = await generateMatchAngle(user, candidate, userComposite, candidateComposite)
          narrativeForUser = angles.narrativeForA
        } catch (err) {
          console.error(`Cron: Failed to generate angle for ${user.id} <> ${candidate.id}`, err)
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
      })

      // Calculate expires_at (next delivery time = tomorrow same hour)
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setUTCHours(currentHourUtc, 0, 0, 0)
      expiresAt.setDate(expiresAt.getDate() + 1)

      // Create daily intro
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
      })

      delivered++
      console.log(`Cron: Delivered intro for ${user.first_name} → ${candidate.first_name} (score: ${score})`)
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
