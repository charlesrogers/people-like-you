-- PLY Phases 1, 2, 3, 5 Migration
-- Run in Supabase SQL Editor
-- Adds: mutual matches, disclosure exchanges, date scheduling, feedback, trust,
--        expanded composite profiles (I-sharing, attachment, admiration),
--        friend vouches, narrative experiments, embedding infrastructure

-- ============================================================
-- PHASE 1: Outcome Engine Foundation
-- ============================================================

-- 1A: Mutual Matches
CREATE TABLE mutual_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) NOT NULL UNIQUE,
  user_a_id uuid REFERENCES users(id) NOT NULL,
  user_b_id uuid REFERENCES users(id) NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'exchange_in_progress', 'date_scheduled', 'date_completed', 'relationship', 'expired')),
  current_round int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expired_at timestamptz
);
CREATE INDEX idx_mutual_matches_users ON mutual_matches(user_a_id, user_b_id);
CREATE INDEX idx_mutual_matches_status ON mutual_matches(status);

-- 1A: Structured Disclosure Exchanges
CREATE TABLE disclosure_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mutual_match_id uuid REFERENCES mutual_matches(id) ON DELETE CASCADE NOT NULL,
  round_number int NOT NULL CHECK (round_number BETWEEN 1 AND 5),
  prompt_text text NOT NULL,
  user_a_response text,
  user_a_response_voice_path text,
  user_a_responded_at timestamptz,
  user_b_response text,
  user_b_response_voice_path text,
  user_b_responded_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(mutual_match_id, round_number)
);
CREATE INDEX idx_disclosure_match ON disclosure_exchanges(mutual_match_id, round_number);

-- 1B: User Availability
CREATE TABLE user_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  availability jsonb NOT NULL DEFAULT '{}',
  -- { "monday": { "morning": false, "afternoon": true, "evening": true }, ... }
  updated_at timestamptz DEFAULT now()
);

-- 1B: Scheduled Dates
CREATE TABLE scheduled_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mutual_match_id uuid REFERENCES mutual_matches(id) NOT NULL,
  proposed_by uuid REFERENCES users(id) NOT NULL,
  confirmed_by uuid REFERENCES users(id),
  scheduled_at timestamptz NOT NULL,
  activity_type text,
  venue_name text,
  venue_address text,
  venue_place_id text,
  status text NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'confirmed', 'completed', 'cancelled', 'no_show')),
  pre_nudge_sent boolean DEFAULT false,
  post_checkin_sent boolean DEFAULT false,
  conversation_starter text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_dates_mutual_match ON scheduled_dates(mutual_match_id);
CREATE INDEX idx_dates_status ON scheduled_dates(status);
CREATE INDEX idx_dates_scheduled ON scheduled_dates(scheduled_at);

-- 1C: Date Feedback
CREATE TABLE date_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date_id uuid REFERENCES scheduled_dates(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  about_user_id uuid REFERENCES users(id) NOT NULL,
  what_surprised_you text NOT NULL,
  surprise_sentiment text CHECK (surprise_sentiment IN ('positive', 'negative', 'neutral')),
  surprise_extracted_traits jsonb DEFAULT '{}',
  felt_safe boolean,
  looked_like_photos text CHECK (looked_like_photos IN ('yes', 'somewhat', 'no')),
  want_to_see_again text CHECK (want_to_see_again IN ('yes', 'maybe', 'no')),
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(scheduled_date_id, user_id)
);
CREATE INDEX idx_date_feedback_user ON date_feedback(about_user_id);

-- 1C: Trust Scores
CREATE TABLE trust_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score float NOT NULL DEFAULT 0,
  dates_completed int DEFAULT 0,
  safety_positive int DEFAULT 0,
  safety_negative int DEFAULT 0,
  photo_accuracy_positive int DEFAULT 0,
  photo_accuracy_negative int DEFAULT 0,
  positive_surprises int DEFAULT 0,
  no_shows int DEFAULT 0,
  ghosting_incidents int DEFAULT 0,
  disclosure_rounds_completed int DEFAULT 0,
  tier text DEFAULT 'new' CHECK (tier IN ('new', 'established', 'verified', 'trusted')),
  verified_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- 1C: Exit Surveys
CREATE TABLE exit_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  reason text NOT NULL
    CHECK (reason IN ('found_someone_ply', 'found_someone_elsewhere', 'taking_break', 'matches_wrong', 'not_enough_people', 'other')),
  found_match_id uuid REFERENCES matches(id),
  details text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PHASE 2: Extraction Upgrade
-- ============================================================

-- 2A: Expand composite_profiles with I-sharing, attachment, admiration fields
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS humor_signature jsonb DEFAULT '{}';
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS aesthetic_resonance jsonb DEFAULT '{}';
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS emotional_processing jsonb DEFAULT '{}';
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS attachment_proxy jsonb DEFAULT '{}';
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS values_in_action text[] DEFAULT '{}';
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS demonstrated_competence text[] DEFAULT '{}';
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS friend_vouch_quotes text[] DEFAULT '{}';

-- 2B: Expand prompt categories
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_category_check;
ALTER TABLE prompts ADD CONSTRAINT prompts_category_check
  CHECK (category IN ('warmth', 'humor', 'depth', 'ambition', 'vulnerability', 'i_sharing', 'attachment', 'self_expansion'));

-- 2B: Add I-sharing and attachment prompts
INSERT INTO prompts (id, text, day_number, category) VALUES
  ('chills_moment', 'What''s the last thing that gave you actual chills — a song, a moment, a sentence?', 0, 'i_sharing'),
  ('notice_first', 'When you walk into a room, what do you notice first?', 0, 'i_sharing'),
  ('grab_arm', 'Describe a moment that made you grab someone''s arm and say "did you SEE that?"', 0, 'i_sharing'),
  ('not_funny_to_others', 'What cracks you up that other people don''t find funny at all?', 0, 'i_sharing'),
  ('partner_goes_quiet', 'When someone you''re seeing goes quiet for a day, what''s your honest first thought?', 0, 'attachment'),
  ('needs_space', 'How do you handle it when someone needs more space than you expected?', 0, 'attachment')
ON CONFLICT (id) DO NOTHING;

-- 2C: Friend Vouches
CREATE TABLE friend_vouches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  friend_name text NOT NULL,
  friend_email text,
  invite_token text UNIQUE NOT NULL,
  audio_storage_path text,
  duration_seconds float,
  transcript text,
  extraction jsonb,
  status text DEFAULT 'invited' CHECK (status IN ('invited', 'recorded', 'processed')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_vouches_user ON friend_vouches(user_id);
CREATE INDEX idx_vouches_token ON friend_vouches(invite_token);

-- ============================================================
-- PHASE 3: Narrative Intelligence
-- ============================================================

-- 3A/3B: Narrative metadata on matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS narrative_strategy text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS narrative_for_a text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS narrative_for_b text;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS narrative_a_critic_score float;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS narrative_b_critic_score float;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS narrative_a_used_quote boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS narrative_b_used_quote boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS compatibility_score float;

-- 3C: Narrative A/B Testing
CREATE TABLE narrative_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hypothesis text,
  variant_a_config jsonb NOT NULL,
  variant_b_config jsonb NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'concluded', 'abandoned')),
  started_at timestamptz DEFAULT now(),
  concluded_at timestamptz,
  winner text CHECK (winner IN ('a', 'b', 'inconclusive')),
  results jsonb
);

ALTER TABLE matches ADD COLUMN IF NOT EXISTS narrative_experiment_id uuid REFERENCES narrative_experiments(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS narrative_variant text CHECK (narrative_variant IN ('a', 'b'));

-- ============================================================
-- PHASE 5: Relationship Genome
-- ============================================================

-- Enable pgvector extension (may need superuser)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to composite_profiles
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS embedding vector(128);
CREATE INDEX IF NOT EXISTS idx_composite_embedding ON composite_profiles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- ============================================================
-- INDEXES & VIEWS
-- ============================================================

-- Funnel metrics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS funnel_metrics AS
SELECT
  date_trunc('week', di.created_at) as week,
  COUNT(DISTINCT di.id) as intros_delivered,
  COUNT(DISTINCT CASE WHEN di.status = 'liked' THEN di.id END) as interested,
  COUNT(DISTINCT mm.id) as mutual_matches,
  COUNT(DISTINCT CASE WHEN de.round_number = 1 AND de.user_a_responded_at IS NOT NULL AND de.user_b_responded_at IS NOT NULL THEN mm.id END) as exchange_round_1,
  COUNT(DISTINCT CASE WHEN de_max.max_round >= 3 THEN mm.id END) as exchange_complete,
  COUNT(DISTINCT sd.id) as dates_scheduled,
  COUNT(DISTINCT CASE WHEN sd.status = 'confirmed' THEN sd.id END) as dates_confirmed,
  COUNT(DISTINCT CASE WHEN sd.status = 'completed' THEN sd.id END) as dates_completed,
  COUNT(DISTINCT CASE WHEN df.want_to_see_again = 'yes' THEN df.id END) as want_second_date,
  COUNT(DISTINCT CASE WHEN es.reason = 'found_someone_ply' THEN es.id END) as relationships
FROM daily_intros di
LEFT JOIN mutual_matches mm ON mm.match_id = di.match_id
LEFT JOIN disclosure_exchanges de ON de.mutual_match_id = mm.id
LEFT JOIN LATERAL (
  SELECT MAX(round_number) as max_round
  FROM disclosure_exchanges de2
  WHERE de2.mutual_match_id = mm.id
    AND de2.user_a_responded_at IS NOT NULL
    AND de2.user_b_responded_at IS NOT NULL
) de_max ON true
LEFT JOIN scheduled_dates sd ON sd.mutual_match_id = mm.id
LEFT JOIN date_feedback df ON df.scheduled_date_id = sd.id
LEFT JOIN exit_surveys es ON es.found_match_id = di.match_id
GROUP BY 1
ORDER BY 1 DESC;
