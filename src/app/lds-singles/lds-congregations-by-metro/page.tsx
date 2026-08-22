import Link from 'next/link'
import ArticleShell, { Paras, JsonLd, WaitlistCta, SourceNote } from '@/components/seo/ArticleShell'
import { METRO_CONTENT } from '@/content/metro-pages'
import rankings from '@/data/seo-rankings.json'
import metros from '@/data/seo-metros.json'

export const metadata = {
  title: 'LDS Congregations and Members in All 869 U.S. Metros',
  description:
    'The complete reference: Latter-day Saint congregations, members, and share of population for every U.S. metro and micro area, from the 2020 U.S. Religion Census.',
  alternates: { canonical: '/lds-singles/lds-congregations-by-metro' },
}

const fmt = (n: number) => n.toLocaleString('en-US')
const PAGE_BY_CBSA = new Map(metros.map(m => [m.cbsa, m.slug]))

const datasetJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Latter-day Saint congregations and adherents by U.S. metro area, 2020',
  description:
    'Congregations, adherents, and share of population for The Church of Jesus Christ of Latter-day Saints in all 869 U.S. metropolitan and micropolitan statistical areas, from the 2020 U.S. Religion Census.',
  creator: { '@type': 'Organization', name: 'Association of Statisticians of American Religious Bodies (2020 U.S. Religion Census)' },
  url: 'https://people-like-you.com/lds-singles/lds-congregations-by-metro',
  isBasedOn: 'https://www.usreligioncensus.org/',
  temporalCoverage: '2020',
  spatialCoverage: 'United States',
}

export default function Page() {
  return (
    <ArticleShell>
      <JsonLd data={datasetJsonLd} />
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-stone-900">
        LDS congregations and members: every U.S. metro
      </h1>
      <Paras
        paras={[
          `How many Latter-day Saints live in your metro? This is the complete answer for all 869 U.S. metropolitan and micropolitan areas — congregations, members, and share of population — from the 2020 U.S. Religion Census, ranked by membership. Congregations count all wards and branches; the census does not break out singles wards.`,
        ]}
      />
      <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Metro / micro area</th>
              <th className="px-4 py-3 text-right">Members</th>
              <th className="px-4 py-3 text-right">Congregations</th>
              <th className="px-4 py-3 text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {rankings.all.map((m, i) => {
              const slug = PAGE_BY_CBSA.get(m.cbsa)
              return (
                <tr key={m.cbsa} className="border-b border-stone-100 last:border-0">
                  <td className="px-3 py-2 text-stone-400">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-stone-900">
                    {slug && METRO_CONTENT[slug] ? (
                      <Link href={`/lds-singles/${slug}`} className="underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900">
                        {m.name}
                      </Link>
                    ) : (
                      m.name
                    )}
                    {m.micro && <span className="ml-1.5 text-[10px] font-normal uppercase text-stone-400">micro</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-stone-700">{fmt(m.adherents)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-stone-500">{fmt(m.cong)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-stone-500">{m.pct}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <WaitlistCta
        slug="ranking-all-metros"
        title="Single where you are?"
        body="People Like You is a matchmaker — one real introduction a day, chosen on actual compatibility, with the reason attached. Each metro opens once enough people nearby join the waitlist."
        button="Join the waitlist"
      />
      <SourceNote>
        Source: 2020 U.S. Religion Census, Religious Congregations &amp; Membership Study
        (usreligioncensus.org), sheet &ldquo;2020 Group by Metro.&rdquo; Adherents are as counted
        by the census. Share is adherents as a percentage of total metro population.
      </SourceNote>
    </ArticleShell>
  )
}
