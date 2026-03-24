'use client'

import { useState, useEffect } from 'react'
import ProfileCompleteness from './ProfileCompleteness'
import VoiceRecorder from './VoiceRecorder'
import { computePersonalityReveal, type PersonalityReveal } from '@/lib/personality-reveal'
import { getTargetedPrompts, QUESTION_BANK, type PromptDef } from '@/lib/prompts'

interface VoiceMemo {
  id: string
  prompt_id: string
  transcript: string | null
  duration_seconds: number | null
  extraction: Record<string, unknown> | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ProfileTabProps {
  userId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  composite: any
  memos: VoiceMemo[]
  onMemoRecorded: () => void
}

const promptTextMap = new Map(QUESTION_BANK.map(q => [q.id, q.text]))

export default function ProfileTab({ userId, composite, memos, onMemoRecorded }: ProfileTabProps) {
  const [reveal, setReveal] = useState<PersonalityReveal | null>(null)
  const [struckItems, setStruckItems] = useState<string[]>([])
  const [expandedMemo, setExpandedMemo] = useState<string | null>(null)
  const [showMoreQuestions, setShowMoreQuestions] = useState(false)
  const [morePrompts, setMorePrompts] = useState<{ targeted: PromptDef[]; others: PromptDef[] }>({ targeted: [], others: [] })
  const [recordingPrompt, setRecordingPrompt] = useState<PromptDef | null>(null)

  useEffect(() => {
    if (composite) {
      setReveal(computePersonalityReveal(composite))
    }
  }, [composite])

  useEffect(() => {
    if (reveal && showMoreQuestions) {
      const answered = memos.map(m => m.prompt_id)
      setMorePrompts(getTargetedPrompts(reveal.weakestDimension, answered))
    }
  }, [reveal, showMoreQuestions, memos])

  const toggleStrike = (item: string) => {
    setStruckItems(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const handleRecordingComplete = async (promptId: string, blob: Blob, duration: number) => {
    const formData = new FormData()
    formData.append('audio', blob, `${promptId}.webm`)
    formData.append('userId', userId)
    formData.append('promptId', promptId)
    formData.append('dayNumber', '0')
    formData.append('durationSeconds', String(duration))

    await fetch('/api/voice-memo', { method: 'POST', body: formData })
    setRecordingPrompt(null)
    onMemoRecorded()
  }

  if (!composite) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
        <p className="mt-4 text-sm text-stone-500">Building your profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Completeness */}
      <ProfileCompleteness richness={reveal?.richness || 0} memoCount={composite.memo_count || 0} />

      {/* Personality card */}
      {reveal && (
        <div className="rounded-xl bg-white border border-stone-200 p-5">
          <h2 className="text-lg font-bold text-stone-900">{reveal.headline}</h2>
          <div className="mt-4 space-y-3">
            {reveal.dimensions.map(dim => (
              <div key={dim.id}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-700">
                    {dim.emoji} {dim.label}
                  </span>
                  <span className="text-xs font-bold text-stone-500 tabular-nums">{dim.score}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-stone-900 transition-all duration-500"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted traits — strikeable */}
      <div className="rounded-xl bg-white border border-stone-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-stone-900">What we know about you</h3>
        <p className="text-xs text-stone-400">Tap anything that doesn&rsquo;t fit to remove it.</p>

        {/* Passions */}
        {composite.passion_indicators?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">What lights you up</p>
            <div className="flex flex-wrap gap-1.5">
              {composite.passion_indicators.slice(0, 10).map((p: string) => (
                <button
                  key={p}
                  onClick={() => toggleStrike(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    struckItems.includes(p)
                      ? 'bg-red-50 text-red-400 line-through'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Values */}
        {composite.values?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">Your values</p>
            <div className="flex flex-wrap gap-1.5">
              {composite.values.slice(0, 8).map((v: string) => (
                <button
                  key={v}
                  onClick={() => toggleStrike(v)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    struckItems.includes(v)
                      ? 'bg-red-50 text-red-400 line-through'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {composite.interest_tags?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">Your interests</p>
            <div className="flex flex-wrap gap-1.5">
              {composite.interest_tags.slice(0, 10).map((t: string) => (
                <button
                  key={t}
                  onClick={() => toggleStrike(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    struckItems.includes(t)
                      ? 'bg-red-50 text-red-400 line-through'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quotes */}
        {composite.notable_quotes?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">In your own words</p>
            <div className="space-y-1.5">
              {composite.notable_quotes.slice(0, 4).map((q: string, i: number) => (
                <button
                  key={i}
                  onClick={() => toggleStrike(q)}
                  className={`block w-full text-left rounded-lg px-3 py-2 text-xs italic transition ${
                    struckItems.includes(q)
                      ? 'bg-red-50 text-red-400 line-through'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {struckItems.length > 0 && (
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {struckItems.length} item{struckItems.length > 1 ? 's' : ''} removed — answer more questions to improve accuracy.
          </div>
        )}
      </div>

      {/* Your transcripts */}
      <div className="rounded-xl bg-white border border-stone-200 p-5">
        <h3 className="text-sm font-semibold text-stone-900">Your recordings</h3>
        <div className="mt-3 space-y-2">
          {memos.filter(m => m.transcript).map(memo => (
            <button
              key={memo.id}
              onClick={() => setExpandedMemo(expandedMemo === memo.id ? null : memo.id)}
              className="block w-full text-left rounded-lg border border-stone-100 px-3 py-2.5 transition hover:bg-stone-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-700">
                  {promptTextMap.get(memo.prompt_id)?.slice(0, 60) || memo.prompt_id}...
                </span>
                <span className="text-[10px] text-stone-400">
                  {memo.transcript?.split(/\s+/).filter(Boolean).length || 0} words
                </span>
              </div>
              {expandedMemo === memo.id && memo.transcript && (
                <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                  {memo.transcript}
                </p>
              )}
            </button>
          ))}
          {memos.filter(m => m.transcript).length === 0 && (
            <p className="text-xs text-stone-400">No transcripts yet — recordings are still processing.</p>
          )}
        </div>
      </div>

      {/* Answer more questions */}
      <div className="rounded-xl bg-white border border-stone-200 p-5">
        <h3 className="text-sm font-semibold text-stone-900">Show another side of yourself</h3>
        <p className="mt-1 text-xs text-stone-400">
          More answers = more specific intros. Each recording takes 30-60 seconds.
        </p>

        {!showMoreQuestions && !recordingPrompt && (
          <button
            onClick={() => setShowMoreQuestions(true)}
            className="mt-3 w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Show me questions
          </button>
        )}

        {showMoreQuestions && !recordingPrompt && (
          <div className="mt-3 space-y-2">
            {reveal && (
              <p className="text-xs text-stone-500 mb-2">
                Recommended for your {reveal.dimensions[reveal.dimensions.length - 1]?.emoji}{' '}
                {reveal.dimensions[reveal.dimensions.length - 1]?.label} side:
              </p>
            )}
            {morePrompts.targeted.map(p => (
              <button
                key={p.id}
                onClick={() => { setRecordingPrompt(p); setShowMoreQuestions(false) }}
                className="block w-full text-left rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-700 transition hover:bg-stone-50"
              >
                <span className="font-medium">{p.text}</span>
                <span className="mt-0.5 block text-xs text-stone-400">{p.helpText}</span>
              </button>
            ))}
            {morePrompts.others.length > 0 && (
              <>
                <p className="text-xs text-stone-400 mt-3">Or try something different:</p>
                {morePrompts.others.slice(0, 2).map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setRecordingPrompt(p); setShowMoreQuestions(false) }}
                    className="block w-full text-left rounded-lg border border-dashed border-stone-200 px-3 py-2.5 text-sm text-stone-500 transition hover:bg-stone-50"
                  >
                    {p.text}
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {recordingPrompt && (
          <div className="mt-3">
            <VoiceRecorder
              promptId={recordingPrompt.id}
              promptText={recordingPrompt.text}
              helpText={recordingPrompt.helpText}
              exampleAnswer={recordingPrompt.exampleAnswer}
              onRecordingComplete={(blob, duration) => handleRecordingComplete(recordingPrompt.id, blob, duration)}
            />
            <button
              onClick={() => setRecordingPrompt(null)}
              className="mt-2 text-xs text-stone-400 underline decoration-dotted underline-offset-2"
            >
              Pick a different question
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
