-- 025_prompt_instrumentation.sql — voice prompt v4 test instrumentation
-- What the picker showed, what was picked or passed over, how long a prompt sat
-- open before the first take, how many takes were thrown away, and which
-- example arm the account is in. This is what makes "drop the prompts people
-- ignore" a query instead of a guess. Additive only; staging and prod share this DB.
--
-- NOTE: `_migrations` is shared with other apps on this Postgres. Match by exact
-- filename, never delete rows. Run `NOTIFY pgrst, 'reload schema'` after applying.

alter table voice_memos
  add column if not exists example_shown boolean,
  add column if not exists seconds_to_record integer,
  add column if not exists rerecord_count integer;

alter table prompt_metrics
  add column if not exists example_shown boolean,
  add column if not exists seconds_to_record integer,
  add column if not exists rerecord_count integer,
  add column if not exists prompt_source text;

create table if not exists prompt_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  prompt_id text not null,
  prompt_source text,
  event text not null check (event in ('shown', 'picked', 'passed', 'skipped', 'recorded')),
  angle text,
  position smallint,
  example_shown boolean,
  created_at timestamptz not null default now()
);
create index if not exists idx_prompt_events_prompt on prompt_events (prompt_id, event);
create index if not exists idx_prompt_events_user on prompt_events (user_id, created_at);

notify pgrst, 'reload schema';
