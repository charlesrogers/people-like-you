/**
 * Seed script: Downloads US zip code data (lat/lng + city/state) and
 * inserts into zip_locations table via Supabase.
 *
 * Metro areas are assigned using a simple state+proximity heuristic
 * since free CBSA crosswalk data requires HUD registration.
 *
 * Run: npx tsx scripts/seed-zip-locations.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Major US metro areas with center coordinates and CBSA codes
const METROS: Array<{
  name: string
  code: string
  lat: number
  lng: number
  radiusMiles: number
}> = [
  { name: 'New York-Newark-Jersey City', code: '35620', lat: 40.7128, lng: -74.006, radiusMiles: 50 },
  { name: 'Los Angeles-Long Beach-Anaheim', code: '31080', lat: 34.0522, lng: -118.2437, radiusMiles: 50 },
  { name: 'Chicago-Naperville-Elgin', code: '16980', lat: 41.8781, lng: -87.6298, radiusMiles: 40 },
  { name: 'Dallas-Fort Worth-Arlington', code: '19100', lat: 32.7767, lng: -96.797, radiusMiles: 45 },
  { name: 'Houston-The Woodlands-Sugar Land', code: '26420', lat: 29.7604, lng: -95.3698, radiusMiles: 40 },
  { name: 'Washington-Arlington-Alexandria', code: '47900', lat: 38.9072, lng: -77.0369, radiusMiles: 40 },
  { name: 'Philadelphia-Camden-Wilmington', code: '37980', lat: 39.9526, lng: -75.1652, radiusMiles: 35 },
  { name: 'Miami-Fort Lauderdale-Pompano Beach', code: '33100', lat: 25.7617, lng: -80.1918, radiusMiles: 40 },
  { name: 'Atlanta-Sandy Springs-Alpharetta', code: '12060', lat: 33.749, lng: -84.388, radiusMiles: 40 },
  { name: 'Boston-Cambridge-Newton', code: '14460', lat: 42.3601, lng: -71.0589, radiusMiles: 35 },
  { name: 'Phoenix-Mesa-Chandler', code: '38060', lat: 33.4484, lng: -112.074, radiusMiles: 35 },
  { name: 'San Francisco-Oakland-Berkeley', code: '41860', lat: 37.7749, lng: -122.4194, radiusMiles: 35 },
  { name: 'Riverside-San Bernardino-Ontario', code: '40140', lat: 33.9533, lng: -117.3962, radiusMiles: 35 },
  { name: 'Detroit-Warren-Dearborn', code: '19820', lat: 42.3314, lng: -83.0458, radiusMiles: 35 },
  { name: 'Seattle-Tacoma-Bellevue', code: '42660', lat: 47.6062, lng: -122.3321, radiusMiles: 35 },
  { name: 'Minneapolis-St. Paul-Bloomington', code: '33460', lat: 44.9778, lng: -93.265, radiusMiles: 35 },
  { name: 'San Diego-Chula Vista-Carlsbad', code: '41740', lat: 32.7157, lng: -117.1611, radiusMiles: 30 },
  { name: 'Tampa-St. Petersburg-Clearwater', code: '45300', lat: 27.9506, lng: -82.4572, radiusMiles: 30 },
  { name: 'Denver-Aurora-Lakewood', code: '19740', lat: 39.7392, lng: -104.9903, radiusMiles: 35 },
  { name: 'St. Louis', code: '41180', lat: 38.627, lng: -90.1994, radiusMiles: 30 },
  { name: 'Baltimore-Columbia-Towson', code: '12580', lat: 39.2904, lng: -76.6122, radiusMiles: 30 },
  { name: 'Orlando-Kissimmee-Sanford', code: '36740', lat: 28.5383, lng: -81.3792, radiusMiles: 30 },
  { name: 'Charlotte-Concord-Gastonia', code: '16740', lat: 35.2271, lng: -80.8431, radiusMiles: 30 },
  { name: 'San Antonio-New Braunfels', code: '41700', lat: 29.4241, lng: -98.4936, radiusMiles: 30 },
  { name: 'Portland-Vancouver-Hillsboro', code: '38900', lat: 45.5152, lng: -122.6784, radiusMiles: 30 },
  { name: 'Sacramento-Roseville-Folsom', code: '40900', lat: 38.5816, lng: -121.4944, radiusMiles: 30 },
  { name: 'Pittsburgh', code: '38300', lat: 40.4406, lng: -79.9959, radiusMiles: 30 },
  { name: 'Austin-Round Rock-Georgetown', code: '12420', lat: 30.2672, lng: -97.7431, radiusMiles: 30 },
  { name: 'Las Vegas-Henderson-Paradise', code: '29820', lat: 36.1699, lng: -115.1398, radiusMiles: 30 },
  { name: 'Cincinnati', code: '17140', lat: 39.1031, lng: -84.512, radiusMiles: 30 },
  { name: 'Kansas City', code: '28140', lat: 39.0997, lng: -94.5786, radiusMiles: 30 },
  { name: 'Columbus', code: '18140', lat: 39.9612, lng: -82.9988, radiusMiles: 30 },
  { name: 'Indianapolis-Carmel-Anderson', code: '26900', lat: 39.7684, lng: -86.1581, radiusMiles: 30 },
  { name: 'Cleveland-Elyria', code: '17460', lat: 41.4993, lng: -81.6944, radiusMiles: 30 },
  { name: 'Nashville-Davidson-Murfreesboro', code: '34980', lat: 36.1627, lng: -86.7816, radiusMiles: 30 },
  { name: 'Salt Lake City', code: '41620', lat: 40.7608, lng: -111.891, radiusMiles: 30 },
  { name: 'Raleigh-Cary', code: '39580', lat: 35.7796, lng: -78.6382, radiusMiles: 25 },
  { name: 'Provo-Orem', code: '39340', lat: 40.2338, lng: -111.6585, radiusMiles: 25 },
]

// Haversine
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function findMetro(lat: number, lng: number): { name: string; code: string } | null {
  for (const m of METROS) {
    if (haversine(lat, lng, m.lat, m.lng) <= m.radiusMiles) {
      return { name: m.name, code: m.code }
    }
  }
  return null
}

async function main() {
  console.log('Fetching zip code data...')

  // Fetch lat/lng data
  const coordsRes = await fetch('https://gist.githubusercontent.com/erichurst/7882666/raw/5bdc46db47d9515269ab12ed6fb2850377fd869e/US%20Zip%20Codes%20from%202013%20Government%20Data')
  const coordsText = await coordsRes.text()
  const coordLines = coordsText.trim().split('\n').slice(1) // skip header

  // Fetch city/state data
  const cityRes = await fetch('https://raw.githubusercontent.com/scpike/us-state-county-zip/master/geo-data.csv')
  const cityText = await cityRes.text()
  const cityLines = cityText.trim().split('\n').slice(1)

  // Build city/state lookup
  const cityMap = new Map<string, { city: string; state: string }>()
  for (const line of cityLines) {
    const parts = line.split(',')
    const zip = parts[3]?.trim()
    const city = parts[5]?.trim()
    const state = parts[2]?.trim()
    if (zip && city && state) {
      cityMap.set(zip, { city, state })
    }
  }

  // Build records
  const records: Array<{
    zipcode: string
    latitude: number
    longitude: number
    city: string | null
    state: string | null
    metro_area: string | null
    metro_code: string | null
    country: string
    hemisphere: string
  }> = []

  let skipped = 0
  for (const line of coordLines) {
    const parts = line.split(',')
    const zip = parts[0]?.trim()
    const lat = parseFloat(parts[1]?.trim())
    const lng = parseFloat(parts[2]?.trim())

    if (!zip || isNaN(lat) || isNaN(lng)) { skipped++; continue }

    const cityInfo = cityMap.get(zip)
    const metro = findMetro(lat, lng)

    records.push({
      zipcode: zip,
      latitude: lat,
      longitude: lng,
      city: cityInfo?.city || null,
      state: cityInfo?.state || null,
      metro_area: metro?.name || null,
      metro_code: metro?.code || null,
      country: 'US',
      hemisphere: lat >= 0 ? 'N' : 'S',
    })
  }

  console.log(`Parsed ${records.length} zip codes (skipped ${skipped})`)
  console.log(`${records.filter(r => r.metro_code).length} assigned to a metro area`)

  // Insert in batches
  const BATCH = 500
  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH)
    const { error } = await supabase
      .from('zip_locations')
      .upsert(batch, { onConflict: 'zipcode' })

    if (error) {
      console.error(`Batch ${i / BATCH} failed:`, error.message)
    } else {
      inserted += batch.length
    }

    if (inserted % 5000 === 0 || i + BATCH >= records.length) {
      console.log(`  ${inserted}/${records.length} inserted...`)
    }
  }

  console.log(`Done! ${inserted} zip codes seeded.`)

  // Backfill existing users
  console.log('\nBackfilling user locations...')
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id, zipcode')
    .not('zipcode', 'is', null)
    .is('latitude', null)

  if (userErr) {
    console.error('Failed to fetch users:', userErr.message)
    return
  }

  let backfilled = 0
  for (const user of users || []) {
    const zip = records.find(r => r.zipcode === user.zipcode)
    if (!zip) continue

    const { error } = await supabase
      .from('users')
      .update({
        latitude: zip.latitude,
        longitude: zip.longitude,
        metro_code: zip.metro_code,
      })
      .eq('id', user.id)

    if (!error) backfilled++
  }

  console.log(`Backfilled ${backfilled} users.`)
}

main().catch(console.error)
