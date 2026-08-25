'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { apiFetch } from '@/lib/api-client'
import { QUIZ_ITEMS, QUIZ_BLOCKS, FRAMING, INSTRUMENT_VERSION, getItem, blockOf } from '@/lib/quiz-battery'
import { isPolarityFlipped, displayOptions } from '@/lib/quiz-scoring'

// D-QD5 §4 — every timing is a starting value, but something must be specified
// for each. Silence is what made the first build feel dead.
const T_DIM = 90        // other options fade back
const T_EXIT = 180      // screen starts leaving
const T_ENTER = 340     // next screen enters
const EXIT_MS = 160
const STAGGER_MS = 40

export interface QuizAnswer {
  optionIndex: number | null
  polarityFlipped: boolean
  responseMs: number | null
}
export interface QuizResult {
  answers: Record<string, QuizAnswer>
}

type Screen = { kind: 'intro' } | { kind: 'item'; itemId: string }

const SCREENS: Screen[] = [
  { kind: 'intro' },
  ...QUIZ_ITEMS.map(i => ({ kind: 'item' as const, itemId: i.id })),
]
const TOTAL = QUIZ_ITEMS.length

// D-QD5 §5 — a background tint per block, barely perceptible screen-to-screen
// and obvious across the flow. It is the only remaining signal that blocks
// exist, now that the interstitials are gone.
const TINTS: Record<number, string> = {
  1: 'rgba(109, 92, 255, 0.055)',   // Identity
  2: 'rgba(180, 92, 255, 0.055)',   // Wired
  3: 'rgba(47, 191, 113, 0.055)',   // Actual life
  4: 'rgba(224, 169, 47, 0.06)',    // How you talk
  5: 'rgba(0, 0, 0, 0)',            // Facts — plain, the home stretch
}

export default function QuizStep({
  userId, onComplete,
}: {
  userId: string
  onComplete: (result: QuizResult) => void
}) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({})
  const [justPicked, setJustPicked] = useState<number | null>(null)
  const [dim, setDim] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [dir, setDir] = useState<1 | -1>(1)
  const [filled, setFilled] = useState(0)

  const answersRef = useRef<Record<string, QuizAnswer>>({})
  const finishRef = useRef<() => Promise<void>>(async () => {})
  const flushedRef = useRef<Set<number>>(new Set())
  const startedAtRef = useRef(0)
  const itemShownAtRef = useRef(0)
  const completedRef = useRef(false)
  const timers = useRef<number[]>([])

  const screen = SCREENS[idx]
  const item = screen?.kind === 'item' ? getItem(screen.itemId) : undefined
  const block = screen?.kind === 'item' ? blockOf(screen.itemId)?.block ?? 5 : 0

  const flips = useMemo(() => {
    const m: Record<string, boolean> = {}
    for (const it of QUIZ_ITEMS) m[it.id] = isPolarityFlipped(userId, it.id)
    return m
  }, [userId])

  const after = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  useEffect(() => () => { timers.current.forEach(window.clearTimeout) }, [])

  // ─── Persistence: buffered, one POST per block boundary and one at the end ──
  const flush = useCallback(async (itemIds: string[], complete: boolean) => {
    const responses = itemIds
      .filter(id => answersRef.current[id] !== undefined)
      .map(id => ({ itemId: id, ...answersRef.current[id] }))
    if (responses.length === 0 && !complete) return
    try {
      await apiFetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, responses, complete }),
      })
    } catch { /* never block the flow; the final POST re-sends everything */ }
  }, [userId])

  // ─── Navigation ────────────────────────────────────────────────────────────
  const goTo = useCallback((next: number, direction: 1 | -1) => {
    setDir(direction)
    setExiting(true)
    after(EXIT_MS, () => {
      setIdx(next)
      setExiting(false)
      setDim(false)
      setJustPicked(null)
    })
  }, [])

  const advanceFrom = useCallback((current: number) => {
    const next = current + 1
    const target = SCREENS[next]
    if (!target) return
    const from = SCREENS[current]
    if (from?.kind === 'item' && target.kind === 'item') {
      const b1 = blockOf(from.itemId)?.block
      const b2 = blockOf(target.itemId)?.block
      if (b1 && b2 && b1 !== b2 && !flushedRef.current.has(b1)) {
        flushedRef.current.add(b1)
        posthog.capture('quiz_block_completed', { block: b1 })
        void flush(QUIZ_BLOCKS.find(b => b.block === b1)!.items, false)
      }
    }
    goTo(next, 1)
  }, [flush, goTo])

  const poppingRef = useRef(false)

  const back = useCallback(() => {
    if (idx > 0) {
      setFilled(f => Math.max(0, f - 1))
      goTo(idx - 1, -1)
    }
  }, [idx, goTo])

  // One history entry per item screen, so the phone's back gesture steps back
  // through the quiz instead of unloading onboarding entirely.
  useEffect(() => {
    if (screen?.kind !== 'item') return
    if (poppingRef.current) { poppingRef.current = false; return }
    window.history.pushState({ quizItem: idx }, '')
  }, [idx, screen])

  useEffect(() => {
    const onPop = () => { poppingRef.current = true; back() }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [back])

  // ─── Answer → the core interaction (D-QD5 §4) ──────────────────────────────
  const answer = useCallback((itemId: string, displayedIndex: number | null) => {
    if (exiting) return
    const rec: QuizAnswer = {
      optionIndex: displayedIndex,
      polarityFlipped: flips[itemId] ?? false,
      responseMs: itemShownAtRef.current ? Math.round(performance.now() - itemShownAtRef.current) : null,
    }
    answersRef.current[itemId] = rec
    setAnswers(a => ({ ...a, [itemId]: rec }))
    setJustPicked(displayedIndex)
    posthog.capture('quiz_item_answered', {
      item_id: itemId, option_index: displayedIndex,
      polarity_flipped: rec.polarityFlipped, response_ms: rec.responseMs,
      instrument_version: INSTRUMENT_VERSION,
    })
    after(T_DIM, () => setDim(true))
    // The dot fills as the screen leaves, so the reward lands with the tap.
    after(T_EXIT, () => setFilled(f => Math.min(TOTAL, f + 1)))
    after(T_EXIT, () => { setDir(1); setExiting(true) })

    const isLast = idx >= SCREENS.length - 1
    if (isLast) {
      after(T_ENTER, () => { void finishRef.current() })
      return
    }

    after(T_ENTER, () => {
      setIdx(i => {
        const next = i + 1
        const from = SCREENS[i], target = SCREENS[next]
        if (from?.kind === 'item' && target?.kind === 'item') {
          const b1 = blockOf(from.itemId)?.block, b2 = blockOf(target.itemId)?.block
          if (b1 && b2 && b1 !== b2 && !flushedRef.current.has(b1)) {
            flushedRef.current.add(b1)
            posthog.capture('quiz_block_completed', { block: b1 })
            void flush(QUIZ_BLOCKS.find(b => b.block === b1)!.items, false)
          }
        }
        return next
      })
      setExiting(false); setDim(false); setJustPicked(null)
    })
  }, [exiting, flips, flush, idx])

  // ─── Instrumentation ───────────────────────────────────────────────────────
  useEffect(() => { startedAtRef.current = performance.now() }, [])

  useEffect(() => {
    if (screen?.kind === 'item') {
      itemShownAtRef.current = performance.now()
      posthog.capture('quiz_item_viewed', { item_id: screen.itemId, instrument_version: INSTRUMENT_VERSION })
    }
  }, [screen])

  useEffect(() => {
    const abandon = () => {
      if (completedRef.current) return
      const last = SCREENS[idx]
      posthog.capture('quiz_abandoned', {
        last_item_id: last?.kind === 'item' ? last.itemId : null,
        elapsed_ms: Math.round(performance.now() - startedAtRef.current),
        instrument_version: INSTRUMENT_VERSION,
      })
    }
    window.addEventListener('beforeunload', abandon)
    return () => { window.removeEventListener('beforeunload', abandon); abandon() }
  }, [idx])

  const finish = useCallback(async () => {
    completedRef.current = true
    posthog.capture('quiz_completed', {
      elapsed_ms: Math.round(performance.now() - startedAtRef.current),
      instrument_version: INSTRUMENT_VERSION,
    })
    await flush(QUIZ_ITEMS.map(i => i.id), true)
    onComplete({ answers: answersRef.current })
  }, [flush, onComplete])

  useEffect(() => { finishRef.current = finish }, [finish])

  // ─── Render ────────────────────────────────────────────────────────────────
  const screenClass = `quiz-screen transition-all duration-[160ms] ease-out ${
    exiting ? `opacity-0 ${dir === 1 ? '-translate-x-6' : 'translate-x-6'}` : 'opacity-100 translate-x-0'
  }`

  const compact = (item?.options.length ?? 0) >= 6

  return (
    <div className="relative min-h-[560px]">
      {/* Block tint — crossfades over 400ms, the only remaining signal blocks exist */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -inset-y-8 -z-10 transition-colors duration-[400ms]"
        style={{ backgroundColor: screen?.kind === 'item' ? TINTS[block] : 'rgba(0,0,0,0)' }}
      />

      {screen?.kind === 'item' && (
        <div className="mb-8 flex items-center gap-3">
          <div className="flex flex-1 items-end gap-1" data-testid="quiz-progress" aria-label={`${filled} of ${TOTAL}`}>
            {QUIZ_ITEMS.map((it, i) => (
              <span
                key={it.id}
                className={`flex-1 rounded-full transition-all duration-200 ${
                  i < filled ? 'h-1 bg-stone-900'
                  : i === filled ? 'h-1.5 bg-stone-900'
                  : 'h-1 bg-stone-200'
                }`}
              />
            ))}
          </div>
          {idx > 0 && (
            <button
              onClick={back}
              aria-label="Back"
              className="-mr-1 flex h-11 shrink-0 items-center gap-1 rounded-full px-2 text-[13px] font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              Back
            </button>
          )}
        </div>
      )}

      <div className={screenClass} key={idx}>
        {screen?.kind === 'intro' && (
          <div className="pt-10 text-center" data-testid="quiz-intro">
            <h1 className="text-[28px] font-bold leading-tight text-stone-900">A few questions</h1>
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-stone-600">{FRAMING.intro}</p>
            <p className="mx-auto mt-3 max-w-sm text-[13px] text-stone-400">{FRAMING.honesty}</p>
            <button
              onClick={() => advanceFrom(0)}
              className="mt-10 w-full rounded-2xl bg-stone-900 px-6 py-4 text-[15px] font-semibold text-white transition active:scale-[0.98]"
            >
              Start
            </button>
          </div>
        )}

        {screen?.kind === 'item' && item && (
          <div data-testid={`quiz-item-${item.id}`}>
            <h2 className="quiz-stem-in text-[24px] font-semibold leading-[1.25] text-stone-900">
              {item.stem}
            </h2>

            <div className="mt-7 flex flex-col gap-3">
              {displayOptions(item.id, flips[item.id] ?? false).map((opt, i) => {
                const chosen = justPicked === i || (justPicked === null && answers[item.id]?.optionIndex === i)
                return (
                  <button
                    key={`${item.id}-${i}`}
                    onClick={() => answer(item.id, i)}
                    style={{ animationDelay: `${i * STAGGER_MS}ms` }}
                    className={`quiz-card-in flex w-full items-center gap-3 rounded-xl border px-4 text-left transition-[opacity,background-color,border-color] duration-150 active:scale-[0.98] active:shadow-none ${
                      compact ? 'min-h-[56px] py-2.5' : 'min-h-[64px] py-3'
                    } ${
                      chosen
                        ? 'border-stone-900 bg-neon shadow-none'
                        : 'border-stone-200 bg-white shadow-sm shadow-black/[0.04] hover:border-stone-300'
                    } ${dim && !chosen ? 'opacity-40' : 'opacity-100'}`}
                  >
                    {opt.emoji && (
                      <span
                        className="w-7 shrink-0 text-center text-[22px] leading-none transition-transform duration-[120ms]"
                        style={{ transform: chosen ? 'scale(1.15)' : 'scale(1)' }}
                      >
                        {opt.emoji}
                      </span>
                    )}
                    <span className="text-[15px] font-medium leading-snug text-stone-800">{opt.label}</span>
                  </button>
                )
              })}
            </div>

            {item.sub && <p className="mt-4 text-[12px] text-stone-400">{item.sub}</p>}

            {item.skippable && (
              <div className="mt-5 flex justify-center">
                <button
                  onClick={() => answer(item.id, null)}
                  data-testid="quiz-skip"
                  className="flex h-11 items-center px-4 text-[13px] text-stone-400 underline underline-offset-4 transition hover:text-stone-600"
                >
                  {FRAMING.skip}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
