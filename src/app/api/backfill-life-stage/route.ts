import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { buildPersonalityProfile } from '@/lib/extraction-v2'
import type { StoryExtraction } from '@/lib/extraction-v2'

// One-time backfill: re-run Pass 2 on all users to populate life_stage
// DELETE THIS FILE after backfill is complete
export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const results: Array<{ userId: string; status: string; chapter?: string; confidence?: number }> = []

  // Get all users with voice memos that have v2 story extractions
  const { data: profiles } = await supabase
    .from('composite_profiles')
    .select('user_id')

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ message: 'No profiles to backfill' })
  }

  console.log(`[backfill] Starting life-stage backfill for ${profiles.length} users`)

  for (const profile of profiles) {
    try {
      // Get all voice memos with v2 story extractions
      const { data: memos } = await supabase
        .from('voice_memos')
        .select('extraction')
        .eq('user_id', profile.user_id)
        .not('extraction', 'is', null)

      const stories = (memos || [])
        .filter(m => m.extraction && typeof m.extraction === 'object' && 'story_summary' in m.extraction)
        .map(m => m.extraction as unknown as StoryExtraction)

      if (stories.length === 0) {
        results.push({ userId: profile.user_id, status: 'skipped_no_stories' })
        console.log(`[backfill] ${profile.user_id}: no v2 stories, skipping`)
        continue
      }

      // Re-run Pass 2 (this now includes life_stage extraction)
      console.log(`[backfill] ${profile.user_id}: running Pass 2 on ${stories.length} stories...`)
      const newProfile = await buildPersonalityProfile(stories)

      // Update composite_profiles with life_stage data
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
          chapter: ls?.life_chapter ?? 'null',
          confidence: ls?.confidence ?? 0,
        })
        console.log(`[backfill] ${profile.user_id}: ${ls?.life_chapter ?? 'null'} (confidence: ${ls?.confidence ?? 0})`)
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
