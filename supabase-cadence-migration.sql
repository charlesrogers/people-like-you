-- Daily Match Cadence — Schema Migration
-- Run this in Supabase SQL Editor

-- 1. Add profile_status to users
alter table users add column if not exists profile_status text default 'active'
  check (profile_status in ('active', 'paused', 'hidden', 'deactivated'));

-- 2. Add bidirectional narratives to matches
alter table matches add column if not exists narrative_for_a text;
alter table matches add column if not exists narrative_for_b text;
alter table matches add column if not exists compatibility_score float;

-- 3. Daily intros — the core state machine
create table if not exists daily_intros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  match_id uuid references matches(id) on delete cascade not null,
  matched_user_id uuid references users(id) on delete cascade not null,
  narrative text not null,

  status text not null default 'pending'
    check (status in ('pending', 'liked', 'passed', 'expired')),

  intro_type text not null default 'daily'
    check (intro_type in ('daily', 'bonus')),

  scheduled_at timestamptz not null default now(),
  delivered_at timestamptz,
  acted_at timestamptz,
  expires_at timestamptz not null,

  voice_message_required boolean default false,
  voice_message_path text,

  created_at timestamptz default now()
);

create index if not exists idx_daily_intros_user_status on daily_intros(user_id, status);
create index if not exists idx_daily_intros_user_scheduled on daily_intros(user_id, scheduled_at desc);
create index if not exists idx_daily_intros_matched_user on daily_intros(matched_user_id);
create unique index if not exists idx_daily_intros_user_match on daily_intros(user_id, match_id);

-- 4. User cadence — per-user delivery config + state
create table if not exists user_cadence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique not null,

  delivery_hour int default 11,
  timezone text default 'America/Denver',

  is_paused boolean default false,
  is_hidden boolean default false,
  paused_at timestamptz,
  last_action_at timestamptz,
  consecutive_inactive_days int default 0,

  consecutive_passes int default 0,
  consecutive_unresponded_likes int default 0,
  total_likes int default 0,
  total_passes int default 0,

  next_match_user_id uuid references users(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Auto-create user_cadence rows for existing users
insert into user_cadence (user_id)
select id from users
where id not in (select user_id from user_cadence)
on conflict do nothing;
