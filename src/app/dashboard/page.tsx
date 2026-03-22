'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import posthog from 'posthog-js'

interface Match {
  id: string
  name: string
  narrative: string
  expansionPoints: string[]
  photoUrl: string | null
  compatibilityScore: number
}

interface UserProfile {
  id: string
  first_name: string
  onboarding_stage: string
  elo_score: number
}

interface ExtractionStatus {
  total: number
  transcribed: number
  extracted: number
  compositeReady: boolean
  excitementType: string | null
  memoCount: number
}

interface CompositeData {
  passion_indicators: string[]
  values: string[]
  interest_tags: string[]
  excitement_type: string | null
  notable_quotes: string[]
  memo_count: number
}

type FeedbackReason = 'not_attracted' | 'no_spark' | 'dealbreaker' | 'something_off' | 'reconsider'

const FEEDBACK_OPTIONS: { value: FeedbackReason; label: string }[] = [
  { value: 'not_attracted', label: 'Not physically attracted' },
  { value: 'no_spark', label: "No spark from the description" },
  { value: 'dealbreaker', label: 'Dealbreaker (kids, location, religion, etc.)' },
  { value: 'something_off', label: 'Something felt off' },
  { value: 'reconsider', label: 'Actually, I want to reconsider' },
]

const EXCITEMENT_LABELS: Record<string, { label: string; description: string }> = {
  explorer: { label: 'Explorer', description: 'You light up around novelty, adventure, and the unexpected' },
  nester: { label: 'Nester', description: 'You respond to warmth, stability, and shared values' },
  intellectual: { label: 'Intellectual', description: 'You\'re drawn to depth, curiosity, and unique perspectives' },
  spark: { label: 'Spark', description: 'You connect through humor, energy, and magnetic personality' },
}

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [composite, setComposite] = useState<CompositeData | null>(null)
  const [extraction, setExtraction] = useState<ExtractionStatus | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [matchesLoading, setMatchesLoading] = useState(false)

  // Match detail modal
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [photoRevealed, setPhotoRevealed] = useState(false)
  const [photoRevealedBeforeDecision, setPhotoRevealedBeforeDecision] = useState(false)

  // Feedback modal
  const [feedbackMatch, setFeedbackMatch] = useState<Match | null>(null)
  const [feedbackReason, setFeedbackReason] = useState<FeedbackReason | null>(null)
  const [feedbackDetails, setFeedbackDetails] = useState('')
  const [feedbackSending, setFeedbackSending] = useState(false)

  useEffect(() => {
    const profileId = localStorage.getItem('ply_profile_id')
    if (!profileId) {
      window.location.href = '/onboarding'
      return
    }

    async function load() {
      try {
        // Load profile + extraction status in parallel
        const [profileRes, extractionRes] = await Promise.all([
          fetch(`/api/profile?id=${profileId}`),
          fetch(`/api/extraction-status?userId=${profileId}`),
        ])

        const profileData = await profileRes.json()
        const extractionData = await extractionRes.json()

        if (!profileData.profile) {
          window.location.href = '/onboarding'
          return
        }

        setProfile(profileData.profile)
        setExtraction(extractionData)

        // Load composite profile if ready
        if (extractionData.compositeReady) {
          const compositeRes = await fetch(`/api/composite?userId=${profileId}`)
          const compositeData = await compositeRes.json()
          if (compositeData.composite) setComposite(compositeData.composite)
        }

        // Load matches
        setMatchesLoading(true)
        const matchesRes = await fetch(`/api/matches?userId=${profileId}`)
        const matchesData = await matchesRes.json()
        setMatches(matchesData.matches || [])
        setMatchesLoading(false)

        posthog.capture('dashboard_loaded', { match_count: (matchesData.matches || []).length })
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  function handleSelectMatch(match: Match) {
    posthog.capture('match_selected', { match_id: match.id })
    setSelectedMatch(match)
    setPhotoRevealed(false)
    setPhotoRevealedBeforeDecision(false)
  }

  function handleRevealPhoto() {
    posthog.capture('photo_revealed', { match_id: selectedMatch?.id })
    setPhotoRevealed(true)
    setPhotoRevealedBeforeDecision(true)
  }

  function handleInterested() {
    if (!selectedMatch || !profile) return
    posthog.capture('match_interested', { match_id: selectedMatch.id })
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: selectedMatch.id,
        userId: profile.id,
        action: 'interested',
        photoRevealedBeforeDecision,
      }),
    }).catch(() => {})
    setSelectedMatch(null)
  }

  function handleNotRightNow() {
    if (selectedMatch) {
      setFeedbackMatch(selectedMatch)
      setSelectedMatch(null)
      setFeedbackReason(null)
      setFeedbackDetails('')
    }
  }

  async function handleSubmitFeedback() {
    if (!feedbackMatch || !feedbackReason || !profile) return

    if (feedbackReason === 'reconsider') {
      setSelectedMatch(feedbackMatch)
      setFeedbackMatch(null)
      return
    }

    posthog.capture('feedback_submitted', { reason: feedbackReason })
    setFeedbackSending(true)

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: feedbackMatch.id,
          userId: profile.id,
          action: 'not_interested',
          reason: feedbackReason,
          details: feedbackDetails,
          photoRevealedBeforeDecision,
        }),
      })
      setMatches(prev => prev.filter(m => m.id !== feedbackMatch.id))
    } catch {
      // Silent fail
    } finally {
      setFeedbackSending(false)
      setFeedbackMatch(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-400">Loading your world...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <p className="text-stone-500">Profile not found.</p>
          <Link href="/onboarding" className="mt-4 text-stone-900 underline">Create one</Link>
        </div>
      </div>
    )
  }

  const dripProgress = extraction ? extraction.total : 0
  const maxMemos = 8

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-900">People Like You</h1>
          <span className="text-sm text-stone-500">Hi, {profile.first_name}</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Profile processing status */}
        {extraction && !extraction.compositeReady && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-medium text-amber-800">Processing your stories...</p>
            <p className="mt-1 text-xs text-amber-600">
              {extraction.transcribed} of {extraction.total} transcribed,{' '}
              {extraction.extracted} of {extraction.total} analyzed
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-amber-100">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${extraction.total > 0 ? (extraction.extracted / extraction.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Profile summary from composite */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Your Profile</h2>

          {/* Drip progress */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: maxMemos }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-6 rounded-full ${i < dripProgress ? 'bg-stone-900' : 'bg-stone-200'}`}
                />
              ))}
            </div>
            <span className="text-xs text-stone-400">{dripProgress} of {maxMemos} stories recorded</span>
          </div>

          {/* Excitement type badge */}
          {composite?.excitement_type && EXCITEMENT_LABELS[composite.excitement_type] && (
            <div className="mt-4 rounded-lg bg-stone-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Your type</p>
              <p className="mt-1 text-sm font-semibold text-stone-900">
                {EXCITEMENT_LABELS[composite.excitement_type].label}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                {EXCITEMENT_LABELS[composite.excitement_type].description}
              </p>
            </div>
          )}

          {/* Composite insights */}
          {composite && (
            <div className="mt-4 space-y-3">
              {composite.passion_indicators.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">What lights you up</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {composite.passion_indicators.slice(0, 6).map(p => (
                      <span key={p} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {composite.values.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Your values</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {composite.values.slice(0, 5).map(v => (
                      <span key={v} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">{v}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Matches */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">Your Matches</h2>

          {matchesLoading ? (
            <div className="mt-4 rounded-xl border-2 border-dashed border-stone-200 p-8 text-center">
              <p className="text-stone-400">Finding your people...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="mt-4 rounded-xl border-2 border-dashed border-stone-200 p-8 text-center">
              <p className="text-stone-500">
                {extraction && !extraction.compositeReady
                  ? "We're still processing your stories. Matches will appear once your profile is ready."
                  : "We're finding people whose worlds could expand yours. Check back soon."
                }
              </p>
              {dripProgress < 3 && (
                <p className="mt-2 text-xs text-stone-400">
                  Recording more stories helps us find better matches for you.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {matches.map(match => (
                <button
                  key={match.id}
                  onClick={() => handleSelectMatch(match)}
                  className="w-full rounded-xl bg-white p-6 text-left shadow-sm transition hover:shadow-md"
                >
                  <p className="font-medium text-stone-900">Someone we think you should meet</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600 line-clamp-3">
                    {match.narrative}
                  </p>
                  {match.expansionPoints?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {match.expansionPoints.map(point => (
                        <span key={point} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                          {point}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Match detail modal */}
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8">
              <h3 className="text-xl font-semibold text-stone-900">
                Why you might click with {selectedMatch.name}
              </h3>
              <p className="mt-4 leading-relaxed text-stone-600">
                {selectedMatch.narrative}
              </p>

              {/* Photo reveal */}
              <div className="mt-6">
                {!photoRevealed ? (
                  <button
                    onClick={handleRevealPhoto}
                    className="w-full rounded-xl border-2 border-dashed border-stone-200 py-4 text-sm font-medium text-stone-500 transition hover:border-stone-300 hover:text-stone-700"
                  >
                    See their photo
                  </button>
                ) : selectedMatch.photoUrl ? (
                  <div className="overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedMatch.photoUrl}
                      alt={selectedMatch.name}
                      className="h-72 w-full object-cover rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl bg-stone-100">
                    <span className="text-4xl text-stone-300">{selectedMatch.name[0]}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleInterested}
                  className="flex-1 rounded-xl bg-stone-900 py-3 font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
                >
                  I&rsquo;m curious
                </button>
                <button
                  onClick={handleNotRightNow}
                  className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600 transition hover:bg-stone-50 active:translate-y-px"
                >
                  Not right now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback modal */}
        {feedbackMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8">
              <h3 className="text-lg font-semibold text-stone-900">Why wasn&rsquo;t this a fit?</h3>
              <p className="mt-1 text-sm text-stone-500">This helps us find better matches for you.</p>

              <div className="mt-6 space-y-2">
                {FEEDBACK_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFeedbackReason(option.value)}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
                      feedbackReason === option.value
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {feedbackReason && feedbackReason !== 'reconsider' && (
                <textarea
                  value={feedbackDetails}
                  onChange={e => setFeedbackDetails(e.target.value)}
                  placeholder="Anything specific? (optional)"
                  rows={3}
                  className="mt-4 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:border-stone-400 focus:outline-none"
                />
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackReason || feedbackSending}
                  className="flex-1 rounded-xl bg-stone-900 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-30"
                >
                  {feedbackSending ? 'Sending...' : feedbackReason === 'reconsider' ? 'Go back' : 'Submit'}
                </button>
                <button
                  onClick={() => setFeedbackMatch(null)}
                  className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600 transition hover:bg-stone-50"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
