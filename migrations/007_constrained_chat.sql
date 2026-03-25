-- Constrained Chat + Meet Decision + Date Planning
-- Replaces disclosure exchange flow with 10-message chat → blind decision → date planning
-- Applied: 2026-03-24

-- ─── Chat Messages ───
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mutual_match_id uuid REFERENCES mutual_matches(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES users(id) NOT NULL,
  content text NOT NULL,
  voice_url text,
  transcript text,
  message_number int NOT NULL CHECK (message_number BETWEEN 1 AND 10),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_chat_messages_match ON chat_messages(mutual_match_id, created_at);
CREATE UNIQUE INDEX idx_chat_messages_unique ON chat_messages(mutual_match_id, sender_id, message_number);

-- ─── Meet Decisions (blind yes/no) ───
CREATE TABLE meet_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mutual_match_id uuid REFERENCES mutual_matches(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  decision text NOT NULL CHECK (decision IN ('yes', 'no')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(mutual_match_id, user_id)
);

-- ─── Date Planning Preferences (specific dates for a match, not recurring) ───
CREATE TABLE date_planning_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mutual_match_id uuid REFERENCES mutual_matches(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  available_slots jsonb NOT NULL DEFAULT '[]',
  location_preferences jsonb NOT NULL DEFAULT '{}',
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(mutual_match_id, user_id)
);

-- ─── Expand mutual_matches status enum ───
ALTER TABLE mutual_matches DROP CONSTRAINT IF EXISTS mutual_matches_status_check;
ALTER TABLE mutual_matches ADD CONSTRAINT mutual_matches_status_check
  CHECK (status IN (
    'active', 'exchange_in_progress', 'chatting', 'deciding', 'planning',
    'date_scheduled', 'date_completed', 'relationship', 'expired', 'declined'
  ));

-- ─── Add chat tracking columns to mutual_matches ───
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS chat_started_at timestamptz;
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS chat_expires_at timestamptz;
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS user_a_msg_count int DEFAULT 0;
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS user_b_msg_count int DEFAULT 0;
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS planned_venue_name text;
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS planned_venue_address text;
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS planned_venue_place_id text;
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS planned_at timestamptz;
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS user_a_phone text;
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS user_b_phone text;
