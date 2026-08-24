'use client'

import { ANGLE_LABELS, ANGLE_TIERS, getProfileCompletion } from '@/lib/prompts'

interface ProfileCompletionProps {
  answeredPromptIds: string[]
  /** Compact single-line form for tight spaces. */
  compact?: boolean
}

/**
 * Shows the four angles and which of them the person has a story behind.
 * Completion is coverage, not a count — see getProfileCompletion.
 */
export default function ProfileCompletion({ answeredPromptIds, compact }: ProfileCompletionProps) {
  const { covered, missing, isComplete } = getProfileCompletion(answeredPromptIds)
  const isCovered = (t: string) => (covered as readonly string[]).includes(t)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1" aria-hidden="true">
          {ANGLE_TIERS.map(t => (
            <span
              key={t}
              className={`h-1.5 w-6 rounded-full ${isCovered(t) ? 'bg-emerald-500' : 'bg-stone-200'}`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-stone-500">
          {isComplete ? 'Profile complete' : `${covered.length} of 4`}
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-stone-900">
          {isComplete ? 'Your profile is complete' : 'Your profile isn’t complete yet'}
        </p>
        <span className="text-xs font-medium tabular-nums text-stone-400">{covered.length}/4</span>
      </div>

      <ul className="mt-3 flex flex-col gap-1.5">
        {ANGLE_TIERS.map(t => (
          <li key={t} className="flex items-center gap-2">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                isCovered(t) ? 'bg-emerald-500 text-white' : 'border border-stone-300 text-transparent'
              }`}
              aria-hidden="true"
            >
              ✓
            </span>
            <span className={`text-[13px] ${isCovered(t) ? 'text-stone-500 line-through' : 'text-stone-700'}`}>
              {ANGLE_LABELS[t]}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-stone-500">
        {isComplete
          ? 'Every angle has a story behind it — that’s what we write your intros from.'
          : `Each one you answer is a different way of introducing you. ${
              missing.length === 1 ? 'One left.' : `${missing.length} left.`
            }`}
      </p>
    </div>
  )
}
