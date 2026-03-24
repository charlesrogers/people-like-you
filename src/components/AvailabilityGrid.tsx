'use client'

import { useState } from 'react'
import type { UserAvailability, DaySlots } from '@/lib/types'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}
const SLOTS = ['morning', 'afternoon', 'evening'] as const
const SLOT_LABELS: Record<string, string> = {
  morning: 'AM', afternoon: 'PM', evening: 'Eve',
}

const DEFAULT_AVAILABILITY: UserAvailability['availability'] = {
  monday: { morning: false, afternoon: false, evening: true },
  tuesday: { morning: false, afternoon: false, evening: true },
  wednesday: { morning: false, afternoon: false, evening: true },
  thursday: { morning: false, afternoon: false, evening: true },
  friday: { morning: false, afternoon: true, evening: true },
  saturday: { morning: true, afternoon: true, evening: true },
  sunday: { morning: false, afternoon: false, evening: false },
}

interface Props {
  userId: string
  initial?: UserAvailability['availability'] | null
  onSave?: (availability: UserAvailability['availability']) => void
  compact?: boolean
}

export default function AvailabilityGrid({ userId, initial, onSave, compact }: Props) {
  const [availability, setAvailability] = useState<UserAvailability['availability']>(
    initial ?? DEFAULT_AVAILABILITY
  )
  const [saving, setSaving] = useState(false)

  function toggle(day: typeof DAYS[number], slot: keyof DaySlots) {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [slot]: !prev[day][slot] },
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, availability }),
      })
      if (res.ok && onSave) {
        onSave(availability)
      }
    } finally {
      setSaving(false)
    }
  }

  const selectedCount = Object.values(availability)
    .flatMap(day => Object.values(day))
    .filter(Boolean).length

  return (
    <div className="space-y-4">
      {!compact && (
        <div>
          <h3 className="text-[14px] font-semibold">When are you free?</h3>
          <p className="text-[12px] text-muted-foreground mt-1">
            Tap the times you&apos;re usually available for a date. We&apos;ll find overlap with your match.
          </p>
        </div>
      )}

      <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1">
        {/* Header row */}
        <div />
        {DAYS.map(day => (
          <div key={day} className="text-[10px] text-muted-foreground text-center font-medium py-1">
            {DAY_LABELS[day]}
          </div>
        ))}

        {/* Slot rows */}
        {SLOTS.map(slot => (
          <>
            <div key={`label-${slot}`} className="text-[10px] text-muted-foreground pr-2 flex items-center justify-end font-medium">
              {SLOT_LABELS[slot]}
            </div>
            {DAYS.map(day => {
              const active = availability[day][slot]
              return (
                <button
                  key={`${day}-${slot}`}
                  onClick={() => toggle(day, slot)}
                  className={`h-8 rounded-md transition-all text-[10px] font-medium ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary/50 text-muted-foreground/50 hover:bg-secondary'
                  }`}
                >
                  {active ? '\u2713' : ''}
                </button>
              )
            })}
          </>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          {selectedCount} slot{selectedCount !== 1 ? 's' : ''} selected
        </p>
        <button
          onClick={handleSave}
          disabled={saving || selectedCount === 0}
          className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium disabled:opacity-50 active:translate-y-px transition-all"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}
