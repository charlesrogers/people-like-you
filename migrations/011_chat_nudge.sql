-- Ghost nudge tracking for mutual matches
-- nudge_sent_at: 24h into chat with one-sided silence, gentle reminder sent
-- pause_offered_at: 48h, offer to pause matches

ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS nudge_sent_at timestamptz;
ALTER TABLE mutual_matches ADD COLUMN IF NOT EXISTS pause_offered_at timestamptz;
