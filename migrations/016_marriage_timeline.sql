-- 016: Marriage timeline (EXECUTION.md T10). A user's own answer to "when do you
-- want to be married" — Keeper's single best segmentation variable (devout want it
-- sooner; more-kids-wanted = sooner). Used as a soft PROXIMITY signal in matching
-- (aligned urgency = boost; "within a year" vs "no timeline" = penalty) and for
-- funnel segmentation. Faith intensity is NOT a new column — it's derived from the
-- existing users.observance_level (practicing/cultural/background) in the scorer.

ALTER TABLE users ADD COLUMN IF NOT EXISTS marriage_timeline text
  CHECK (marriage_timeline IN ('within_1_year', '1_2_years', '2_5_years', 'no_timeline'));
