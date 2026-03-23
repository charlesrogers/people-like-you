'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import VoiceRecorder from '@/components/VoiceRecorder'
import PhotoUploader from '@/components/PhotoUploader'
import { getOnboardingPrompts, getRandomPrompt, type PromptDef } from '@/lib/prompts'
import { getSeedNarrativesForGender, ATTRIBUTE_TAGS, type SeedNarrative } from '@/lib/seed-narratives'

type Step = 'signup' | 'basics' | 'voice' | 'preferences' | 'photos' | 'taste' | 'reveal'

const STEP_LABELS: Record<Step, string> = {
  signup: 'Sign up',
  basics: 'About you',
  voice: 'Your stories',
  preferences: 'Preferences',
  photos: 'Photos',
  taste: 'Your taste',
  reveal: 'Your profile',
}

const STEPS: Step[] = ['signup', 'basics', 'voice', 'preferences', 'photos', 'taste', 'reveal']

const EXCITEMENT_LABELS: Record<string, { label: string; emoji: string; description: string }> = {
  explorer: { label: 'Explorer', emoji: '🧭', description: 'You light up around novelty, adventure, and the unexpected.' },
  nester: { label: 'Nester', emoji: '🏡', description: 'You respond to warmth, stability, and shared values.' },
  intellectual: { label: 'Intellectual', emoji: '🔬', description: "You're drawn to depth, curiosity, and unique perspectives." },
  spark: { label: 'Spark', emoji: '⚡', description: 'You connect through humor, energy, and magnetic personality.' },
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('signup')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 0: Signup
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  // Step 1: Basics
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [zipcode, setZipcode] = useState('')

  // Step 2: Voice recordings
  const [prompts, setPrompts] = useState<PromptDef[]>(() => getOnboardingPrompts(6))
  const [recordings, setRecordings] = useState<Map<string, { blob: Blob; duration: number }>>(new Map())
  const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0)

  // Step 3: Hard prefs (dealbreakers only)
  const [ageMin, setAgeMin] = useState(21)
  const [ageMax, setAgeMax] = useState(35)
  const [wouldRelocate, setWouldRelocate] = useState('')
  const [faithImportance, setFaithImportance] = useState('')
  const [kids, setKids] = useState('')
  const [maritalHistory, setMaritalHistory] = useState('')

  // Step 4: Photos
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

  // Step 5: Taste calibration
  const [tasteNarratives, setTasteNarratives] = useState<SeedNarrative[]>([])
  const [tasteIndex, setTasteIndex] = useState(0)
  const [tasteSelectedAttrs, setTasteSelectedAttrs] = useState<string[]>([])

  // Step 6: Profile reveal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [composite, setComposite] = useState<any>(null)
  const [processingDone, setProcessingDone] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState<Record<string, boolean>>({})

  // Track user ID after profile creation
  const [userId, setUserId] = useState<string | null>(null)

  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const handleRecordingComplete = (promptId: string, blob: Blob, duration: number) => {
    setRecordings(prev => {
      const next = new Map(prev)
      next.set(promptId, { blob, duration })
      return next
    })
  }

  const handleSkipPrompt = (promptId: string) => {
    const currentIds = prompts.map(p => p.id)
    const replacement = getRandomPrompt(currentIds)
    if (replacement) {
      setPrompts(prev => prev.map(p => p.id === promptId ? replacement : p))
    }
  }

  const canProceedSignup = signupEmail && signupPassword && signupPassword.length >= 6
  const canProceedBasics = firstName && gender && birthYear && zipcode
  const canProceedVoice = recordings.size >= 2
  const canProceedPrefs = faithImportance && kids
  const canProceedPhotos = photoFiles.length >= 1

  const handleNext = async () => {
    setError(null)

    if (step === 'signup') {
      setSubmitting(true)
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signupEmail,
            password: signupPassword,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Signup failed')

        // Store auth tokens if returned
        if (data.access_token) {
          localStorage.setItem('ply_access_token', data.access_token)
          localStorage.setItem('ply_refresh_token', data.refresh_token)
        }
        if (data.id) {
          setUserId(data.id)
          localStorage.setItem('ply_profile_id', data.id)
        }

        setEmail(signupEmail)
        posthog.capture('onboarding_started')
        setStep('basics')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Signup failed')
      } finally {
        setSubmitting(false)
      }
    } else if (step === 'basics') {
      setStep('voice')
    } else if (step === 'voice') {
      posthog.capture('onboarding_section_progressed', { section: 'voice', recordings: recordings.size })

      // Create profile + preferences first
      setSubmitting(true)
      try {
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            basics: {
              first_name: firstName,
              last_name: lastName,
              email,
              gender,
              birth_year: birthYear,
              zipcode,
            },
            hardPreferences: null,
            softPreferences: null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create profile')

        setUserId(data.id)
        localStorage.setItem('ply_profile_id', data.id)

        // Upload voice memos
        for (const [promptId, { blob, duration }] of recordings) {
          const formData = new FormData()
          formData.append('audio', blob, `${promptId}.webm`)
          formData.append('userId', data.id)
          formData.append('promptId', promptId)
          formData.append('dayNumber', '0')
          formData.append('durationSeconds', String(duration))

          const memoRes = await fetch('/api/voice-memo', { method: 'POST', body: formData })
          if (!memoRes.ok) console.error(`Failed to upload memo: ${promptId}`)
          else console.log(`Uploaded voice memo: ${promptId}`)
        }

        // Kick off transcription + extraction in the background while user does preferences
        fetch('/api/process-memos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.id }),
        }).then(r => r.json()).then(d => {
          console.log(`Background processing: ${d.processed} memos processed`)
        }).catch(err => {
          console.error('Background processing failed:', err)
        })

        setStep('preferences')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setSubmitting(false)
      }
    } else if (step === 'preferences') {
      posthog.capture('onboarding_section_progressed', { section: 'preferences' })

      // Save preferences
      setSubmitting(true)
      try {
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            basics: { first_name: firstName, email, gender },
            hardPreferences: {
              age_range_min: ageMin,
              age_range_max: ageMax,
              distance_radius: wouldRelocate || 'anywhere',
              faith_importance: faithImportance,
              kids,
              marital_history: maritalHistory || null,
            },
            softPreferences: null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        // Use existing userId if we already have one
        if (!userId && data.id) {
          setUserId(data.id)
          localStorage.setItem('ply_profile_id', data.id)
        }

        setStep('photos')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setSubmitting(false)
      }
    } else if (step === 'photos') {
      if (!userId) return

      setSubmitting(true)
      try {
        for (let i = 0; i < photoFiles.length; i++) {
          const formData = new FormData()
          formData.append('photo', photoFiles[i])
          formData.append('userId', userId)
          formData.append('sortOrder', String(i + 1))

          const res = await fetch('/api/upload-photo', { method: 'POST', body: formData })
          if (!res.ok) throw new Error('Failed to upload photo')
          console.log(`Uploaded photo ${i + 1}`)
        }

        // Fire background processing while user does taste calibration
        fetch('/api/process-memos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }).then(r => r.json()).then(d => {
          console.log(`Background processing: ${d.processed} memos processed`)
          setProcessingDone(true)
        }).catch(err => {
          console.error('Background processing failed:', err)
        })

        // Load taste calibration narratives for opposite gender
        const seekingGender = gender === 'Man' ? 'Woman' : 'Man'
        setTasteNarratives(getSeedNarrativesForGender(seekingGender, 6))
        setTasteIndex(0)

        setStep('taste')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload photos')
      } finally {
        setSubmitting(false)
      }
    } else if (step === 'taste') {
      // Taste calibration is done, move to reveal
      setStep('reveal')

      // Poll for composite profile if not ready yet
      if (!processingDone && userId) {
        const pollInterval = setInterval(async () => {
          try {
            const res = await fetch(`/api/extraction-status?userId=${userId}`)
            const data = await res.json()
            if (data.compositeReady) {
              clearInterval(pollInterval)
              setProcessingDone(true)
              const compRes = await fetch(`/api/composite?userId=${userId}`)
              const compData = await compRes.json()
              if (compData.composite) setComposite(compData.composite)
            }
          } catch { /* keep polling */ }
        }, 3000)
        // Clean up after 60s max
        setTimeout(() => clearInterval(pollInterval), 60000)
      } else if (userId) {
        // Already done, fetch composite
        fetch(`/api/composite?userId=${userId}`)
          .then(r => r.json())
          .then(d => { if (d.composite) setComposite(d.composite) })
          .catch(() => {})
      }
    } else if (step === 'reveal') {
      // Save profile feedback if any
      if (userId && Object.keys(profileFeedback).length > 0) {
        fetch('/api/profile-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, feedback: profileFeedback }),
        }).catch(() => {})
      }

      posthog.capture('onboarding_completed')
      router.push('/dashboard')
    }
  }

  const canProceedTaste = tasteIndex >= tasteNarratives.length
  const canProceedReveal = true // always can proceed from reveal

  const canProceed =
    step === 'signup' ? canProceedSignup :
    step === 'basics' ? canProceedBasics :
    step === 'voice' ? canProceedVoice :
    step === 'preferences' ? canProceedPrefs :
    step === 'photos' ? canProceedPhotos :
    step === 'taste' ? canProceedTaste :
    canProceedReveal

  // Taste calibration handlers
  const handleTasteVote = async (vote: boolean) => {
    const narrative = tasteNarratives[tasteIndex]
    if (!narrative || !userId) return

    // Save vote
    fetch('/api/taste-calibration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        narrativeId: narrative.id,
        vote,
        attributesSelected: vote ? tasteSelectedAttrs : [],
        narrativeStyle: narrative.style,
      }),
    }).catch(() => {})

    setTasteSelectedAttrs([])
    setTasteIndex(prev => prev + 1)
  }

  const toggleTasteAttr = (attr: string) => {
    setTasteSelectedAttrs(prev =>
      prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Progress bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-100">
        <div className="mx-auto max-w-xl px-6 py-3">
          <div className="flex items-center justify-between text-xs text-stone-400">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= stepIndex ? 'font-medium text-stone-700' : ''}>
                {STEP_LABELS[s]}
              </span>
            ))}
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-stone-900 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-6 py-12">
        {/* Step 0: Signup */}
        {step === 'signup' && (
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Let&rsquo;s find your person</h1>
            <p className="mt-2 text-sm text-stone-500">Create your account to get started.</p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-medium text-stone-500">Email</label>
                <input
                  type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">Password</label>
                <input
                  type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                  placeholder="6+ characters"
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Basics */}
        {step === 'basics' && (
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Tell us about you</h1>
            <p className="mt-2 text-sm text-stone-500">This helps us find the right people.</p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="block text-xs font-medium text-stone-500">First name *</label>
                <input
                  type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">I am a *</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {['Man', 'Woman'].map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`rounded-lg border px-4 py-3 text-sm font-medium transition active:translate-y-px ${
                        gender === g
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">Birth year *</label>
                <input
                  type="text" value={birthYear}
                  onChange={e => setBirthYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1995"
                  inputMode="numeric"
                  maxLength={4}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">Zip code *</label>
                <input
                  type="text" value={zipcode}
                  onChange={e => setZipcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="84101"
                  inputMode="numeric"
                  maxLength={5}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Voice Recordings — one card at a time */}
        {step === 'voice' && (
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Tell us your stories</h1>
            <p className="mt-2 text-sm text-stone-500">
              Just talk like you&rsquo;re telling a friend. Record at least 2.
            </p>

            {/* Progress */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex gap-1.5">
                {prompts.map((p, i) => (
                  <div
                    key={p.id}
                    className={`h-2 w-8 rounded-full transition-all duration-300 ${
                      recordings.has(p.id) ? 'bg-emerald-500' :
                      i === currentVoiceIndex ? 'bg-stone-900' :
                      'bg-stone-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-stone-400 font-medium">
                {recordings.size} recorded
              </span>
            </div>

            {/* Single card with slide animation */}
            <div className="mt-6 relative overflow-hidden">
              <div
                key={prompts[currentVoiceIndex]?.id}
                className="animate-slide-in"
              >
                {prompts[currentVoiceIndex] && !recordings.has(prompts[currentVoiceIndex].id) && (
                  <VoiceRecorder
                    promptId={prompts[currentVoiceIndex].id}
                    promptText={prompts[currentVoiceIndex].text}
                    helpText={prompts[currentVoiceIndex].helpText}
                    exampleAnswer={prompts[currentVoiceIndex].exampleAnswer}
                    onRecordingComplete={(blob, duration) => {
                      handleRecordingComplete(prompts[currentVoiceIndex].id, blob, duration)
                      // Auto-advance to next unrecorded prompt after a beat
                      setTimeout(() => {
                        const nextUnrecorded = prompts.findIndex((p, i) => i > currentVoiceIndex && !recordings.has(p.id))
                        if (nextUnrecorded !== -1) {
                          setCurrentVoiceIndex(nextUnrecorded)
                        } else {
                          // Try wrapping around
                          const firstUnrecorded = prompts.findIndex(p => !recordings.has(p.id) && p.id !== prompts[currentVoiceIndex].id)
                          if (firstUnrecorded !== -1) {
                            setCurrentVoiceIndex(firstUnrecorded)
                          }
                        }
                      }, 600)
                    }}
                  />
                )}

                {prompts[currentVoiceIndex] && recordings.has(prompts[currentVoiceIndex].id) && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                    <p className="text-lg font-medium text-emerald-700">Got it! ✓</p>
                    <p className="mt-1 text-sm text-emerald-600">{prompts[currentVoiceIndex].text}</p>
                  </div>
                )}
              </div>

              {/* Swap question — prominent */}
              {prompts[currentVoiceIndex] && !recordings.has(prompts[currentVoiceIndex].id) && (
                <button
                  onClick={() => handleSkipPrompt(prompts[currentVoiceIndex].id)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 px-4 py-3 text-sm font-medium text-stone-500 transition hover:border-stone-300 hover:bg-stone-50 active:translate-y-px"
                >
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 8h12M10 4l4 4-4 4" />
                  </svg>
                  Give me a different question
                </button>
              )}
            </div>

            {/* Navigation dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {prompts.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setCurrentVoiceIndex(i)}
                  className={`h-3 w-3 rounded-full transition-all ${
                    recordings.has(p.id) ? 'bg-emerald-500' :
                    i === currentVoiceIndex ? 'bg-stone-900 scale-125' :
                    'bg-stone-200 hover:bg-stone-300'
                  }`}
                />
              ))}
            </div>

            {/* Continue early */}
            {recordings.size >= 2 && (
              <p className="mt-4 text-center text-xs text-stone-400">
                {recordings.size >= 2 && recordings.size < prompts.length && (
                  <span>You can continue now, or record more for better matches.</span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Preferences (dealbreakers only) */}
        {step === 'preferences' && (
          <div>
            <h1 className="text-2xl font-bold text-stone-900">A few dealbreakers</h1>
            <p className="mt-2 text-sm text-stone-500">
              These help us filter out obvious mismatches. Your stories drive the real matching.
            </p>

            <div className="mt-8 space-y-6">
              {/* Age range — dual slider */}
              <div>
                <label className="block text-xs font-medium text-stone-500">
                  Age range: <span className="font-semibold text-stone-700">{ageMin} – {ageMax}</span>
                </label>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400 w-8">Min</span>
                    <input
                      type="range" min={18} max={60} value={ageMin}
                      onChange={e => {
                        const v = parseInt(e.target.value)
                        setAgeMin(Math.min(v, ageMax - 1))
                      }}
                      className="flex-1 accent-stone-900"
                    />
                    <span className="text-sm font-medium text-stone-700 w-8 text-right">{ageMin}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400 w-8">Max</span>
                    <input
                      type="range" min={18} max={60} value={ageMax}
                      onChange={e => {
                        const v = parseInt(e.target.value)
                        setAgeMax(Math.max(v, ageMin + 1))
                      }}
                      className="flex-1 accent-stone-900"
                    />
                    <span className="text-sm font-medium text-stone-700 w-8 text-right">{ageMax}</span>
                  </div>
                </div>
              </div>

              {/* Relocation */}
              <div>
                <label className="block text-xs font-medium text-stone-500">Would you relocate for the right person?</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { value: 'yes', label: 'Yes' },
                    { value: 'maybe', label: 'Maybe' },
                    { value: 'no', label: 'No' },
                  ].map(opt => (
                    <button
                      key={opt.value} onClick={() => setWouldRelocate(opt.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition active:translate-y-px ${
                        wouldRelocate === opt.value
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Faith importance */}
              <div>
                <label className="block text-xs font-medium text-stone-500">How important is shared faith? *</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { value: 'essential', label: 'Essential' },
                    { value: 'important', label: 'Important' },
                    { value: 'nice_to_have', label: 'Nice to have' },
                    { value: 'doesnt_matter', label: "Doesn't matter" },
                  ].map(opt => (
                    <button
                      key={opt.value} onClick={() => setFaithImportance(opt.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition active:translate-y-px ${
                        faithImportance === opt.value
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kids */}
              <div>
                <label className="block text-xs font-medium text-stone-500">Kids *</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { value: 'has', label: 'Have kids' },
                    { value: 'wants', label: 'Want kids' },
                    { value: 'open', label: 'Open to kids' },
                    { value: 'doesnt_want', label: "Don't want kids" },
                  ].map(opt => (
                    <button
                      key={opt.value} onClick={() => setKids(opt.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition active:translate-y-px ${
                        kids === opt.value
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marital history */}
              <div>
                <label className="block text-xs font-medium text-stone-500">Marital history</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { value: 'never_married', label: 'Never married' },
                    { value: 'divorced', label: 'Divorced' },
                  ].map(opt => (
                    <button
                      key={opt.value} onClick={() => setMaritalHistory(opt.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition active:translate-y-px ${
                        maritalHistory === opt.value
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Photos */}
        {step === 'photos' && (
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Add your photos</h1>
            <p className="mt-2 text-sm text-stone-500">
              1-3 photos. These are shown to other members during calibration. Pick ones that actually look like you.
            </p>

            <div className="mt-8">
              <PhotoUploader onPhotosChange={setPhotoFiles} />
            </div>
          </div>
        )}

        {/* Step 5: Taste Calibration */}
        {step === 'taste' && tasteNarratives.length > 0 && tasteIndex < tasteNarratives.length && (
          <div>
            <h1 className="text-2xl font-bold text-stone-900">What catches your eye?</h1>
            <p className="mt-2 text-sm text-stone-500">
              Read each intro and tell us if you&rsquo;d want to meet this person. This helps us find the right matches for you.
            </p>

            <p className="mt-3 text-xs text-stone-400">
              {tasteIndex + 1} of {tasteNarratives.length}
            </p>

            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Someone we think you might like
              </p>
              <p className="mt-4 text-base leading-relaxed text-stone-700">
                {tasteNarratives[tasteIndex].narrative}
              </p>

              {/* Attribute tags — show after reading */}
              <div className="mt-5">
                <p className="text-xs font-medium text-stone-500">If yes — what caught your attention?</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ATTRIBUTE_TAGS.map(attr => (
                    <button
                      key={attr.value}
                      onClick={() => toggleTasteAttr(attr.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition active:translate-y-px ${
                        tasteSelectedAttrs.includes(attr.value)
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-500 hover:border-stone-300'
                      }`}
                    >
                      {attr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleTasteVote(true)}
                  className="flex-1 rounded-xl bg-stone-900 py-3 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
                >
                  I&rsquo;d want to meet them
                </button>
                <button
                  onClick={() => handleTasteVote(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50 active:translate-y-px"
                >
                  Not for me
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Taste calibration done, waiting for continue */}
        {step === 'taste' && tasteIndex >= tasteNarratives.length && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-900">Got it.</h1>
            <p className="mt-2 text-sm text-stone-500">
              We&rsquo;re using your taste to find better matches. Let&rsquo;s see what we learned about you.
            </p>
          </div>
        )}

        {/* Step 6: Profile Reveal */}
        {step === 'reveal' && (
          <div>
            {!composite ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
                <p className="mt-4 text-sm text-stone-500">Almost ready... building your profile</p>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-stone-900">Here&rsquo;s what we see in you</h1>
                <p className="mt-2 text-sm text-stone-500">
                  Based on your stories, here&rsquo;s how we&rsquo;ll introduce you to people. Does this feel right?
                </p>

                <div className="mt-6 space-y-5">
                  {/* Excitement type */}
                  {composite.excitement_type && EXCITEMENT_LABELS[composite.excitement_type as string] && (
                    <div className="rounded-xl bg-stone-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Your type</p>
                          <p className="mt-1 text-lg font-semibold text-stone-900">
                            {EXCITEMENT_LABELS[composite.excitement_type as string].emoji}{' '}
                            {EXCITEMENT_LABELS[composite.excitement_type as string].label}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {EXCITEMENT_LABELS[composite.excitement_type as string].description}
                          </p>
                        </div>
                        <button
                          onClick={() => setProfileFeedback(prev => ({ ...prev, excitement_type: !prev.excitement_type }))}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            profileFeedback.excitement_type === false
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {profileFeedback.excitement_type === false ? 'Not quite' : 'Feels right'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Passions */}
                  {Array.isArray(composite.passion_indicators) && (composite.passion_indicators as string[]).length > 0 && (
                    <div className="rounded-xl bg-white border border-stone-200 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wider text-stone-400">What lights you up</p>
                        <button
                          onClick={() => setProfileFeedback(prev => ({ ...prev, passions: !prev.passions }))}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            profileFeedback.passions === false ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {profileFeedback.passions === false ? 'Not quite' : 'Feels right'}
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(composite.passion_indicators as string[]).slice(0, 8).map((p: string) => (
                          <span key={p} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Values */}
                  {Array.isArray(composite.values) && (composite.values as string[]).length > 0 && (
                    <div className="rounded-xl bg-white border border-stone-200 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Your values</p>
                        <button
                          onClick={() => setProfileFeedback(prev => ({ ...prev, values: !prev.values }))}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            profileFeedback.values === false ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {profileFeedback.values === false ? 'Not quite' : 'Feels right'}
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(composite.values as string[]).slice(0, 6).map((v: string) => (
                          <span key={v} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">{v}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notable quotes */}
                  {Array.isArray(composite.notable_quotes) && (composite.notable_quotes as string[]).length > 0 && (
                    <div className="rounded-xl bg-white border border-stone-200 p-5">
                      <p className="text-xs font-medium uppercase tracking-wider text-stone-400">In your own words</p>
                      <div className="mt-3 space-y-2">
                        {(composite.notable_quotes as string[]).slice(0, 2).map((q: string, i: number) => (
                          <p key={i} className="text-sm italic text-stone-600">&ldquo;{q}&rdquo;</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex gap-3">
          {stepIndex > 0 && step !== 'taste' && step !== 'reveal' && (
            <button
              onClick={() => setStep(STEPS[stepIndex - 1])}
              disabled={submitting}
              className="rounded-lg border border-stone-200 px-6 py-3.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
            >
              Back
            </button>
          )}
          {/* Hide Continue during active taste card voting — the vote buttons handle progression */}
          {!(step === 'taste' && tasteIndex < tasteNarratives.length) && (
            <button
              onClick={handleNext}
              disabled={!canProceed || submitting}
              className="flex-1 rounded-lg bg-stone-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-px"
            >
              {submitting
                ? 'Saving...'
                : step === 'reveal'
                  ? "I'm ready — show me my matches"
                  : 'Continue'
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
