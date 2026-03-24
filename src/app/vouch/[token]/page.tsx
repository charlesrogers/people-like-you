'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import VoiceRecorder from '@/components/VoiceRecorder'

interface VouchInfo {
  userName: string
  friendName: string
  status: string
}

export default function VouchPage() {
  const params = useParams<{ token: string }>()
  const token = params.token

  const [info, setInfo] = useState<VouchInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res = await fetch(`/api/vouch/info?token=${token}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Invalid link')
          return
        }
        const data = await res.json()
        if (data.status !== 'invited') {
          setSubmitted(true)
        }
        setInfo(data)
      } catch {
        setError('Failed to load vouch info')
      } finally {
        setLoading(false)
      }
    }
    fetchInfo()
  }, [token])

  async function handleSubmit(audioBlob: Blob, durationSeconds: number) {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'vouch.webm')
      formData.append('token', token)
      formData.append('durationSeconds', String(Math.round(durationSeconds)))

      const res = await fetch('/api/vouch/record', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Upload failed')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-[13px] text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error && !info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md text-center px-6">
          <h1 className="text-[20px] font-bold text-foreground mb-2">Invalid Link</h1>
          <p className="text-[13px] text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md text-center px-6">
          <h1 className="text-[20px] font-bold text-foreground mb-2">Thank you!</h1>
          <p className="text-[13px] text-muted-foreground">
            Your vouch for {info?.userName} has been recorded. They&apos;ll appreciate it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md w-full px-6 py-12">
        <h1 className="text-[20px] font-bold text-foreground mb-3 text-center">
          {info?.userName} invited you to vouch for them on PLY
        </h1>
        <p className="text-[13px] text-muted-foreground text-center mb-8">
          Record a 60-second voice memo answering:{' '}
          <span className="text-foreground font-medium italic">
            What&apos;s the thing about {info?.userName} that people don&apos;t see right away?
          </span>
        </p>

        <VoiceRecorder
          promptText={`What's the thing about ${info?.userName} that people don't see right away?`}
          promptId={`vouch-${token}`}
          onRecordingComplete={handleSubmit}
          maxSeconds={60}
        />

        {error && (
          <p className="text-[12px] text-destructive text-center mt-4">{error}</p>
        )}

        {submitting && (
          <p className="text-[12px] text-muted-foreground text-center mt-4">
            Uploading your vouch...
          </p>
        )}
      </div>
    </div>
  )
}
