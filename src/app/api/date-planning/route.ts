import { NextRequest, NextResponse } from 'next/server'
import {
  getMutualMatch, saveDatePlanningPrefs, getDatePlanningPrefs,
  updateMutualMatch, getUser
} from '@/lib/db'
import type { MutualMatch } from '@/lib/types'
import { calculateMidpoint, findDateVenue, slotToTimeOfDay } from '@/lib/places'

// GET: Check planning state
export async function GET(req: NextRequest) {
  const mutualMatchId = req.nextUrl.searchParams.get('mutualMatchId')
  const userId = req.nextUrl.searchParams.get('userId')

  if (!mutualMatchId || !userId) {
    return NextResponse.json({ error: 'mutualMatchId and userId required' }, { status: 400 })
  }

  const mutualMatch = await getMutualMatch(mutualMatchId)
  if (!mutualMatch) {
    return NextResponse.json({ error: 'Mutual match not found' }, { status: 404 })
  }

  const prefs = await getDatePlanningPrefs(mutualMatchId)
  const myPrefs = prefs.find(p => p.user_id === userId)
  const partnerPrefs = prefs.find(p => p.user_id !== userId)

  // If date is already scheduled, return the details
  if (mutualMatch.status === 'date_scheduled' && mutualMatch.planned_venue_name) {
    const isUserA = mutualMatch.user_a_id === userId
    const partnerId = isUserA ? mutualMatch.user_b_id : mutualMatch.user_a_id
    const partner = await getUser(partnerId)
    const partnerPhone = isUserA ? mutualMatch.user_b_phone : mutualMatch.user_a_phone

    return NextResponse.json({
      phase: 'confirmed',
      date: {
        venue_name: mutualMatch.planned_venue_name,
        venue_address: mutualMatch.planned_venue_address,
        venue_place_id: mutualMatch.planned_venue_place_id,
        planned_at: mutualMatch.planned_at,
        partner_phone: partnerPhone,
        partner_name: partner?.first_name || 'Your match',
      },
    })
  }

  return NextResponse.json({
    phase: myPrefs ? (partnerPrefs ? 'processing' : 'waiting') : 'input',
    hasSubmitted: !!myPrefs,
    partnerHasSubmitted: !!partnerPrefs,
  })
}

// POST: Submit availability + location preferences
export async function POST(req: NextRequest) {
  const { mutualMatchId, userId, availableSlots, locationPreferences, phone } = await req.json()

  if (!mutualMatchId || !userId || !availableSlots?.length || !locationPreferences) {
    return NextResponse.json({ error: 'mutualMatchId, userId, availableSlots, and locationPreferences required' }, { status: 400 })
  }

  const mutualMatch = await getMutualMatch(mutualMatchId)
  if (!mutualMatch) {
    return NextResponse.json({ error: 'Mutual match not found' }, { status: 404 })
  }

  if (mutualMatch.user_a_id !== userId && mutualMatch.user_b_id !== userId) {
    return NextResponse.json({ error: 'User not part of this match' }, { status: 403 })
  }

  // Save preferences
  await saveDatePlanningPrefs({
    mutual_match_id: mutualMatchId,
    user_id: userId,
    available_slots: availableSlots,
    location_preferences: locationPreferences,
  })

  // Save phone number
  const isUserA = mutualMatch.user_a_id === userId
  const phoneUpdate: Partial<MutualMatch> = isUserA
    ? { user_a_phone: phone }
    : { user_b_phone: phone }
  await updateMutualMatch(mutualMatchId, phoneUpdate)

  // Check if both have submitted
  const allPrefs = await getDatePlanningPrefs(mutualMatchId)
  if (allPrefs.length < 2) {
    return NextResponse.json({ ok: true, phase: 'waiting' })
  }

  // Both submitted — find overlap and plan the date
  const prefsA = allPrefs.find(p => p.user_id === mutualMatch.user_a_id)!
  const prefsB = allPrefs.find(p => p.user_id === mutualMatch.user_b_id)!

  // Find overlapping time slots
  const overlapping = prefsA.available_slots.filter(slotA =>
    prefsB.available_slots.some(slotB =>
      slotA.date === slotB.date && slotA.slot === slotB.slot
    )
  )

  if (overlapping.length === 0) {
    return NextResponse.json({
      ok: true,
      phase: 'no_overlap',
      error: 'No overlapping availability found. Try adding more times.',
    })
  }

  // Pick the first overlapping slot
  const chosenSlot = overlapping[0]

  // Calculate midpoint from locations
  const locA = prefsA.location_preferences
  const locB = prefsB.location_preferences

  let venue = null
  if (locA.latitude && locA.longitude && locB.latitude && locB.longitude) {
    const midpoint = calculateMidpoint(locA.latitude, locA.longitude, locB.latitude, locB.longitude)
    const maxTravel = Math.min(
      locA.max_travel_minutes || 30,
      locB.max_travel_minutes || 30
    )
    // Convert minutes to rough meters (assuming ~1km per minute of driving)
    const radiusMeters = maxTravel * 1000
    venue = await findDateVenue(midpoint, radiusMeters, slotToTimeOfDay(chosenSlot.slot))
  }

  // Build planned date/time from the chosen slot
  const slotHours: Record<string, number> = { morning: 10, afternoon: 14, evening: 19 }
  const plannedDate = new Date(chosenSlot.date)
  plannedDate.setHours(slotHours[chosenSlot.slot] || 14, 0, 0, 0)

  // Update mutual match with planned date info
  const updatedMatch = await getMutualMatch(mutualMatchId)
  await updateMutualMatch(mutualMatchId, {
    status: 'date_scheduled',
    planned_venue_name: venue?.name || 'TBD - pick a spot near you both',
    planned_venue_address: venue?.address || null,
    planned_venue_place_id: venue?.place_id || null,
    planned_at: plannedDate.toISOString(),
  } as Partial<MutualMatch>)

  const partnerId = isUserA ? mutualMatch.user_b_id : mutualMatch.user_a_id
  const partner = await getUser(partnerId)
  const partnerPhone = isUserA
    ? (updatedMatch?.user_b_phone || null)
    : (updatedMatch?.user_a_phone || null)

  return NextResponse.json({
    ok: true,
    phase: 'confirmed',
    date: {
      venue_name: venue?.name || 'TBD - pick a spot near you both',
      venue_address: venue?.address || null,
      venue_place_id: venue?.place_id || null,
      planned_at: plannedDate.toISOString(),
      partner_phone: partnerPhone,
      partner_name: partner?.first_name || 'Your match',
    },
  })
}
