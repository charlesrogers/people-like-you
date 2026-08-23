import Link from 'next/link'

/**
 * Footer for the public pre-launch pages. Only links pages a logged-out visitor can
 * actually use — /feedback, /dashboard and /calibrate all bounce to onboarding, so they
 * stay out. Privacy has to be reachable from the landing page for Meta ad review.
 */
const LINKS = [
  { href: '/faq', label: 'FAQ' },
  { href: '/welcome', label: 'How it works' },
  { href: '/thesis', label: 'Why we built this' },
  // Neutral anchor text on purpose: this footer renders on the Meta ad landing page,
  // where the community must never be named (launch-plan §5). The page it links to may.
  { href: '/lds-singles', label: 'Cities' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
]

export default function SiteFooter() {
  return (
    <footer className="mt-14 w-full max-w-md px-2 text-center">
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="text-[13px] font-semibold text-[var(--dark)]/50 underline-offset-4 transition hover:text-[var(--dark)] hover:underline"
          >
            {l.label}
          </Link>
        ))}
        <a
          href="mailto:hello@people-like-you.com"
          className="text-[13px] font-semibold text-[var(--dark)]/50 underline-offset-4 transition hover:text-[var(--dark)] hover:underline"
        >
          Contact
        </a>
      </nav>
      <p className="mt-4 text-[11px] text-[var(--dark)]/35">© People Like You</p>
    </footer>
  )
}
