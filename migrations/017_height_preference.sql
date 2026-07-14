-- 017: Height preference (EXECUTION.md T8). A soft minimum-height preference used
-- as a gentle ranking nudge (×0.9 when a candidate is below the stated minimum),
-- never a hard filter (filter-discipline: stacked hard filters collapse the pool).
-- The user's own height is stored in the existing users.height text column.

ALTER TABLE hard_preferences ADD COLUMN IF NOT EXISTS height_preference_min int;
