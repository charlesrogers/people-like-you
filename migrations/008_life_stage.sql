-- Life-stage signals extracted from voice memos
-- See model-rules.md Rule 9 and tasks/ongoing_tests.md Test 1
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS life_stage jsonb;
