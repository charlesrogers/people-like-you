-- 015: Persist per-pair calibration votes (roadmap-2026-07 Phase 1a / EXECUTION.md T6).
-- Previously /api/calibrate stored only the client-computed Elo scalar and threw
-- away the individual yes/no votes — the 82% "personal taste" signal. This table
-- keeps the directional per-pair data so T7 can use "A voted yes on B" as an
-- attraction prior in candidate selection, and Phase 4 can build a taste model.

CREATE TABLE IF NOT EXISTS calibration_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vote boolean NOT NULL,                          -- true = yes/attracted
  source text NOT NULL DEFAULT 'calibration' CHECK (source IN ('calibration')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(voter_id, target_id)                     -- latest vote wins via upsert
);
CREATE INDEX IF NOT EXISTS idx_calibration_votes_voter ON calibration_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_calibration_votes_target ON calibration_votes(target_id);
