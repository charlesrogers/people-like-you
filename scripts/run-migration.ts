/**
 * Run migration 011_location_matching.sql via Supabase client.
 * Uses individual table operations since we don't have direct SQL access.
 *
 * Run: npx tsx scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Manual .env.local parsing (no dotenv dependency)
const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Test if zip_locations table exists by trying a select
  console.log('Checking if zip_locations table exists...')
  const { error: checkErr } = await supabase.from('zip_locations').select('zipcode').limit(1)

  if (checkErr && checkErr.message.includes('does not exist')) {
    console.log('Table does not exist. Please run this SQL in the Supabase SQL Editor:')
    console.log(`
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

ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS metro_code TEXT;
CREATE INDEX IF NOT EXISTS idx_users_metro_code ON users(metro_code);
    `)
    process.exit(1)
  } else if (checkErr) {
    console.error('Unexpected error:', checkErr.message)
    process.exit(1)
  } else {
    console.log('zip_locations table exists!')
  }

  // Check if users table has lat/lng columns
  const { data: testUser, error: userErr } = await supabase
    .from('users')
    .select('latitude')
    .limit(1)

  if (userErr && userErr.message.includes('latitude')) {
    console.log('Users table missing latitude column. Run the migration SQL above.')
    process.exit(1)
  }

  console.log('Migration looks applied! Ready to seed zip data.')
}

main().catch(console.error)
