'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceRecorderProps {
  promptText: string
  promptId: string
  helpText?: string
  exampleAnswer?: string
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void
  maxSeconds?: number
}

export default function VoiceRecorder({
  promptText,
  promptId,
  helpText,
  exampleAnswer,
  onRecordingComplete,
  maxSeconds = 90,
}: VoiceRecorderProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'reviewing' | 'submitted'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showExample, setShowExample] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const blobRef = useRef<Blob | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const secondsRef = useRef(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [audioUrl])

  const getMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return null
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
    return null
  }

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = getMimeType()
      if (!mimeType) {
        setError('Your browser does not support audio recording.')
        return
      }

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        blobRef.current = blob
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(t => t.stop())
        // Auto-submit immediately — no review step
        setState('submitted')
        onRecordingComplete(blob, secondsRef.current)
      }

      recorder.start(1000)
      setState('recording')
      setSeconds(0)
      secondsRef.current = 0

      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          const next = prev + 1
          secondsRef.current = next
          if (next >= maxSeconds) {
            recorder.stop()
            if (timerRef.current) clearInterval(timerRef.current)
          }
          return next
        })
      }, 1000)
    } catch {
      setError('Microphone access denied. Please allow microphone access to record.')
    }
  }, [maxSeconds])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    // Don't save — just reset
    chunksRef.current = []
    blobRef.current = null
    setSeconds(0)
    setState('idle')
  }, [])

  const handleReRecord = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    blobRef.current = null
    setSeconds(0)
    setState('idle')
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = (seconds / maxSeconds) * 100

  if (state === 'submitted') {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Got it!</p>
            <p className="mt-1 text-xs text-emerald-600">{promptText}</p>
          </div>
          <button
            onClick={handleReRecord}
            className="text-xs text-emerald-600 underline decoration-dotted underline-offset-2 hover:text-emerald-800"
          >
            Re-record
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm" data-prompt-id={promptId}>
      <p className="text-base font-medium text-stone-800">{promptText}</p>

      {/* Help text */}
      {helpText && (
        <p className="mt-2 text-xs text-stone-400">{helpText}</p>
      )}

      {/* Example answer toggle */}
      {exampleAnswer && state === 'idle' && (
        <div className="mt-3">
          <button
            onClick={() => setShowExample(!showExample)}
            className="text-xs font-medium text-stone-500 underline decoration-dotted underline-offset-2 hover:text-stone-700"
          >
            {showExample ? 'Hide example' : 'Not sure what to say? See an example'}
          </button>
          {showExample && (
            <div className="mt-2 rounded-lg bg-stone-50 px-4 py-3">
              <p className="text-xs italic text-stone-500">&ldquo;{exampleAnswer}&rdquo;</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {state === 'idle' && (
        <button
          onClick={startRecording}
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-lg bg-stone-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
        >
          <span className="h-3 w-3 rounded-full bg-red-500" />
          Tap to record
        </button>
      )}

      {state === 'recording' && (
        <div className="mt-5">
          {/* Timer ring */}
          <div className="flex items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e7e5e4" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray={`${progress * 2.83} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="text-center">
                <span className="text-2xl font-bold text-stone-900 tabular-nums">{formatTime(seconds)}</span>
                <span className="block text-[10px] text-stone-400">{formatTime(maxSeconds)}</span>
              </div>
            </div>
          </div>

          {/* Pulsing indicator */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-xs text-stone-500">Recording...</span>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={cancelRecording}
              className="flex-1 rounded-lg border border-stone-200 px-4 py-3 text-sm font-medium text-stone-500 transition hover:bg-stone-50 active:translate-y-px"
            >
              Start over
            </button>
            <button
              onClick={stopRecording}
              className="flex-1 rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* reviewing state is no longer used — auto-submits on stop */}
      {state === 'reviewing' && audioUrl && (
        <div className="mt-5 text-center text-xs text-stone-400">Processing...</div>
      )}
    </div>
  )
}
