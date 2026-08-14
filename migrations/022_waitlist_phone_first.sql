-- T16c: waitlist becomes phone + ZIP only (Charles, 2026-08-13).
-- The original T16 table required email (UNIQUE NOT NULL); the capture page now asks
-- for phone + ZIP and nothing else, so phone becomes the identity key and email is
-- optional (kept on the table so we can add it back without another migration).

ALTER TABLE waitlist ALTER COLUMN email DROP NOT NULL;

-- Digits-only phone, used for dedupe. The raw `phone` column keeps whatever they typed.
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS phone_normalized text;

-- ZIP3 prefix: 81% of US ZIPs don't resolve to a metro_code (see
-- specs/waitlist-referrals-geo-launch.md), so ZIP3 is the fallback clustering signal
-- for spotting a city forming before the full CBSA crosswalk is backfilled.
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS zip3 text;

-- Denormalized from zip_locations at insert so the success popup can name their city
-- without a second lookup.
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS state text;

UPDATE waitlist SET phone_normalized = regexp_replace(phone, '\D', '', 'g')
  WHERE phone IS NOT NULL AND phone_normalized IS NULL;

-- Partial unique index: one row per phone, but rows without a phone are still allowed.
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_phone_norm
  ON waitlist(phone_normalized) WHERE phone_normalized IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_zip3 ON waitlist(zip3);

NOTIFY pgrst, 'reload schema';
