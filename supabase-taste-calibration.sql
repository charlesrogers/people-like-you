-- Taste Calibration + Profile Feedback — Schema Migration

create table if not exists taste_calibration (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  narrative_id text not null,
  vote boolean not null,
  attributes_selected text[] default '{}',
  narrative_style text,
  created_at timestamptz default now()
);

create index if not exists idx_taste_cal_user on taste_calibration(user_id);

-- Add profile feedback column to composite_profiles
alter table composite_profiles add column if not exists profile_feedback jsonb;
