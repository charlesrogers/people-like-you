'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'

export type IntlFormStrings = {
  title: string
  body: string
  placeholder: string
  button: string
  saving: string
  successTitle: string
  successBody: string
  shareLabel: string
  copied: string
  privacy: string
  invalid: string
  generic: string
}

/**
 * Waitlist capture for countries PLY hasn't reached. Phone + fixed country — no ZIP
 * (US-only concept) and no metro. Honest Scenario-C framing: the page never implies
 * service exists in-country; strings are provided per page in the page's language.
 */
export default function IntlWaitlistForm({ country, campaign, strings: s }: {
  country: string // ISO-3166 alpha-2, e.g. 'MX'
  campaign: string // e.g. 'country-mexico'
  strings: IntlFormStrings
}) {
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ referralCode: string | null } | null>(null)
  const [copied, setCopied] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, country, source: `seo-${campaign}` }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(res.status === 400 ? s.invalid : data.error || s.generic)
        return
      }
      setResult({ referralCode: data.referralCode ?? null })
      track(data.alreadyJoined ? 'waitlist_already_joined' : 'waitlist_signup', {
        country,
        source: `seo-${campaign}`,
        international: true,
      })
    } catch {
      setError(s.generic)
    } finally {
      setSubmitting(false)
    }
  }

  const shareUrl = result?.referralCode
    ? `https://people-like-you.com/?ref=${result.referralCode}`
    : 'https://people-like-you.com/'

  if (result) {
    return (
      <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
        <p className="text-lg font-bold text-stone-900">🎉 {s.successTitle}</p>
        <p className="mt-2 text-base leading-7 text-stone-600">{s.successBody}</p>
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-stone-400">{s.shareLabel}</p>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-2">
          <span className="flex-1 truncate px-2 text-sm text-stone-500">{shareUrl}</span>
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl).then(() => setCopied(true)).catch(() => {})}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white"
          >
            {copied ? s.copied : 'Copy'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
      <p className="text-lg font-bold text-stone-900">{s.title}</p>
      <p className="mt-2 text-base leading-7 text-stone-600">{s.body}</p>
      <input
        type="tel"
        required
        autoComplete="tel"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder={s.placeholder}
        className="mt-4 w-full rounded-xl border border-stone-200 px-4 py-3 text-base outline-none focus:border-stone-900"
      />
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-full bg-stone-900 px-6 py-3.5 text-base font-bold text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
      >
        {submitting ? s.saving : s.button}
      </button>
      <p className="mt-3 text-center text-[11px] text-stone-400">{s.privacy}</p>
    </form>
  )
}
