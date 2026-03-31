-- Shared feedback/feature request board
-- Used across all apps via app_id column

CREATE TABLE IF NOT EXISTS feedback_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id text NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'declined')),
  vote_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES feedback_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(request_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_requests_app ON feedback_requests(app_id, status);
CREATE INDEX IF NOT EXISTS idx_feedback_requests_votes ON feedback_requests(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_request ON feedback_votes(request_id);
