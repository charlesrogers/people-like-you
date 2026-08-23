-- 023_matching_v2_quiz.sql — V2-T1
-- Reader instrument (battery v1.0 / instrument_version 'B-1.0') storage.
-- Spec: specs/farmout-v2-quiz-build.md section 2, matching_algo-v2.md section 10.
--
-- NOTE: `_migrations` is shared with other apps on this Postgres. Match by exact
-- filename, never delete rows. Run `NOTIFY pgrst, 'reload schema'` after applying.

-- Derived reader traits, one row per user. taste_priors / pickiness / scale_use
-- stay null until V2-T3 (the pitch-taste step) ships.
create table if not exists reader_traits (
  user_id uuid primary key references users(id) on delete cascade,
  big5 jsonb,
  milieu jsonb,
  homogamy jsonb,
  convo jsonb,
  taste_priors jsonb,
  pickiness numeric,
  scale_use numeric,
  register text check (register in ('playful','earnest')),
  instrument_version text not null,
  completed_at timestamptz default now()
);

-- Raw per-item responses. NOT in matching_algo-v2 section 10, and required: per-item
-- distributions, response times and drop-off (D-QD7 item analytics, and the N4
-- dead-item criterion) cannot be computed from the derived jsonb alone.
create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  item_id text not null,                 -- 'Q1'..'Q23'
  option_index smallint,                 -- null = skipped; index AS DISPLAYED
  polarity_flipped boolean not null default false,
  response_ms integer,
  instrument_version text not null,
  created_at timestamptz default now(),
  unique (user_id, item_id, instrument_version)
);

create index if not exists idx_quiz_responses_item on quiz_responses(item_id, option_index);
create index if not exists idx_quiz_responses_user on quiz_responses(user_id);

-- Which prompts were fished from quiz answers vs drawn from the bank, so
-- per-item story yield is measurable (D-QD7).
alter table voice_memos add column if not exists prompt_source text
  check (prompt_source in ('bank','fished'));
alter table voice_memos add column if not exists prompt_seed jsonb;
