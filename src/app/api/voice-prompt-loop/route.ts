import { NextRequest, NextResponse } from 'next/server'
import {
  getUserVoiceMemos, getUser, getCompositeProfile, getUserPhotos,
  saveMatch, saveDailyIntro,
} from '@/lib/db'
import { shouldUnlockIntro, getProgressInfo } from '@/lib/reward-schedule'
import { selectNextCandidate, generateMatchAngle, computeCompatibilityBreakdown } from '@/lib/matchmaker'

/**
 * POST /api/voice-prompt-loop
 *
 * Handles the voice-to-unlock intro loop:
 * 1. Counts how many prompts the user has answered today
 * 2. Checks if they've hit an unlock threshold
 * 3. If yes: generates a new match + narrative and returns it
 * 4. If no: returns the next unanswered prompt
 *
 * Body: { userId }
 * Returns: { nextPrompt, promptsAnswered, progress, unlockedIntro }
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId } = body

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const user = await getUser(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Count prompts answered today
  const today = new Date().toISOString().split('T')[0]
  const allMemos = await getUserVoiceMemos(userId)
  const todaysMemos = allMemos.filter(m =>
    m.created_at.startsWith(today)
  )
  const promptsAnsweredToday = todaysMemos.length

  // Get all prompt IDs the user has already answered (ever)
  const answeredPromptIds = new Set(allMemos.map(m => m.prompt_id))

  // Get progress info
  const progress = getProgressInfo(userId, today, promptsAnsweredToday)

  // Check if they've just unlocked an intro
  const justUnlocked = shouldUnlockIntro(userId, today, promptsAnsweredToday)

  let unlockedIntro = null

  if (justUnlocked && promptsAnsweredToday > 0) {
    // Generate a new match on the spot
    try {
      const result = await selectNextCandidate(userId)
      if (result) {
        const { candidate } = result
        const userComposite = await getCompositeProfile(userId)
        const candidateComposite = await getCompositeProfile(candidate.id)

        let narrative = "Based on your stories, we found someone you should meet."
        if (userComposite && candidateComposite) {
          try {
            const breakdown = computeCompatibilityBreakdown(userComposite, candidateComposite)
            const { generateNarrativeWithPipeline } = await import('@/lib/matchmaker')
            const result = await generateNarrativeWithPipeline(
              user, candidate, userComposite, candidateComposite, breakdown
            )
            narrative = result.narrative
          } catch {
            // Use fallback narrative
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

        const intro = await saveDailyIntro({
          user_id: userId,
          match_id: match.id,
          matched_user_id: candidate.id,
          narrative,
          status: 'pending',
          intro_type: 'bonus',
          scheduled_at: new Date().toISOString(),
          delivered_at: null,
          acted_at: null,
          expires_at: expiresAt.toISOString(),
          voice_message_required: false,
          voice_message_path: null,
        })

        const photos = await getUserPhotos(candidate.id)

        unlockedIntro = {
          id: intro.id,
          matchId: match.id,
          matchedUserId: candidate.id,
          name: candidate.first_name,
          narrative,
          photoUrl: photos[0]?.public_url || null,
        }
      }
    } catch (err) {
      console.error('Failed to generate unlocked intro:', err)
    }
  }

  // Find the next unanswered prompt
  const { createServerClient } = await import('@/lib/supabase')
  const supabase = createServerClient()
  const { data: allPrompts } = await supabase
    .from('prompts')
    .select('id, text, category')
    .eq('active', true)
    .order('day_number')

  const availablePrompts = (allPrompts ?? []).filter(p => !answeredPromptIds.has(p.id))
  const nextPrompt = availablePrompts.length > 0 ? availablePrompts[0] : null

  return NextResponse.json({
    nextPrompt,
    promptsAnsweredToday,
    progress: {
      promptsUntilNext: progress.promptsUntilNext,
      totalUnlocksEarned: progress.totalUnlocksEarned,
      isMaxed: progress.isMaxed,
      maxPrompts: progress.maxPrompts,
    },
    unlockedIntro,
    noMorePrompts: availablePrompts.length === 0,
  })
}
