import type { CompositeProfile, ActivityType, UserAvailability, DaySlots, DateSuggestion } from './types'

/**
 * Suggest date activities based on both users' composite profiles.
 *
 * Research basis: Aron et al. (2000) — shared novel/arousing activities increase
 * relationship quality. Dutton & Aron (1974) — arousal transfer from exciting
 * experiences gets attributed to romantic attraction. Coffee is the worst first date.
 */

const ACTIVE_ACTIVITIES: ActivityType[] = ['rock_climbing', 'kayaking', 'hiking_new_trail']
const CREATIVE_ACTIVITIES: ActivityType[] = ['pottery_class', 'cooking_class', 'art_workshop']
const SOCIAL_ACTIVITIES: ActivityType[] = ['comedy_show', 'trivia_night', 'live_music']
const EXPLORATORY_ACTIVITIES: ActivityType[] = ['outdoor_market', 'food_hall', 'art_walk', 'museum_exhibit']
const FALLBACK_ACTIVITIES: ActivityType[] = ['bookstore_cafe', 'dessert_spot', 'park_walk']

export function suggestActivities(
  profileA: CompositeProfile,
  profileB: CompositeProfile,
  count = 4
): ActivityType[] {
  const avgEnergy = avg(profileA.energy_enthusiasm, profileB.energy_enthusiasm)
  const avgOpenness = avg(
    profileA.big_five_proxy?.openness,
    profileB.big_five_proxy?.openness
  )
  const avgExtraversion = avg(
    profileA.big_five_proxy?.extraversion,
    profileB.big_five_proxy?.extraversion
  )

  // Check humor markers for comedy/trivia suggestions
  const bothHumorous = (profileA.humor_style && profileB.humor_style)
    || (profileA.humor_signature?.what_makes_them_laugh?.length ?? 0) > 0

  const scored: { activity: ActivityType; score: number }[] = []

  // Score each activity category based on profile compatibility
  for (const activity of ACTIVE_ACTIVITIES) {
    scored.push({ activity, score: avgEnergy * 1.5 + (avgOpenness > 0.5 ? 0.2 : 0) })
  }
  for (const activity of CREATIVE_ACTIVITIES) {
    scored.push({ activity, score: avgOpenness * 1.3 + 0.3 }) // bonus: novel by default
  }
  for (const activity of SOCIAL_ACTIVITIES) {
    let s = avgExtraversion * 1.2
    if (bothHumorous && (activity === 'comedy_show' || activity === 'trivia_night')) s += 0.4
    scored.push({ activity, score: s })
  }
  for (const activity of EXPLORATORY_ACTIVITIES) {
    scored.push({ activity, score: 0.6 + avgOpenness * 0.3 }) // solid baseline, always novel
  }
  for (const activity of FALLBACK_ACTIVITIES) {
    scored.push({ activity, score: 0.2 }) // low priority — only if nothing else works
  }

  // Sort by score descending, pick top N with variety (max 1 per category)
  scored.sort((a, b) => b.score - a.score)

  const selected: ActivityType[] = []
  const usedCategories = new Set<string>()

  for (const { activity } of scored) {
    if (selected.length >= count) break
    const cat = getCategory(activity)
    if (usedCategories.has(cat)) continue
    usedCategories.add(cat)
    selected.push(activity)
  }

  // Fill remaining slots if needed
  for (const { activity } of scored) {
    if (selected.length >= count) break
    if (!selected.includes(activity)) selected.push(activity)
  }

  return selected.slice(0, count)
}

function getCategory(activity: ActivityType): string {
  if (ACTIVE_ACTIVITIES.includes(activity)) return 'active'
  if (CREATIVE_ACTIVITIES.includes(activity)) return 'creative'
  if (SOCIAL_ACTIVITIES.includes(activity)) return 'social'
  if (EXPLORATORY_ACTIVITIES.includes(activity)) return 'exploratory'
  return 'fallback'
}

function avg(a: number | null | undefined, b: number | null | undefined): number {
  const va = a ?? 0.5
  const vb = b ?? 0.5
  return (va + vb) / 2
}

/**
 * Find overlapping availability slots between two users in the next N days.
 */
export function findOverlappingSlots(
  availA: UserAvailability['availability'],
  availB: UserAvailability['availability'],
  daysAhead = 7
): { day: string; dayOfWeek: string; slot: keyof DaySlots; time: string }[] {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
  const slotTimes: Record<keyof DaySlots, string> = {
    morning: '10:00',
    afternoon: '14:00',
    evening: '19:00',
  }

  const results: { day: string; dayOfWeek: string; slot: keyof DaySlots; time: string }[] = []
  const today = new Date()

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dayOfWeek = dayNames[date.getDay()]

    const slotsA = availA[dayOfWeek as keyof typeof availA]
    const slotsB = availB[dayOfWeek as keyof typeof availB]
    if (!slotsA || !slotsB) continue

    for (const slot of ['morning', 'afternoon', 'evening'] as const) {
      if (slotsA[slot] && slotsB[slot]) {
        results.push({
          day: date.toISOString().split('T')[0],
          dayOfWeek,
          slot,
          time: slotTimes[slot],
        })
      }
    }
  }

  // Rank: evening > afternoon > morning, weekend > weekday, sooner > later
  results.sort((a, b) => {
    const slotRank: Record<string, number> = { evening: 3, afternoon: 2, morning: 1 }
    const isWeekendA = ['saturday', 'sunday'].includes(a.dayOfWeek) ? 1 : 0
    const isWeekendB = ['saturday', 'sunday'].includes(b.dayOfWeek) ? 1 : 0

    // Weekend bonus
    if (isWeekendA !== isWeekendB) return isWeekendB - isWeekendA
    // Slot preference
    if (slotRank[a.slot] !== slotRank[b.slot]) return slotRank[b.slot] - slotRank[a.slot]
    // Sooner is better
    return a.day.localeCompare(b.day)
  })

  return results
}

/**
 * Build date suggestions by combining time slots with activity types.
 */
export function buildDateSuggestions(
  availA: UserAvailability['availability'],
  availB: UserAvailability['availability'],
  profileA: CompositeProfile,
  profileB: CompositeProfile,
  count = 4
): DateSuggestion[] {
  const slots = findOverlappingSlots(availA, availB)
  const activities = suggestActivities(profileA, profileB, count)

  if (slots.length === 0) return []

  const suggestions: DateSuggestion[] = []
  for (let i = 0; i < Math.min(count, slots.length); i++) {
    const slot = slots[i]
    const activity = activities[i % activities.length]

    suggestions.push({
      scheduledAt: `${slot.day}T${slot.time}:00`,
      activityType: activity,
      venueName: null, // Filled by Google Places API lookup
      venueAddress: null,
      venuePlaceId: null,
      venueRating: null,
      venueDescription: null,
      distanceFromA: null,
      distanceFromB: null,
    })
  }

  return suggestions
}
