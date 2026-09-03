-- 025_pitch_rationales.sql — per-pitch provenance log
-- Spec: specs/pitch-rationales.md
--
-- One row per pitch explaining exactly why it was written: the mechanical inputs
-- the code fed in (100% factual) AND the model's own same-call self-report, with
-- every factual claim mapped to the input excerpt that supports it. Capture-only
-- in v1; the verifier columns stay null until phase 2.
--
-- NOTE: `_migrations` is shared with other apps on this Postgres. Match by exact
-- filename, never delete rows. Run `NOTIFY pgrst, 'reload schema'` after applying.

create table if not exists pitch_rationales (
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
  inputs_omitted text[] not null,      -- what the model was NOT given
  drafts jsonb,                        -- all drafts: text, approach, critic scores, critic feedback
  critic_feedback text,

  -- LLM self-report (same-call structured output)
  rationale jsonb,                     -- {why_this_hook, why_this_lead, tone_choices}
  claims jsonb not null default '[]',  -- see specs/pitch-rationales.md for the claim shape

  covariates jsonb,                    -- reserved (bias-covariate decision on hold)

  -- phase 2 verifier (null in v1)
  verified_at timestamptz,
  verifier_model text,
  flag_count int
);

create index if not exists idx_pitch_rationales_daily_intro on pitch_rationales (daily_intro_id);
create index if not exists idx_pitch_rationales_created on pitch_rationales (created_at desc);
