-- Observance level + partner match preference
-- Applied: 2026-03-24

ALTER TABLE users ADD COLUMN observance_level text;
-- Values: practicing, cultural, background

ALTER TABLE hard_preferences ADD COLUMN observance_match text;
-- Values: must_match, prefer_same, respect_only
