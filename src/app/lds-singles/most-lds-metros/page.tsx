import Link from 'next/link'
import ArticleShell, { HeroCopy, Paras, SectionHeading, WaitlistCta, SourceNote } from '@/components/seo/ArticleShell'
import WaitlistForm from '@/components/WaitlistForm'
import { METRO_CONTENT } from '@/content/metro-pages'
import rankings from '@/data/seo-rankings.json'
import metros from '@/data/seo-metros.json'

export const metadata = {
  title: 'The 25 Most Latter-day Saint Metros in America, Ranked',
  description:
    'Provo–Orem is 82.6% Latter-day Saint — the highest share of any U.S. metro. The full top 25 by share of population, from the 2020 U.S. Religion Census.',
  alternates: { canonical: '/lds-singles/most-lds-metros' },
}

const fmt = (n: number) => n.toLocaleString('en-US')

// Metros that have a full PLY page get linked from the table.
const PAGE_BY_CBSA = new Map(metros.map(m => [m.cbsa, m.slug]))

export default function Page() {
  return (
    <ArticleShell
      crumb={{ href: '/lds-singles', label: 'All cities & countries' }}
      hero={
        <>
          <HeroCopy h1="The 25 most Latter-day Saint metros in America" hook="One real introduction a day, with the reason you two would work — wherever your metro ranks." />
          <WaitlistForm source="seo-ranking-most-lds-metros" />
        </>
      }
    >
      
      <Paras
        paras={[
          `Ranked by share of population, from the 2020 U.S. Religion Census — the standard academic count of religious congregations and adherents in the United States. Provo–Orem leads the country at 82.6%, the highest share of any metro for any single religious body in America.`,
          `The list is really two lists: the Mormon Corridor (Utah, southern Idaho, and their borders), where the Church is the majority culture — and everywhere else, which starts at #20 and drops off fast. For what the map looks like outside the corridor, see where LDS singles actually live outside Utah.`,
        ]}
      />
      <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Metro</th>
              <th className="px-4 py-3 text-right">Share</th>
              <th className="px-4 py-3 text-right">Members</th>
              <th className="px-4 py-3 text-right">Congregations</th>
            </tr>
          </thead>
          <tbody>
            {rankings.top25Pct.map((m, i) => {
              const slug = PAGE_BY_CBSA.get(m.cbsa)
              return (
                <tr key={m.cbsa} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-2.5 text-stone-400">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-stone-900">
                    {slug && METRO_CONTENT[slug] ? (
                      <Link href={`/lds-singles/${slug}`} className="underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900">
                        {m.name}
                      </Link>
                    ) : (
                      m.name
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums text-stone-900">{m.pct}%</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-stone-600">{fmt(m.adherents)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-stone-600">{fmt(m.cong)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <SectionHeading>What the ranking hides</SectionHeading>
      <Paras
        paras={[
          `Share and size are different questions. Salt Lake City ranks seventh by share but first by raw membership — more than 650,000 Latter-day Saints, the most of any metro on earth. And the biggest LDS populations outside this list aren't small: Phoenix has over 300,000 members and Los Angeles nearly 200,000, more than Boise — they just sit inside metros so large the percentage disappears.`,
          `For singles, the share number matters in a specific way: above roughly 50%, the problem isn't finding members of the Church, it's standing out among them. Below about 5%, it flips — the community is real but you will not stumble into it. Both problems are why People Like You exists.`,
        ]}
      />
      <SectionHeading>More</SectionHeading>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-stone-600">
        <li><Link className="font-semibold text-stone-900 underline underline-offset-4" href="/lds-singles/lds-singles-outside-utah">Where LDS singles actually live outside Utah</Link></li>
        <li><Link className="font-semibold text-stone-900 underline underline-offset-4" href="/lds-singles/lds-congregations-by-metro">LDS congregations and members: all 869 U.S. metros</Link></li>
        <li><Link className="font-semibold text-stone-900 underline underline-offset-4" href="/lds-singles/countries-with-most-latter-day-saints">The countries with the most Latter-day Saints</Link></li>
      </ul>
      <WaitlistCta
        title="Dating where you live"
        body="People Like You is a matchmaker — one real introduction a day, with the reason you two would work. Each metro opens once enough people nearby join the waitlist."
        button="Join the waitlist ↑"
      />
      <SourceNote>
        Source: 2020 U.S. Religion Census, Religious Congregations &amp; Membership Study
        (usreligioncensus.org). Metropolitan statistical areas only; micropolitan areas (e.g.
        Rexburg, ID at 53%) are excluded from this table but included in the full list.
        &ldquo;Members&rdquo; are adherents as counted by the census.
      </SourceNote>
    </ArticleShell>
  )
}
