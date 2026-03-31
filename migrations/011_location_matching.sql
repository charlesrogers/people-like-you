-- Location-based matching: zip lookup table + user location fields

-- Zip code → lat/lng + metro area mapping
CREATE TABLE IF NOT EXISTS zip_locations (
  zipcode TEXT PRIMARY KEY,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  city TEXT,
  state TEXT,
  metro_area TEXT,
  metro_code TEXT,
  country TEXT DEFAULT 'US',
  hemisphere TEXT
);

CREATE INDEX IF NOT EXISTS idx_zip_locations_metro ON zip_locations(metro_code);
CREATE INDEX IF NOT EXISTS idx_zip_locations_state ON zip_locations(state);

-- Add location fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS metro_code TEXT;

CREATE INDEX IF NOT EXISTS idx_users_metro_code ON users(metro_code);
