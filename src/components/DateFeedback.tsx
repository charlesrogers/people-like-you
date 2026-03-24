'use client'

import { useState } from 'react'

interface Props {
  scheduledDateId: string
  userId: string
  aboutUserId: string
  partnerName: string
  onSubmitted: () => void
}

export default function DateFeedback({
  scheduledDateId,
  userId,
  aboutUserId,
  partnerName,
  onSubmitted,
}: Props) {
  const [whatSurprised, setWhatSurprised] = useState('')
  const [feltSafe, setFeltSafe] = useState<boolean | null>(null)
  const [lookedLikePhotos, setLookedLikePhotos] = useState<string | null>(null)
  const [wantToSeeAgain, setWantToSeeAgain] = useState<string | null>(null)
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  async function handleSubmit() {
    if (!whatSurprised.trim()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/dates/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDateId,
          userId,
          aboutUserId,
          whatSurprisedYou: whatSurprised,
          feltSafe,
          lookedLikePhotos,
          wantToSeeAgain,
          additionalNotes: additionalNotes || null,
        }),
      })
      if (res.ok) onSubmitted()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-5 space-y-5">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          Post-date check-in
        </p>
        <h3 className="text-[15px] font-semibold mt-1">
          How was your date with {partnerName}?
        </h3>
      </div>

      {/* Step 1: What surprised you (PRIMARY — required) */}
      {step >= 1 && (
        <div className="space-y-2">
          <label className="text-[13px] font-medium">
            What surprised you about {partnerName}?
          </label>
          <p className="text-[11px] text-muted-foreground">
            This is the most helpful thing you can tell us. What was different from what you expected?
          </p>
          <textarea
            value={whatSurprised}
            onChange={(e) => setWhatSurprised(e.target.value)}
            placeholder={`Something about ${partnerName} that caught you off guard...`}
            className="w-full min-h-[80px] rounded-lg border bg-background p-3 text-[13px] resize-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              disabled={!whatSurprised.trim()}
              className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-[13px] font-medium disabled:opacity-50 active:translate-y-px transition-all"
            >
              Continue
            </button>
          )}
        </div>
      )}

      {/* Step 2: Quick checks (private, optional-ish) */}
      {step >= 2 && (
        <div className="space-y-4">
          <p className="text-[11px] text-muted-foreground">
            Quick check — private, never shared with {partnerName}
          </p>

          {/* Felt safe */}
          <div className="space-y-1.5">
            <p className="text-[12px] font-medium">Did you feel physically safe?</p>
            <div className="flex gap-2">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  onClick={() => setFeltSafe(val)}
                  className={`flex-1 rounded-lg py-2 text-[12px] font-medium transition-colors ${
                    feltSafe === val
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {/* Looked like photos */}
          <div className="space-y-1.5">
            <p className="text-[12px] font-medium">Did they look like their photos?</p>
            <div className="flex gap-2">
              {['yes', 'somewhat', 'no'].map(val => (
                <button
                  key={val}
                  onClick={() => setLookedLikePhotos(val)}
                  className={`flex-1 rounded-lg py-2 text-[12px] font-medium transition-colors capitalize ${
                    lookedLikePhotos === val
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Want to see again */}
          <div className="space-y-1.5">
            <p className="text-[12px] font-medium">Do you want to see them again?</p>
            <div className="flex gap-2">
              {['yes', 'maybe', 'no'].map(val => (
                <button
                  key={val}
                  onClick={() => setWantToSeeAgain(val)}
                  className={`flex-1 rounded-lg py-2 text-[12px] font-medium transition-colors capitalize ${
                    wantToSeeAgain === val
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Additional notes */}
          <div className="space-y-1.5">
            <p className="text-[12px] font-medium">Anything else? <span className="text-muted-foreground font-normal">(optional)</span></p>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Anything we should know..."
              className="w-full min-h-[60px] rounded-lg border bg-background p-3 text-[12px] resize-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !whatSurprised.trim()}
            className="w-full rounded-lg bg-primary text-primary-foreground py-3 text-[13px] font-medium disabled:opacity-50 active:translate-y-px transition-all"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  )
}
