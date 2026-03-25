-- Log life-stage alignment score on matches for test evaluation
-- See tasks/ongoing_tests.md Test 1
ALTER TABLE matches ADD COLUMN IF NOT EXISTS life_stage_score float;
