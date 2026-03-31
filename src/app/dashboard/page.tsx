'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api-client'
import posthog from 'posthog-js'
import MatchCard from '@/components/MatchCard'
import CountdownTimer from '@/components/CountdownTimer'
import DisclosureExchange from '@/components/DisclosureExchange'
import ChatWindow from '@/components/ChatWindow'
import MeetDecision from '@/components/MeetDecision'
import DatePlanning from '@/components/DatePlanning'
import DateConfirmed from '@/components/DateConfirmed'
import DateFeedback from '@/components/DateFeedback'
import type { PlannedDateInfo } from '@/lib/types'
import VoicePromptLoop from '@/components/VoicePromptLoop'
import ProfileTab from '@/components/ProfileTab'
import InviteTab from '@/components/InviteTab'
import SettingsTab from '@/components/SettingsTab'
import DailyThree, { type IntroCard } from '@/components/DailyThree'
import type { CompositeProfile } from '@/lib/types'

type DashboardTab = 'today' | 'chats' | 'profile' | 'invite' | 'settings'

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
  proximityLabel?: string | null
  distanceMiles?: number | null
  locationTier?: number | null
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
  poolState?: 'normal' | 'empty_pool' | 'processing' | 'exhausted'
  poolStateReason?: string
}

interface ExtractionStatus {
  total: number
  transcribed: number
  extracted: number
  compositeReady: boolean
  excitementType: string | null
}

type PassStreakAction = 'tell_us_more' | null

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('today')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [extraction, setExtraction] = useState<ExtractionStatus | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [composite, setComposite] = useState<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [voiceMemos, setVoiceMemos] = useState<any[]>([])

  const [currentIntro, setCurrentIntro] = useState<Intro | null>(null)
  const [bonusIntro, setBonusIntro] = useState<Intro | null>(null)
  const [matchComposites, setMatchComposites] = useState<Record<string, CompositeProfile>>({})
  const [nextDeliveryAt, setNextDeliveryAt] = useState<string | null>(null)
  const [cadenceState, setCadenceState] = useState<CadenceState | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [passStreakAction, setPassStreakAction] = useState<PassStreakAction>(null)
  const [resuming, setResuming] = useState(false)

  // Post-interest state for DailyThree
  const [postInterestState, setPostInterestState] = useState<'mutual' | 'pending' | 'exhausted' | null>(null)
  const [pendingName, setPendingName] = useState<string | null>(null)
  const [showVoiceLoop, setShowVoiceLoop] = useState(false)

  // Mutual match + disclosure state
  interface ExchangeRound {
    id: string; round_number: number; prompt_text: string;
    user_a_response: string | null; user_b_response: string | null;
    user_a_responded_at: string | null; user_b_responded_at: string | null;
    expires_at: string;
  }
  interface ActiveMutualMatchState {
    id: string
    matchedUserId: string
    matchedUserName: string
    isUserA: boolean
    exchanges: ExchangeRound[]
    currentRound: ExchangeRound | null
    exchangeComplete: boolean
  }
  const [activeMutualMatch, setActiveMutualMatch] = useState<ActiveMutualMatchState | null>(null)

  // Chat flow state
  const [chatPhase, setChatPhase] = useState<'chatting' | 'deciding' | 'planning' | 'confirmed' | 'declined' | null>(null)
  const [confirmedDate, setConfirmedDate] = useState<PlannedDateInfo | null>(null)

  // Pending date feedback
  const [pendingFeedback, setPendingFeedback] = useState<{
    scheduledDateId: string; aboutUserId: string; partnerName: string;
  } | null>(null)

  // Feedback modal
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackIntroId, setFeedbackIntroId] = useState<string | null>(null)
  const [feedbackMatchId, setFeedbackMatchId] = useState<string | null>(null)
  const [feedbackMatchedUserId, setFeedbackMatchedUserId] = useState<string | null>(null)
  const [feedbackReason, setFeedbackReason] = useState<string | null>(null)

  // Ghost nudge state
  const [ghostNudges, setGhostNudges] = useState<Array<{
    matchId: string; partnerName: string; nudgeLevel: 'gentle' | 'direct'
  }>>([])
  const [ghostNudgeDismissed, setGhostNudgeDismissed] = useState(false)

  useEffect(() => {
    const profileId = localStorage.getItem('ply_profile_id')
    if (!profileId) {
      window.location.href = '/onboarding'
      return
    }
    setUserId(profileId)

    async function load() {
      // Load profile first (required for everything else)
      try {
        const profileRes = await apiFetch(`/api/profile?id=${profileId}`)
        const profileData = await profileRes.json()
        if (!profileData.profile) {
          // Stored profile ID is invalid — clear and redirect
          localStorage.removeItem('ply_profile_id')
          localStorage.removeItem('ply_access_token')
          localStorage.removeItem('ply_refresh_token')
          window.location.href = '/onboarding'
          return
        }
        setFirstName(profileData.profile.first_name)
        setUserEmail(profileData.profile.email || '')
      } catch (err) {
        console.error('Failed to load profile:', err)
      }

      // Load everything else in parallel (non-blocking)
      try {
        const [extractionRes, matchesRes, compositeRes, memosRes] = await Promise.all([
          apiFetch(`/api/extraction-status?userId=${profileId}`),
          apiFetch(`/api/matches?userId=${profileId}`),
          apiFetch(`/api/composite?userId=${profileId}`),
          apiFetch(`/api/voice-memos?userId=${profileId}`),
        ])

        const extractionData = await extractionRes.json()
        setExtraction(extractionData)

        const compositeData = await compositeRes.json()
        if (compositeData.composite) setComposite(compositeData.composite)

        const memosData = await memosRes.json()
        if (memosData.memos) setVoiceMemos(memosData.memos)

        const matchesData = await matchesRes.json()
        setCurrentIntro(matchesData.currentIntro)
        setBonusIntro(matchesData.bonusIntro)
        setNextDeliveryAt(matchesData.nextDeliveryAt)
        setCadenceState(matchesData.cadenceState)
        setHistory(matchesData.history || [])

        // Fetch composite profiles for matched users (for radar chart)
        const matchedUserIds = [
          matchesData.currentIntro?.matchedUserId,
          matchesData.bonusIntro?.matchedUserId,
        ].filter(Boolean) as string[]
        if (matchedUserIds.length > 0) {
          Promise.all(
            matchedUserIds.map(async (id) => {
              const res = await apiFetch(`/api/composite?userId=${id}`)
              const data = await res.json()
              return { id, composite: data.composite }
            })
          ).then(results => {
            const composites: Record<string, CompositeProfile> = {}
            results.forEach(r => { if (r.composite) composites[r.id] = r.composite })
            setMatchComposites(prev => ({ ...prev, ...composites }))
          }).catch(() => {})
        }

        // Load ghost nudges
        if (matchesData.ghostNudges?.length > 0) {
          setGhostNudges(matchesData.ghostNudges)
        }

        // Restore active chat state if one exists
        if (matchesData.activeChatState) {
          const acs = matchesData.activeChatState
          setActiveMutualMatch({
            id: acs.id,
            matchedUserId: acs.matchedUserId,
            matchedUserName: acs.matchedUserName,
            isUserA: acs.isUserA,
            exchanges: [],
            currentRound: null,
            exchangeComplete: false,
          })
          const statusToPhase: Record<string, typeof chatPhase> = {
            chatting: 'chatting',
            deciding: 'deciding',
            planning: 'planning',
            date_scheduled: 'confirmed',
          }
          setChatPhase(statusToPhase[acs.status] || 'chatting')

          // If date is confirmed, fetch the date details
          if (acs.status === 'date_scheduled') {
            try {
              const dateRes = await apiFetch(`/api/date-planning?mutualMatchId=${acs.id}&userId=${profileId}`)
              const dateData = await dateRes.json()
              if (dateData.phase === 'confirmed' && dateData.date) {
                setConfirmedDate(dateData.date)
              }
            } catch {
              // non-blocking
            }
          }
        }

        posthog.capture('dashboard_loaded', {
          has_intro: !!matchesData.currentIntro,
          is_paused: matchesData.cadenceState?.isPaused,
        })
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleLike(introId: string, matchId: string, matchedUserId?: string) {
    if (!userId) return
    setSubmitting(true)
    posthog.capture('match_interested', { intro_id: introId })

    // Resolve matchedUserId from current/bonus intro if not passed directly
    const resolvedMatchedUserId = matchedUserId
      || (currentIntro?.id === introId ? currentIntro.matchedUserId : null)
      || (bonusIntro?.id === introId ? bonusIntro.matchedUserId : null)

    try {
      const res = await apiFetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introId, matchId, matchedUserId: resolvedMatchedUserId, userId, action: 'interested' }),
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

      // Determine post-interest state
      const likedName = (currentIntro?.id === introId ? currentIntro?.name : bonusIntro?.name) || 'them'

      if (data.mutualMatch) {
        // STATE 1: Mutual match!
        setPostInterestState('mutual')
        setPendingName(likedName)
        const matchedIntro = currentIntro?.matchedUserId === data.mutualMatch.matchedUserId
          ? currentIntro : bonusIntro
        // Set up chat flow for new mutual match
        setActiveMutualMatch({
          id: data.mutualMatch.id,
          matchedUserId: data.mutualMatch.matchedUserId,
          matchedUserName: matchedIntro?.name || 'your match',
          isUserA: true,
          exchanges: [],
          currentRound: null,
          exchangeComplete: false,
        })
        setChatPhase('chatting')
        setActiveTab('chats')
      } else {
        // Check remaining visible cards (exclude the one just liked + passed ones)
        const remainingCards = (currentIntro && currentIntro.id !== introId ? 1 : 0)
          + (bonusIntro && bonusIntro.id !== introId ? 1 : 0)

        if (remainingCards > 0) {
          // STATE 2: Pending — still have cards to browse
          setPostInterestState('pending')
          setPendingName(likedName)
        } else {
          // STATE 3: Exhausted — no more cards
          setPostInterestState('exhausted')
          setPendingName(likedName)
        }
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
      const res = await apiFetch('/api/feedback', {
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
      const res = await apiFetch('/api/cadence', {
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
  const poolState = cadenceState?.poolState || 'normal'
  const poolStateReason = cadenceState?.poolStateReason || null
  const activeIntro = currentIntro?.status === 'pending' ? currentIntro : null
  const activeBonus = bonusIntro?.status === 'pending' ? bonusIntro : null

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-900">People Like You</h1>
          {firstName && <span className="text-sm text-stone-500">Hi, {firstName}</span>}
        </div>
      </header>

      {/* Tab navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-stone-200">
        <div className="mx-auto max-w-xl flex">
          {([
            { id: 'today' as const, label: 'Intros', icon: '💌' },
            { id: 'chats' as const, label: 'Chats', icon: '💬' },
            { id: 'profile' as const, label: 'You', icon: '👤' },
            { id: 'invite' as const, label: 'Invite', icon: '🔗' },
            { id: 'settings' as const, label: 'Essentials', icon: '⚙️' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-center text-xs font-medium transition relative ${
                activeTab === tab.id
                  ? 'text-stone-900 border-b-2 border-stone-900'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <span className="block text-base">{tab.icon}</span>
              {tab.label}
              {tab.id === 'chats' && activeMutualMatch && chatPhase === 'chatting' && activeTab !== 'chats' && (
                <span className="absolute top-2 right-1/4 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-xl px-6 py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && userId && (
          <ProfileTab
            userId={userId}
            composite={composite}
            memos={voiceMemos}
            onMemoRecorded={async () => {
              // Refresh composite and memos after new recording
              const [compRes, memRes] = await Promise.all([
                apiFetch(`/api/composite?userId=${userId}`),
                apiFetch(`/api/voice-memos?userId=${userId}`),
              ])
              const compData = await compRes.json()
              const memData = await memRes.json()
              if (compData.composite) setComposite(compData.composite)
              if (memData.memos) setVoiceMemos(memData.memos)
            }}
          />
        )}

        {/* Settings Tab */}
        {/* Invite Tab */}
        {activeTab === 'invite' && userId && (
          <InviteTab userId={userId} />
        )}

        {activeTab === 'settings' && userId && (
          <SettingsTab
            userId={userId}
            email={userEmail}
            onSignOut={() => {
              localStorage.removeItem('ply_profile_id')
              localStorage.removeItem('ply_access_token')
              localStorage.removeItem('ply_refresh_token')
              window.location.href = '/'
            }}
          />
        )}

        {/* Chats Tab */}
        {activeTab === 'chats' && userId && (
          <div>
            {activeMutualMatch ? (
              <div id="match-flow">
                {/* Phase: Chatting */}
                {(chatPhase === 'chatting' || (!chatPhase && activeMutualMatch.exchanges.length === 0)) && (
                  <ChatWindow
                    mutualMatchId={activeMutualMatch.id}
                    userId={userId}
                    isUserA={activeMutualMatch.isUserA}
                    partnerName={activeMutualMatch.matchedUserName}
                    onPhaseChange={(status) => {
                      if (status === 'deciding') setChatPhase('deciding')
                      else if (status === 'expired') {
                        setActiveMutualMatch(null)
                        setChatPhase(null)
                      }
                    }}
                  />
                )}

                {/* Phase: Deciding */}
                {chatPhase === 'deciding' && (
                  <MeetDecision
                    mutualMatchId={activeMutualMatch.id}
                    userId={userId}
                    partnerName={activeMutualMatch.matchedUserName}
                    onPhaseChange={(status) => {
                      if (status === 'planning') setChatPhase('planning')
                      else if (status === 'declined') setChatPhase('declined')
                    }}
                  />
                )}

                {/* Phase: Planning */}
                {chatPhase === 'planning' && (
                  <DatePlanning
                    mutualMatchId={activeMutualMatch.id}
                    userId={userId}
                    partnerName={activeMutualMatch.matchedUserName}
                    onDateConfirmed={(date) => {
                      setConfirmedDate(date)
                      setChatPhase('confirmed')
                    }}
                  />
                )}

                {/* Phase: Confirmed */}
                {chatPhase === 'confirmed' && confirmedDate && (
                  <DateConfirmed date={confirmedDate} />
                )}

                {/* Phase: Declined */}
                {chatPhase === 'declined' && (
                  <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-8 text-center">
                    <p className="text-[15px] font-semibold">
                      This one didn&apos;t work out
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-2">
                      No worries &mdash; your next intro is coming.
                    </p>
                  </div>
                )}

                {/* Legacy: Disclosure Exchange (for any existing matches still in exchange flow) */}
                {!chatPhase && activeMutualMatch.exchanges.length > 0 && (
                  <DisclosureExchange
                    mutualMatchId={activeMutualMatch.id}
                    userId={userId}
                    isUserA={activeMutualMatch.isUserA}
                    partnerName={activeMutualMatch.matchedUserName}
                    exchanges={activeMutualMatch.exchanges}
                    currentRound={activeMutualMatch.currentRound}
                    onSubmit={async () => {
                      try {
                        const res = await apiFetch(`/api/disclosure?mutualMatchId=${activeMutualMatch.id}`)
                        const data = await res.json()
                        setActiveMutualMatch(prev => prev ? {
                          ...prev,
                          exchanges: data.exchanges || [],
                          currentRound: data.currentRound,
                          exchangeComplete: data.exchanges?.filter(
                            (e: { user_a_responded_at: string | null; user_b_responded_at: string | null; round_number: number }) =>
                              e.user_a_responded_at && e.user_b_responded_at
                          ).length >= 3,
                        } : null)
                      } catch {
                        // silent
                      }
                    }}
                    exchangeComplete={activeMutualMatch.exchangeComplete}
                  />
                )}
              </div>
            ) : (
              <div className="rounded-xl border bg-card shadow-sm shadow-black/[0.04] p-8 text-center">
                <p className="text-[15px] font-semibold">No active chats</p>
                <p className="text-[12px] text-muted-foreground mt-2">
                  When you and someone both say yes, your chat will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Today Tab — existing match content */}
        {activeTab === 'today' && (<>

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

        {/* Active chat — most important thing, show first */}
        {activeMutualMatch && chatPhase === 'chatting' && !isPaused && !isHidden && (
          <div className="mb-6">
            <button
              onClick={() => setActiveTab('chats')}
              className="w-full rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-center hover:bg-primary/10 transition-colors"
            >
              <p className="text-[15px] font-semibold text-primary">
                You matched with {activeMutualMatch.matchedUserName}
              </p>
              <p className="mt-1 text-[13px] text-primary/70">
                Tap to start chatting &mdash; your window is open
              </p>
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

        {/* Daily Three — new intro experience */}
        {!isPaused && !isHidden && (activeIntro || activeBonus) && (() => {
          // Convert available intros to DailyThree card format
          const dailyCards: IntroCard[] = []
          if (activeIntro) {
            dailyCards.push({
              id: activeIntro.id,
              matchId: activeIntro.matchId,
              matchedUserId: activeIntro.matchedUserId,
              name: activeIntro.name,
              narrative: activeIntro.narrative,
              photoUrl: activeIntro.photoUrl,
              tier: '',
              strategy: '',
              proximityLabel: activeIntro.proximityLabel ?? null,
              distanceMiles: activeIntro.distanceMiles ?? null,
              locationTier: activeIntro.locationTier ?? null,
            })
          }
          if (activeBonus) {
            dailyCards.push({
              id: activeBonus.id,
              matchId: activeBonus.matchId,
              matchedUserId: activeBonus.matchedUserId,
              name: activeBonus.name,
              narrative: activeBonus.narrative,
              photoUrl: activeBonus.photoUrl,
              tier: '',
              strategy: '',
              proximityLabel: activeBonus.proximityLabel ?? null,
              distanceMiles: activeBonus.distanceMiles ?? null,
              locationTier: activeBonus.locationTier ?? null,
            })
          }

          return (
            <DailyThree
              cards={dailyCards}
              firesAvailable={3}
              userId={userId!}
              userComposite={composite}
              matchComposites={matchComposites}
              lockedCount={20}
              postInterestState={postInterestState}
              mutualMatchData={activeMutualMatch ? {
                id: activeMutualMatch.id,
                partnerName: activeMutualMatch.matchedUserName,
              } : null}
              pendingName={pendingName || undefined}
              onStartDisclosure={() => {
                setActiveTab('chats')
              }}
              onStartVoiceLoop={() => setShowVoiceLoop(true)}
              onFire={(card) => {
                posthog.capture('daily_three_fire', { intro_id: card.id })
              }}
              onSave={(card) => {
                posthog.capture('daily_three_save', { intro_id: card.id })
              }}
              onPass={(card) => {
                posthog.capture('daily_three_pass', { intro_id: card.id })
                apiFetch('/api/feedback', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    introId: card.id,
                    matchId: card.matchId,
                    userId,
                    action: 'not_interested',
                    photoRevealedBeforeDecision: false,
                  }),
                }).catch(() => {})
              }}
              onPhotoDecision={(card, interested, reason) => {
                if (interested) {
                  handleLike(card.id, card.matchId, card.matchedUserId)
                } else {
                  setShowFeedback(true)
                  setFeedbackIntroId(card.id)
                  setFeedbackMatchId(card.matchId)
                  setFeedbackMatchedUserId(card.matchedUserId)
                }
              }}
            />
          )
        })()}

        {/* Legacy MatchCard removed — replaced by DailyThree above */}

        {/* Empty pool / waiting — show appropriate message based on pool state */}
        {!isPaused && !isHidden && !activeIntro && !activeBonus && (
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            {extraction && !extraction.compositeReady ? (
              <>
                <p className="text-base font-semibold text-stone-900">We&rsquo;re processing your recordings</p>
                <p className="mt-2 text-sm text-stone-500">
                  Our AI is listening to your voice memos and building your personality profile.
                  This takes a minute or two.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-stone-900 transition-all"
                      style={{ width: `${extraction.total > 0 ? (extraction.extracted / extraction.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-400">{extraction.extracted}/{extraction.total}</span>
                </div>
              </>
            ) : poolState === 'empty_pool' ? (
              <>
                <p className="text-base font-semibold text-stone-900">
                  {poolStateReason === 'no_compatible_users'
                    ? "You\u2019re early to your area"
                    : "We\u2019re finding more people for you"}
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  {poolStateReason === 'no_compatible_users'
                    ? "We\u2019re actively growing the community near you. The best way to get great matches faster? Bring the people you already think are great."
                    : poolStateReason === 'all_candidates_shown'
                    ? "You\u2019ve seen everyone who matches your criteria right now. We\u2019re working on bringing in more people. Invite friends to speed things up."
                    : "We\u2019re prioritizing acquisition in your area. In the meantime, invite friends \u2014 the best matches come from people you already respect."}
                </p>
                <button
                  onClick={() => setActiveTab('invite')}
                  className="mt-4 w-full rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
                >
                  Invite friends
                </button>
              </>
            ) : history.length === 0 ? (
              <>
                <p className="text-base font-semibold text-stone-900">Your profile is ready</p>
                <p className="mt-2 text-sm text-stone-500">
                  We&rsquo;re writing personalized introductions for you right now. Each intro is custom &mdash; we match
                  your personality with someone specific, then write a story about why you&rsquo;d click.
                </p>
                {nextDeliveryAt && (
                  <div className="mt-4">
                    <CountdownTimer targetTime={nextDeliveryAt} label="Your first intro arrives in" />
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-base font-medium text-stone-900">You&rsquo;re all set for today.</p>
                {nextDeliveryAt && (
                  <div className="mt-4">
                    <CountdownTimer targetTime={nextDeliveryAt} />
                  </div>
                )}
              </>
            )}
          </div>
        )}


        {/* Pending Date Feedback */}
        {pendingFeedback && (
          <div className="mt-6">
            <DateFeedback
              scheduledDateId={pendingFeedback.scheduledDateId}
              userId={userId!}
              aboutUserId={pendingFeedback.aboutUserId}
              partnerName={pendingFeedback.partnerName}
              onSubmitted={() => setPendingFeedback(null)}
            />
          </div>
        )}

        {/* Voice-to-Unlock Loop (State 3: pool exhausted) */}
        {showVoiceLoop && userId && (
          <VoicePromptLoop userId={userId} onIntroUnlocked={(intro: { id: string; matchId: string; matchedUserId: string; name: string; narrative: string; photoUrl: string | null }) => {
            // Add the unlocked intro as a new card
            setCurrentIntro({
              id: intro.id,
              matchId: intro.matchId,
              matchedUserId: intro.matchedUserId,
              name: intro.name,
              narrative: intro.narrative,
              photoUrl: intro.photoUrl,
              status: 'pending',
              introType: 'bonus',
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
              voiceMessageRequired: false,
            })
            setPostInterestState(null)
            setShowVoiceLoop(false)
          }} onDone={() => setShowVoiceLoop(false)} />
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
                    {item.status === 'liked' ? 'Curious' : item.status === 'passed' ? 'Not this time' : 'Expired'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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

      {/* Ghost nudge — you haven't messaged your match */}
      {ghostNudges.length > 0 && !ghostNudgeDismissed && (() => {
        const nudge = ghostNudges[0]
        const isDirectLevel = nudge.nudgeLevel === 'direct'

        async function handleDeclineMatch() {
          try {
            await apiFetch('/api/meet-decision', {
              method: 'POST',
              body: JSON.stringify({ mutualMatchId: nudge.matchId, userId, decision: 'decline_early' }),
            })
            setGhostNudges(prev => prev.filter(n => n.matchId !== nudge.matchId))
          } catch { /* silent */ }
        }

        async function handlePauseMatches() {
          try {
            await apiFetch('/api/cadence', {
              method: 'POST',
              body: JSON.stringify({ userId, action: 'pause' }),
            })
            setGhostNudges([])
            setCadenceState(prev => prev ? { ...prev, isPaused: true } : prev)
          } catch { /* silent */ }
        }

        if (isDirectLevel) {
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-8">
                <h3 className="text-lg font-semibold text-stone-900">Not the right time?</h3>
                <p className="mt-2 text-sm text-stone-600">
                  You haven&rsquo;t messaged {nudge.partnerName} yet. It looks like now might not be the right time &mdash; and that&rsquo;s okay.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setGhostNudgeDismissed(true)
                      if (activeMutualMatch) setChatPhase('chatting')
                    }}
                    className="flex-1 rounded-xl bg-stone-900 py-3 text-center font-medium text-white transition hover:bg-stone-800"
                  >
                    Message {nudge.partnerName}
                  </button>
                  <button
                    onClick={handlePauseMatches}
                    className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600 transition hover:bg-stone-50"
                  >
                    Pause my matches
                  </button>
                </div>
              </div>
            </div>
          )
        }

        return (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-amber-800">
              <span className="font-medium">{nudge.partnerName}</span> is waiting to hear from you.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  setGhostNudgeDismissed(true)
                  if (activeMutualMatch) setChatPhase('chatting')
                }}
                className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-stone-800"
              >
                Open chat
              </button>
              <button
                onClick={handleDeclineMatch}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50"
              >
                Not interested
              </button>
            </div>
          </div>
        )
      })()}

      {/* Pass streak modal — situation-aware messaging */}
      {passStreakAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8">
            {poolState === 'empty_pool' ? (
              <>
                <h3 className="text-lg font-semibold text-stone-900">We&rsquo;re bringing more people in.</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Your area is still growing. The best way to get great matches faster? Bring the people you already think are great.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => { setPassStreakAction(null); setActiveTab('invite') }}
                    className="flex-1 rounded-xl bg-stone-900 py-3 text-center font-medium text-white transition hover:bg-stone-800"
                  >
                    Invite friends
                  </button>
                  <button onClick={() => setPassStreakAction(null)} className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600 transition hover:bg-stone-50">
                    Maybe later
                  </button>
                </div>
              </>
            ) : voiceMemos.length < 4 ? (
              <>
                <h3 className="text-lg font-semibold text-stone-900">Help us understand you better.</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Add more voice notes so we can understand you better and find stronger matches.
                  The more stories you share, the better we get at knowing who you&rsquo;ll click with.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => { setPassStreakAction(null); setActiveTab('profile') }}
                    className="flex-1 rounded-xl bg-stone-900 py-3 text-center font-medium text-white transition hover:bg-stone-800"
                  >
                    Record a voice note
                  </button>
                  <button onClick={() => setPassStreakAction(null)} className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600 transition hover:bg-stone-50">
                    Maybe later
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-stone-900">None of these clicked?</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Tell us what you&rsquo;re looking for &mdash; we&rsquo;ll use it to find better matches.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => { setPassStreakAction(null); setActiveTab('profile') }}
                    className="flex-1 rounded-xl bg-stone-900 py-3 text-center font-medium text-white transition hover:bg-stone-800"
                  >
                    Record a voice note
                  </button>
                  <button onClick={() => setPassStreakAction(null)} className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600 transition hover:bg-stone-50">
                    Maybe later
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

        </>)}

        {/* Footer */}
        <div className="mt-12 pb-8 text-center">
          <a href="/feedback" className="text-xs text-stone-400 hover:text-stone-600 transition">
            Have an idea? Share it here
          </a>
        </div>
      </div>
    </div>
  )
}
