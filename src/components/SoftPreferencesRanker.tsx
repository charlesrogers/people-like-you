'use client'

import { useState } from 'react'

interface RankCategory {
  id: string
  label: string
  options: { value: string; label: string; emoji: string }[]
}

const CATEGORIES: RankCategory[] = [
  {
    id: 'humor_style',
    label: 'What kind of humor do you love?',
    options: [
      { value: 'witty_dry', label: 'Witty / Dry', emoji: '🎯' },
      { value: 'goofy', label: 'Goofy', emoji: '🤪' },
      { value: 'sarcastic', label: 'Sarcastic', emoji: '😏' },
      { value: 'wholesome', label: 'Wholesome', emoji: '😊' },
    ],
  },
  {
    id: 'energy_level',
    label: 'Your energy vibe?',
    options: [
      { value: 'adventurous', label: 'Adventurous', emoji: '🏔️' },
      { value: 'homebody', label: 'Homebody', emoji: '🏠' },
      { value: 'balanced', label: 'Balanced', emoji: '⚖️' },
    ],
  },
  {
    id: 'communication_style',
    label: 'How do you communicate?',
    options: [
      { value: 'direct', label: 'Direct', emoji: '🎯' },
      { value: 'gentle', label: 'Gentle', emoji: '🕊️' },
      { value: 'expressive', label: 'Expressive', emoji: '✨' },
    ],
  },
  {
    id: 'life_stage_priority',
    label: 'Right now, your focus is...',
    options: [
      { value: 'career', label: 'Career', emoji: '📈' },
      { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
      { value: 'balanced', label: 'Balanced', emoji: '🌊' },
    ],
  },
  {
    id: 'date_activity_prefs',
    label: 'Ideal date vibes? (pick your favorites)',
    options: [
      { value: 'outdoor', label: 'Outdoor', emoji: '🌲' },
      { value: 'creative', label: 'Creative', emoji: '🎨' },
      { value: 'chill', label: 'Chill', emoji: '☕' },
      { value: 'food_focused', label: 'Food-focused', emoji: '🍜' },
    ],
  },
]

interface SoftPreferencesRankerProps {
  onPreferencesChange: (prefs: Record<string, string | string[]>) => void
}

export default function SoftPreferencesRanker({ onPreferencesChange }: SoftPreferencesRankerProps) {
  const [selections, setSelections] = useState<Record<string, string | string[]>>({})

  const handleSelect = (categoryId: string, value: string, isMulti: boolean) => {
    setSelections(prev => {
      const next = { ...prev }
      if (isMulti) {
        const current = (prev[categoryId] as string[]) || []
        if (current.includes(value)) {
          next[categoryId] = current.filter(v => v !== value)
        } else {
          next[categoryId] = [...current, value]
        }
      } else {
        next[categoryId] = value
      }
      onPreferencesChange(next)
      return next
    })
  }

  const isSelected = (categoryId: string, value: string) => {
    const sel = selections[categoryId]
    if (Array.isArray(sel)) return sel.includes(value)
    return sel === value
  }

  return (
    <div className="space-y-8">
      {CATEGORIES.map(cat => {
        const isMulti = cat.id === 'humor_style' || cat.id === 'date_activity_prefs'
        return (
          <div key={cat.id}>
            <p className="text-sm font-medium text-stone-700">
              {cat.label}
              {isMulti && <span className="ml-1 text-xs text-stone-400">(select all that apply)</span>}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {cat.options.map(opt => {
                const selected = isSelected(cat.id, opt.value)
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(cat.id, opt.value, isMulti)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition active:translate-y-px ${
                      selected
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
