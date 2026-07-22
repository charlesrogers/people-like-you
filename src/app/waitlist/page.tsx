'use client'

import { useState, useEffect } from 'react'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [gender, setGender] = useState<'Man' | 'Woman' | ''>('')
  const [ref, setRef] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ position: number | null; referralCode: string | null; already: boolean } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setRef(p.get('ref'))
    setSource(p.get('utm_source') || p.get('utm_campaign'))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, zipcode, gender: gender || undefined, ref, source }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setDone({ position: data.position ?? null, referralCode: data.referralCode ?? null, already: !!data.alreadyJoined })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const shareUrl = done?.referralCode
    ? `https://people-like-you.com/waitlist?ref=${done.referralCode}`
    : 'https://people-like-you.com/waitlist'

  function copyShare() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--dark)] flex flex-col items-center px-6 py-12 sm:py-20">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="text-2xl font-bold tracking-tight">
            P<span className="italic text-[var(--neon-dim)]">L</span>Y
          </span>
        </div>

        {!done ? (
          <>
            <h1 className="mt-8 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl">
              Get early access to{' '}
              <span className="italic">People Like You</span>.
            </h1>
            <p className="mt-4 text-lg font-medium text-[var(--dark)]/60">
              The matchmaker that knows you better than your friends do. One real introduction a day.
              <span className="font-bold text-[var(--dark)]"> Never swipe again.</span>
            </p>

            {/* Benefits */}
            <ul className="mt-7 space-y-3">
              {[
                ['⚡', 'Priority access', 'We fold people in over time. The sooner you join, the sooner you’re in.'],
                ['📍', 'Help pick your city', 'We launch city by city. Your spot tells us where to open first.'],
                ['💌', 'Founding member perks', 'Early members get founding status when we open the doors.'],
              ].map(([icon, title, body]) => (
                <li key={title} className="flex gap-3">
                  <span className="text-xl leading-none" aria-hidden>{icon}</span>
                  <span>
                    <span className="font-bold">{title}.</span>{' '}
                    <span className="text-[var(--dark)]/60">{body}</span>
                  </span>
                </li>
              ))}
            </ul>

            <form onSubmit={submit} className="mt-8 rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[var(--dark)]"
              />
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Phone (optional — for launch texts)"
                className="mt-3 w-full rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[var(--dark)]"
              />
              <input
                inputMode="numeric" value={zipcode} onChange={e => setZipcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="ZIP code (so we know where to launch)"
                className="mt-3 w-full rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[var(--dark)]"
              />
              <div className="mt-3 flex gap-2">
                {(['Woman', 'Man'] as const).map(g => (
                  <button
                    key={g} type="button" onClick={() => setGender(gender === g ? '' : g)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      gender === g ? 'border-[var(--dark)] bg-[var(--dark)] text-white' : 'border-black/10 text-[var(--dark)]/70 hover:border-[var(--dark)]/30'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              <button
                type="submit" disabled={submitting}
                className="mt-4 w-full rounded-full bg-[var(--dark)] px-6 py-4 text-base font-bold text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? 'Joining…' : 'Join the waitlist'}
              </button>
              <p className="mt-3 text-center text-[11px] text-[var(--dark)]/40">
                No spam. We&rsquo;ll only email you about your spot and launch.
              </p>
            </form>
          </>
        ) : (
          <div className="mt-10 rounded-3xl bg-white p-7 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="text-4xl">🎉</div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
              {done.already ? 'You’re already on the list' : 'You’re on the list!'}
            </h1>
            {done.position && (
              <p className="mt-2 text-lg font-medium text-[var(--dark)]/60">
                You&rsquo;re <span className="font-extrabold text-[var(--dark)]">#{done.position.toLocaleString()}</span> in line.
              </p>
            )}
            <p className="mt-5 text-[var(--dark)]/70">
              Want in sooner? Share your link — every friend who joins moves you up.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-black/10 p-2">
              <span className="flex-1 truncate px-2 text-sm text-[var(--dark)]/60">{shareUrl}</span>
              <button onClick={copyShare} className="rounded-lg bg-[var(--dark)] px-4 py-2 text-sm font-semibold text-white">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
