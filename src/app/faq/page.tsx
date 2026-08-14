import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'

export const metadata = {
  title: 'FAQ — People Like You',
  description: 'Common questions about People Like You, the matchmaker that sends one real introduction a day.',
}

/**
 * Pre-launch FAQ. Every answer here is true as of today — no pricing promises (pricing
 * isn't set), no launch dates (a city opens on density, not a calendar). If an answer
 * would require inventing a commitment, the question isn't on this page.
 */
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What is People Like You?',
    a: (
      <>
        A matchmaker, not a dating app. Instead of handing you a feed to sort through, we
        learn who you actually are and introduce you to one person a day — with a tailored
        preview of why the two of you would like each other.
      </>
    ),
  },
  {
    q: 'How is this different from swiping?',
    a: (
      <>
        There&rsquo;s no feed and no deck. You aren&rsquo;t browsing strangers and strangers
        aren&rsquo;t browsing you. Every introduction is chosen on purpose and comes with the
        reason behind it, so a first conversation starts with something real instead of
        &ldquo;hey.&rdquo;
      </>
    ),
  },
  {
    q: 'When will you open near me?',
    a: (
      <>
        We open one city at a time, and a city opens once enough people nearby have joined —
        it&rsquo;s density, not a date on a calendar. That&rsquo;s exactly why we ask for your
        ZIP: it tells us where people are actually waiting. You&rsquo;ll see your city&rsquo;s
        progress the moment you join.
      </>
    ),
  },
  {
    q: 'Why do you need my phone number?',
    a: (
      <>
        So we can tell you the day we open in your area. That&rsquo;s one text — no daily
        nudges, no marketing blasts.
      </>
    ),
  },
  {
    q: 'How do I get in sooner?',
    a: (
      <>
        Invite people. Every friend who joins with your link moves you up 25 spots, and earns
        you two introductions a day instead of one for your first week once we open. Invite
        three and that runs for three weeks. It also helps your city hit the number it needs
        to open at all.
      </>
    ),
  },
  {
    q: 'Who is it for?',
    a: (
      <>
        People who date with marriage in mind. If you&rsquo;re looking for something casual,
        this is the wrong product — and we&rsquo;d rather say so now.
      </>
    ),
  },
  {
    q: 'What does it cost?',
    a: (
      <>
        Joining the waitlist is free. We haven&rsquo;t set pricing for the app itself yet, and
        nothing will ever be charged without telling you first.
      </>
    ),
  },
  {
    q: 'Is my information safe?',
    a: (
      <>
        We do not sell your personal data. We share it only with the providers that run the
        service — hosting, and the AI services that help build your profile. The full detail is
        in our{' '}
        <Link href="/privacy" className="font-semibold text-stone-900 underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </>
    ),
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Link href="/" className="text-sm font-medium text-stone-400 transition hover:text-stone-600">
          &larr; Back
        </Link>

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-stone-900">
          Questions, answered
        </h1>
        <p className="mt-2 text-sm text-stone-400">
          Everything below is true today. We&rsquo;d rather leave a question off this page than
          guess at the answer.
        </p>

        <dl className="mt-10 space-y-8 text-base leading-7 text-stone-600">
          {FAQS.map(({ q, a }) => (
            <div key={q}>
              <dt className="text-lg font-semibold text-stone-900">{q}</dt>
              <dd className="mt-2">{a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-base font-semibold text-stone-900">Still wondering something?</p>
          <p className="mt-1 text-sm text-stone-500">
            Email{' '}
            <a
              href="mailto:hello@people-like-you.com"
              className="font-semibold text-stone-900 underline underline-offset-4"
            >
              hello@people-like-you.com
            </a>{' '}
            and a person will answer.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
          >
            Get early access
          </Link>
        </div>

        <div className="text-stone-900">
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}
