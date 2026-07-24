-- T16b: store the resolved named-metro key on each waitlist signup so the admin
-- launch dashboard can group by city cheaply. Resolved from ZIP at signup time
-- (src/lib/metros.ts). Nullable — unresolved ZIPs stay unassigned.

ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS metro_key text;
CREATE INDEX IF NOT EXISTS idx_waitlist_metro_key ON waitlist(metro_key);

NOTIFY pgrst, 'reload schema';
