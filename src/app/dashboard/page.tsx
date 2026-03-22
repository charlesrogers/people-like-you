'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import posthog from 'posthog-js'
import MatchCard from '@/components/MatchCard'
import CountdownTimer from '@/components/CountdownTimer'

interface Intro {
  id: string
  matchId: string
  matchedUserId: string
  name: string
  narrative: string
  photoUrl: string | null
  status: string
  introType: string
  expiresAt: string
  voiceMessageRequired: boolean
}

interface HistoryItem {
  id: string
  name: string
  narrativePreview: string
  status: string
  actedAt: string | null
}

interface CadenceState {
  isPaused: boolean
  isHidden: boolean
  consecutiveInactiveDays: number
}

interface ExtractionStatus {
  total: number
  transcribed: number
  extracted: number
  compositeReady: boolean
  excitementType: string | null
}

type PassStreakAction = 'help_us_help_you' | 'refresh_profile' | 'reset' | null

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [extraction, setExtraction] = useState<ExtractionStatus | null>(null)

  const [currentIntro, setCurrentIntro] = useState<Intro | null>(null)
  const [bonusIntro, setBonusIntro] = useState<Intro | null>(null)
  const [nextDeliveryAt, setNextDeliveryAt] = useState<string | null>(null)
  const [cadenceState, setCadenceState] = useState<CadenceState | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [passStreakAction, setPassStreakAction] = useState<PassStreakAction>(null)
  const [resuming, setResuming] = useState(false)

  // Feedback modal
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackIntroId, setFeedbackIntroId] = useState<string | null>(null)
  const [feedbackMatchId, setFeedbackMatchId] = useState<string | null>(null)
  const [feedbackMatchedUserId, setFeedbackMatchedUserId] = useState<string | null>(null)
  const [feedbackReason, setFeedbackReason] = useState<string | null>(null)

  useEffect(() => {
    const profileId = localStorage.getItem('ply_profile_id')
    if (!profileId) {
      window.location.href = '/onboarding'
      return
    }
    setUserId(profileId)

    async function load() {
      try {
        const [profileRes, extractionRes, matchesRes] = await Promise.all([
          fetch(`/api/profile?id=${profileId}`),
          fetch(`/api/extraction-status?userId=${profileId}`),
          fetch(`/api/matches?userId=${profileId}`),
        ])

        const profileData = await profileRes.json()
        if (!profileData.profile) {
          window.location.href = '/onboarding'
          return
        }
        setFirstName(profileData.profile.first_name)

        const extractionData = await extractionRes.json()
        setExtraction(extractionData)

        const matchesData = await matchesRes.json()
        setCurrentIntro(matchesData.currentIntro)
        setBonusIntro(matchesData.bonusIntro)
        setNextDeliveryAt(matchesData.nextDeliveryAt)
        setCadenceState(matchesData.cadenceState)
        setHistory(matchesData.history || [])

        posthog.capture('dashboard_loaded', {
          has_intro: !!matchesData.currentIntro,
          is_paused: matchesData.cadenceState?.isPaused,
        })
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleLike(introId: string, matchId: string) {
    if (!userId) return
    setSubmitting(true)
    posthog.capture('match_interested', { intro_id: introId })

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introId, matchId, userId, action: 'interested' }),
      })
      const data = await res.json()

      // Move current intro to history
      if (currentIntro?.id === introId) {
        setHistory(prev => [{ id: introId, name: currentIntro.name, narrativePreview: currentIntro.narrative.substring(0, 120), status: 'liked', actedAt: new Date().toISOString() }, ...prev])
        setCurrentIntro(null)
      } else if (bonusIntro?.id === introId) {
        setHistory(prev => [{ id: introId, name: bonusIntro.name, narrativePreview: bonusIntro.narrative.substring(0, 120), status: 'liked', actedAt: new Date().toISOString() }, ...prev])
        setBonusIntro(null)
      }

      // Show bonus if returned
      if (data.bonusIntro) {
        setBonusIntro(data.bonusIntro)
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false)
    }
  }

  function handlePass(introId: string, matchId: string, matchedUserId: string) {
    setFeedbackIntroId(introId)
    setFeedbackMatchId(matchId)
    setFeedbackMatchedUserId(matchedUserId)
    setFeedbackReason(null)
    setShowFeedback(true)
  }

  async function submitFeedback() {
    if (!feedbackIntroId || !feedbackReason || !userId) return
    setSubmitting(true)
    posthog.capture('feedback_submitted', { reason: feedbackReason })

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          introId: feedbackIntroId,
          matchId: feedbackMatchId,
          matchedUserId: feedbackMatchedUserId,
          userId,
          action: 'not_interested',
          reason: feedbackReason,
        }),
      })
      const data = await res.json()

      // Move to history
      const passedIntro = currentIntro?.id === feedbackIntroId ? currentIntro : bonusIntro
      if (passedIntro) {
        setHistory(prev => [{ id: passedIntro.id, name: passedIntro.name, narrativePreview: passedIntro.narrative.substring(0, 120), status: 'passed', actedAt: new Date().toISOString() }, ...prev])
        if (currentIntro?.id === feedbackIntroId) setCurrentIntro(null)
        if (bonusIntro?.id === feedbackIntroId) setBonusIntro(null)
      }

      setShowFeedback(false)

      if (data.passStreakAction) {
        setPassStreakAction(data.passStreakAction)
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResume() {
    if (!userId) return
    setResuming(true)
    try {
      const res = await fetch('/api/cadence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'resume' }),
      })
      const data = await res.json()
      setCadenceState({ isPaused: false, isHidden: false, consecutiveInactiveDays: 0 })
      if (data.intro) setCurrentIntro(data.intro)
    } catch {
      // silent fail
    } finally {
      setResuming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-400">Loading your world...</p>
      </div>
    )
  }

  const isPaused = cadenceState?.isPaused
  const isHidden = cadenceState?.isHidden
  const activeIntro = currentIntro?.status === 'pending' ? currentIntro : null
  const activeBonus = bonusIntro?.status === 'pending' ? bonusIntro : null
  const doneForToday = !activeIntro && !activeBonus && history.length > 0

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-900">People Like You</h1>
          <span className="text-sm text-stone-500">Hi, {firstName}</span>
        </div>
      </header>

      <div className="mx-auto max-w-xl px-6 py-8">
        {/* Paused/Hidden banner */}
        {(isPaused || isHidden) && (
          <div className="mb-6 rounded-xl border border-stone-200 bg-white p-6 text-center">
            <p className="text-base font-medium text-stone-900">
              {isHidden ? "Your profile is resting." : "We saved your spot."}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {isHidden
                ? "Tap to come back whenever you're ready."
                : "You have intros waiting."
              }
            </p>
            <button
              onClick={handleResume}
              disabled={resuming}
              className="mt-4 rounded-lg bg-stone-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-40"
            >
              {resuming ? 'Getting your intro...' : 'Resume'}
            </button>
          </div>
        )}

        {/* Processing state */}
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

        {/* Hero match */}
        {!isPaused && !isHidden && activeIntro && (
          <MatchCard
            intro={activeIntro}
            onLike={handleLike}
            onPass={handlePass}
            isSubmitting={submitting}
          />
        )}

        {/* Bonus match */}
        {!isPaused && !isHidden && !activeIntro && activeBonus && (
          <div>
            <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-center">
              <p className="text-sm font-medium text-emerald-700">
                Nice! Here&rsquo;s a bonus intro.
              </p>
            </div>
            <MatchCard
              intro={activeBonus}
              onLike={handleLike}
              onPass={handlePass}
              isSubmitting={submitting}
            />
          </div>
        )}

        {/* Done for today */}
        {!isPaused && !isHidden && doneForToday && !activeIntro && !activeBonus && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-base font-medium text-stone-900">You&rsquo;re all set for today.</p>
            {nextDeliveryAt && (
              <div className="mt-4">
                <CountdownTimer targetTime={nextDeliveryAt} />
              </div>
            )}
          </div>
        )}

        {/* Waiting for first intro */}
        {!isPaused && !isHidden && !activeIntro && !activeBonus && history.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-base font-medium text-stone-900">
              {extraction && !extraction.compositeReady
                ? "We're still processing your stories. Your first intro is coming soon."
                : "Your first intro is on its way."
              }
            </p>
            {nextDeliveryAt && (
              <div className="mt-4">
                <CountdownTimer targetTime={nextDeliveryAt} label="Your first intro arrives in" />
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">Past intros</h2>
            <div className="mt-3 space-y-2">
              {history.slice(0, 10).map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900">{item.name}</p>
                    <p className="truncate text-xs text-stone-400">{item.narrativePreview}</p>
                  </div>
                  <span className={`ml-3 flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                    item.status === 'liked'
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.status === 'passed'
                        ? 'bg-stone-100 text-stone-500'
                        : 'bg-amber-50 text-amber-600'
                  }`}>
                    {item.status === 'liked' ? 'Liked' : item.status === 'passed' ? 'Passed' : 'Expired'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feedback modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8">
            <h3 className="text-lg font-semibold text-stone-900">Why wasn&rsquo;t this a fit?</h3>
            <p className="mt-1 text-sm text-stone-500">This helps us find better matches for you.</p>

            <div className="mt-6 space-y-2">
              {[
                { value: 'not_attracted', label: 'Not physically attracted' },
                { value: 'no_spark', label: "No spark from the description" },
                { value: 'dealbreaker', label: 'Dealbreaker (kids, location, religion, etc.)' },
                { value: 'something_off', label: 'Something felt off' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFeedbackReason(opt.value)}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
                    feedbackReason === opt.value
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={submitFeedback}
                disabled={!feedbackReason || submitting}
                className="flex-1 rounded-xl bg-stone-900 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-30"
              >
                {submitting ? 'Saving...' : 'Submit'}
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600 transition hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pass streak modal */}
      {passStreakAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8">
            {passStreakAction === 'help_us_help_you' && (
              <>
                <h3 className="text-lg font-semibold text-stone-900">We want to find you better matches.</h3>
                <p className="mt-2 text-sm text-stone-600">
                  The more we know about you, the better we can find someone you&rsquo;ll be excited about.
                  Share a new story:
                </p>
                <div className="mt-4 space-y-3">
                  <p className="rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
                    &ldquo;What&rsquo;s a quality in someone that instantly gets your attention?&rdquo;
                  </p>
                  <p className="rounded-lg bg-stone-50 p-3 text-sm text-stone-700">
                    &ldquo;Describe someone you admire — what makes them special?&rdquo;
                  </p>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link href="/onboarding" className="flex-1 rounded-xl bg-stone-900 py-3 text-center font-medium text-white transition hover:bg-stone-800">
                    Record now
                  </Link>
                  <button onClick={() => setPassStreakAction(null)} className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600 transition hover:bg-stone-50">
                    Maybe later
                  </button>
                </div>
              </>
            )}

            {passStreakAction === 'refresh_profile' && (
              <>
                <h3 className="text-lg font-semibold text-stone-900">A fresh photo changes everything.</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Profiles with updated photos get significantly more mutual matches.
                </p>
                <div className="mt-4 space-y-2 text-sm text-stone-500">
                  <p>- Outdoor light, genuine smile, no sunglasses</p>
                  <p>- Solo shot where your face is clear</p>
                  <p>- Action shots outperform posed photos 2:1</p>
                </div>
                <button onClick={() => setPassStreakAction(null)} className="mt-6 w-full rounded-xl bg-stone-900 py-3 font-medium text-white transition hover:bg-stone-800">
                  Got it
                </button>
              </>
            )}

            {passStreakAction === 'reset' && (
              <>
                <h3 className="text-lg font-semibold text-stone-900">Let&rsquo;s recalibrate.</h3>
                <p className="mt-2 text-sm text-stone-600">
                  We haven&rsquo;t found your person yet. That&rsquo;s okay — let&rsquo;s try a fresh approach.
                </p>
                <div className="mt-4 space-y-3 text-sm text-stone-600">
                  <p>1. Record 2 new stories — we&rsquo;ll use them to find different types of matches</p>
                  <p>2. Consider widening your preferences — a slightly wider range can dramatically expand your match pool</p>
                  <p>3. Add or update your photos — a stronger first photo is the single biggest thing you can do</p>
                </div>
                <button onClick={() => setPassStreakAction(null)} className="mt-6 w-full rounded-xl bg-stone-900 py-3 font-medium text-white transition hover:bg-stone-800">
                  Got it
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
