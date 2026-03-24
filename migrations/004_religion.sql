-- Add religion field to users table (community perimeter system)
-- Applied: 2026-03-24

ALTER TABLE users ADD COLUMN religion text;

-- Religion is identity, stored on the user. Faith importance (how much it matters
-- for matching) stays on hard_preferences. Together they form the first "perimeter":
--   essential + religion → hard filter (must match)
--   important + religion → strong preference (boost score)
--   nice_to_have/doesn't_matter → no filter, but stored for others who care
