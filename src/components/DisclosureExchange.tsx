'use client'

import { useState } from 'react'
import VoiceRecorder from './VoiceRecorder'

interface Exchange {
  id: string
  round_number: number
  prompt_text: string
  user_a_response: string | null
  user_b_response: string | null
  user_a_responded_at: string | null
  user_b_responded_at: string | null
  expires_at: string
}

interface Props {
  mutualMatchId: string
  userId: string
  isUserA: boolean
  partnerName: string
  exchanges: Exchange[]
  currentRound: Exchange | null
  onSubmit: () => void
  exchangeComplete: boolean
}

export default function DisclosureExchange({
  mutualMatchId,
  userId,
  isUserA,
  partnerName,
  exchanges,
  currentRound,
  onSubmit,
  exchangeComplete,
}: Props) {
  const [response, setResponse] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useVoice, setUseVoice] = useState(false)
  const [voicePath, setVoicePath] = useState<string | null>(null)

  const myResponse = isUserA ? currentRound?.user_a_response : currentRound?.user_b_response
  const partnerResponse = isUserA ? currentRound?.user_b_response : currentRound?.user_a_response
  const iResponded = isUserA ? currentRound?.user_a_responded_at : currentRound?.user_b_responded_at
  const partnerResponded = isUserA ? currentRound?.user_b_responded_at : currentRound?.user_a_responded_at
  const bothResponded = iResponded && partnerResponded

  async function handleSubmit() {
    if (!response.trim() && !voicePath) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/disclosure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mutualMatchId,
          userId,
          response: response.trim() || '[voice response]',
          voicePath,
        }),
      })
      if (res.ok) {
        setResponse('')
        setVoicePath(null)
        onSubmit()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show completed exchanges
  const completedExchanges = exchanges.filter(
    e => e.user_a_responded_at && e.user_b_responded_at
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          You&apos;re both curious
        </p>
        <h2 className="text-[15px] font-semibold mt-1">
          Getting to know {partnerName}
        </h2>
        <p className="text-[12px] text-muted-foreground mt-1">
          Round {currentRound?.round_number ?? completedExchanges.length} of 3
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((r) => {
          const completed = completedExchanges.some(e => e.round_number === r)
          const active = currentRound?.round_number === r
          return (
            <div
              key={r}
              className={`h-2 w-2 rounded-full transition-colors ${
                completed
                  ? 'bg-primary'
                  : active
                    ? 'bg-primary/50'
                    : 'bg-muted'
              }`}
            />
          )
        })}
      </div>

      {/* Previous rounds (collapsed) */}
      {completedExchanges.map((ex) => (
        <div key={ex.id} className="rounded-xl border bg-card p-4 opacity-70">
          <p className="text-[11px] text-muted-foreground mb-2">Round {ex.round_number}</p>
          <p className="text-[12px] text-muted-foreground italic mb-3">&ldquo;{ex.prompt_text}&rdquo;</p>
          <div className="space-y-2">
            <div className="rounded-lg bg-primary/5 p-3">
              <p className="text-[11px] font-medium text-primary mb-1">You said:</p>
              <p className="text-[12px]">{isUserA ? ex.user_a_response : ex.user_b_response}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-[11px] font-medium text-muted-foreground mb-1">{partnerName} said:</p>
              <p className="text-[12px]">{isUserA ? ex.user_b_response : ex.user_a_response}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Exchange complete state */}
      {exchangeComplete && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-[15px] font-semibold">You two clearly have things to talk about.</p>
          <p className="text-[13px] text-muted-foreground mt-2">
            Ready to meet {partnerName} in person?
          </p>
        </div>
      )}

      {/* Current round */}
      {currentRound && !exchangeComplete && (
        <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-5">
          <p className="text-[13px] font-medium text-center mb-4">
            &ldquo;{currentRound.prompt_text}&rdquo;
          </p>

          {/* Already responded — waiting for partner */}
          {iResponded && !bothResponded && (
            <div className="space-y-3">
              <div className="rounded-lg bg-primary/5 p-3">
                <p className="text-[11px] font-medium text-primary mb-1">You said:</p>
                <p className="text-[12px]">{myResponse}</p>
              </div>
              <p className="text-[12px] text-muted-foreground text-center">
                Waiting for {partnerName} to answer...
              </p>
            </div>
          )}

          {/* Both responded — show partner's answer */}
          {bothResponded && (
            <div className="space-y-3">
              <div className="rounded-lg bg-primary/5 p-3">
                <p className="text-[11px] font-medium text-primary mb-1">You said:</p>
                <p className="text-[12px]">{myResponse}</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-[11px] font-medium text-muted-foreground mb-1">{partnerName} said:</p>
                <p className="text-[12px]">{partnerResponse}</p>
              </div>
            </div>
          )}

          {/* Haven't responded yet — show input */}
          {!iResponded && (
            <div className="space-y-3">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setUseVoice(false)}
                  className={`text-[12px] px-3 py-1 rounded-lg transition-colors ${
                    !useVoice ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  Type
                </button>
                <button
                  onClick={() => setUseVoice(true)}
                  className={`text-[12px] px-3 py-1 rounded-lg transition-colors ${
                    useVoice ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  Record
                </button>
              </div>

              {useVoice ? (
                <div className="py-2">
                  <VoiceRecorder
                    promptText={currentRound.prompt_text}
                    promptId={`disclosure-${currentRound.round_number}`}
                    onRecordingComplete={(blob) => {
                      // In production, upload blob and set voicePath
                      void blob
                      setVoicePath('pending-upload')
                      setResponse('[voice response recorded]')
                    }}
                    maxSeconds={90}
                  />
                </div>
              ) : (
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Share your answer..."
                  className="w-full min-h-[100px] rounded-lg border bg-background p-3 text-[13px] resize-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                />
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (!response.trim() && !voicePath)}
                className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-[13px] font-medium disabled:opacity-50 disabled:pointer-events-none active:translate-y-px transition-all"
              >
                {isSubmitting ? 'Sending...' : 'Share your answer'}
              </button>

              {partnerResponded && (
                <p className="text-[11px] text-muted-foreground text-center">
                  {partnerName} has already answered — share yours to see theirs
                </p>
              )}
            </div>
          )}

          {/* Expiration timer */}
          <p className="text-[11px] text-muted-foreground text-center mt-3">
            Expires {new Date(currentRound.expires_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  )
}
