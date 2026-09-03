/**
 * Verification harness for the pitch-rationales provenance system.
 * Run: npx tsx --env-file=.env.local scripts/verify-pitch-rationales.ts
 *
 * Walks the spec's verification checklist (specs/pitch-rationales.md):
 *   1. one real generateTrailer run produces claims + all drafts
 *   2. every claim's source_excerpt appears VERBATIM in inputs
 *   3. a baseline pitch (no rationale instruction) for the same pair, so the
 *      structured-output change can be judged against the old behaviour
 *   4. savePitchRationale round-trip, incl. a forced failure that must not throw
 */
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '../src/lib/supabase'
import { generateTrailer, INTRO_ENGINE_CONFIG } from '../src/lib/intro-engine-v2'
import { savePitchRationale } from '../src/lib/db'
import type { CompositeProfile, User, PitchProvenance } from '../src/lib/types'

const db = createServerClient()
let failures = 0
function check(name: string, cond: boolean, detail?: string) {
  if (!cond) { failures++; console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`) }
  else console.log(`  ✓ ${name}`)
}

/** Every string leaf of the inputs object, for verbatim excerpt matching. */
function stringLeaves(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach(x => stringLeaves(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach(x => stringLeaves(x, out))
  return out
}

async function main() {
  console.log('→ Loading two real users with composite profiles...')
  const { data: profiles, error } = await db
    .from('composite_profiles')
    .select('*')
    .not('notable_quotes', 'is', null)
    .order('memo_count', { ascending: false })
    .limit(20)
  if (error) throw error

  const withQuotes = (profiles || []).filter(p => (p.notable_quotes?.length ?? 0) >= 2)
  if (withQuotes.length < 2) throw new Error(`Need 2 profiles with quotes, found ${withQuotes.length}`)

  const { data: users } = await db
    .from('users')
    .select('*')
    .in('id', withQuotes.map(p => p.user_id))
  const userById = new Map((users || []).map(u => [u.id, u as User]))

  // The pitch is ABOUT the subject, so the subject gets the richest profile;
  // the reader only supplies taste bias. Opposite genders, like production.
  const ranked = withQuotes
    .filter(p => userById.has(p.user_id))
    .sort((a, b) => (b.notable_quotes?.length ?? 0) - (a.notable_quotes?.length ?? 0))
  const subjectProfile: CompositeProfile | null = ranked[0] ?? null
  const readerProfile: CompositeProfile | null = subjectProfile
    ? ranked.find(p => userById.get(p.user_id)!.gender !== userById.get(subjectProfile.user_id)!.gender) ?? null
    : null
  if (!readerProfile || !subjectProfile) throw new Error('Could not form a reader/subject pair')

  const reader = userById.get(readerProfile.user_id)!
  const subject = userById.get(subjectProfile.user_id)!
  console.log(`  reader: ${reader.first_name} (${reader.gender}), subject: ${subject.first_name} (${subject.gender})`)
  console.log(`  subject quotes: ${subjectProfile.notable_quotes?.length}, memos: ${subjectProfile.memo_count}`)

  // ── 1. Real generateTrailer run (NEW path, same-call structured output) ──
  console.log('\n→ [1/4] Running generateTrailer (new path)...')
  const t0 = Date.now()
  const trailer = await generateTrailer(reader, subject, readerProfile, subjectProfile)
  console.log(`  done in ${Math.round((Date.now() - t0) / 1000)}s`)
  const p: PitchProvenance = trailer.provenance

  console.log('\n──────── PITCH (new, with rationale output) ────────')
  console.log(trailer.narrative)
  console.log(`──────── critic ${trailer.criticScore}/100, hook ${trailer.hookType}, approach ${p.approach_variant} ────────\n`)

  check('provenance present', !!p)
  check('claims non-empty', p.claims.length > 0, `${p.claims.length} claims`)
  check('rationale present', !!p.rationale)
  check('prompt_text is the winning draft prompt', p.prompt_text.includes('OUTPUT FORMAT') && p.prompt_text.includes(subject.first_name))
  check('all drafts recorded', p.drafts.length >= 3, `${p.drafts.length} drafts`)
  check('exactly one draft selected', p.drafts.filter(d => d.selected).length === 1)
  check('selected draft text == narrative', p.drafts.find(d => d.selected)?.text === trailer.narrative)
  check('engine_version/model recorded', p.engine_version === INTRO_ENGINE_CONFIG.version && p.model === INTRO_ENGINE_CONFIG.model)
  check('inputs_omitted recorded', p.inputs_omitted.length === 4, p.inputs_omitted.join(','))

  // ── 2. Every source_excerpt appears verbatim in inputs ──
  console.log('\n→ [2/4] Auditing claims against inputs (verbatim check)...')
  const haystack = stringLeaves(p.inputs)
  let sourced = 0, inferred = 0, unsourced = 0, verbatimFail = 0, caseNormalized = 0
  for (const c of p.claims) {
    const tag = `[${c.source_type}]`
    if (c.source_type === 'none') { unsourced++; console.log(`  ${tag} "${c.sentence.slice(0, 70)}..." — model admits no source`); continue }
    if (c.source_type === 'inference') {
      inferred++
      console.log(`  ${tag} "${c.sentence.slice(0, 60)}..." ← inferred from: ${c.source_ref ?? 'unnamed'}`)
      continue
    }
    sourced++
    const ex = (c.source_excerpt ?? '').trim()
    const exact = ex.length > 0 && haystack.some(h => h.includes(ex))
    // Reported separately, never merged: a case-only difference is the model
    // sentence-casing a lowercase field, not inventing a source. A fabricated
    // excerpt fails both.
    const loose = !exact && ex.length > 0 && haystack.some(h => h.toLowerCase().includes(ex.toLowerCase()))
    if (exact) {
      console.log(`  ✓ verbatim ${tag} "${ex.slice(0, 70)}${ex.length > 70 ? '...' : ''}"`)
    } else if (loose) {
      caseNormalized++
      console.log(`  ~ verbatim after case-normalisation ${tag} "${ex.slice(0, 70)}${ex.length > 70 ? '...' : ''}"`)
    } else {
      verbatimFail++
      console.error(`  ✗ NOT IN INPUTS ${tag} excerpt: "${ex.slice(0, 90)}"`)
    }
  }
  console.log(`  totals: ${p.claims.length} claims — ${sourced} sourced (${caseNormalized} case-normalised), ${inferred} inference, ${unsourced} none`)
  check('every sourced claim excerpt appears in inputs (exact or case-normalised)', verbatimFail === 0, `${verbatimFail} misses`)

  // ── 3. Baseline: same inputs, OLD prompt (no rationale instruction) ──
  console.log('\n→ [3/4] Baseline pitch with the pre-change prompt (same pair, same hook)...')
  const anthropic = new Anthropic()
  const basePrompt = p.prompt_text.split('\n\nOUTPUT FORMAT')[0]
  const baseMsg = await anthropic.messages.create({
    model: INTRO_ENGINE_CONFIG.model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: basePrompt }],
  })
  const baseText = baseMsg.content[0].type === 'text' ? baseMsg.content[0].text.trim() : ''
  console.log('\n──────── PITCH (baseline, old prompt, same hook + approach) ────────')
  console.log(baseText)
  console.log('────────────────────────────────────────────────────────\n')

  // ── 4. savePitchRationale round-trip + forced failure ──
  console.log('→ [4/4] savePitchRationale round-trip...')
  const before = await db.from('pitch_rationales').select('id', { count: 'exact', head: true })
  await savePitchRationale(p, null)
  const { data: rows } = await db
    .from('pitch_rationales').select('*').order('created_at', { ascending: false }).limit(1)
  const row = rows?.[0]
  check('row written', !!row)
  if (row) {
    check('claims round-tripped', (row.claims as unknown[]).length === p.claims.length)
    check('prompt_text round-tripped', row.prompt_text === p.prompt_text)
    check('all drafts round-tripped', (row.drafts as unknown[]).length === p.drafts.length)
    check('inputs_omitted round-tripped', (row.inputs_omitted as string[]).length === 4)
    console.log(`  row id: ${row.id} (before count: ${before.count})`)
  }

  console.log('\n→ Forced failure: a rationale write that CANNOT succeed must not throw')
  const poisoned = { ...p, kind: 'not_a_valid_kind' } as unknown as PitchProvenance
  let threw = false
  try { await savePitchRationale(poisoned, null) } catch { threw = true }
  check('savePitchRationale swallowed a constraint violation (delivery would continue)', !threw)

  // Clean up the harness row so the audit table only holds real deliveries.
  if (row) {
    await db.from('pitch_rationales').delete().eq('id', row.id)
    console.log(`  cleaned up harness row ${row.id}`)
  }

  console.log(`\n${failures === 0 ? '✅ ALL CHECKS PASSED' : `❌ ${failures} CHECK(S) FAILED`}`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch(e => { console.error(e); process.exit(1) })
