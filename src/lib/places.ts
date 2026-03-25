// Google Places API integration for date venue selection

interface PlaceResult {
  name: string
  address: string
  place_id: string
  rating: number | null
  photo_url: string | null
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening'

const PLACE_TYPES_BY_TIME: Record<TimeOfDay, string[]> = {
  morning: ['cafe', 'bakery', 'park'],
  afternoon: ['restaurant', 'museum', 'bowling_alley', 'amusement_park'],
  evening: ['restaurant', 'movie_theater', 'bar'],
}

export function calculateMidpoint(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): { lat: number; lng: number } {
  return {
    lat: (lat1 + lat2) / 2,
    lng: (lng1 + lng2) / 2,
  }
}

export async function findDateVenue(
  midpoint: { lat: number; lng: number },
  radiusMeters: number,
  timeOfDay: TimeOfDay
): Promise<PlaceResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY not set')
    return null
  }

  const types = PLACE_TYPES_BY_TIME[timeOfDay]

  for (const type of types) {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
      url.searchParams.set('location', `${midpoint.lat},${midpoint.lng}`)
      url.searchParams.set('radius', String(radiusMeters))
      url.searchParams.set('type', type)
      url.searchParams.set('rankby', 'prominence')
      url.searchParams.set('key', apiKey)

      const res = await fetch(url.toString())
      if (!res.ok) continue

      const data = await res.json()
      if (data.status !== 'OK' || !data.results?.length) continue

      // Filter: 4.0+ rating, pick best one
      const good = data.results
        .filter((r: { rating?: number }) => (r.rating ?? 0) >= 4.0)
        .slice(0, 5)

      if (good.length === 0) continue

      // Pick a random one from top 5 for variety
      const pick = good[Math.floor(Math.random() * good.length)]

      let photoUrl: string | null = null
      if (pick.photos?.length) {
        const photoRef = pick.photos[0].photo_reference
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`
      }

      return {
        name: pick.name,
        address: pick.vicinity || pick.formatted_address || '',
        place_id: pick.place_id,
        rating: pick.rating || null,
        photo_url: photoUrl,
      }
    } catch {
      continue
    }
  }

  return null
}

export function slotToTimeOfDay(slot: string): TimeOfDay {
  if (slot === 'morning') return 'morning'
  if (slot === 'afternoon') return 'afternoon'
  return 'evening'
}
