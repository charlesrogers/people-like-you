'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'

interface CalibrateCandidate {
  id: string
  first_name: string
  elo_score: number
  photoUrl: string | null
}

export default function Calibrate() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<CalibrateCandidate[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userElo, setUserElo] = useState(1200)
  const [interactions, setInteractions] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const profileId = localStorage.getItem('ply_profile_id')
    if (!profileId) {
      router.push('/onboarding')
      return
    }
    setUserId(profileId)

    async function load() {
      try {
        // Fetch user profile to get gender + current Elo
        const profileRes = await fetch(`/api/profile?id=${profileId}`)
        const profileData = await profileRes.json()
        if (!profileData.profile) {
          router.push('/onboarding')
          return
        }

        const user = profileData.profile
        setUserElo(user.elo_score)
        setInteractions(user.elo_interactions)

        // Fetch calibration candidates (opposite gender with photos)
        const seeking = user.gender === 'Man' ? 'Woman' : 'Man'
        const candidatesRes = await fetch(`/api/calibrate/candidates?gender=${seeking}&excludeUserId=${profileId}`)
        const candidatesData = await candidatesRes.json()

        if (candidatesData.candidates?.length > 0) {
          setCandidates(candidatesData.candidates)
        } else {
          // No candidates available — skip calibration
          router.push('/dashboard')
          return
        }

        setLoading(false)
        posthog.capture('calibration_started')
      } catch {
        router.push('/dashboard')
      }
    }

    load()
  }, [router])

  async function handleVote(outcome: 0 | 1) {
    if (animating || candidates.length === 0 || !userId) return
    posthog.capture('calibration_vote', { outcome, candidate_id: candidates[currentIndex].id })
    setAnimating(true)

    const candidate = candidates[currentIndex]
    const k = interactions < 20 ? 32 : 16

    // Elo calculation
    const expectedUser = 1 / (1 + Math.pow(10, (candidate.elo_score - userElo) / 400))
    const newUserElo = Math.round(userElo + k * (outcome - expectedUser))

    // Also update candidate Elo
    const expectedCandidate = 1 - expectedUser
    const newCandidateElo = Math.round(candidate.elo_score + 16 * ((1 - outcome) - expectedCandidate))

    setUserElo(newUserElo)
    setInteractions(prev => prev + 1)

    // Update candidate Elo in local state
    const updated = [...candidates]
    updated[currentIndex] = { ...updated[currentIndex], elo_score: newCandidateElo }
    setCandidates(updated)

    // Persist both Elo updates
    try {
      await Promise.all([
        fetch('/api/calibrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, newElo: newUserElo, interactions: interactions + 1 }),
        }),
        fetch('/api/calibrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: candidate.id, newElo: newCandidateElo }),
        }),
      ])
    } catch {
      // Non-critical
    }

    setTimeout(() => {
      if (currentIndex + 1 >= candidates.length) {
        posthog.capture('calibration_completed', { final_elo: newUserElo, votes: interactions + 1 })
        router.push('/dashboard')
      } else {
        setCurrentIndex(currentIndex + 1)
        setAnimating(false)
      }
    }, 300)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-400">Loading...</p>
      </div>
    )
  }

  const candidate = candidates[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-100">
        <div
          className="h-full bg-stone-900 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / candidates.length) * 100}%` }}
        />
      </div>

      <div className="mx-auto max-w-md px-6 pb-24 pt-16">
        <div className="text-center">
          <p className="text-sm font-medium text-stone-400">
            {currentIndex + 1} of {candidates.length}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            Calibrate your taste
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Would you want to meet this person?
          </p>
        </div>

        <div
          className={`mt-8 overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 ${
            animating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {candidate.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={candidate.photoUrl}
              alt={candidate.first_name}
              className="h-96 w-full object-cover"
            />
          ) : (
            <div className="flex h-96 w-full items-center justify-center bg-stone-100">
              <span className="text-6xl text-stone-300">
                {candidate.first_name[0]}
              </span>
            </div>
          )}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-stone-900">
              {candidate.first_name}
            </h2>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => handleVote(0)}
            disabled={animating}
            className="flex-1 rounded-xl border border-stone-200 py-3.5 text-lg font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-30 active:translate-y-px"
          >
            Not for me
          </button>
          <button
            onClick={() => handleVote(1)}
            disabled={animating}
            className="flex-1 rounded-xl bg-stone-900 py-3.5 text-lg font-medium text-white transition hover:bg-stone-800 disabled:opacity-30 active:translate-y-px"
          >
            Yes, I&rsquo;d meet them
          </button>
        </div>
      </div>
    </div>
  )
}
