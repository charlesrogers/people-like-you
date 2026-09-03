import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAuth(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

/**
 * Reverse-chron pitch provenance log (migration 025, specs/pitch-rationales.md).
 * Capture-only in v1 — verdicts stay null until the phase-2 verifier ships.
 */
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 50, 200)
  const db = createServerClient()

  const { data, error } = await db
    .from('pitch_rationales')
    .select('id, created_at, kind, daily_intro_id, sample_ref, subject_user_id, reader_user_id, engine_version, model, hook_type, approach_variant, quote_used, generation_attempts, inputs, inputs_omitted, drafts, critic_feedback, rationale, claims, verified_at, flag_count')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message, rationales: [], totals: null }, { status: 500 })
  }

  const rows = data || []

  // The delivered pitch text. Prefer daily_intros.narrative (what the reader
  // actually saw); fall back to the selected draft for kind='sample' rows.
  const introIds = rows.map(r => r.daily_intro_id).filter((v): v is string => !!v)
  const narrativeById = new Map<string, string>()
  const nameById = new Map<string, string>()
  if (introIds.length > 0) {
    const { data: intros } = await db
      .from('daily_intros')
      .select('id, narrative')
      .in('id', introIds)
    for (const i of intros || []) narrativeById.set(i.id as string, i.narrative as string)
  }

  const userIds = [...new Set(rows.flatMap(r => [r.subject_user_id, r.reader_user_id]))]
    .filter((v): v is string => !!v)
  if (userIds.length > 0) {
    const { data: users } = await db.from('users').select('id, first_name').in('id', userIds)
    for (const u of users || []) nameById.set(u.id as string, u.first_name as string)
  }

  type Claim = { source_type?: string }
  type Draft = { selected?: boolean; text?: string }

  const rationales = rows.map(r => {
    const drafts = (r.drafts as Draft[] | null) ?? []
    const selected = drafts.find(d => d.selected)
    const claims = (r.claims as Claim[] | null) ?? []
    return {
      ...r,
      subject_name: r.subject_user_id ? nameById.get(r.subject_user_id) ?? null : null,
      reader_name: r.reader_user_id ? nameById.get(r.reader_user_id) ?? null : null,
      narrative: (r.daily_intro_id ? narrativeById.get(r.daily_intro_id) : null)
        ?? selected?.text ?? null,
      unsourcedCount: claims.filter(c => c.source_type === 'none').length,
      inferenceCount: claims.filter(c => c.source_type === 'inference').length,
      claimCount: claims.length,
    }
  })

  const totals = {
    rows: rationales.length,
    claims: rationales.reduce((a, r) => a + r.claimCount, 0),
    unsourced: rationales.reduce((a, r) => a + r.unsourcedCount, 0),
    inference: rationales.reduce((a, r) => a + r.inferenceCount, 0),
    withNoClaims: rationales.filter(r => r.claimCount === 0).length,
  }

  return NextResponse.json({ rationales, totals })
}
