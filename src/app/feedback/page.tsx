'use client'

import { useState, useEffect } from 'react'
import FeedbackBoard from '@/components/FeedbackBoard'

export default function FeedbackPage() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('ply_profile_id')
    if (!id) {
      window.location.href = '/onboarding'
      return
    }
    setUserId(id)
  }, [])

  if (!userId) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-stone-400">Loading...</p></div>
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <a href="/dashboard" className="text-xs text-stone-400 hover:text-stone-600 transition mb-4 inline-block">
          &larr; Back to dashboard
        </a>
        <FeedbackBoard userId={userId} />
      </div>
    </div>
  )
}
