# Pitch Rationales — per-pitch provenance log

**Status:** Spec approved 2026-09-02. Build after approval of ordering (see EXECUTION.md).
**Goal:** Every pitch gets one DB row explaining exactly why it was written — the mechanical inputs that went in AND the model's own stated reasoning, with every factual claim mapped to its source. Purpose: audit for unconscious bias, hallucinations, and drift. Capture-only in v1; automated verification is phase 2.

## Decisions (locked)

1. **Both rationale sources**: mechanical provenance (logged by code, 100% factual) + LLM-written rationale (generated in the *same API call* as the pitch — never a post-hoc "explain this" call, which would confabulate).
2. **Per-claim granularity**: each factual sentence in the pitch maps to its source excerpt. A claim with no source is a hallucination candidate.
3. **Bias covariates**: ON HOLD — no demographic columns in v1. Schema leaves room (`covariates jsonb`, unused).
4. **No retroactive entries** for existing samples (12 seed narratives, 8 Dane examples). All *future* hand-written sample pitches (the 16 V2-T3 pitches included) get hand-written rationale rows at authoring time.
5. New table, not columns on `daily_intros` (which already has migration drift).
6. Verifier is phase 2; schema is verifier-ready now.
7. Minimal admin view ships with v1.

## Schema — `migrations/025_pitch_rationales.sql`

```sql
create table pitch_rationales (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('generated','sample')),
  daily_intro_id uuid references daily_intros(id),  -- null for kind='sample'
  sample_ref text,                                   -- e.g. 'v2t3-pitch-07'; null for generated
  subject_user_id uuid,
  reader_user_id uuid,

  -- mechanical provenance (written by code, not the LLM)
  engine_version text not null,        -- e.g. 'v2.0'
  model text not null,                 -- exact model id
  prompt_text text not null,           -- full prompt sent
  hook_type text,
  approach_variant text,               -- which of the 3 draft approaches won
  quote_used boolean,
  generation_attempts int,
  inputs jsonb not null,               -- exact composite_profile fields fed in, verbatim
  inputs_omitted text[] not null,      -- what the model was NOT given, e.g. {'personality_quiz','physical_attributes','photos'}
  drafts jsonb,                        -- all drafts: text, approach, critic scores, critic feedback
  critic_feedback text,

  -- LLM self-report (same-call structured output)
  rationale jsonb,                     -- {why_this_hook, why_this_lead, tone_choices}
  claims jsonb not null default '[]',  -- see shape below

  covariates jsonb,                    -- reserved (decision on hold)

  -- phase 2 verifier (null in v1)
  verified_at timestamptz,
  verifier_model text,
  flag_count int
);
create index on pitch_rationales (daily_intro_id);
create index on pitch_rationales (created_at desc);
```

**Claim shape** (each element of `claims`):

```json
{
  "sentence": "the pitch sentence verbatim",
  "claim": "the factual assertion in it",
  "source_type": "quote | memo | vouch | profile_field | inference | none",
  "source_ref": "field/quote identifier from inputs",
  "source_excerpt": "the verbatim input text supporting it",
  "verdict": null,          // phase 2: supported | stretch | unsupported
  "verifier_note": null
}
```

`source_type: "inference"` is legal (the model connecting dots) but must name what it inferred from. `"none"` means the model itself admits no source — auto-flag material.

## Implementation

**`src/lib/intro-engine-v2.ts`** — `generateTrailer` prompt gains a required JSON output section: after the pitch, the model returns `rationale` + `claims` for the winning draft. Same call, structured output. Losing drafts don't get claims (cost control) — their text + critic scores land in `drafts`. `generateTrailer`'s return type gains `provenance` carrying everything above; it already knows prompt, model, inputs, drafts internally. Output token budget roughly doubles (~1024→2048 max_tokens); cost impact is cents.

**`src/lib/db.ts`** — new `savePitchRationale(provenance, dailyIntroId)`. Called immediately after `saveDailyIntro` in **all four** `generateTrailer` call sites: `/api/cron/deliver-matches`, `/api/feedback`, `/api/cadence`, `/api/voice-prompt-loop`. Rationale write failure must `console.error` + Sentry but never block intro delivery.

**`inputs_omitted`** is hard-coded truth in the engine, updated whenever the prompt's input set changes. Today: `{'personality_quiz','physical_attributes','photos','reader_identity_beyond_taste_bias'}`. This is the bias-audit anchor — it records what the model *couldn't* have used.

**Sample pitches**: when the 16 V2-T3 pitches are written (in `src/lib/sample-pitches.ts` per matching_algo-v2.md), each ships with a hand-written rationale row (`kind='sample'`, `sample_ref`, claims map to the synthetic profile they're drawn from). Authored by Claude, reviewed by Charles, inserted via a seed script — not silently.

## Admin view (v1)

New section on `/admin` (pattern: existing matching-health card): reverse-chron list of recent pitches; each row expands to show pitch text with claims inline (sentence → source excerpt side by side), the rationale, hook/approach/critic scores, and `inputs_omitted`. Claims with `source_type: none` or `inference` render highlighted. Read endpoint: `/api/admin/pitch-rationales?limit=50`, admin-auth same as matching-health.

## Phase 2 — verifier (explicitly out of scope for v1)

Async job (cron or post-generation queue): for each unverified row, a cheap model compares each `claim` against its `source_excerpt` and the full `inputs`, writes `verdict`/`verifier_note`, sets `verified_at` and `flag_count`. Admin view surfaces flagged pitches first. No generation-time blocking.

## Non-goals (v1)

- No demographic/bias covariates (held).
- No retroactive rationale for existing seed narratives or Dane grid.
- No automated verification, no alerting.
- No changes to pitch content or generation logic beyond the added structured output.

## Verification checklist (for the build session)

- [ ] Migration 025 applied; `_migrations` row present.
- [ ] One real `generateTrailer` run writes a `pitch_rationales` row with non-empty `claims`, correct `prompt_text`, all 3 drafts.
- [ ] Every claim's `source_excerpt` appears verbatim in `inputs`.
- [ ] All four call sites write rationale rows; a forced rationale-write failure still delivers the intro.
- [ ] Admin view renders claims with excerpts; `npx next build` clean.
