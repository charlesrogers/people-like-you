// Location-based matching: haversine distance, tier resolution, zip lookup

import { createServerClient } from './supabase'

// ─── Types ───

export interface ZipLocation {
  zipcode: string
  latitude: number
  longitude: number
  city: string | null
  state: string | null
  metro_area: string | null
  metro_code: string | null
  country: string
}

export interface UserLocation {
  latitude: number | null
  longitude: number | null
  metro_code: string | null
  country: string
}

/**
 * Location tier:
 * 1 = Neighborhood (~5 mi)
 * 2 = Metro area (same CBSA)
 * 3 = Regional (~150 mi)
 * 4 = National (same country)
 * 5 = Hemisphere
 * 6 = Global
 */
export type LocationTier = 1 | 2 | 3 | 4 | 5 | 6

const TIER_MULTIPLIERS: Record<LocationTier, number> = {
  1: 1.5,
  2: 1.3,
  3: 1.15,
  4: 1.0,
  5: 0.9,
  6: 0.8,
}

// Max tier allowed by distance_radius preference
const DISTANCE_RADIUS_MAX_TIER: Record<string, LocationTier> = {
  same_metro: 2,
  few_hours: 3,
  anywhere: 6,
}

// ─── Haversine Distance ───

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3959 // Earth radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// ─── Tier Resolution ───

export function getLocationTier(
  a: UserLocation,
  b: UserLocation
): LocationTier {
  // If either user has no coordinates, fall back to country-level
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) {
    if (a.country === b.country) return 4
    if (sameHemisphere(a, b)) return 5
    return 6
  }

  const distMiles = haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude)

  if (distMiles <= 5) return 1
  if (a.metro_code && a.metro_code === b.metro_code) return 2
  if (distMiles <= 150) return 3
  if (a.country === b.country) return 4
  if (sameHemisphere(a, b)) return 5
  return 6
}

function sameHemisphere(a: UserLocation, b: UserLocation): boolean {
  if (a.latitude == null || b.latitude == null) return false
  return (a.latitude >= 0) === (b.latitude >= 0)
}

export function getTierMultiplier(tier: LocationTier): number {
  return TIER_MULTIPLIERS[tier]
}

/**
 * Check if a candidate passes the user's distance_radius hard filter.
 */
export function passesDistanceFilter(
  distanceRadius: string | null,
  tier: LocationTier
): boolean {
  if (!distanceRadius || distanceRadius === 'anywhere') return true
  const maxTier = DISTANCE_RADIUS_MAX_TIER[distanceRadius]
  if (!maxTier) return true
  return tier <= maxTier
}

// ─── Zip Lookup ───

export async function lookupZip(zipcode: string): Promise<ZipLocation | null> {
  const { data, error } = await createServerClient()
    .from('zip_locations')
    .select()
    .eq('zipcode', zipcode)
    .single()
  if (error) return null
  return data
}

/**
 * Resolve a user's zipcode to lat/lng/metro and return the fields to update.
 */
export async function resolveUserLocation(zipcode: string): Promise<{
  latitude: number
  longitude: number
  metro_code: string | null
} | null> {
  const zip = await lookupZip(zipcode)
  if (!zip) return null
  return {
    latitude: zip.latitude,
    longitude: zip.longitude,
    metro_code: zip.metro_code,
  }
}

/**
 * Build a UserLocation from User fields for tier calculation.
 */
export function userToLocation(user: {
  latitude?: number | null
  longitude?: number | null
  metro_code?: string | null
}): UserLocation {
  return {
    latitude: user.latitude ?? null,
    longitude: user.longitude ?? null,
    metro_code: user.metro_code ?? null,
    country: 'US', // Default for now; expand later
  }
}
