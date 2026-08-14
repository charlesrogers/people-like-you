'use client'

import { useState, useEffect, useRef } from 'react'

interface MetroCountdown {
  name: string
  women: number; men: number; total: number
  minWomen: number; minTotal: number; maxRatio: number
  womenToGo: number; totalToGo: number
  genderTracked: boolean; ready: boolean
}

type Result = {
  position: number | null
  referralCode: string | null
  referrals: number
  city: string | null
  state: string | null
  metro: MetroCountdown | null
  already: boolean
}

// Display a US phone as (801) 555-0123 while they type.
function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

export default function WaitlistCapture() {
  const [phone, setPhone] = useState('')
  const [zipcode, setZipcode] = useState('')
  const [ref, setRef] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState<'link' | 'message' | null>(null)

  // Focus the dialog itself, not a control inside it — focusing the bottom "Done"
  // button made the browser scroll the popup past its own headline on open.
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setRef(p.get('ref'))
    setSource(p.get('utm_source') || p.get('utm_campaign'))
  }, [])

  // Lock background scroll and move focus into the popup while it's open.
  useEffect(() => {
    if (!result) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus({ preventScroll: true })
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setResult(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [result])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, zipcode, ref, source }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }
      setResult({
        position: data.position ?? null,
        referralCode: data.referralCode ?? null,
        referrals: data.referrals ?? 0,
        city: data.city ?? null,
        state: data.state ?? null,
        metro: data.metro ?? null,
        already: !!data.alreadyJoined,
      })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const placeName = result?.city
    ? `${result.city}${result.state ? `, ${result.state}` : ''}`
    : result?.metro?.name || 'your area'

  const shareUrl = result?.referralCode
    ? `https://people-like-you.com/?ref=${result.referralCode}`
    : 'https://people-like-you.com/'

  const inviteMessage =
    `ok this one's actually different — it's a matchmaker, not another swipe app. ` +
    `One real introduction a day and they do the picking.\n\n` +
    `It opens in ${placeName} once enough of us are on the list, and I'm already in line. ` +
    `Use my link so we both get in early + double intros the first week:\n${shareUrl}`

  function copy(text: string, which: 'link' | 'message') {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(which)
        setTimeout(() => setCopied(null), 2000)
      })
      .catch(() => setError('Could not copy — you can select the text manually.'))
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--dark)] flex flex-col items-center px-6 py-12 sm:py-20">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="text-2xl font-bold tracking-tight">
            P<span className="italic text-[var(--neon-dim)]">L</span>Y
          </span>
        </div>

        <h1 className="mt-8 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl">
          A matchmaker for people who{' '}
          <span className="italic">date to marry</span>.
        </h1>
        <p className="mt-4 text-lg font-medium text-[var(--dark)]/60">
          One real introduction a day — picked by someone who knows what you&rsquo;re actually
          looking for. No swiping. No feed.
          <span className="font-bold text-[var(--dark)]"> No wondering if he&rsquo;s serious.</span>
        </p>

        {/* Value props — why this is different, in the three seconds they'll give us. */}
        <ul className="mt-7 space-y-3">
          {[
            ['💛', 'One a day, not a hundred', 'You get one person, chosen on purpose, with the reason why. Then you decide.'],
            ['🙈', 'You’re not a card in a deck', 'Nobody scrolls past your face. She sees the introduction first — and she goes first.'],
            ['📍', 'We open one ZIP at a time', 'Enough people near you have to join before we launch there. Yours counts.'],
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

        <p className="mt-7 text-base font-bold">
          Add your number and ZIP. You&rsquo;re in the moment we open near you.
        </p>

        <form onSubmit={submit} className="mt-8 rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <label htmlFor="wl-phone" className="sr-only">Phone number</label>
          <input
            id="wl-phone"
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={e => setPhone(formatPhone(e.target.value))}
            placeholder="Phone number"
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[var(--dark)]"
          />

          <label htmlFor="wl-zip" className="sr-only">ZIP code</label>
          <input
            id="wl-zip"
            inputMode="numeric"
            required
            autoComplete="postal-code"
            value={zipcode}
            onChange={e => setZipcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="ZIP code"
            className="mt-3 w-full rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[var(--dark)]"
          />

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-full bg-[var(--dark)] px-6 py-4 text-base font-bold text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? 'Saving your spot…' : 'Get early access'}
          </button>
          <p className="mt-3 text-center text-[11px] text-[var(--dark)]/40">
            One text when we open near you. That&rsquo;s it — no spam, no daily nudges.
          </p>
        </form>
      </div>

      {/* ══════ SUCCESS POPUP ══════ */}
      {result && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={e => { if (e.target === e.currentTarget) setResult(null) }}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wl-dialog-title"
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
          >
            <div className="text-center">
              <div className="text-4xl">🎉</div>
              <h2 id="wl-dialog-title" className="mt-3 text-3xl font-extrabold tracking-tight">
                {result.already ? 'You’re already on the list' : `We’re launching in ${placeName} soon.`}
              </h2>
              <p className="mt-3 text-[var(--dark)]/60">
                {result.position ? (
                  <>
                    You&rsquo;re{' '}
                    <span className="font-extrabold text-[var(--dark)]">#{result.position.toLocaleString()}</span>
                    {result.metro ? <> in {result.metro.name}</> : ' in line'}. We open each city once
                    enough people nearby have joined — so your spot is what decides where we go first.
                  </>
                ) : (
                  <>You&rsquo;re on the list. We open each city once enough people nearby have joined.</>
                )}
              </p>
            </div>

            {/* Metro countdown — the "open your city" rallying mechanic (T16b). */}
            {result.metro && !result.metro.ready && (() => {
              // Gender isn't collected on the phone+ZIP form, so show the headcount
              // countdown unless this metro actually has gender data behind it.
              const useWomen = result.metro.genderTracked
              const have = useWomen ? result.metro.women : result.metro.total
              const need = useWomen ? result.metro.minWomen : result.metro.minTotal
              const toGo = useWomen ? result.metro.womenToGo : result.metro.totalToGo
              return (
                <div className="mt-5 rounded-2xl bg-[var(--cream)] p-4">
                  <p className="text-sm font-bold">
                    {result.metro.name} opens when {need}{useWomen ? ' women' : ' people'} join.
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full bg-[var(--dark)]"
                      style={{ width: `${Math.min(100, Math.round((have / Math.max(1, need)) * 100))}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--dark)]/60">
                    {have} of {need} — {toGo} to go. Every friend you invite gets your city there faster.
                  </p>
                </div>
              )
            })()}

            {result.metro?.ready && (
              <p className="mt-5 rounded-2xl bg-[var(--cream)] p-4 text-sm font-bold">
                {result.metro.name} has hit critical mass — you&rsquo;re in the first launch group. 🎉
              </p>
            )}

            <div className="mt-6 rounded-2xl bg-[var(--cream)] p-5">
              <h3 className="text-lg font-extrabold tracking-tight">
                Want in sooner — and more matches?
              </h3>
              <p className="mt-2 text-sm text-[var(--dark)]/70">
                Every friend who joins moves you up <span className="font-bold text-[var(--dark)]">25
                spots</span> — and gets you <span className="font-bold text-[var(--dark)]">two
                introductions a day instead of one</span> for a week once we open. Invite three,
                and that runs for three weeks.
              </p>
              {result.referrals > 0 && (
                <p className="mt-2 text-sm font-bold">
                  {result.referrals} friend{result.referrals === 1 ? ' has' : 's have'} joined with your link.
                </p>
              )}

              <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-[var(--dark)]/40">
                Copy this and send it
              </p>
              <div className="mt-2 whitespace-pre-wrap rounded-xl border border-black/10 bg-white p-3 text-sm text-[var(--dark)]/80">
                {inviteMessage}
              </div>
              <button
                onClick={() => copy(inviteMessage, 'message')}
                className="mt-3 w-full rounded-full bg-[var(--dark)] px-6 py-3 text-base font-bold text-white transition hover:scale-[1.02] active:scale-95"
              >
                {copied === 'message' ? 'Copied — now paste it to a friend!' : 'Copy invite message'}
              </button>

              <div className="mt-3 flex items-center gap-2 rounded-xl border border-black/10 bg-white p-2">
                <span className="flex-1 truncate px-2 text-sm text-[var(--dark)]/60">{shareUrl}</span>
                <button
                  onClick={() => copy(shareUrl, 'link')}
                  className="rounded-lg bg-[var(--dark)] px-4 py-2 text-sm font-semibold text-white"
                >
                  {copied === 'link' ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setResult(null)}
              className="mt-5 w-full rounded-full px-6 py-3 text-sm font-semibold text-[var(--dark)]/50 transition hover:text-[var(--dark)]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
