-- T16: Pre-launch waitlist capture. Lightweight lead capture (email/phone/geo) to
-- drive Meta traffic to /waitlist before the app opens. Geography informs which metro
-- launches first; signup order drives priority ("sooner = more access").

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text,
  zipcode text,
  metro_code text,
  metro_area text,
  gender text CHECK (gender IN ('Man','Woman') OR gender IS NULL),
  referral_code text UNIQUE,           -- this signup's own share code
  referred_by text,                    -- referral_code of whoever referred them
  source text,                         -- utm_source / campaign label
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_waitlist_metro ON waitlist(metro_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_referred_by ON waitlist(referred_by);

NOTIFY pgrst, 'reload schema';
