import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'

/**
 * Shared shell for the organic content pages (/lds-singles/*, /es/*, /pt/*).
 * Follows the /faq idiom: stone palette, narrow reading column, CTA handled by the
 * page itself (US pages link to the waitlist; international pages embed the form).
 */
export default function ArticleShell({
  backHref = '/lds-singles',
  backLabel = 'All cities & countries',
  lang,
  children,
}: {
  backHref?: string
  backLabel?: string
  lang?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white" lang={lang}>
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <Link href={backHref} className="text-sm font-medium text-stone-400 transition hover:text-stone-600">
          &larr; {backLabel}
        </Link>
        {children}
        <div className="text-stone-900">
          <SiteFooter />
        </div>
      </div>
    </div>
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
  )}

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

/** CTA card for US metro pages — links into the waitlist with attribution. */
export function WaitlistCta({ slug, title, body, button }: { slug: string; title: string; body: string; button: string }) {
  return (
    <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
      <p className="text-lg font-bold text-stone-900">{title}</p>
      <p className="mt-2 text-base leading-7 text-stone-600">{body}</p>
      <Link
        href={`/?utm_source=seo&utm_campaign=${slug}`}
        className="mt-5 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-95"
      >
        {button}
      </Link>
    </div>
  )
}

export function SourceNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-10 border-t border-stone-200 pt-4 text-xs leading-5 text-stone-400">{children}</p>
}
