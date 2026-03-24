-- Invite system: codes, tracking, queue priority
-- Applied: 2026-03-24

ALTER TABLE users ADD COLUMN invite_code text UNIQUE;
ALTER TABLE users ADD COLUMN invited_by uuid REFERENCES users(id);
ALTER TABLE users ADD COLUMN invite_count int DEFAULT 0;
ALTER TABLE users ADD COLUMN queue_priority int DEFAULT 0;

-- Invite event tracking (full funnel analytics)
CREATE TABLE invite_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code text NOT NULL,
  event_type text NOT NULL, -- link_generated, page_viewed, signup_started, signup_completed, onboarding_completed
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer_user_id uuid REFERENCES users(id),
  referred_user_id uuid, -- null until signup
  ip_hash text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Generate invite codes for existing users
-- Run after migration: UPDATE users SET invite_code = substr(md5(random()::text), 1, 6) WHERE invite_code IS NULL;
