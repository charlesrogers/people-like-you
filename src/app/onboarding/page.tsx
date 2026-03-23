'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import VoiceRecorder from '@/components/VoiceRecorder'
import PhotoUploader from '@/components/PhotoUploader'
import SoftPreferencesRanker from '@/components/SoftPreferencesRanker'
import { getOnboardingPrompts, getRandomPrompt, type PromptDef } from '@/lib/prompts'

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','Outside US',
]

type Step = 'basics' | 'voice' | 'preferences' | 'photos'

const STEP_LABELS: Record<Step, string> = {
  basics: 'About you',
  voice: 'Tell your stories',
  preferences: 'What you want',
  photos: 'Show yourself',
}

const STEPS: Step[] = ['basics', 'voice', 'preferences', 'photos']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('basics')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Basics
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [state, setState] = useState('')

  // Step 2: Voice recordings
  const [prompts, setPrompts] = useState<PromptDef[]>(() => getOnboardingPrompts(6))
  const [recordings, setRecordings] = useState<Map<string, { blob: Blob; duration: number }>>(new Map())

  // Step 3: Hard prefs
  const [ageMin, setAgeMin] = useState('21')
  const [ageMax, setAgeMax] = useState('35')
  const [distance, setDistance] = useState('')
  const [faithImportance, setFaithImportance] = useState('')
  const [kids, setKids] = useState('')
  const [maritalHistory, setMaritalHistory] = useState('')
  const [smoking, setSmoking] = useState('')

  // Step 3: Soft prefs
  const [softPrefs, setSoftPrefs] = useState<Record<string, string | string[]>>({})

  // Step 4: Photos
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

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

  const canProceedBasics = firstName && email && gender && birthYear
  const canProceedVoice = recordings.size >= 2
  const canProceedPrefs = distance && faithImportance && kids
  const canProceedPhotos = photoFiles.length >= 1

  const handleNext = async () => {
    setError(null)

    if (step === 'basics') {
      posthog.capture('onboarding_started')
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
              state,
            },
            hardPreferences: null, // saved in preferences step
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

          await fetch('/api/voice-memo', { method: 'POST', body: formData })
          console.log(`Uploaded voice memo: ${promptId}`)
        }

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
              age_range_min: parseInt(ageMin),
              age_range_max: parseInt(ageMax),
              distance_radius: distance,
              faith_importance: faithImportance,
              kids,
              marital_history: maritalHistory || null,
              smoking: smoking || null,
            },
            softPreferences: {
              humor_style: Array.isArray(softPrefs.humor_style) ? softPrefs.humor_style : [],
              energy_level: typeof softPrefs.energy_level === 'string' ? softPrefs.energy_level : null,
              communication_style: typeof softPrefs.communication_style === 'string' ? softPrefs.communication_style : null,
              life_stage_priority: typeof softPrefs.life_stage_priority === 'string' ? softPrefs.life_stage_priority : null,
              date_activity_prefs: Array.isArray(softPrefs.date_activity_prefs) ? softPrefs.date_activity_prefs : [],
            },
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

        posthog.capture('onboarding_completed')
        router.push('/dashboard')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload photos')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const canProceed =
    step === 'basics' ? canProceedBasics :
    step === 'voice' ? canProceedVoice :
    step === 'preferences' ? canProceedPrefs :
    canProceedPhotos

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
        {/* Step 1: Basics */}
        {step === 'basics' && (
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Let&rsquo;s start with the basics</h1>
            <p className="mt-2 text-sm text-stone-500">This takes about 30 seconds.</p>

            <div className="mt-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500">First name *</label>
                  <input
                    type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500">Last name</label>
                  <input
                    type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">Email *</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
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
                <select
                  value={birthYear} onChange={e => setBirthYear(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 50 }, (_, i) => 2008 - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500">State</label>
                <select
                  value={state} onChange={e => setState(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                >
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Voice Recordings */}
        {step === 'voice' && (
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Tell us your stories</h1>
            <p className="mt-2 text-sm text-stone-500">
              Pick at least 2 and record yourself answering. Just talk like you&rsquo;re telling a friend.
            </p>

            {/* Coaching tips */}
            <div className="mt-3 rounded-lg bg-stone-50 px-4 py-3 text-xs text-stone-500">
              <p className="font-medium text-stone-600">Tips for great answers:</p>
              <ul className="mt-1.5 ml-3 list-disc space-y-0.5">
                <li>Specific stories beat general answers</li>
                <li>Any length is fine — say what feels natural</li>
                <li>Don&rsquo;t love a question? Hit &ldquo;Try a different one&rdquo;</li>
              </ul>
            </div>

            <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <span className="font-medium">{recordings.size} of 2+ recorded</span>
              {recordings.size >= 2 && <span>— nice! Record more for better matches</span>}
            </div>

            <div className="mt-6 space-y-4">
              {prompts.map(prompt => (
                <div key={prompt.id}>
                  {!recordings.has(prompt.id) && (
                    <VoiceRecorder
                      promptId={prompt.id}
                      promptText={prompt.text}
                      helpText={prompt.helpText}
                      exampleAnswer={prompt.exampleAnswer}
                      onRecordingComplete={(blob, duration) => handleRecordingComplete(prompt.id, blob, duration)}
                    />
                  )}
                  {recordings.has(prompt.id) && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                      <p className="text-sm font-medium text-emerald-700">Recording submitted</p>
                      <p className="mt-1 text-xs text-emerald-600">{prompt.text}</p>
                    </div>
                  )}
                  {!recordings.has(prompt.id) && (
                    <button
                      onClick={() => handleSkipPrompt(prompt.id)}
                      className="mt-2 text-xs text-stone-400 underline decoration-dotted underline-offset-2 hover:text-stone-600"
                    >
                      Try a different question
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 'preferences' && (
          <div>
            <h1 className="text-2xl font-bold text-stone-900">What are you looking for?</h1>
            <p className="mt-2 text-sm text-stone-500">
              These help us filter — your stories are what actually drive matching.
            </p>

            <div className="mt-8 space-y-6">
              <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">Dealbreakers</h2>

              {/* Age range */}
              <div>
                <label className="block text-xs font-medium text-stone-500">Age range</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number" value={ageMin} onChange={e => setAgeMin(e.target.value)} min="18" max="99"
                    className="w-20 rounded-lg border border-stone-200 px-3 py-2 text-sm text-center"
                  />
                  <span className="text-stone-400">to</span>
                  <input
                    type="number" value={ageMax} onChange={e => setAgeMax(e.target.value)} min="18" max="99"
                    className="w-20 rounded-lg border border-stone-200 px-3 py-2 text-sm text-center"
                  />
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-xs font-medium text-stone-500">Distance *</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { value: 'same_metro', label: 'Same metro' },
                    { value: 'few_hours', label: 'Within a few hours' },
                    { value: 'anywhere', label: 'Anywhere' },
                  ].map(opt => (
                    <button
                      key={opt.value} onClick={() => setDistance(opt.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition active:translate-y-px ${
                        distance === opt.value
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
                <label className="block text-xs font-medium text-stone-500">Faith / religion importance *</label>
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

              {/* Smoking */}
              <div>
                <label className="block text-xs font-medium text-stone-500">Smoking</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { value: 'no', label: 'No' },
                    { value: 'sometimes', label: 'Sometimes' },
                    { value: 'yes', label: 'Yes' },
                    { value: 'dealbreaker', label: 'Dealbreaker if they do' },
                  ].map(opt => (
                    <button
                      key={opt.value} onClick={() => setSmoking(opt.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition active:translate-y-px ${
                        smoking === opt.value
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-stone-100" />

              <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">Your vibe</h2>
              <SoftPreferencesRanker onPreferencesChange={setSoftPrefs} />
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

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex gap-3">
          {stepIndex > 0 && (
            <button
              onClick={() => setStep(STEPS[stepIndex - 1])}
              disabled={submitting}
              className="rounded-lg border border-stone-200 px-6 py-3.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed || submitting}
            className="flex-1 rounded-lg bg-stone-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-px"
          >
            {submitting
              ? 'Saving...'
              : step === 'photos'
                ? 'Finish & see matches'
                : 'Continue'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
