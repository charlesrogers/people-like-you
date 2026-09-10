'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { MIN_RECORDING_SECONDS, meetsRecordingMinimum } from '@/lib/recording-requirements'

interface VoiceRecorderProps {
  promptText: string
  promptId: string
  helpText?: string
  exampleAnswer?: string
  onRecordingComplete: (blob: Blob, durationSeconds: number) => Promise<void>
  onSkip?: () => void
  maxSeconds?: number
}

type RecorderState = 'idle' | 'starting' | 'recording' | 'finishing' | 'review' | 'uploading' | 'submitted'
const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

export default function VoiceRecorder({
  promptText, promptId, helpText, exampleAnswer, onRecordingComplete, onSkip, maxSeconds,
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const blobRef = useRef<Blob | null>(null)
  const durationRef = useRef(0)
  const startedAtRef = useRef(0)
  const attemptRef = useRef(0)
  const savingRef = useRef(false)

  const release = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    const context = contextRef.current
    contextRef.current = null
    if (context && context.state !== 'closed') void context.close().catch(() => {})
  }, [])

  useEffect(() => () => {
    // Invalidate pending microphone requests and onstop work before releasing resources.
    attemptRef.current++
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    release()
  }, [release])
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl) }, [audioUrl])

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    durationRef.current = Math.max(0, (contextRef.current?.currentTime ?? startedAtRef.current) - startedAtRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setState('finishing')
    recorder.stop()
  }, [])

  useEffect(() => {
    // Backgrounding must not turn wall-clock time into recorded audio time.
    const onVisibility = () => { if (document.hidden) stopRecording() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [stopRecording])

  const reset = useCallback(() => {
    attemptRef.current++
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
    release()
    recorderRef.current = null
    blobRef.current = null
    durationRef.current = 0
    setAudioUrl(null)
    setSeconds(0)
    setError(null)
    setState('idle')
  }, [release])

  const startRecording = async () => {
    const attempt = ++attemptRef.current
    setState('starting')
    setError(null)
    setAudioUrl(null)
    blobRef.current = null
    durationRef.current = 0
    setSeconds(0)
    try {
      const mimeType = typeof MediaRecorder === 'undefined' ? undefined :
        ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type))
      if (!mimeType) throw new Error('Your browser does not support audio recording.')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (attempt !== attemptRef.current) { stream.getTracks().forEach(t => t.stop()); return }
      streamRef.current = stream
      const context = new AudioContext()
      contextRef.current = context
      await context.resume()
      if (attempt !== attemptRef.current) return
      // Use the audio clock, not an interval counter, for live progress.
      context.createMediaStreamSource(stream).connect(context.createAnalyser())
      const recorder = new MediaRecorder(stream, { mimeType })
      recorderRef.current = recorder
      const chunks: Blob[] = []
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
      recorder.onerror = () => {
        if (attempt !== attemptRef.current) return
        reset()
        setError('Recording was interrupted. Please try again.')
      }
      recorder.onstop = async () => {
        if (attempt !== attemptRef.current) return
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null
        setState('finishing')
        const blob = new Blob(chunks, { type: mimeType })
        // Decode when supported so review uses actual media length. The server
        // independently decodes every upload, including when this browser cannot.
        let duration = durationRef.current || Math.max(0, context.currentTime - startedAtRef.current)
        stream.getTracks().forEach(t => t.stop())
        try { duration = (await context.decodeAudioData(await blob.arrayBuffer())).duration } catch { /* Server validates. */ }
        if (attempt !== attemptRef.current) return
        release()
        durationRef.current = duration
        blobRef.current = blob
        setSeconds(duration)
        setAudioUrl(URL.createObjectURL(blob))
        setError(meetsRecordingMinimum(duration) ? null : 'This recording is under 20 seconds. Record again to continue.')
        setState('review')
      }
      stream.getAudioTracks().forEach(track => {
        track.onended = stopRecording
        track.onmute = stopRecording
      })
      recorder.start(1000)
      startedAtRef.current = context.currentTime
      setState('recording')
      timerRef.current = setInterval(() => {
        const elapsed = Math.max(0, context.currentTime - startedAtRef.current)
        durationRef.current = elapsed
        setSeconds(elapsed)
        if (maxSeconds !== undefined && elapsed >= maxSeconds) stopRecording()
      }, 100)
    } catch (err) {
      if (attempt !== attemptRef.current) return
      release()
      setState('idle')
      setError(err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Please allow microphone access to record.'
        : err instanceof Error ? err.message : 'Could not start recording. Please try again.')
    }
  }

  const saveRecording = async () => {
    if (savingRef.current || !blobRef.current || !meetsRecordingMinimum(durationRef.current)) return
    savingRef.current = true
    setError(null)
    setState('uploading')
    try {
      await onRecordingComplete(blobRef.current, durationRef.current)
      setState('submitted')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Your recording is still here—try saving again.')
      setState('review')
    } finally { savingRef.current = false }
  }

  const qualified = meetsRecordingMinimum(seconds)
  const progress = Math.min(100, seconds / MIN_RECORDING_SECONDS * 100)
  if (state === 'submitted') return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6" role="status">
      <p className="font-medium text-emerald-700">Recording saved ✓</p>
      <p className="mt-1 text-sm text-emerald-600">{promptText}</p>
      <button onClick={reset} className="mt-3 text-sm text-emerald-700 underline">Re-record</button>
    </div>
  )

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" data-prompt-id={promptId}>
      <p className="text-[19px] font-semibold leading-snug text-stone-900">{promptText}</p>
      {helpText && <p className="mt-2 text-sm text-stone-500">{helpText}</p>}
      <p className="mt-3 text-sm font-medium text-stone-700">At least 20 seconds. Take your time—tap Stop when you’re finished.</p>
      {exampleAnswer && state === 'idle' && <p className="mt-2 text-xs italic text-stone-400">e.g. &ldquo;{exampleAnswer}&rdquo;</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

      {(state === 'recording' || state === 'review') && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-3xl font-semibold tabular-nums text-stone-900">{formatTime(seconds)}</span>
            <span className="text-sm text-stone-500">0:20 minimum</span>
          </div>
          <div role="progressbar" aria-label="Recording minimum" aria-valuemin={0} aria-valuemax={20}
            aria-valuenow={Math.min(20, Math.floor(seconds))} className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
            <div className={`h-full transition-[width] ${qualified ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${progress}%` }} />
          </div>
          <p className={`mt-2 text-sm ${qualified ? 'text-emerald-700' : 'text-stone-600'}`}>
            {qualified ? 'Minimum reached—finish whenever you’re ready.' : `${Math.ceil(MIN_RECORDING_SECONDS - seconds)} seconds to go.`}
          </p>
        </div>
      )}
      {state === 'idle' && <div className="mt-5 space-y-3">
        <button onClick={startRecording} className="w-full rounded-xl bg-stone-900 px-5 py-4 font-medium text-white">🎙️ Tap to record</button>
        {onSkip && <button onClick={onSkip} className="w-full py-2 text-sm text-stone-500">Ask me a different question</button>}
      </div>}
      {state === 'starting' && <div className="mt-5"><p role="status" className="text-sm text-stone-500">Opening your microphone…</p><button onClick={reset} className="mt-3 text-sm underline">Cancel</button></div>}
      {state === 'recording' && <div className="mt-5 flex gap-3">
        <button onClick={reset} className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-600">Start over</button>
        <button onClick={stopRecording} className="flex-1 rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white">Stop recording</button>
      </div>}
      {state === 'review' && <div className="mt-5 space-y-3">
        {audioUrl && <audio controls src={audioUrl} className="w-full" aria-label="Listen to your recording" />}
        <button onClick={saveRecording} disabled={!qualified} className="w-full rounded-xl bg-stone-900 px-5 py-4 font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500">Save recording</button>
        <button onClick={reset} className="w-full py-2 text-sm text-stone-500">Record again</button>
      </div>}
      {(state === 'finishing' || state === 'uploading') && <p role="status" className="mt-5 py-4 text-center text-sm text-stone-500">{state === 'finishing' ? 'Preparing your recording…' : 'Saving your recording…'}</p>}
    </div>
  )
}
