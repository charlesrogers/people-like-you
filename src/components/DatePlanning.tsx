'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { PlannedDateInfo } from '@/lib/types'

interface Props {
  mutualMatchId: string
  userId: string
  partnerName: string
  onDateConfirmed: (date: PlannedDateInfo) => void
}

type Slot = { date: string; slot: 'morning' | 'afternoon' | 'evening' }

export default function DatePlanning({
  mutualMatchId,
  userId,
  partnerName,
  onDateConfirmed,
}: Props) {
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([])
  const [phone, setPhone] = useState('')
  const [travelMinutes, setTravelMinutes] = useState(30)
  const [submitting, setSubmitting] = useState(false)
  const [phase, setPhase] = useState<'input' | 'waiting' | 'processing' | 'confirmed'>('input')
  const [locationGranted, setLocationGranted] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Generate next 14 days
  const days: { date: string; label: string; dayName: string }[] = []
  for (let i = 1; i <= 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
    })
  }

  const slots: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening']

  function toggleSlot(date: string, slot: 'morning' | 'afternoon' | 'evening') {
    setSelectedSlots(prev => {
      const exists = prev.some(s => s.date === date && s.slot === slot)
      if (exists) return prev.filter(s => !(s.date === date && s.slot === slot))
      return [...prev, { date, slot }]
    })
  }

  function isSelected(date: string, slot: string): boolean {
    return selectedSlots.some(s => s.date === date && s.slot === slot)
  }

  async function requestLocation() {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      setLocationGranted(true)
    } catch {
      // Fall back to no location — venue will be TBD
      setLocationGranted(false)
    }
  }

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/date-planning?mutualMatchId=${mutualMatchId}&userId=${userId}`)
      if (!res.ok) return
      const data = await res.json()
      setPhase(data.phase)
      if (data.phase === 'confirmed' && data.date) {
        onDateConfirmed(data.date)
      }
    } catch {
      // retry
    }
  }, [mutualMatchId, userId, onDateConfirmed])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  // Poll while waiting
  useEffect(() => {
    if (phase === 'waiting') {
      pollingRef.current = setInterval(checkStatus, 5000)
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current)
      }
    }
  }, [phase, checkStatus])

  async function handleSubmit() {
    if (selectedSlots.length === 0 || !phone.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/date-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mutualMatchId,
          userId,
          availableSlots: selectedSlots,
          locationPreferences: {
            latitude: coords?.lat || null,
            longitude: coords?.lng || null,
            max_travel_minutes: travelMinutes,
          },
          phone: phone.trim(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setPhase(data.phase)
        if (data.phase === 'confirmed' && data.date) {
          onDateConfirmed(data.date)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'waiting') {
    return (
      <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Planning in progress
          </span>
        </div>
        <p className="text-[15px] font-semibold">
          Waiting for {partnerName} to share their availability
        </p>
        <p className="text-[12px] text-muted-foreground mt-2">
          We&apos;ll find the perfect time and place once you&apos;re both ready.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          Before we share the results
        </p>
        <h2 className="text-[15px] font-semibold mt-1">
          Help us plan logistics
        </h2>
        <p className="text-[12px] text-muted-foreground mt-1">
          When are you free in the next two weeks?
        </p>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header row */}
          <div className="grid grid-cols-[80px_repeat(14,1fr)] gap-1 mb-2">
            <div />
            {days.map(d => (
              <div key={d.date} className="text-center">
                <p className="text-[10px] text-muted-foreground">{d.dayName}</p>
                <p className="text-[11px] font-medium">{d.label}</p>
              </div>
            ))}
          </div>

          {/* Slot rows */}
          {slots.map(slot => (
            <div key={slot} className="grid grid-cols-[80px_repeat(14,1fr)] gap-1 mb-1">
              <div className="flex items-center">
                <span className="text-[11px] text-muted-foreground capitalize">{slot}</span>
              </div>
              {days.map(d => (
                <button
                  key={`${d.date}-${slot}`}
                  onClick={() => toggleSlot(d.date, slot)}
                  className={`h-8 rounded-md text-[10px] transition-colors ${
                    isSelected(d.date, slot)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-accent'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        {selectedSlots.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-2">
            {selectedSlots.length} time{selectedSlots.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Location */}
      <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4 space-y-3">
        <p className="text-[13px] font-medium">Where can you meet?</p>

        {!locationGranted ? (
          <button
            onClick={requestLocation}
            className="w-full rounded-lg bg-secondary text-foreground py-2.5 text-[13px] font-medium hover:bg-accent transition-colors active:translate-y-px"
          >
            Share my location (for finding a midpoint)
          </button>
        ) : (
          <p className="text-[12px] text-muted-foreground">
            Location shared. We&apos;ll find a spot between you both.
          </p>
        )}

        <div>
          <label className="text-[12px] text-muted-foreground block mb-1">
            Max travel time: {travelMinutes} minutes
          </label>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={travelMinutes}
            onChange={(e) => setTravelMinutes(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Phone number */}
      <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-4 space-y-2">
        <p className="text-[13px] font-medium">Your phone number</p>
        <p className="text-[11px] text-muted-foreground">
          Shared with your match so you can coordinate day-of details.
        </p>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 123-4567"
          className="w-full rounded-lg border bg-background px-3 py-2 text-[13px] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || selectedSlots.length === 0 || !phone.trim()}
        className="w-full rounded-lg bg-primary text-primary-foreground py-3 text-[13px] font-medium disabled:opacity-50 disabled:pointer-events-none active:translate-y-px transition-all"
      >
        {submitting ? 'Submitting...' : 'Lock in my availability'}
      </button>
    </div>
  )
}
