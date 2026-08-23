'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import posthog from 'posthog-js'
import { apiFetch } from '@/lib/api-client'
import {
  QUIZ_ITEMS, QUIZ_BLOCKS, FRAMING, INSTRUMENT_VERSION, getItem,
} from '@/lib/quiz-battery'
import { isPolarityFlipped, displayOptions } from '@/lib/quiz-scoring'

const CARD_AUTO_ADVANCE_MS = 1200
const Q19_TEXT_CAP = 120
const Q19_AUDIO_CAP_S = 30
const Q19_PROMPT_ID = 'Q19_nerd_out'
const TRANSITION_MS = 120

export interface QuizAnswer {
  optionIndex: number | null
  polarityFlipped: boolean
  responseMs: number | null
}

export interface QuizResult {
  answers: Record<string, QuizAnswer>
  m9Text: string | null
  m9AudioUrl: string | null
}

type Screen =
  | { kind: 'intro' }
  | { kind: 'card'; block: number; card: string }
  | { kind: 'item'; itemId: string }
  | { kind: 'close' }

const SCREENS: Screen[] = (() => {
  const s: Screen[] = [{ kind: 'intro' }]
  for (const b of QUIZ_BLOCKS) {
    if (b.card) s.push({ kind: 'card', block: b.block, card: b.card })
    for (const id of b.items) s.push({ kind: 'item', itemId: id })
  }
  s.push({ kind: 'close' })
  return s
})()

const TOTAL_ITEMS = QUIZ_ITEMS.length

function itemsAnsweredBefore(index: number): number {
  return SCREENS.slice(0, index).filter(s => s.kind === 'item').length
}

export default function QuizStep({
  userId,
  onComplete,
}: {
  userId: string
  onComplete: (result: QuizResult) => void
}) {
  const [idx, setIdx] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const answersRef = useRef<Record<string, QuizAnswer>>({})
  const [answerTick, setAnswerTick] = useState(0)   // re-render on answer change
  const flushedRef = useRef<Set<number>>(new Set())
  const startedAtRef = useRef<number>(0)
  const itemShownAtRef = useRef<number>(0)
  const blockStartedAtRef = useRef<number>(0)
  const completedRef = useRef(false)

  const [q19Text, setQ19Text] = useState('')
  const q19TranscriptRef = useRef<string | null>(null)
  const q19AudioUrlRef = useRef<string | null>(null)
  const [q19Recording, setQ19Recording] = useState(false)
  const [q19Seconds, setQ19Seconds] = useState(0)
  const [q19Status, setQ19Status] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const screen = SCREENS[idx]

  // Polarity is seeded on the user id, so Back never reshuffles an item.
  const flips = useMemo(() => {
    const m: Record<string, boolean> = {}
    for (const it of QUIZ_ITEMS) m[it.id] = isPolarityFlipped(userId, it.id)
    return m
  }, [userId])

  // ─── Persistence ─────────────────────────────────────────────────────────
  // Buffered: one POST per block card and one at the end. Never between items.

  const flush = useCallback(async (itemIds: string[], complete: boolean) => {
    const responses = itemIds
      .filter(id => answersRef.current[id] !== undefined)
      .map(id => ({ itemId: id, ...answersRef.current[id] }))
    if (responses.length === 0 && !complete) return
    try {
      await apiFetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          responses,
          complete,
          m9Text: q19TranscriptRef.current,
          m9AudioUrl: q19AudioUrlRef.current,
        }),
      })
    } catch {
      // Never block the flow on a write; the final POST re-sends everything.
    }
  }, [userId])

  // ─── Navigation ──────────────────────────────────────────────────────────

  const go = useCallback((next: number) => {
    setLeaving(true)
    window.setTimeout(() => {
      setIdx(next)
      setLeaving(false)
    }, TRANSITION_MS)
  }, [])

  const advance = useCallback(() => {
    const next = idx + 1
    const target = SCREENS[next]
    if (!target) return

    // Arriving at a block card flushes the block that just ended.
    if (target.kind === 'card') {
      const prior = QUIZ_BLOCKS.filter(b => b.block < target.block).flatMap(b => b.items)
      if (prior.length > 0 && !flushedRef.current.has(target.block)) {
        flushedRef.current.add(target.block)
        const elapsed = Math.round(performance.now() - blockStartedAtRef.current)
        posthog.capture('quiz_block_completed', { block: target.block - 1, elapsed_ms: elapsed })
        void flush(prior, false)
      }
      blockStartedAtRef.current = performance.now()
    }
    go(next)
  }, [idx, flush, go])

  const back = useCallback(() => {
    if (idx > 0) go(idx - 1)
  }, [idx, go])

  const answer = useCallback((itemId: string, displayedIndex: number | null) => {
    answersRef.current[itemId] = {
      optionIndex: displayedIndex,
      polarityFlipped: flips[itemId] ?? false,
      responseMs: itemShownAtRef.current ? Math.round(performance.now() - itemShownAtRef.current) : null,
    }
    setAnswerTick(t => t + 1)
    posthog.capture('quiz_item_answered', {
      item_id: itemId,
      option_index: displayedIndex,
      polarity_flipped: flips[itemId] ?? false,
      response_ms: answersRef.current[itemId].responseMs,
      instrument_version: INSTRUMENT_VERSION,
    })
    advance()
  }, [advance, flips])

  // ─── Instrumentation ─────────────────────────────────────────────────────

  useEffect(() => {
    startedAtRef.current = performance.now()
    blockStartedAtRef.current = performance.now()
  }, [])

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
    return () => {
      window.removeEventListener('beforeunload', abandon)
      abandon()
    }
  }, [idx])

  // Block cards are zero-tap: they auto-advance, or the user taps through sooner.
  useEffect(() => {
    if (screen?.kind !== 'card') return
    const t = window.setTimeout(advance, CARD_AUTO_ADVANCE_MS)
    return () => window.clearTimeout(t)
  }, [screen, advance])

  // ─── Q19 audio ───────────────────────────────────────────────────────────

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const tickRef = useRef<number | null>(null)

  const getMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return null
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
    return null
  }

  const stopQ19 = useCallback(() => {
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null }
    recorderRef.current?.state === 'recording' && recorderRef.current.stop()
    setQ19Recording(false)
  }, [])

  const startQ19 = useCallback(async () => {
    const mimeType = getMimeType()
    if (!mimeType) { setQ19Status('error'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const rec = new MediaRecorder(stream, { mimeType })
      recorderRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        if (blob.size > 0) void uploadQ19(blob, mimeType)
        // Do not block advance on transcription — it runs while the user
        // answers Q20-Q23 (~30s of one-tap items).
        advance()
      }
      rec.start()
      setQ19Recording(true)
      setQ19Seconds(0)
      tickRef.current = window.setInterval(() => {
        setQ19Seconds(s => {
          if (s + 1 >= Q19_AUDIO_CAP_S) stopQ19()
          return s + 1
        })
      }, 1000)
    } catch {
      setQ19Status('error')
    }
  }, [advance, stopQ19])

  const uploadQ19 = useCallback(async (blob: Blob, mimeType: string) => {
    setQ19Status('saving')
    const ext = mimeType.includes('mp4') ? 'm4a' : 'webm'

    // Storage: an ordinary voice memo, so it flows into extraction as story
    // material and through the existing moderation path.
    const memoForm = new FormData()
    memoForm.append('audio', blob, `${Q19_PROMPT_ID}.${ext}`)
    memoForm.append('userId', userId)
    memoForm.append('promptId', Q19_PROMPT_ID)
    memoForm.append('dayNumber', '0')
    memoForm.append('durationSeconds', String(q19Seconds))
    memoForm.append('promptSource', 'fished')
    memoForm.append('promptSeed', JSON.stringify({ itemId: 'Q19', optionIndex: -1 }))

    // Transcript: needed by the voice step to template the Q19 prompt.
    const txForm = new FormData()
    txForm.append('audio', blob, `${Q19_PROMPT_ID}.${ext}`)
    txForm.append('userId', userId)

    try {
      const [memoRes, txRes] = await Promise.all([
        apiFetch('/api/voice-memo', { method: 'POST', body: memoForm }).then(r => r.json()).catch(() => null),
        apiFetch('/api/transcribe', { method: 'POST', body: txForm }).then(r => r.json()).catch(() => null),
      ])
      if (memoRes?.id) q19AudioUrlRef.current = memoRes.id
      if (txRes?.text) {
        q19TranscriptRef.current = txRes.text
        setQ19Status('saved')
      } else {
        setQ19Status(txRes?.error ? 'error' : 'saved')
      }
    } catch {
      setQ19Status('error')
    }
  }, [userId, q19Seconds])

  useEffect(() => () => {
    if (tickRef.current) window.clearInterval(tickRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  // ─── Completion ──────────────────────────────────────────────────────────

  const finish = useCallback(async () => {
    completedRef.current = true
    if (q19Text.trim()) q19TranscriptRef.current = q19Text.trim()
    posthog.capture('quiz_completed', {
      elapsed_ms: Math.round(performance.now() - startedAtRef.current),
      instrument_version: INSTRUMENT_VERSION,
    })
    await flush(QUIZ_ITEMS.map(i => i.id), true)
    onComplete({
      answers: answersRef.current,
      m9Text: q19TranscriptRef.current,
      m9AudioUrl: q19AudioUrlRef.current,
    })
  }, [flush, onComplete, q19Text])

  // ─── Render ──────────────────────────────────────────────────────────────

  const answeredCount = itemsAnsweredBefore(idx)
  const showProgress = screen?.kind === 'item' || screen?.kind === 'card'
  const frame = `transition-all duration-100 ${leaving ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`

  return (
    <div>
      {showProgress && (
        <div className="mb-6" data-testid="quiz-progress">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>{answeredCount} of {TOTAL_ITEMS}</span>
          </div>
          <div className="mt-2 h-1 rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-stone-900 transition-all duration-300"
              style={{ width: `${(answeredCount / TOTAL_ITEMS) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className={frame} style={{ minHeight: 380 }}>
        {screen?.kind === 'intro' && (
          <div data-testid="quiz-intro">
            <h1 className="text-2xl font-bold text-stone-900">A few questions</h1>
            <p className="mt-4 text-sm text-stone-600">{FRAMING.intro}</p>
            <p className="mt-3 text-sm text-stone-500">{FRAMING.honesty}</p>
            <button
              onClick={advance}
              className="mt-8 w-full rounded-lg bg-stone-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
            >
              Start
            </button>
          </div>
        )}

        {screen?.kind === 'card' && (
          <button
            onClick={advance}
            data-testid={`quiz-card-${screen.block}`}
            className="flex min-h-[380px] w-full items-center justify-center text-center"
          >
            <p className="text-xl font-medium text-stone-800">{screen.card}</p>
          </button>
        )}

        {screen?.kind === 'item' && screen.itemId !== 'Q19' && (
          <ItemScreen
            itemId={screen.itemId}
            flipped={flips[screen.itemId] ?? false}
            selected={answersRef.current[screen.itemId]?.optionIndex ?? null}
            onAnswer={i => answer(screen.itemId, i)}
            tick={answerTick}
          />
        )}

        {screen?.kind === 'item' && screen.itemId === 'Q19' && (
          <div data-testid="quiz-item-Q19">
            <p className="text-lg font-medium text-stone-900">{getItem('Q19')!.stem}</p>

            <div className="mt-6">
              <textarea
                value={q19Text}
                onChange={e => setQ19Text(e.target.value.slice(0, Q19_TEXT_CAP))}
                placeholder={FRAMING.q19TextPlaceholder}
                rows={3}
                disabled={q19Recording}
                className="w-full resize-none rounded-lg border border-stone-200 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-300 focus:border-stone-400 focus:outline-none"
              />
              <div className="mt-1 text-right text-xs text-stone-400" data-testid="q19-counter">
                {q19Text.length}/{Q19_TEXT_CAP}
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-xs text-stone-400">{FRAMING.q19AudioAffordance}</p>
              <button
                onPointerDown={startQ19}
                onPointerUp={stopQ19}
                onPointerLeave={() => q19Recording && stopQ19()}
                data-testid="q19-record"
                className={`rounded-full px-6 py-3 text-sm font-medium transition ${
                  q19Recording ? 'bg-red-500 text-white' : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {q19Recording ? `Recording ${q19Seconds}s — release to stop` : 'Hold to record'}
              </button>
            </div>

            <button
              onClick={() => answer('Q19', null)}
              disabled={!q19Text.trim()}
              className="mt-8 w-full rounded-lg bg-stone-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-40 active:translate-y-px"
            >
              Continue
            </button>
          </div>
        )}

        {screen?.kind === 'close' && (
          <div data-testid="quiz-close">
            <p className="text-lg font-medium text-stone-900">{FRAMING.close}</p>
            {q19Status === 'saving' && (
              <p className="mt-3 text-xs text-stone-400">Still saving your recording — you can keep going.</p>
            )}
            <button
              onClick={finish}
              className="mt-8 w-full rounded-lg bg-stone-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
            >
              Continue
            </button>
          </div>
        )}
      </div>

      {/* Back is always available — auto-advance makes a mis-tap unrecoverable without it. */}
      <div className="mt-8 flex items-center justify-between">
        {idx > 0 ? (
          <button onClick={back} className="text-sm text-stone-400 transition hover:text-stone-600">
            Back
          </button>
        ) : <span />}

        {screen?.kind === 'item' && getItem(screen.itemId)?.skippable && screen.itemId !== 'Q19' && (
          <button
            onClick={() => answer(screen.itemId, null)}
            data-testid="quiz-skip"
            className="text-sm text-stone-400 underline transition hover:text-stone-600"
          >
            {FRAMING.skip}
          </button>
        )}
        {screen?.kind === 'item' && screen.itemId === 'Q19' && (
          <button
            onClick={() => answer('Q19', null)}
            data-testid="quiz-skip"
            className="text-sm text-stone-400 underline transition hover:text-stone-600"
          >
            {FRAMING.skip}
          </button>
        )}
      </div>
    </div>
  )
}

function ItemScreen({
  itemId, flipped, selected, onAnswer, tick,
}: {
  itemId: string
  flipped: boolean
  selected: number | null
  onAnswer: (displayedIndex: number) => void
  tick: number
}) {
  const item = getItem(itemId)!
  const options = displayOptions(itemId, flipped)
  void tick

  return (
    <div data-testid={`quiz-item-${itemId}`}>
      <p className="text-lg font-medium leading-snug text-stone-900">{item.stem}</p>
      <div className="mt-6 space-y-2.5">
        {options.map((opt, i) => (
          <button
            key={`${itemId}-${i}`}
            onClick={() => onAnswer(i)}
            className={`w-full rounded-xl border px-4 py-3.5 text-left text-[15px] leading-snug transition active:translate-y-px ${
              selected === i
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {item.id === 'Q23' && (
        <p className="mt-4 text-xs text-stone-400">{FRAMING.q23Sub}</p>
      )}
    </div>
  )
}
