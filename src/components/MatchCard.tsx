'use client'

import { useState } from 'react'

interface MatchCardProps {
  intro: {
    id: string
    matchId: string
    matchedUserId: string
    name: string
    narrative: string
    photoUrl: string | null
    expiresAt: string
    voiceMessageRequired: boolean
  }
  onLike: (introId: string, matchId: string) => void
  onPass: (introId: string, matchId: string, matchedUserId: string) => void
  isSubmitting: boolean
}

export default function MatchCard({ intro, onLike, onPass, isSubmitting }: MatchCardProps) {
  const [photoRevealed, setPhotoRevealed] = useState(false)

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
        Someone we think you should meet
      </p>

      <h3 className="mt-4 text-xl font-semibold text-stone-900">
        Why you might click with {intro.name}
      </h3>

      <p className="mt-4 text-base leading-relaxed text-stone-600">
        {intro.narrative}
      </p>

      {/* Photo reveal */}
      <div className="mt-6">
        {!photoRevealed ? (
          <button
            onClick={() => setPhotoRevealed(true)}
            className="w-full rounded-xl border-2 border-dashed border-stone-200 py-4 text-sm font-medium text-stone-500 transition hover:border-stone-300 hover:text-stone-700"
          >
            See their photo
          </button>
        ) : intro.photoUrl ? (
          <div className="overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={intro.photoUrl}
              alt={intro.name}
              className="h-72 w-full object-cover rounded-xl"
            />
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl bg-stone-100">
            <span className="text-5xl text-stone-300">{intro.name[0]}</span>
          </div>
        )}
      </div>

      {/* Expiry hint */}
      <p className="mt-4 text-center text-xs text-stone-400">
        This intro is available until your next one arrives
      </p>

      {/* Action buttons */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onLike(intro.id, intro.matchId)}
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-stone-900 py-3.5 text-base font-medium text-white transition hover:bg-stone-800 disabled:opacity-40 active:translate-y-px"
        >
          {isSubmitting ? 'Finding your bonus...' : "I'm curious"}
        </button>
        <button
          onClick={() => onPass(intro.id, intro.matchId, intro.matchedUserId)}
          disabled={isSubmitting}
          className="flex-1 rounded-xl border border-stone-200 py-3.5 text-base font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-40 active:translate-y-px"
        >
          Not right now
        </button>
      </div>
    </div>
  )
}
