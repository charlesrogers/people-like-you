'use client'

import { useEffect, useState } from 'react'
import { getPromptChoices, type PromptDef } from '@/lib/prompts'

interface PromptPickerProps {
  answeredPromptIds: string[]
  /** Prompts the user passed over this session — never re-offered. */
  passedIds: string[]
  onPick: (prompt: PromptDef) => void
  onPassAll: (shownIds: string[]) => void
  count?: number
}

/**
 * Choose-your-own prompt list. Shows `count` short labels so the whole set is
 * scannable at a glance; the full question only appears once they've picked,
 * on the recording screen, because the second clause of each prompt is what
 * actually produces a usable story and would be unreadable in a list.
 */
export default function PromptPicker({
  answeredPromptIds,
  passedIds,
  onPick,
  onPassAll,
  count = 5,
}: PromptPickerProps) {
  // getPromptChoices shuffles, so it must never run during render: the server
  // and client would draw different lists, React would throw a hydration
  // mismatch and regenerate the tree, taking component state with it.
  // Choosing on the client after mount keeps the two renders identical.
  const [choices, setChoices] = useState<PromptDef[] | null>(null)
  const answeredCount = answeredPromptIds.length

  useEffect(() => {
    setChoices(getPromptChoices(answeredPromptIds, count, passedIds))
    // Re-draw when the profile advances, not on every parent re-render —
    // reshuffling under the user's cursor would move the option they're
    // reaching for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredCount, count])

  const showDifferent = () => {
    if (!choices) return
    const shownIds = choices.map(c => c.id)
    onPassAll(shownIds)
    const next = getPromptChoices(answeredPromptIds, count, [...passedIds, ...shownIds])
    // If we've exhausted the bank, start re-offering what was passed rather
    // than showing an empty list.
    setChoices(next.length ? next : getPromptChoices(answeredPromptIds, count, []))
  }

  // Placeholder rows hold the layout for the one frame before the client draw,
  // so the picker doesn't pop in and shift what's below it.
  if (!choices) {
    return (
      <div className="flex flex-col gap-2" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-[50px] rounded-xl border border-stone-200 bg-stone-50" />
        ))}
      </div>
    )
  }

  if (!choices.length) return null

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {choices.map(prompt => (
          <li key={prompt.id}>
            <button
              type="button"
              onClick={() => onPick(prompt)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-stone-900 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 active:translate-y-px"
            >
              <span className="text-[15px] font-medium text-stone-800">{prompt.short}</span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={showDifferent}
        className="mt-3 w-full rounded-lg px-4 py-2 text-sm text-stone-500 transition-colors hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
      >
        Show me different ones
      </button>
    </div>
  )
}
