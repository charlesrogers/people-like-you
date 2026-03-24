'use client'

import { useState } from 'react'

export interface IntroCard {
  id: string
  matchId: string
  matchedUserId: string
  name: string
  narrative: string
  photoUrl: string | null
  tier: string
  strategy: string
}

interface DailyThreeProps {
  cards: IntroCard[]
  firesAvailable: number
  userId: string
  onFire: (card: IntroCard) => void
  onSave: (card: IntroCard) => void
  onPass: (card: IntroCard) => void
  onPhotoDecision: (card: IntroCard, interested: boolean, reason?: string) => void
}

type CardState = 'browsing' | 'photo_revealed' | 'decided'

export default function DailyThree({
  cards,
  firesAvailable,
  userId,
  onFire,
  onSave,
  onPass,
  onPhotoDecision,
}: DailyThreeProps) {
  const [firedCard, setFiredCard] = useState<IntroCard | null>(null)
  const [cardState, setCardState] = useState<CardState>('browsing')
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const visibleCards = cards.filter(c => !passedIds.has(c.id) && c.id !== firedCard?.id)

  const handleFire = (card: IntroCard) => {
    if (firesAvailable <= 0) return
    setFiredCard(card)
    setCardState('photo_revealed')
    onFire(card)
  }

  const handleSave = (card: IntroCard) => {
    setSavedIds(prev => new Set(prev).add(card.id))
    onSave(card)
  }

  const handlePass = (card: IntroCard) => {
    setPassedIds(prev => new Set(prev).add(card.id))
    onPass(card)
  }

  const handlePhotoInterested = () => {
    if (!firedCard) return
    setCardState('decided')
    onPhotoDecision(firedCard, true)
  }

  const handlePhotoPass = () => {
    if (!firedCard) return
    setCardState('decided')
    onPhotoDecision(firedCard, false)
  }

  // Photo reveal view
  if (cardState === 'photo_revealed' && firedCard) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {/* Narrative recap */}
          <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
            About {firedCard.name}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            {firedCard.narrative}
          </p>

          {/* Photo */}
          {firedCard.photoUrl ? (
            <div className="mt-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={firedCard.photoUrl}
                alt={firedCard.name}
                className="w-full rounded-xl object-cover"
                style={{ maxHeight: '400px' }}
              />
            </div>
          ) : (
            <div className="mt-5 flex h-64 items-center justify-center rounded-xl bg-stone-100">
              <p className="text-sm text-stone-400">No photo available</p>
            </div>
          )}

          <p className="mt-4 text-center text-lg font-semibold text-stone-900">{firedCard.name}</p>
        </div>

        {/* Decision buttons */}
        <div className="flex gap-3">
          <button
            onClick={handlePhotoPass}
            className="flex-1 rounded-xl border border-stone-200 py-3.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 active:translate-y-px"
          >
            Not for me
          </button>
          <button
            onClick={handlePhotoInterested}
            className="flex-1 rounded-xl bg-stone-900 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
          >
            I&rsquo;m interested
          </button>
        </div>
      </div>
    )
  }

  // Decided view
  if (cardState === 'decided') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-3xl">✨</p>
        <p className="mt-3 text-lg font-semibold text-stone-900">Got it!</p>
        <p className="mt-1 text-sm text-stone-500">
          Come back tomorrow for 3 more intros.
        </p>
        {visibleCards.length > 0 && (
          <p className="mt-3 text-xs text-stone-400">
            You still have {visibleCards.length} card{visibleCards.length > 1 ? 's' : ''} below — save them for later or pass.
          </p>
        )}
      </div>
    )
  }

  // No cards
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-3xl">💌</p>
        <p className="mt-3 text-lg font-semibold text-stone-900">Your intros are coming</p>
        <p className="mt-1 text-sm text-stone-500">
          We&rsquo;re writing personalized introductions for you. Check back soon.
        </p>
      </div>
    )
  }

  // Browsing view — show cards
  return (
    <div className="space-y-4">
      {/* Fire count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700">
          Today&rsquo;s intros
        </p>
        <div className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
          <span className="text-base">🔥</span>
          <span className="text-xs font-bold text-stone-700">{firesAvailable}</span>
          <span className="text-xs text-stone-400">left today</span>
        </div>
      </div>

      {/* Cards */}
      {cards.map(card => {
        const isPassed = passedIds.has(card.id)
        const isSaved = savedIds.has(card.id)
        if (isPassed) return null

        return (
          <div
            key={card.id}
            className={`rounded-2xl bg-white p-6 shadow-sm transition ${
              isSaved ? 'border-2 border-emerald-200 bg-emerald-50/30' : 'border border-stone-200'
            }`}
          >
            {/* Narrative */}
            <p className="text-sm leading-relaxed text-stone-700">
              {card.narrative}
            </p>

            {/* Action buttons */}
            <div className="mt-5 flex gap-2">
              {!isSaved && firesAvailable > 0 && !firedCard && (
                <button
                  onClick={() => handleFire(card)}
                  className="flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-800 active:translate-y-px"
                >
                  🔥 Tell me more
                </button>
              )}
              {!isSaved && (
                <button
                  onClick={() => handleSave(card)}
                  className="flex items-center gap-1.5 rounded-full border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-50 active:translate-y-px"
                >
                  💾 Save for later
                </button>
              )}
              {isSaved && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2 text-xs font-medium text-emerald-700">
                  ✓ Saved
                </span>
              )}
              <button
                onClick={() => handlePass(card)}
                className="ml-auto text-xs text-stone-400 transition hover:text-stone-600"
              >
                👋 Pass
              </button>
            </div>
          </div>
        )
      })}

      {/* All passed */}
      {visibleCards.length === 0 && !firedCard && (
        <div className="rounded-2xl bg-stone-50 p-6 text-center">
          <p className="text-sm text-stone-500">
            You&rsquo;ve seen all today&rsquo;s intros. Come back tomorrow for more!
          </p>
        </div>
      )}
    </div>
  )
}
