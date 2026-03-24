'use client'

import { useState, useEffect } from 'react'

interface SettingsTabProps {
  userId: string
  email: string
  onSignOut: () => void
}

export default function SettingsTab({ userId, email, onSignOut }: SettingsTabProps) {
  const [loading, setLoading] = useState(true)
  const [ageMin, setAgeMin] = useState(21)
  const [ageMax, setAgeMax] = useState(35)
  const [wouldRelocate, setWouldRelocate] = useState('')
  const [faithImportance, setFaithImportance] = useState('')
  const [religion, setReligion] = useState('')
  const [kids, setKids] = useState('')
  const [maritalHistory, setMaritalHistory] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load religion from user profile
    fetch(`/api/profile?id=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.profile?.religion) setReligion(data.profile.religion)
      })
      .catch(() => {})

    fetch(`/api/hard-preferences?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.preferences) {
          const p = data.preferences
          if (p.age_range_min != null) setAgeMin(p.age_range_min)
          if (p.age_range_max != null) setAgeMax(p.age_range_max)
          if (p.distance_radius) setWouldRelocate(p.distance_radius)
          if (p.faith_importance) setFaithImportance(p.faith_importance)
          if (p.kids) setKids(p.kids)
          if (p.marital_history) setMaritalHistory(p.marital_history)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basics: { email, religion: religion || null },
          hardPreferences: {
            age_range_min: ageMin,
            age_range_max: ageMax,
            distance_radius: wouldRelocate || 'anywhere',
            faith_importance: faithImportance || null,
            kids: kids || null,
            marital_history: maritalHistory || null,
          },
          softPreferences: null,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account */}
      <div className="rounded-xl bg-white border border-stone-200 p-5">
        <h3 className="text-sm font-semibold text-stone-900">Account</h3>
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs text-stone-500">Email</label>
            <p className="text-sm text-stone-700">{email}</p>
          </div>
          <button
            onClick={onSignOut}
            className="text-xs font-medium text-red-500 hover:text-red-700 transition"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Hard filters */}
      <div className="rounded-xl bg-white border border-stone-200 p-5">
        <h3 className="text-sm font-semibold text-stone-900">Your dealbreakers</h3>

        <div className="mt-4 space-y-5">
          {/* Age range */}
          <div>
            <label className="text-xs font-medium text-stone-500">
              Age range: <span className="font-semibold text-stone-700">{ageMin} – {ageMax}</span>
            </label>
            <div className="relative mt-3 h-8">
              <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full bg-stone-200" />
              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-stone-900"
                style={{
                  left: `${((ageMin - 18) / (60 - 18)) * 100}%`,
                  right: `${100 - ((ageMax - 18) / (60 - 18)) * 100}%`,
                }}
              />
              <input
                type="range" min={18} max={60} value={ageMin}
                onChange={e => setAgeMin(Math.min(parseInt(e.target.value), ageMax - 1))}
                className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-stone-900 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <input
                type="range" min={18} max={60} value={ageMax}
                onChange={e => setAgeMax(Math.max(parseInt(e.target.value), ageMin + 1))}
                className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-stone-900 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>

          <ChipPicker label="Would you relocate?" value={wouldRelocate} onChange={setWouldRelocate} options={[
            { value: 'same_metro', label: 'Same area only' },
            { value: 'few_hours', label: 'Within a few hours' },
            { value: 'anywhere', label: 'Anywhere' },
          ]} />

          <ChipPicker label="How important is shared faith?" value={faithImportance} onChange={setFaithImportance} options={[
            { value: 'essential', label: 'Essential' }, { value: 'important', label: 'Important' },
            { value: 'nice_to_have', label: 'Nice to have' }, { value: 'doesnt_matter', label: "Doesn't matter" },
          ]} />

          <div>
            <label className="text-xs font-medium text-stone-500">
              What&rsquo;s your background?
              {(faithImportance === 'essential' || faithImportance === 'important') && (
                <span className="ml-1 text-amber-600">Used to filter your matches.</span>
              )}
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { value: 'lds', label: 'LDS' },
                { value: 'jehovahs_witness', label: "JW" },
                { value: 'orthodox_jewish', label: 'Orthodox Jewish' },
                { value: 'jewish', label: 'Jewish' },
                { value: 'catholic', label: 'Catholic' },
                { value: 'protestant', label: 'Protestant' },
                { value: 'muslim', label: 'Muslim' },
                { value: 'hindu', label: 'Hindu' },
                { value: 'buddhist', label: 'Buddhist' },
                { value: 'sikh', label: 'Sikh' },
                { value: 'spiritual', label: 'Spiritual' },
                { value: 'agnostic', label: 'Agnostic' },
                { value: 'atheist', label: 'None' },
                { value: 'other', label: 'Other' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setReligion(opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    religion === opt.value
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <ChipPicker label="Kids" value={kids} onChange={setKids} options={[
            { value: 'has', label: 'Have kids' }, { value: 'wants', label: 'Want kids' },
            { value: 'open', label: 'Open' }, { value: 'doesnt_want', label: "Don't want" },
          ]} />

          <ChipPicker label="Marital history" value={maritalHistory} onChange={setMaritalHistory} options={[
            { value: 'never_married', label: 'Never married' }, { value: 'divorced', label: 'Divorced' },
          ]} />

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ChipPicker({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-500">{label}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              value === opt.value
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
