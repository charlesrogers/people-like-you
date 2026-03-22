-- People Like You — Database Schema
-- Run this in Supabase SQL Editor

-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  first_name text not null,
  last_name text,
  gender text check (gender in ('Man', 'Woman')),
  seeking text check (seeking in ('Men', 'Women')),
  birth_year int,
  state text,
  height text,
  education text,
  onboarding_stage text default 'signup' check (onboarding_stage in ('signup', 'day0_complete', 'drip_1', 'drip_2', 'drip_3', 'drip_4', 'drip_5', 'drip_6', 'complete')),
  elo_score int default 1200,
  elo_interactions int default 0,
  community text default 'general',
  is_seed boolean default false,
  created_at timestamptz default now()
);

-- Hard preferences (dealbreakers)
create table hard_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique not null,
  age_range_min int,
  age_range_max int,
  distance_radius text check (distance_radius in ('same_metro', 'few_hours', 'anywhere')),
  faith_importance text check (faith_importance in ('essential', 'important', 'nice_to_have', 'doesnt_matter')),
  kids text check (kids in ('has', 'wants', 'open', 'doesnt_want')),
  marital_history text check (marital_history in ('never_married', 'divorced')),
  smoking text check (smoking in ('yes', 'no', 'sometimes', 'dealbreaker')),
  community_fields jsonb default '{}'
);

-- Soft preferences (weighted, not binary)
create table soft_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique not null,
  humor_style text[],
  energy_level text check (energy_level in ('adventurous', 'homebody', 'balanced')),
  communication_style text check (communication_style in ('direct', 'gentle', 'expressive')),
  life_stage_priority text check (life_stage_priority in ('career', 'family', 'balanced')),
  date_activity_prefs text[]
);

-- Photos
create table photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  storage_path text not null,
  public_url text not null,
  sort_order int default 1,
  created_at timestamptz default now()
);

-- Voice memos
create table voice_memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  prompt_id text not null,
  audio_storage_path text not null,
  duration_seconds int,
  transcript text,
  extraction jsonb,
  day_number int default 0,
  created_at timestamptz default now()
);

-- Composite profiles (aggregated from voice memos)
create table composite_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique not null,
  big_five_proxy jsonb default '{}',
  humor_style text,
  communication_warmth float,
  communication_directness float,
  energy_enthusiasm float,
  storytelling_ability float,
  passion_indicators text[] default '{}',
  kindness_markers text[] default '{}',
  vulnerability_authenticity float,
  interest_tags text[] default '{}',
  values text[] default '{}',
  goals text[] default '{}',
  excitement_type text check (excitement_type in ('explorer', 'nester', 'intellectual', 'spark')),
  notable_quotes text[] default '{}',
  memo_count int default 0,
  last_updated timestamptz default now()
);

-- Matches
create table matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid references users(id) on delete cascade not null,
  user_b_id uuid references users(id) on delete cascade not null,
  angle_narrative text,
  angle_style text,
  expansion_points text[] default '{}',
  created_at timestamptz default now()
);

-- Match feedback
create table match_feedback (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  action text not null check (action in ('opened', 'read_full', 'interested', 'not_interested', 'mutual', 'conversation_started')),
  reason text,
  details text,
  photo_revealed_before_decision boolean default false,
  created_at timestamptz default now()
);

-- Prompts bank
create table prompts (
  id text primary key,
  text text not null,
  day_number int not null,
  category text check (category in ('warmth', 'humor', 'depth', 'ambition', 'vulnerability')),
  active boolean default true
);

-- Email drips
create table email_drips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  day_number int not null,
  prompt_id text references prompts(id),
  sent_at timestamptz default now(),
  opened_at timestamptz,
  recorded_at timestamptz
);

-- Indexes
create index idx_users_gender on users(gender);
create index idx_users_elo on users(elo_score);
create index idx_users_community on users(community);
create index idx_voice_memos_user on voice_memos(user_id);
create index idx_matches_user_a on matches(user_a_id);
create index idx_matches_user_b on matches(user_b_id);
create index idx_match_feedback_match on match_feedback(match_id);
create index idx_photos_user on photos(user_id);

-- Seed the prompt bank
insert into prompts (id, text, day_number, category) values
  ('proud_moment', 'Tell a story about a time you were proud of yourself.', 0, 'ambition'),
  ('surprises_people', 'Tell a story about yourself that surprises people.', 0, 'vulnerability'),
  ('secret_skill', 'What''s a secret skill you have that most people don''t know about?', 0, 'depth'),
  ('most_yourself', 'Describe a moment when you felt most like yourself.', 0, 'vulnerability'),
  ('teach_someone', 'What''s something you''d want to teach someone you care about?', 0, 'warmth'),
  ('talk_for_hours', 'What could you talk about for hours that most people don''t care about?', 0, 'depth'),
  ('saturday_morning', 'What does a perfect Saturday morning look like for you?', 1, 'warmth'),
  ('changed_worldview', 'Tell me about someone who changed how you see the world.', 2, 'depth'),
  ('unpopular_belief', 'What''s something you believe that most people disagree with?', 3, 'depth'),
  ('best_meal', 'Describe the best meal you''ve ever had — where were you, who were you with?', 4, 'warmth'),
  ('secretly_proud', 'What''s a skill you''re secretly proud of?', 5, 'ambition'),
  ('funniest_thing', 'What''s the funniest thing that''s happened to you recently?', 6, 'humor');

-- Storage buckets (run these in Supabase Storage settings or via API)
-- Bucket: voice-memos (private)
-- Bucket: photos (public)
