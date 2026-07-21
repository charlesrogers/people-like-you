-- T24: Block, Report, and Content Moderation (Apple Guideline 1.2 terminal state)
-- Four UGC-safety pillars: filter (moderation_events), report (reports), block (blocks),
-- contact (communityhealth@people-like-you.com in product surfaces + EULA acceptance).

-- ─── Blocks: silent, absolute, bidirectional exclusion ───
CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','report','moderation')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

-- ─── Reports: user reports of another user; every report implies a block ───
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reported_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mutual_match_id uuid,                          -- context for the transcript, if any
  reason text NOT NULL CHECK (reason IN (
    'inappropriate_messages','harassment','fake_profile','inappropriate_photos',
    'safety_concern','underage','married_or_taken','spam_or_scam','other')),
  details text,
  source text NOT NULL DEFAULT 'user' CHECK (source IN ('user','auto_moderation')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  action_taken text CHECK (action_taken IN ('none','warned','paused','banned')),
  admin_notes text,
  escalated_at timestamptz,                      -- set by the 24h-SLA cron when overdue
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);

-- ─── Moderation events: audit trail of every auto-moderation decision (the "filter" pillar) ───
CREATE TABLE IF NOT EXISTS moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  surface text NOT NULL CHECK (surface IN ('photo','chat_message','voice_transcript','profile_text')),
  content_ref text,                              -- storage path / message id / free label
  flagged boolean NOT NULL,
  rejected boolean NOT NULL,                     -- true = content was blocked from posting
  categories text[],                             -- flagged category keys
  scores jsonb,                                  -- raw category scores for tuning
  outcome text NOT NULL DEFAULT 'checked' CHECK (outcome IN ('checked','rejected','error')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_moderation_user ON moderation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_flagged ON moderation_events(flagged) WHERE flagged;

-- ─── Ban state + zero-tolerance EULA acceptance (Apple 1.2 requires affirmative agreement) ───
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_profile_status_check;
ALTER TABLE users ADD CONSTRAINT users_profile_status_check
  CHECK (profile_status IN ('active','paused','hidden','deactivated','banned'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS eula_accepted_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS eula_version text;

NOTIFY pgrst, 'reload schema';
