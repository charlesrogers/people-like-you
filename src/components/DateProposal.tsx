'use client'

import { useState } from 'react'
import type { DateSuggestion, ActivityType } from '@/lib/types'

const ACTIVITY_LABELS: Record<ActivityType, { label: string; icon: string }> = {
  cooking_class: { label: 'Cooking Class', icon: '\uD83C\uDF73' },
  pottery_class: { label: 'Pottery Class', icon: '\uD83C\uDFFA' },
  art_workshop: { label: 'Art Workshop', icon: '\uD83C\uDFA8' },
  escape_room: { label: 'Escape Room', icon: '\uD83D\uDD10' },
  trivia_night: { label: 'Trivia Night', icon: '\uD83E\uDDE0' },
  comedy_show: { label: 'Comedy Show', icon: '\uD83C\uDFAD' },
  live_music: { label: 'Live Music', icon: '\uD83C\uDFB5' },
  outdoor_market: { label: 'Outdoor Market', icon: '\uD83C\uDFEA' },
  food_hall: { label: 'Food Hall', icon: '\uD83C\uDF5C' },
  art_walk: { label: 'Art Walk', icon: '\uD83D\uDDBC\uFE0F' },
  museum_exhibit: { label: 'Museum Exhibit', icon: '\uD83C\uDFDB\uFE0F' },
  rock_climbing: { label: 'Rock Climbing', icon: '\uD83E\uDDD7' },
  kayaking: { label: 'Kayaking', icon: '\uD83D\uDEF6' },
  hiking_new_trail: { label: 'Hiking', icon: '\u26F0\uFE0F' },
  bookstore_cafe: { label: 'Bookstore Cafe', icon: '\uD83D\uDCDA' },
  dessert_spot: { label: 'Dessert Spot', icon: '\uD83C\uDF70' },
  park_walk: { label: 'Park Walk', icon: '\uD83C\uDF33' },
}

interface Props {
  suggestions: DateSuggestion[]
  mutualMatchId: string
  userId: string
  partnerName: string
  onProposed: () => void
}

export default function DateProposal({
  suggestions,
  mutualMatchId,
  userId,
  partnerName,
  onProposed,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [proposing, setProposing] = useState(false)

  async function handlePropose() {
    if (selected === null) return
    const suggestion = suggestions[selected]
    setProposing(true)

    try {
      const res = await fetch('/api/dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mutualMatchId,
          proposedBy: userId,
          scheduledAt: suggestion.scheduledAt,
          activityType: suggestion.activityType,
          venueName: suggestion.venueName,
          venueAddress: suggestion.venueAddress,
          venuePlaceId: suggestion.venuePlaceId,
        }),
      })
      if (res.ok) onProposed()
    } finally {
      setProposing(false)
    }
  }

  function formatDateTime(iso: string) {
    const d = new Date(iso)
    return {
      day: d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-[15px] font-semibold">Pick a time to meet {partnerName}</h3>
        <p className="text-[12px] text-muted-foreground mt-1">
          We found times that work for both of you, with activities you&apos;d both enjoy.
        </p>
      </div>

      <div className="space-y-2">
        {suggestions.map((s, i) => {
          const { day, time } = formatDateTime(s.scheduledAt)
          const activity = ACTIVITY_LABELS[s.activityType] || { label: s.activityType, icon: '' }
          const isSelected = selected === i

          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md shadow-black/[0.06]'
                  : 'bg-card hover:shadow-md hover:shadow-black/[0.06]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-medium">{day} &middot; {time}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {activity.icon} {activity.label}
                  </p>
                  {s.venueName && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {s.venueName}
                      {s.venueRating && ` \u2B50 ${s.venueRating}`}
                    </p>
                  )}
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-primary bg-primary' : 'border-muted'
                }`}>
                  {isSelected && (
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {suggestions.length === 0 && (
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-[13px] text-muted-foreground">
            No overlapping availability found. Try adding more time slots in your settings.
          </p>
        </div>
      )}

      <button
        onClick={handlePropose}
        disabled={selected === null || proposing}
        className="w-full rounded-lg bg-primary text-primary-foreground py-3 text-[13px] font-medium disabled:opacity-50 active:translate-y-px transition-all"
      >
        {proposing ? 'Proposing...' : 'Propose this date'}
      </button>

      <p className="text-[11px] text-muted-foreground text-center">
        {partnerName} will confirm or suggest a different time
      </p>
    </div>
  )
}
