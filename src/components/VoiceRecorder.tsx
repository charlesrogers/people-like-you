'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface VoiceRecorderProps {
  promptText: string
  promptId: string
  helpText?: string
  exampleAnswer?: string
  onRecordingComplete: (blob: Blob, durationSeconds: number) => Promise<void>
  onSkip?: () => void
  maxSeconds?: number
}

export default function VoiceRecorder({
  promptText,
  promptId,
  helpText,
  exampleAnswer,
  onRecordingComplete,
  onSkip,
  maxSeconds = 90,
}: VoiceRecorderProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'uploading' | 'submitted'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasAudioSignal, setHasAudioSignal] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const blobRef = useRef<Blob | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const secondsRef = useRef(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const levelCheckRef = useRef<NodeJS.Timeout | null>(null)
  const hasSignalRef = useRef(false)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (levelCheckRef.current) clearInterval(levelCheckRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close()
    }
  }, [audioUrl])

  const getMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return null
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
    return null
  }

  const startRecording = useCallback(async () => {
    setError(null)
    setHasAudioSignal(false)
    hasSignalRef.current = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = getMimeType()
      if (!mimeType) {
        setError('Your browser does not support audio recording.')
        return
      }

      // Audio level monitoring via AnalyserNode
      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      levelCheckRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length
        if (avg > 5) {
          hasSignalRef.current = true
          setHasAudioSignal(true)
        }
      }, 200)

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        if (levelCheckRef.current) clearInterval(levelCheckRef.current)
        if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close()

        const blob = new Blob(chunksRef.current, { type: mimeType })
        blobRef.current = blob
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(t => t.stop())

        // Reject silent recordings
        const bytesPerSec = blob.size / Math.max(secondsRef.current, 1)
        if (!hasSignalRef.current || bytesPerSec < 500) {
          setError("We didn't pick up any audio. Check that your microphone is working and try again.")
          setState('idle')
          return
        }

        // Upload immediately
        setState('uploading')
        try {
          await onRecordingComplete(blob, secondsRef.current)
          setState('submitted')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to save recording. Tap to try again.')
          setState('idle')
        }
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
  }, [maxSeconds, onRecordingComplete])

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
    if (levelCheckRef.current) clearInterval(levelCheckRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (audioCtxRef.current?.state !== 'closed') audioCtxRef.current?.close()
    chunksRef.current = []
    blobRef.current = null
    setSeconds(0)
    setHasAudioSignal(false)
    hasSignalRef.current = false
    setState('idle')
  }, [])

  const handleReRecord = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    blobRef.current = null
    setSeconds(0)
    setError(null)
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

      {helpText && (
        <p className="mt-2 text-xs text-stone-400">{helpText}</p>
      )}

      {exampleAnswer && state === 'idle' && (
        <p className="mt-2 text-xs italic text-stone-400">
          e.g. &ldquo;{exampleAnswer}&rdquo;
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {state === 'idle' && (
        <div className="mt-5 flex items-center gap-3">
          {onSkip && (
            <button
              onClick={onSkip}
              className="flex items-center gap-1.5 text-xs text-stone-400 transition hover:text-stone-600"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 8h12M10 4l4 4-4 4" />
              </svg>
              Ask me a different question
            </button>
          )}
          <button
            onClick={startRecording}
            className="flex flex-1 items-center justify-center gap-3 rounded-lg bg-stone-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
          >
            <span className="h-3 w-3 rounded-full bg-red-500" />
            Tap to record
          </button>
        </div>
      )}

      {state === 'uploading' && (
        <div className="mt-5 flex items-center justify-center gap-3 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
          <span className="text-sm text-stone-500">Saving your recording...</span>
        </div>
      )}

      {state === 'recording' && (
        <div className="mt-5">
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

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={`h-2 w-2 rounded-full ${hasAudioSignal ? 'animate-pulse bg-red-500' : 'bg-stone-300'}`} />
            <span className="text-xs text-stone-500">
              {hasAudioSignal ? 'Recording...' : 'Waiting for audio \u2014 speak into your mic'}
            </span>
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
    </div>
  )
}
