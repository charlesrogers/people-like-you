'use client'

import SiteFooter from '@/components/SiteFooter'
import WaitlistForm, { formatPhone } from '@/components/WaitlistForm'

// Re-exported for the formatter's keystroke tests and any existing importers.
export { formatPhone }

/**
 * The root/waitlist landing page. The form + success popup live in WaitlistForm so the
 * organic pages can reuse the identical conversion surface; this component owns only the
 * landing page's shell and its locked copy (T16d — do not edit without Charles).
 */
export default function WaitlistCapture() {
  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--dark)] flex flex-col items-center px-6 py-12 sm:py-20">
      <div className="w-full max-w-md">
        <div className="text-center">
          {/* Spell the name out: "PLY" means nothing to someone arriving from an ad. Never
              tint it with --neon-dim — that's yellow on a yellow (--cream) background. */}
          <span className="text-xl font-bold tracking-tight sm:text-2xl">
            People <span className="italic">Like</span> You
          </span>
        </div>

        <h1 className="mt-8 text-4xl font-extrabold tracking-tight leading-[1.05] sm:text-5xl">
          Matches won&rsquo;t get you married. You need a{' '}
          <span className="italic">spark</span>.
        </h1>
        <p className="mt-4 text-lg font-medium text-[var(--dark)]/60">
          People Like You starts every introduction with a tailored preview of why you&rsquo;d
          like them (and we tell them why they&rsquo;d like you). It&rsquo;s like you&rsquo;ve
          already had the first date. No cold opens. No fishing for something to say.
          <span className="font-bold text-[var(--dark)]"> Just the best odds that the right
          person doesn&rsquo;t slip past you in a sea 🌊 of swipes.</span>
        </p>

        <WaitlistForm />
      </div>

      <SiteFooter />
    </div>
  )
}
