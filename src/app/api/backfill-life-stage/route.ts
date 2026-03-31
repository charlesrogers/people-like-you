import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { extractStory, buildPersonalityProfile } from '@/lib/extraction-v2'
import type { StoryExtraction } from '@/lib/extraction-v2'
import { QUESTION_BANK } from '@/lib/prompts'

// One-time backfill: re-run Pass 1 + Pass 2 on all users to populate life_stage
// Most users have v1 extractions (no story_summary), so we need to re-extract from transcripts
// DELETE THIS FILE after backfill is complete
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const promptTextMap = new Map(QUESTION_BANK.map(q => [q.id, q.text]))
  const results: Array<{ userId: string; status: string; memos?: number; chapter?: string | null; confidence?: number }> = []

  const { data: profiles } = await supabase
    .from('composite_profiles')
    .select('user_id')

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: 'No profiles to backfill' })
  }

  console.log(`[backfill] Starting life-stage backfill for ${profiles.length} users`)

  for (const profile of profiles) {
    try {
      // Get all voice memos with transcripts
      const { data: memos } = await supabase
        .from('voice_memos')
        .select('id, prompt_id, transcript, extraction')
        .eq('user_id', profile.user_id)
        .not('transcript', 'is', null)

      if (!memos || memos.length === 0) {
        results.push({ userId: profile.user_id, status: 'skipped_no_transcripts' })
        console.log(`[backfill] ${profile.user_id}: no transcripts, skipping`)
        continue
      }

      // Check if any already have v2 story extractions
      const existingStories = memos
        .filter(m => m.extraction && typeof m.extraction === 'object' && 'story_summary' in (m.extraction as Record<string, unknown>))
        .map(m => m.extraction as unknown as StoryExtraction)

      let stories: StoryExtraction[]

      if (existingStories.length >= memos.length) {
        // All memos already have v2 format — just re-run Pass 2
        stories = existingStories
        console.log(`[backfill] ${profile.user_id}: ${stories.length} existing v2 stories, re-running Pass 2 only`)
      } else {
        // Need to re-run Pass 1 on memos without v2 extractions
        console.log(`[backfill] ${profile.user_id}: ${memos.length} memos, running Pass 1 + Pass 2...`)
        stories = []
        for (const memo of memos) {
          if (!memo.transcript || memo.transcript.trim().length < 10) continue
          const hasV2 = memo.extraction && typeof memo.extraction === 'object' && 'story_summary' in (memo.extraction as Record<string, unknown>)
          if (hasV2) {
            stories.push(memo.extraction as unknown as StoryExtraction)
          } else {
            const promptText = promptTextMap.get(memo.prompt_id) || memo.prompt_id
            const story = await extractStory(memo.transcript, memo.prompt_id, promptText)
            stories.push(story)
            // Save v2 extraction back to memo
            await supabase.from('voice_memos').update({ extraction: story }).eq('id', memo.id)
          }
        }
      }

      if (stories.length === 0) {
        results.push({ userId: profile.user_id, status: 'skipped_empty_transcripts' })
        continue
      }

      // Run Pass 2 (now includes life_stage)
      const newProfile = await buildPersonalityProfile(stories)

      // Update composite_profiles with life_stage
      const { error } = await supabase
        .from('composite_profiles')
        .update({
          life_stage: newProfile.life_stage ?? null,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', profile.user_id)

      if (error) {
        results.push({ userId: profile.user_id, status: `error: ${error.message}` })
        console.error(`[backfill] ${profile.user_id}: update failed:`, error.message)
      } else {
        const ls = newProfile.life_stage
        results.push({
          userId: profile.user_id,
          status: 'updated',
          memos: stories.length,
          chapter: ls?.life_chapter ?? null,
          confidence: ls?.confidence ?? 0,
        })
        console.log(`[backfill] ${profile.user_id}: ${ls?.life_chapter ?? 'null'} (confidence: ${(ls?.confidence ?? 0).toFixed(2)})`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.push({ userId: profile.user_id, status: `error: ${msg}` })
      console.error(`[backfill] ${profile.user_id}: exception:`, msg)
    }
  }

  const updated = results.filter(r => r.status === 'updated').length
  const skipped = results.filter(r => r.status.startsWith('skipped')).length
  const errors = results.filter(r => r.status.startsWith('error')).length

  console.log(`[backfill] Done: ${updated} updated, ${skipped} skipped, ${errors} errors`)

  return NextResponse.json({
    summary: { total: profiles.length, updated, skipped, errors },
    results,
  })
}
