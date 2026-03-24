-- Device token registration for push notifications (iOS APNs)
-- Applied: 2026-03-23

CREATE TABLE device_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  token text NOT NULL,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);
