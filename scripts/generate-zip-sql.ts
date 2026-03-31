/**
 * Downloads US zip code data, assigns metro areas, and outputs SQL INSERT statements.
 * Pipe output to self-hosted Supabase: npx tsx scripts/generate-zip-sql.ts > /tmp/zip_seed.sql
 */

// Major US metro areas with center coordinates and CBSA codes
const METROS = [
  { name: 'New York-Newark-Jersey City', code: '35620', lat: 40.7128, lng: -74.006, r: 50 },
  { name: 'Los Angeles-Long Beach-Anaheim', code: '31080', lat: 34.0522, lng: -118.2437, r: 50 },
  { name: 'Chicago-Naperville-Elgin', code: '16980', lat: 41.8781, lng: -87.6298, r: 40 },
  { name: 'Dallas-Fort Worth-Arlington', code: '19100', lat: 32.7767, lng: -96.797, r: 45 },
  { name: 'Houston-The Woodlands-Sugar Land', code: '26420', lat: 29.7604, lng: -95.3698, r: 40 },
  { name: 'Washington-Arlington-Alexandria', code: '47900', lat: 38.9072, lng: -77.0369, r: 40 },
  { name: 'Philadelphia-Camden-Wilmington', code: '37980', lat: 39.9526, lng: -75.1652, r: 35 },
  { name: 'Miami-Fort Lauderdale-Pompano Beach', code: '33100', lat: 25.7617, lng: -80.1918, r: 40 },
  { name: 'Atlanta-Sandy Springs-Alpharetta', code: '12060', lat: 33.749, lng: -84.388, r: 40 },
  { name: 'Boston-Cambridge-Newton', code: '14460', lat: 42.3601, lng: -71.0589, r: 35 },
  { name: 'Phoenix-Mesa-Chandler', code: '38060', lat: 33.4484, lng: -112.074, r: 35 },
  { name: 'San Francisco-Oakland-Berkeley', code: '41860', lat: 37.7749, lng: -122.4194, r: 35 },
  { name: 'Riverside-San Bernardino-Ontario', code: '40140', lat: 33.9533, lng: -117.3962, r: 35 },
  { name: 'Detroit-Warren-Dearborn', code: '19820', lat: 42.3314, lng: -83.0458, r: 35 },
  { name: 'Seattle-Tacoma-Bellevue', code: '42660', lat: 47.6062, lng: -122.3321, r: 35 },
  { name: 'Minneapolis-St. Paul-Bloomington', code: '33460', lat: 44.9778, lng: -93.265, r: 35 },
  { name: 'San Diego-Chula Vista-Carlsbad', code: '41740', lat: 32.7157, lng: -117.1611, r: 30 },
  { name: 'Tampa-St. Petersburg-Clearwater', code: '45300', lat: 27.9506, lng: -82.4572, r: 30 },
  { name: 'Denver-Aurora-Lakewood', code: '19740', lat: 39.7392, lng: -104.9903, r: 35 },
  { name: 'St. Louis', code: '41180', lat: 38.627, lng: -90.1994, r: 30 },
  { name: 'Baltimore-Columbia-Towson', code: '12580', lat: 39.2904, lng: -76.6122, r: 30 },
  { name: 'Orlando-Kissimmee-Sanford', code: '36740', lat: 28.5383, lng: -81.3792, r: 30 },
  { name: 'Charlotte-Concord-Gastonia', code: '16740', lat: 35.2271, lng: -80.8431, r: 30 },
  { name: 'San Antonio-New Braunfels', code: '41700', lat: 29.4241, lng: -98.4936, r: 30 },
  { name: 'Portland-Vancouver-Hillsboro', code: '38900', lat: 45.5152, lng: -122.6784, r: 30 },
  { name: 'Sacramento-Roseville-Folsom', code: '40900', lat: 38.5816, lng: -121.4944, r: 30 },
  { name: 'Pittsburgh', code: '38300', lat: 40.4406, lng: -79.9959, r: 30 },
  { name: 'Austin-Round Rock-Georgetown', code: '12420', lat: 30.2672, lng: -97.7431, r: 30 },
  { name: 'Las Vegas-Henderson-Paradise', code: '29820', lat: 36.1699, lng: -115.1398, r: 30 },
  { name: 'Cincinnati', code: '17140', lat: 39.1031, lng: -84.512, r: 30 },
  { name: 'Kansas City', code: '28140', lat: 39.0997, lng: -94.5786, r: 30 },
  { name: 'Columbus', code: '18140', lat: 39.9612, lng: -82.9988, r: 30 },
  { name: 'Indianapolis-Carmel-Anderson', code: '26900', lat: 39.7684, lng: -86.1581, r: 30 },
  { name: 'Cleveland-Elyria', code: '17460', lat: 41.4993, lng: -81.6944, r: 30 },
  { name: 'Nashville-Davidson-Murfreesboro', code: '34980', lat: 36.1627, lng: -86.7816, r: 30 },
  { name: 'Salt Lake City', code: '41620', lat: 40.7608, lng: -111.891, r: 30 },
  { name: 'Raleigh-Cary', code: '39580', lat: 35.7796, lng: -78.6382, r: 25 },
  { name: 'Provo-Orem', code: '39340', lat: 40.2338, lng: -111.6585, r: 25 },
]

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function findMetro(lat: number, lng: number): { name: string; code: string } | null {
  for (const m of METROS) {
    if (haversine(lat, lng, m.lat, m.lng) <= m.r) return { name: m.name, code: m.code }
  }
  return null
}

function esc(s: string | null): string {
  if (s === null) return 'NULL'
  return "'" + s.replace(/'/g, "''") + "'"
}

async function main() {
  // Fetch lat/lng data
  const coordsRes = await fetch('https://gist.githubusercontent.com/erichurst/7882666/raw/5bdc46db47d9515269ab12ed6fb2850377fd869e/US%20Zip%20Codes%20from%202013%20Government%20Data')
  const coordsText = await coordsRes.text()
  const coordLines = coordsText.trim().split('\n').slice(1)

  // Fetch city/state data
  const cityRes = await fetch('https://raw.githubusercontent.com/scpike/us-state-county-zip/master/geo-data.csv')
  const cityText = await cityRes.text()
  const cityLines = cityText.trim().split('\n').slice(1)

  const cityMap = new Map<string, { city: string; state: string }>()
  for (const line of cityLines) {
    const parts = line.split(',')
    const zip = parts[3]?.trim()
    const city = parts[5]?.trim()
    const state = parts[2]?.trim()
    if (zip && city && state) cityMap.set(zip, { city, state })
  }

  console.log('BEGIN;')

  let batch: string[] = []
  let total = 0
  let metroCount = 0

  for (const line of coordLines) {
    const parts = line.split(',')
    const zip = parts[0]?.trim()
    const lat = parseFloat(parts[1]?.trim())
    const lng = parseFloat(parts[2]?.trim())
    if (!zip || isNaN(lat) || isNaN(lng)) continue

    const ci = cityMap.get(zip)
    const metro = findMetro(lat, lng)
    if (metro) metroCount++

    batch.push(`(${esc(zip)},${lat},${lng},${esc(ci?.city ?? null)},${esc(ci?.state ?? null)},${esc(metro?.name ?? null)},${esc(metro?.code ?? null)},'US',${lat >= 0 ? "'N'" : "'S'"})`)
    total++

    if (batch.length >= 500) {
      console.log(`INSERT INTO zip_locations (zipcode,latitude,longitude,city,state,metro_area,metro_code,country,hemisphere) VALUES`)
      console.log(batch.join(',\n'))
      console.log('ON CONFLICT (zipcode) DO UPDATE SET latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude, city=EXCLUDED.city, state=EXCLUDED.state, metro_area=EXCLUDED.metro_area, metro_code=EXCLUDED.metro_code;')
      batch = []
    }
  }

  if (batch.length > 0) {
    console.log(`INSERT INTO zip_locations (zipcode,latitude,longitude,city,state,metro_area,metro_code,country,hemisphere) VALUES`)
    console.log(batch.join(',\n'))
    console.log('ON CONFLICT (zipcode) DO UPDATE SET latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude, city=EXCLUDED.city, state=EXCLUDED.state, metro_area=EXCLUDED.metro_area, metro_code=EXCLUDED.metro_code;')
  }

  console.log('COMMIT;')
  process.stderr.write(`Total: ${total} zips, ${metroCount} in metro areas\n`)
}

main().catch(e => { process.stderr.write(e.message + '\n'); process.exit(1) })
