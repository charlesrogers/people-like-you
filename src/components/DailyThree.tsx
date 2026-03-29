'use client'

import { useState } from 'react'
import RadarChart, { getDimensionInsight, type DimensionScores } from './RadarChart'
import { computePersonalityReveal } from '@/lib/personality-reveal'
import type { CompositeProfile } from '@/lib/types'

export interface IntroCard {
  id: string
  matchId: string
  matchedUserId: string
  name: string
  narrative: string
  photoUrl: string | null
  tier: string
  strategy: string
  compatibilityPercentile?: number
  valuesAlignment?: number
}

type PostInterestState = 'mutual' | 'pending' | 'exhausted' | null
type CardState = 'browsing' | 'not_sure' | 'photo_revealed' | 'decided'

interface DailyThreeProps {
  cards: IntroCard[]
  firesAvailable: number
  userId: string
  userComposite?: CompositeProfile | null
  matchComposites?: Record<string, CompositeProfile>
  lockedCount?: number
  onFire: (card: IntroCard) => void
  onSave: (card: IntroCard) => void
  onPass: (card: IntroCard) => void
  onPhotoDecision: (card: IntroCard, interested: boolean, reason?: string) => void
  postInterestState?: PostInterestState
  mutualMatchData?: { id: string; partnerName: string } | null
  pendingName?: string
  onStartDisclosure?: () => void
  onStartVoiceLoop?: () => void
}

export default function DailyThree({
  cards,
  firesAvailable,
  userId,
  userComposite,
  matchComposites,
  lockedCount = 20,
  onFire,
  onSave,
  onPass,
  onPhotoDecision,
  postInterestState,
  mutualMatchData,
  pendingName,
  onStartDisclosure,
  onStartVoiceLoop,
}: DailyThreeProps) {
  const [firedCard, setFiredCard] = useState<IntroCard | null>(null)
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({})
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [irlCheckId, setIrlCheckId] = useState<string | null>(null)

  const getCardState = (id: string): CardState => cardStates[id] || 'browsing'
  const setCardState = (id: string, state: CardState) => {
    setCardStates(prev => ({ ...prev, [id]: state }))
  }

  const activeCards = cards.filter(c => !passedIds.has(c.id) && !savedIds.has(c.id) && getCardState(c.id) !== 'decided')
  const savedCards = cards.filter(c => savedIds.has(c.id) && getCardState(c.id) !== 'decided')

  // Compute dimension scores from composite profiles
  function getUserDimensions(): DimensionScores | null {
    if (!userComposite) return null
    const reveal = computePersonalityReveal(userComposite)
    const scores: DimensionScores = {}
    reveal.dimensions.forEach(d => { scores[d.id] = d.score })
    return scores
  }

  function getMatchDimensions(matchedUserId: string): DimensionScores | null {
    const comp = matchComposites?.[matchedUserId]
    if (!comp) return null
    const reveal = computePersonalityReveal(comp)
    const scores: DimensionScores = {}
    reveal.dimensions.forEach(d => { scores[d.id] = d.score })
    return scores
  }

  const userDims = getUserDimensions()

  const handleFire = (card: IntroCard) => {
    if (firesAvailable <= 0) return
    setFiredCard(card)
    setCardState(card.id, 'photo_revealed')
    onFire(card)
  }

  const handleSave = (card: IntroCard) => {
    setSavedIds(prev => new Set(prev).add(card.id))
    if (expandedId === card.id) setExpandedId(null)
    onSave(card)
  }

  const [passExhausted, setPassExhausted] = useState(false)

  const handlePass = (card: IntroCard) => {
    const newPassedIds = new Set(passedIds).add(card.id)
    setPassedIds(newPassedIds)
    if (expandedId === card.id) setExpandedId(null)
    onPass(card)

    // Check if this was the last card — if so, show voice-to-unlock
    const remaining = cards.filter(c => !newPassedIds.has(c.id) && !savedIds.has(c.id) && getCardState(c.id) !== 'decided')
    const saved = cards.filter(c => savedIds.has(c.id) && getCardState(c.id) !== 'decided')
    if (remaining.length === 0 && saved.length === 0) {
      setPassExhausted(true)
    }
  }

  const handlePhotoInterested = () => {
    if (!firedCard) return
    setCardState(firedCard.id, 'decided')
    onPhotoDecision(firedCard, true)
  }

  const handlePhotoPass = () => {
    if (!firedCard) return
    setCardState(firedCard.id, 'decided')
    setPassedIds(prev => new Set(prev).add(firedCard.id))
    onPhotoDecision(firedCard, false)
  }

  // Render superlative pills
  function renderSuperlatives(card: IntroCard) {
    const pills: string[] = []
    if (card.compatibilityPercentile && card.compatibilityPercentile >= 90) {
      pills.push(`Top ${100 - card.compatibilityPercentile}% match`)
    }
    if (card.valuesAlignment && card.valuesAlignment >= 0.85) {
      pills.push(`Top ${Math.round((1 - card.valuesAlignment) * 100)}% values alignment`)
    }
    if (pills.length === 0) return null
    return (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {pills.slice(0, 2).map(p => (
          <span key={p} className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-bold text-primary border border-primary/15">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            {p}
          </span>
        ))}
      </div>
    )
  }

  // ─── Decided states ───

  if (postInterestState === 'mutual' && mutualMatchData) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-3xl">&#10024;</p>
          <p className="mt-3 text-lg font-semibold text-stone-900">
            You&rsquo;re both curious about each other
          </p>
          <p className="mt-2 text-sm text-stone-500">
            {mutualMatchData.partnerName} is interested in getting to know you too.
          </p>
          <button
            onClick={onStartDisclosure}
            className="mt-5 rounded-xl bg-stone-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
          >
            Start getting to know {mutualMatchData.partnerName}
          </button>
        </div>
      </div>
    )
  }

  if (postInterestState === 'exhausted' && activeCards.length === 0 && savedCards.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-3xl">&#127908;</p>
          <p className="mt-3 text-lg font-semibold text-stone-900">
            Help us find better matches
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Answer a few more questions and we&rsquo;ll unlock new intros based on your stories.
          </p>
          <button
            onClick={onStartVoiceLoop}
            className="mt-5 rounded-xl bg-stone-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
          >
            Record a voice note
          </button>
        </div>
      </div>
    )
  }

  // No cards at all
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-3xl">{'\u{1F48C}'}</p>
        <p className="mt-3 text-lg font-semibold text-stone-900">Your intros are coming</p>
        <p className="mt-1 text-sm text-stone-500">
          We&rsquo;re writing personalized introductions for you. Check back soon.
        </p>
      </div>
    )
  }

  // ─── Photo revealed view (full screen takeover) ───

  if (firedCard && getCardState(firedCard.id) === 'photo_revealed') {
    if (irlCheckId === firedCard.id) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
            {firedCard.photoUrl && (
              <img src={firedCard.photoUrl} alt="" className="w-full h-48 object-cover opacity-60" />
            )}
            <div className="p-6">
              <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
                <p className="text-[13px] font-semibold text-stone-800">Small world</p>
                <p className="mt-2 text-[12px] leading-relaxed text-stone-500">
                  We don&rsquo;t think this is a strong match for you. No worries &mdash; it just means the chemistry math doesn&rsquo;t add up for us.
                </p>
              </div>
              <button
                onClick={() => {
                  setIrlCheckId(null)
                  handlePhotoPass()
                }}
                className="mt-4 w-full rounded-lg border border-stone-200 py-2.5 text-[13px] font-medium text-stone-600 hover:bg-stone-50 transition active:translate-y-px"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          {firedCard.photoUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={firedCard.photoUrl} alt="" className="w-full h-72 object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
                <p className="text-white font-bold text-lg">{firedCard.name}</p>
              </div>
            </div>
          ) : (
            <div className="h-48 bg-stone-100 flex items-center justify-center">
              <span className="text-4xl text-stone-300">{firedCard.name[0]}</span>
            </div>
          )}

          <div className="p-5">
            <p className="text-[13px] leading-relaxed text-stone-600">{firedCard.narrative}</p>
            {renderSuperlatives(firedCard)}
          </div>
        </div>

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
        <div className="text-center">
          <button
            onClick={() => setIrlCheckId(firedCard.id)}
            className="text-[11px] text-stone-400 underline decoration-dotted underline-offset-2 hover:text-stone-600 transition"
          >
            I know this person
          </button>
        </div>
      </div>
    )
  }

  // ─── Pending state (liked someone, showing remaining cards) ───

  if (postInterestState === 'pending' && firedCard && getCardState(firedCard.id) === 'decided') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-3xl">{'\u{1F48C}'}</p>
          <p className="mt-3 text-lg font-semibold text-stone-900">We&rsquo;ll let you know</p>
          <p className="mt-2 text-sm text-stone-500">
            {pendingName ? `We'll tell you if ${pendingName} is curious too.` : "We'll let you know if they feel the same."}
          </p>
        </div>
        {activeCards.length > 0 && (
          <>
            <p className="text-sm font-medium text-stone-700">While you wait, here are more intros:</p>
            {activeCards.map(card => renderBrowsingCard(card, card.id === (expandedId || activeCards[0]?.id)))}
          </>
        )}
        {renderSavedSection()}
        {renderLockedCards()}
      </div>
    )
  }

  // ─── Main browsing view ───

  return (
    <div className="space-y-3">
      {/* Reveal counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700">Today&rsquo;s intros</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-stone-400 font-medium">Reveals</span>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < firesAvailable ? 'bg-primary' : 'bg-stone-200'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Active cards */}
      {activeCards.map((card, idx) => renderBrowsingCard(card, card.id === (expandedId || activeCards[0]?.id)))}

      {/* All active passed/saved — show voice-to-unlock if exhausted via pass */}
      {activeCards.length === 0 && savedCards.length === 0 && (
        passExhausted ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-3xl">&#127908;</p>
            <p className="mt-3 text-lg font-semibold text-stone-900">
              Help us find better matches
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Answer a few more questions and we&rsquo;ll unlock new intros based on your stories.
            </p>
            <button
              onClick={onStartVoiceLoop}
              className="mt-5 rounded-xl bg-stone-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
            >
              Record a voice note
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-stone-50 p-6 text-center">
            <p className="text-sm text-stone-500">
              You&rsquo;ve seen all today&rsquo;s intros. Come back tomorrow for more!
            </p>
          </div>
        )
      )}

      {renderSavedSection()}
      {renderLockedCards()}
    </div>
  )

  // ─── Card renderers ───

  function renderBrowsingCard(card: IntroCard, isExpanded: boolean) {
    const state = getCardState(card.id)

    if (state === 'not_sure') {
      return renderNotSureCard(card)
    }

    if (!isExpanded) {
      return (
        <div key={card.id} className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <button
            onClick={() => setExpandedId(expandedId === card.id ? null : card.id)}
            className="w-full px-5 py-4 text-left flex items-center justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Someone to meet</p>
              <p className="text-[13px] text-stone-600 mt-0.5 truncate">{card.narrative.slice(0, 80)}...</p>
            </div>
            {card.compatibilityPercentile && card.compatibilityPercentile >= 90 && (
              <span className="shrink-0 ml-3 text-[10px] font-bold text-primary bg-primary/8 px-2 py-0.5 rounded-full whitespace-nowrap">
                Top {100 - card.compatibilityPercentile}%
              </span>
            )}
            <svg className="w-4 h-4 text-stone-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )
    }

    // Expanded browsing card
    return (
      <div key={card.id} className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Someone we think you should meet</p>
          {renderSuperlatives(card)}
          <p className="mt-3 text-[13px] leading-relaxed text-stone-600">{card.narrative}</p>
        </div>

        {/* Reveal button */}
        <div className="px-5 pt-4 pb-2">
          <button
            onClick={() => handleFire(card)}
            disabled={firesAvailable <= 0}
            className={`w-full rounded-lg py-3 text-[13px] font-semibold transition active:translate-y-px ${
              firesAvailable > 0
                ? 'bg-stone-900 text-white hover:bg-stone-800'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            {firesAvailable > 0 ? 'I am intrigued \u2014 show me the picture' : 'No reveals left today'}
          </button>
          <p className="text-center mt-1.5 text-[11px] text-stone-400">
            {firesAvailable > 0
              ? `${firesAvailable} of 3 reveals left today`
              : 'Save for tomorrow \u2014 or upgrade for more'}
          </p>
        </div>

        {/* Action row: Not sure / Save / Pass */}
        <div className="px-5 pb-5 pt-1 flex gap-2.5">
          <button
            onClick={() => setCardState(card.id, 'not_sure')}
            className="flex-1 rounded-lg border border-stone-200 py-2.5 text-[13px] font-medium text-stone-600 hover:bg-stone-50 transition active:translate-y-px"
          >
            Not sure
          </button>
          <button
            onClick={() => handleSave(card)}
            className={`flex-1 rounded-lg py-2.5 text-[13px] font-medium transition active:translate-y-px ${
              firesAvailable <= 0
                ? 'bg-primary text-white hover:opacity-90'
                : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Save for later
          </button>
          <button
            onClick={() => handlePass(card)}
            className="flex-1 rounded-lg border border-stone-200 py-2.5 text-[13px] font-medium text-stone-500 hover:bg-stone-50 transition active:translate-y-px"
          >
            Pass
          </button>
        </div>
      </div>
    )
  }

  function renderNotSureCard(card: IntroCard) {
    const matchDims = getMatchDimensions(card.matchedUserId)
    const insight = userDims && matchDims ? getDimensionInsight(userDims, matchDims) : null

    return (
      <div key={card.id} className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Here&rsquo;s why we think you&rsquo;d click</p>
        </div>

        {/* Radar chart */}
        {userDims && matchDims ? (
          <div className="flex justify-center pt-2 pb-1">
            <RadarChart you={userDims} them={matchDims} size={240} />
          </div>
        ) : (
          <div className="flex justify-center py-6">
            <p className="text-[12px] text-stone-400">Record more voice notes to see your personality comparison</p>
          </div>
        )}

        {insight && (
          <p className="text-center text-[11px] text-stone-500 mt-1 px-8">{insight}</p>
        )}

        {renderSuperlatives(card)}

        {/* Reveal button */}
        <div className="px-5 pt-5 pb-2">
          <button
            onClick={() => handleFire(card)}
            disabled={firesAvailable <= 0}
            className={`w-full rounded-lg py-3 text-[13px] font-semibold transition active:translate-y-px ${
              firesAvailable > 0
                ? 'bg-stone-900 text-white hover:bg-stone-800'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
          >
            {firesAvailable > 0 ? 'OK, show me the picture' : 'No reveals left today'}
          </button>
          <p className="text-center mt-1.5 text-[11px] text-stone-400">
            {firesAvailable > 0
              ? `${firesAvailable} of 3 reveals left today`
              : 'Save for tomorrow \u2014 or upgrade for more'}
          </p>
        </div>

        {/* Action row */}
        <div className="px-5 pb-5 pt-1 flex gap-2.5">
          <button
            onClick={() => setCardState(card.id, 'browsing')}
            className="flex-1 rounded-lg border border-stone-200 py-2.5 text-[13px] font-medium text-stone-600 hover:bg-stone-50 transition active:translate-y-px"
          >
            Back to intro
          </button>
          <button
            onClick={() => handleSave(card)}
            className="flex-1 rounded-lg border border-stone-200 py-2.5 text-[13px] font-medium text-stone-600 hover:bg-stone-50 transition active:translate-y-px"
          >
            Save for later
          </button>
          <button
            onClick={() => handlePass(card)}
            className="flex-1 rounded-lg border border-stone-200 py-2.5 text-[13px] font-medium text-stone-500 hover:bg-stone-50 transition active:translate-y-px"
          >
            Pass
          </button>
        </div>
      </div>
    )
  }

  function renderSavedSection() {
    if (savedCards.length === 0) return null
    return (
      <>
        <div className="pt-6 pb-1">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-stone-400">Saved intros</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Come back when you have reveals</p>
        </div>
        {savedCards.map(card => (
          <div key={card.id} className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-primary/70">Saved</span>
              </div>
              <p className="text-[13px] text-stone-600 line-clamp-2">{card.narrative}</p>
              {renderSuperlatives(card)}
              <div className="mt-3 flex gap-2.5">
                <button
                  onClick={() => handleFire(card)}
                  disabled={firesAvailable <= 0}
                  className={`flex-1 rounded-lg py-2 text-[12px] font-semibold transition active:translate-y-px ${
                    firesAvailable > 0
                      ? 'bg-stone-900 text-white hover:bg-stone-800'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {firesAvailable > 0 ? 'Reveal photo' : 'No reveals left'}
                </button>
                <button
                  onClick={() => {
                    setSavedIds(prev => { const s = new Set(prev); s.delete(card.id); return s })
                    handlePass(card)
                  }}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-[12px] font-medium text-stone-500 hover:bg-stone-50 transition active:translate-y-px"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </>
    )
  }

  function renderLockedCards() {
    if (lockedCount <= 0) return null
    return (
      <>
        <div className="pt-6 pb-1">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-stone-400">More matches waiting</p>
          <p className="text-[11px] text-stone-400 mt-0.5">Record voice notes to unlock, or upgrade for instant access</p>
        </div>
        {Array.from({ length: Math.min(lockedCount, 20) }, (_, i) => {
          const fakeCompat = Math.max(50, 90 - i * 2)
          return (
            <div key={`locked-${i}`} className="rounded-xl border border-stone-200 bg-white/60 shadow-sm overflow-hidden opacity-70">
              <div className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-16 bg-stone-200 rounded-full" />
                      {fakeCompat >= 80 && (
                        <span className="text-[9px] font-bold text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded-full">
                          Top {100 - fakeCompat}%
                        </span>
                      )}
                    </div>
                    <div className="h-2 w-32 bg-stone-100 rounded-full mt-1.5" />
                  </div>
                </div>
                <svg className="w-4 h-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )
        })}

        {/* Upgrade CTA */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center mt-2">
          <p className="text-[13px] font-semibold text-stone-800">Want to see them all?</p>
          <p className="mt-1 text-[11px] text-stone-500">Upgrade for unlimited reveals and instant access to locked matches</p>
          <button className="mt-3 rounded-lg bg-primary px-5 py-2 text-[12px] font-semibold text-white transition active:translate-y-px hover:opacity-90">
            See plans
          </button>
        </div>
      </>
    )
  }
}
