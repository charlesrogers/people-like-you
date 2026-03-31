-- Location tracking on matches and feedback for proximity impact analysis
ALTER TABLE matches ADD COLUMN IF NOT EXISTS location_tier SMALLINT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS distance_miles DOUBLE PRECISION;

ALTER TABLE match_feedback ADD COLUMN IF NOT EXISTS location_tier SMALLINT;
ALTER TABLE match_feedback ADD COLUMN IF NOT EXISTS distance_miles DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_match_feedback_location ON match_feedback(location_tier);
CREATE INDEX IF NOT EXISTS idx_matches_location ON matches(location_tier);
