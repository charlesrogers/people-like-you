'use client'

import { useState, useEffect, useCallback } from 'react'
import VoiceRecorder from './VoiceRecorder'

interface LoopPrompt {
  id: string
  text: string
  category: string
}

interface UnlockedIntro {
  id: string
  matchId: string
  matchedUserId: string
  name: string
  narrative: string
  photoUrl: string | null
}

interface Progress {
  promptsUntilNext: number
  totalUnlocksEarned: number
  isMaxed: boolean
  maxPrompts: number
}

interface Props {
  userId: string
  onIntroUnlocked: (intro: UnlockedIntro) => void
  onDone: () => void
}

export default function VoicePromptLoop({ userId, onIntroUnlocked, onDone }: Props) {
  const [currentPrompt, setCurrentPrompt] = useState<LoopPrompt | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [promptsAnswered, setPromptsAnswered] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [justRecorded, setJustRecorded] = useState(false)
  const [noMorePrompts, setNoMorePrompts] = useState(false)

  const fetchNextState = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/voice-prompt-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()

      setCurrentPrompt(data.nextPrompt)
      setProgress(data.progress)
      setPromptsAnswered(data.promptsAnsweredToday)
      setNoMorePrompts(data.noMorePrompts)

      // If an intro was unlocked, notify parent
      if (data.unlockedIntro) {
        onIntroUnlocked(data.unlockedIntro)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [userId, onIntroUnlocked])

  useEffect(() => {
    fetchNextState()
  }, [fetchNextState])

  async function handleRecordingComplete(blob: Blob, durationSeconds: number) {
    if (!currentPrompt) return
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      formData.append('userId', userId)
      formData.append('promptId', currentPrompt.id)
      formData.append('dayNumber', '0')
      formData.append('durationSeconds', String(Math.round(durationSeconds)))

      const res = await fetch('/api/voice-memo', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setJustRecorded(true)
        // Brief pause to show confirmation, then fetch next state
        setTimeout(async () => {
          setJustRecorded(false)
          await fetchNextState()
        }, 1500)
      }
    } catch {
      // silent
    } finally {
      setUploading(false)
    }
  }

  if (loading && promptsAnswered === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-stone-400">Finding your next prompt...</p>
      </div>
    )
  }

  // All done — maxed out or no more prompts
  if (noMorePrompts || progress?.isMaxed) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-3xl">&#127881;</p>
        <p className="mt-3 text-lg font-semibold text-stone-900">
          You&rsquo;re all set
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {progress?.totalUnlocksEarned
            ? `You unlocked ${progress.totalUnlocksEarned} intro${progress.totalUnlocksEarned > 1 ? 's' : ''} today. `
            : ''}
          More intros tomorrow.
        </p>
        <button
          onClick={onDone}
          className="mt-5 rounded-xl border border-stone-200 px-6 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 active:translate-y-px"
        >
          Done
        </button>
      </div>
    )
  }

  // Just recorded — brief confirmation
  if (justRecorded) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-3xl">&#10003;&#65039;</p>
        <p className="mt-3 text-base font-semibold text-stone-900">Nice one</p>
        <p className="mt-1 text-sm text-stone-500">Checking if we found someone new...</p>
      </div>
    )
  }

  if (!currentPrompt) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-stone-500">No more prompts available. More intros tomorrow!</p>
        <button onClick={onDone} className="mt-4 text-sm font-medium text-stone-900 underline">Done</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-stone-400">
            Story {promptsAnswered + 1}
            {progress && !progress.isMaxed && ` of up to ${progress.maxPrompts}`}
          </p>
          {progress && progress.promptsUntilNext > 0 && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(progress.promptsUntilNext, 7) }, (_, i) => (
                <div
                  key={i}
                  className="h-1.5 w-4 rounded-full bg-stone-200"
                />
              ))}
              <span className="text-[10px] text-stone-400 ml-1">until next intro</span>
            </div>
          )}
        </div>

        {/* Prompt */}
        <p className="text-base font-medium text-stone-900 leading-relaxed">
          {currentPrompt.text}
        </p>

        {/* Voice recorder */}
        <div className="mt-5">
          <VoiceRecorder
            promptText={currentPrompt.text}
            promptId={currentPrompt.id}
            onRecordingComplete={handleRecordingComplete}
            maxSeconds={90}
          />
        </div>

        {uploading && (
          <p className="mt-3 text-center text-xs text-stone-400">Uploading...</p>
        )}
      </div>

      {/* Exit option */}
      <button
        onClick={onDone}
        className="w-full text-center text-xs text-stone-400 transition hover:text-stone-600"
      >
        I&rsquo;m done for now
      </button>
    </div>
  )
}
