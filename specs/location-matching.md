# Spec: Location-Based Match Prioritization

## Context
Matching currently ignores location entirely — `state`, `zipcode`, and `distance_radius` are collected but unused. All users see matches from anywhere. We need to prioritize local matches so people can actually meet, while still surfacing great matches further away when local options are thin.

## Current State
- **Stored:** `users.state`, `users.zipcode`, `hard_preferences.distance_radius` (same_metro | few_hours | anywhere)
- **Used:** None of it. `getCompatibleUsers()` in `src/lib/db.ts` filters only on gender, Elo, age, kids, faith, smoking, marital history
- **Geo utils:** `src/lib/places.ts` has `calculateMidpoint()` but only for date venue planning (post-match)

## Design: Tiered Location Priority

Matches are scored with a **location tier multiplier** applied to compatibility score. Closer matches get boosted, not filtered — this avoids empty pools while favoring local.

### Tier Definitions

| Tier | Name | Definition | Multiplier |
|------|------|-----------|------------|
| 1 | Neighborhood | Within ~5 miles | 1.5x |
| 2 | Metro area | Same metro region | 1.3x |
| 3 | Regional | Within ~150 miles | 1.15x |
| 4 | National | Same country | 1.0x (baseline) |
| 5 | Hemisphere | Same hemisphere | 0.9x |
| 6 | Global | Anywhere | 0.8x |

Final score = `compatibilityScore * locationMultiplier`

This means a 0.80 compatibility match 3 miles away scores `0.80 * 1.5 = 1.20`, beating a 0.95 match across the country (`0.95 * 1.0 = 0.95`). But a truly exceptional far-away match can still surface.

### How `distance_radius` preference interacts

The user's `distance_radius` preference acts as a **hard cutoff**, not just a boost:
- `same_metro` → Only tiers 1-2 (hard filter)
- `few_hours` → Only tiers 1-3 (hard filter)
- `anywhere` → All tiers (no filter, just multiplier-based sorting)

### Data Model

#### New table: `zip_locations`
Zipcode → lat/lng + metro area mapping. Pre-populated from US Census/USPS data.

```sql
CREATE TABLE zip_locations (
  zipcode TEXT PRIMARY KEY,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  city TEXT,
  state TEXT,
  metro_area TEXT,          -- e.g., "New York-Newark-Jersey City"
  metro_code TEXT,          -- CBSA code, e.g., "35620"
  country TEXT DEFAULT 'US',
  hemisphere TEXT            -- 'N' or 'S'
);

CREATE INDEX idx_zip_locations_metro ON zip_locations(metro_code);
CREATE INDEX idx_zip_locations_coords ON zip_locations(latitude, longitude);
```

#### Add to `users` table
```sql
ALTER TABLE users ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN longitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN metro_code TEXT;
```

Populated on signup from zipcode lookup. Updated if user changes zipcode.

### Distance Calculation

Use **Haversine formula** for distance between two lat/lng pairs. Already have a midpoint function in `src/lib/places.ts` — add `haversineDistance()` alongside it.

```typescript
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Returns distance in miles
}
```

### Tier Resolution

```typescript
function getLocationTier(userA: { lat, lng, metro_code, country }, userB: same): number {
  const distMiles = haversineDistance(...)

  if (distMiles <= 5) return 1                          // Neighborhood
  if (userA.metro_code && userA.metro_code === userB.metro_code) return 2  // Metro
  if (distMiles <= 150) return 3                        // Regional
  if (userA.country === userB.country) return 4         // National
  // Hemisphere check
  if ((userA.lat >= 0) === (userB.lat >= 0)) return 5   // Same hemisphere
  return 6                                               // Global
}
```

### Zipcode Data Source

US zip → lat/lng + metro area (CBSA) mappings are publicly available:
- **Source:** US Census Bureau ZCTA-to-CBSA crosswalk + USPS zip centroid data
- **Size:** ~42,000 US zip codes
- **Format:** CSV → SQL seed script
- **Free, no API key needed**

For non-US users (future): collect lat/lng via browser geolocation or country-level geocoding.

### Integration into Matching Pipeline

Modify `getCompatibleUsers()` in `src/lib/db.ts`:

1. Look up user's lat/lng/metro_code from `users` table (already fetched)
2. For each candidate, compute location tier
3. Apply `distance_radius` hard filter (reject candidates outside allowed tiers)
4. Return candidates with their location tier

Modify `scoreCompatibility()` in `src/lib/matchmaker.ts`:

1. Accept location tier as parameter
2. Multiply final score by tier multiplier
3. Sort by multiplied score

### Migration Path

1. Create `zip_locations` table and seed with US zip data
2. Add lat/lng/metro_code columns to `users`
3. Backfill existing users from their zipcode
4. Update onboarding to resolve zipcode → lat/lng/metro on signup
5. Update `getCompatibleUsers()` to use location tiers
6. Update `scoreCompatibility()` to apply multipliers

### Files to Modify
- `src/lib/db.ts` — `getCompatibleUsers()`, add location tier filtering
- `src/lib/matchmaker.ts` — `scoreCompatibility()`, apply multiplier
- `src/lib/geo.ts` — **new file**: haversine, tier resolution, zip lookup
- `src/app/api/profile/route.ts` — resolve zipcode on profile create/update
- `supabase-schema.sql` or new migration — `zip_locations` table + user columns
- Seed script for zip data

### Edge Cases
- **No zipcode:** Fall back to state-level matching (treat as tier 3-4)
- **International users:** Collect country, use country-level distance until we have international zip data
- **Sparse areas:** If tier 1-2 yields < 3 candidates, automatically expand to next tier
- **User moves:** Settings page already allows updating preferences; add zipcode update that re-resolves lat/lng

### What This Doesn't Cover (Future)
- International postal code databases
- Browser geolocation for precise location
- "Willing to travel for the right person" preference
- Location-based match card labels ("3 miles away" vs "same city")

## Verification
1. Seed `zip_locations` with test data for a few metros (NYC, LA, Chicago)
2. Create test users in same metro, same state, different state
3. Run `getCompatibleUsers()` — verify tier assignment is correct
4. Verify `same_metro` users only see tier 1-2 matches
5. Verify `anywhere` users see all matches but locals sort first
6. Verify score ordering: local mediocre match > distant good match (within reason)

## Synopsis
Location matching is table stakes for a dating app — without it, users see matches they can never meet. This adds tiered proximity scoring using zipcode-derived coordinates, boosting nearby matches without filtering out exceptional distant ones. Low engineering lift (haversine + a lookup table), high user impact.
