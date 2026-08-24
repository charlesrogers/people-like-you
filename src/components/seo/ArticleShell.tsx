import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'

/**
 * Shared shell for the organic content pages (/lds-singles/*, /es/*, /pt/*).
 *
 * WAITLIST FIRST (Charles, 2026-08-24): every page opens with the brand-yellow hero —
 * wordmark, page headline, and the actual capture form above the fold, exactly like the
 * landing page. The data/content sits below on white, supporting the conversion.
 */
export default function ArticleShell({
  hero,
  lang,
  crumb,
  children,
}: {
  hero: React.ReactNode
  lang?: string
  crumb?: { href: string; label: string }
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white" lang={lang}>
      <div id="join" className="bg-[var(--cream)] px-6 pb-14 pt-10 text-[var(--dark)] sm:pt-14">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <Link href="/" className="text-xl font-bold tracking-tight sm:text-2xl">
              People <span className="italic">Like</span> You
            </Link>
          </div>
          {hero}
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-6 py-12">
        {crumb && (
          <Link href={crumb.href} className="text-sm font-medium text-stone-400 transition hover:text-stone-600">
            &larr; {crumb.label}
          </Link>
        )}
        {children}
        <div className="text-stone-900">
          <SiteFooter />
        </div>
      </div>
    </div>
  )
}

/** Hero headline + hook, rendered above the capture form inside the yellow block. */
export function HeroCopy({ h1, hook }: { h1: string; hook: string }) {
  return (
    <>
      <h1 className="mt-8 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-[2.75rem]">{h1}</h1>
      <p className="mt-4 text-lg font-medium text-[var(--dark)]/70">{hook}</p>
    </>
  )
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 text-xl font-bold tracking-tight text-stone-900">{children}</h2>
}

export function Paras({ paras }: { paras: string[] }) {
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} className="mt-4 text-base leading-7 text-stone-600">{p}</p>
      ))}
    </>
  )
}

export function StatsTable({ rows, caption }: { rows: [string, string][]; caption?: string }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-stone-100 last:border-0">
              <td className="px-5 py-3 font-medium text-stone-500">{label}</td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-stone-900">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {caption && <p className="border-t border-stone-100 px-5 py-3 text-xs text-stone-400">{caption}</p>}
    </div>
  )
}

export function FaqBlock({ faq, heading }: { faq: { q: string; a: string }[]; heading: string }) {
  return (
    <>
      <SectionHeading>{heading}</SectionHeading>
      <dl className="mt-4 space-y-6">
        {faq.map(({ q, a }) => (
          <div key={q}>
            <dt className="font-semibold text-stone-900">{q}</dt>
            <dd className="mt-1 text-base leading-7 text-stone-600">{a}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}

/** FAQPage JSON-LD, rendered by pages that show a FaqBlock. */
export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}

/** Bottom CTA: sends the reader back up to the hero form (the form is the page's #join). */
export function WaitlistCta({ title, body, button }: { title: string; body: string; button: string }) {
  return (
    <div className="mt-12 rounded-2xl bg-[var(--cream)] p-6 text-[var(--dark)]">
      <p className="text-lg font-extrabold tracking-tight">{title}</p>
      <p className="mt-2 text-base leading-7 text-[var(--dark)]/70">{body}</p>
      <a
        href="#join"
        className="mt-5 inline-block rounded-full bg-[var(--dark)] px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
      >
        {button}
      </a>
    </div>
  )
}

export function SourceNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-10 border-t border-stone-200 pt-4 text-xs leading-5 text-stone-400">{children}</p>
}
