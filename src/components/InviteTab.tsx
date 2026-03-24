'use client'

import { useState, useEffect } from 'react'

interface InviteData {
  code: string
  inviteCount: number
  queuePriority: number
  links: Record<string, string>
}

export default function InviteTab({ userId }: { userId: string }) {
  const [data, setData] = useState<InviteData | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/invite?userId=${userId}`)
      .then(r => r.json())
      .then(d => { if (d.code) setData(d) })
      .catch(() => {})
  }, [userId])

  if (!data) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
      </div>
    )
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.links.default)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    trackShare('direct')
  }

  const handleShare = async (channel: string) => {
    const link = data.links[channel] || data.links.default
    const text = `I'm on People Like You — a dating app that actually gets to know you before matching you. Join me: ${link}`
    trackShare(channel)

    if (navigator.share) {
      try { await navigator.share({ text, url: link }) } catch {
        await navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } else {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const trackShare = (channel: string) => {
    fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invite_code: data.code,
        event_type: 'link_generated',
        utm_source: channel,
        utm_medium: 'invite',
        utm_campaign: 'invite_tab',
        referrer_user_id: userId,
      }),
    }).catch(() => {})
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-stone-900 p-6 text-white text-center">
        <p className="text-3xl">🔗</p>
        <h2 className="mt-3 text-xl font-bold">Invite friends, jump the queue</h2>
        <p className="mt-2 text-sm text-stone-400">
          Every invite boosts your priority. The more friends you bring, the faster you see new matches.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white border border-stone-200 p-4 text-center">
          <p className="text-2xl font-bold text-stone-900">{data.inviteCount}</p>
          <p className="text-xs text-stone-400">Friends joined</p>
        </div>
        <div className="rounded-xl bg-white border border-stone-200 p-4 text-center">
          <p className="text-2xl font-bold text-stone-900">+{data.queuePriority}</p>
          <p className="text-xs text-stone-400">Queue priority</p>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl bg-white border border-stone-200 p-5">
        <h3 className="text-sm font-semibold text-stone-900">How it works</h3>
        <div className="mt-3 space-y-2 text-xs text-stone-500">
          <div className="flex items-start gap-3">
            <span className="text-base">📤</span>
            <p><strong className="text-stone-700">Share your link</strong> — +1 priority point just for sharing</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-base">✅</span>
            <p><strong className="text-stone-700">Friend signs up</strong> — +5 priority + bonus 🔥</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-base">🎉</span>
            <p><strong className="text-stone-700">Friend completes profile</strong> — +10 priority + another 🔥</p>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleShare('sms')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          💬 Share via text
        </button>
        <button
          onClick={() => handleShare('instagram')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          📸 Share to Instagram
        </button>
        <button
          onClick={handleCopy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          {copied ? '✅ Copied!' : '🔗 Copy invite link'}
        </button>
      </div>

      {/* Your link */}
      <div className="rounded-xl bg-stone-50 p-4">
        <p className="text-xs text-stone-400">Your personal invite link</p>
        <p className="mt-1 text-xs font-mono text-stone-600 break-all">{data.links.default}</p>
      </div>
    </div>
  )
}
