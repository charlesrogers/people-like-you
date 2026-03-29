import { NextRequest, NextResponse } from 'next/server'
import {
  getUserCadence,
  ensureUserCadence,
  updateUserCadence,
  updateUser,
  expirePendingIntros,
  saveDailyIntro,
  saveMatch,
  getUser,
  getCompositeProfile,
} from '@/lib/db'
import { selectNextCandidate } from '@/lib/matchmaker'
import { generateTrailer } from '@/lib/intro-engine-v2'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const cadence = await ensureUserCadence(userId)
  return NextResponse.json({ cadence })
}

export async function PATCH(req: NextRequest) {
  const { userId, delivery_hour, timezone } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (delivery_hour !== undefined) updates.delivery_hour = delivery_hour
  if (timezone !== undefined) updates.timezone = timezone

  const cadence = await updateUserCadence(userId, updates)
  return NextResponse.json({ cadence })
}

export async function POST(req: NextRequest) {
  const { userId, action } = await req.json()
  if (!userId || action !== 'resume') {
    return NextResponse.json({ error: 'Missing userId or invalid action' }, { status: 400 })
  }

  // Resume from paused/hidden
  await updateUserCadence(userId, {
    is_paused: false,
    is_hidden: false,
    consecutive_inactive_days: 0,
  })
  await updateUser(userId, { profile_status: 'active' })

  // Expire any stale pending intros
  await expirePendingIntros(userId)

  // Generate an immediate intro
  const result = await selectNextCandidate(userId)
  if (!result) {
    return NextResponse.json({ ok: true, intro: null, message: "We're finding people for you. Check back soon." })
  }

  const { candidate, score, lifeStageScore } = result
  const user = await getUser(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

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

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + 1)

  const intro = await saveDailyIntro({
    user_id: userId,
    match_id: match.id,
    matched_user_id: candidate.id,
    narrative,
    status: 'pending',
    intro_type: 'daily',
    scheduled_at: now.toISOString(),
    delivered_at: null,
    acted_at: null,
    expires_at: expiresAt.toISOString(),
    voice_message_required: false,
    voice_message_path: null,
    hook_type: hookType,
  })

  return NextResponse.json({ ok: true, intro })
}
