'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Props {
  mutualMatchId: string
  userId: string
  partnerName: string
  onPhaseChange: (status: string) => void
}

export default function MeetDecision({
  mutualMatchId,
  userId,
  partnerName,
  onPhaseChange,
}: Props) {
  const [phase, setPhase] = useState<'pending' | 'waiting' | 'planning' | 'ended'>('pending')
  const [submitting, setSubmitting] = useState(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/meet-decision?mutualMatchId=${mutualMatchId}&userId=${userId}`)
      if (!res.ok) return
      const data = await res.json()
      setPhase(data.phase)
      if (data.phase === 'planning') {
        onPhaseChange('planning')
      } else if (data.phase === 'ended') {
        onPhaseChange('declined')
      }
    } catch {
      // retry on next poll
    }
  }, [mutualMatchId, userId, onPhaseChange])

  useEffect(() => {
    checkStatus()
    // Only poll while waiting for partner
    pollingRef.current = setInterval(checkStatus, 3000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [checkStatus])

  async function submitDecision(decision: 'yes' | 'no') {
    setSubmitting(true)
    try {
      const res = await fetch('/api/meet-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mutualMatchId, userId, decision }),
      })
      if (res.ok) {
        const data = await res.json()
        setPhase(data.phase)
        if (data.phase === 'planning') {
          onPhaseChange('planning')
        } else if (data.phase === 'ended') {
          onPhaseChange('declined')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'ended') {
    return (
      <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-8 text-center">
        <p className="text-[15px] font-semibold">
          This one didn&apos;t work out
        </p>
        <p className="text-[12px] text-muted-foreground mt-2">
          No worries &mdash; your next intro is coming.
        </p>
      </div>
    )
  }

  if (phase === 'waiting') {
    return (
      <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            Locked in
          </span>
        </div>
        <p className="text-[15px] font-semibold">
          Your answer is sealed
        </p>
        <p className="text-[12px] text-muted-foreground mt-2">
          Waiting for {partnerName} to decide...
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-8 text-center space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          10 messages in
        </p>
        <h2 className="text-[15px] font-semibold mt-1">
          Do you want to meet {partnerName}?
        </h2>
        <p className="text-[12px] text-muted-foreground mt-2">
          This is blind &mdash; neither of you will see the other&apos;s answer.
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => submitDecision('yes')}
          disabled={submitting}
          className="rounded-lg bg-primary text-primary-foreground px-8 py-3 text-[13px] font-medium disabled:opacity-50 disabled:pointer-events-none active:translate-y-px transition-all"
        >
          Yes, let&apos;s meet
        </button>
        <button
          onClick={() => submitDecision('no')}
          disabled={submitting}
          className="rounded-lg bg-secondary text-muted-foreground px-8 py-3 text-[13px] font-medium disabled:opacity-50 disabled:pointer-events-none active:translate-y-px transition-all"
        >
          Not this time
        </button>
      </div>
    </div>
  )
}
