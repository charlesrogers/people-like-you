-- Track which hook type was used for each intro (for A/B testing)
-- Applied: 2026-03-25

ALTER TABLE daily_intros ADD COLUMN hook_type text;
-- Values: quote, contradiction, scene
