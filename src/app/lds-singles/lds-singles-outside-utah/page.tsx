import Link from 'next/link'
import ArticleShell, { Paras, SectionHeading, WaitlistCta, SourceNote } from '@/components/seo/ArticleShell'
import { METRO_CONTENT } from '@/content/metro-pages'
import rankings from '@/data/seo-rankings.json'
import metros from '@/data/seo-metros.json'

export const metadata = {
  title: 'Where LDS Singles Actually Live Outside Utah',
  description:
    'Los Angeles has more Latter-day Saints than Boise. Phoenix has triple Rexburg. The 15 biggest LDS populations outside the Mormon Corridor — and why dating there is hardest.',
  alternates: { canonical: '/lds-singles/lds-singles-outside-utah' },
}

const fmt = (n: number) => n.toLocaleString('en-US')
const PAGE_BY_CBSA = new Map(metros.map(m => [m.cbsa, m.slug]))

export default function Page() {
  return (
    <ArticleShell>
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-stone-900">
        Where LDS singles actually live outside Utah
      </h1>
      <Paras
        paras={[
          `Ask anyone where America's Latter-day Saints live and you'll hear "Utah." Here's what the 2020 U.S. Religion Census actually shows: Los Angeles has more members than Boise. Phoenix has more than triple Rexburg. Dallas, Seattle, and Houston each hold LDS communities the size of a mid-sized Utah city — they're just invisible inside metros of millions.`,
          `These are the fifteen largest LDS populations outside Utah and Idaho:`,
        ]}
      />
      <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Metro</th>
              <th className="px-4 py-3 text-right">Members</th>
              <th className="px-4 py-3 text-right">Congregations</th>
              <th className="px-4 py-3 text-right">Share</th>
            </tr>
          </thead>
          <tbody>
            {rankings.diaspora.map((m, i) => {
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
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums text-stone-900">{fmt(m.adherents)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-stone-600">{fmt(m.cong)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-stone-600">{m.pct}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <SectionHeading>Why the diaspora is where dating is hardest</SectionHeading>
      <Paras
        paras={[
          `Look at the share column. Phoenix's 300,000 members are 6.2% of the metro. In Los Angeles it's 1.5%; in Dallas, Houston, and the East Coast metros, under 2%. A community that size is real — big enough that the right person for you almost certainly lives there — but it's dissolved into a metro of millions, spread across an hour of freeway in any direction.`,
          `That's the specific way diaspora dating breaks: your ward has four singles your age, the community's activities pull from a fifty-mile radius, and no app sorts twenty million people by the things that actually matter to you. Utah's problem is too many candidates; the diaspora's problem is that the candidates exist and cannot find each other. The second problem is the one a matchmaker was built for.`,
        ]}
      />
      <SectionHeading>More</SectionHeading>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-stone-600">
        <li><Link className="font-semibold text-stone-900 underline underline-offset-4" href="/lds-singles/most-lds-metros">The 25 most Latter-day Saint metros in America</Link></li>
        <li><Link className="font-semibold text-stone-900 underline underline-offset-4" href="/lds-singles/lds-congregations-by-metro">All 869 U.S. metros, ranked</Link></li>
      </ul>
      <WaitlistCta
        slug="ranking-outside-utah"
        title="This is the market we built for"
        body="People Like You finds the compatible people your metro is hiding and introduces you — one real introduction a day, with the reason attached. Each metro opens once enough people nearby join."
        button="Join the waitlist"
      />
      <SourceNote>
        Source: 2020 U.S. Religion Census, Religious Congregations &amp; Membership Study
        (usreligioncensus.org). &ldquo;Outside Utah&rdquo; here means outside Utah and Idaho —
        the Mormon Corridor's core states. Metropolitan areas only.
      </SourceNote>
    </ArticleShell>
  )
}
