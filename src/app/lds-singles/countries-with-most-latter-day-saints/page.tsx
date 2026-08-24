import Link from 'next/link'
import ArticleShell, { HeroCopy, Paras, SectionHeading, WaitlistCta, SourceNote } from '@/components/seo/ArticleShell'
import WaitlistForm from '@/components/WaitlistForm'
import { COUNTRY_CONTENT } from '@/content/country-pages'
import countryData from '@/data/seo-countries.json'

export const metadata = {
  title: 'The 30 Countries With the Most Latter-day Saints (2026)',
  description:
    'Brazil just passed Mexico as the second-largest Latter-day Saint country on earth. The full top 30 by membership, what changed since 2019, and where the growth actually is.',
  alternates: { canonical: '/lds-singles/countries-with-most-latter-day-saints' },
}

const fmt = (n: number) => n.toLocaleString('en-US')

// Country name → PLY page (in its own language).
const PAGE_LINKS: Record<string, string> = {
  Mexico: '/es/solteros-sud/mexico',
  Brazil: '/pt/namoro-sud/brasil',
  Philippines: '/lds-singles/philippines',
  Peru: '/es/solteros-sud/peru',
  Chile: '/es/solteros-sud/chile',
  Argentina: '/es/solteros-sud/argentina',
  Guatemala: '/es/solteros-sud/guatemala',
  Ecuador: '/es/solteros-sud/ecuador',
  Nigeria: '/lds-singles/nigeria',
}

export default function Page() {
  const current = new Map(countryData.countries.map(c => [c.en, c.members]))
  return (
    <ArticleShell
      crumb={{ href: '/lds-singles', label: 'All cities & countries' }}
      hero={
        <>
          <HeroCopy h1="The countries with the most Latter-day Saints" hook="A matchmaker, not another swipe app: one real introduction a day, with the reason you two would work." />
          <WaitlistForm source="seo-ranking-countries" />
        </>
      }
    >
      
      <Paras
        paras={[
          `The Church of Jesus Christ of Latter-day Saints counts over 17 million members worldwide, and most of them are not in the United States. The table below is the top 30 countries by official membership (2023 statistics, the most recent full ranking the Church has published), with each country's 2019 rank for comparison.`,
          `The headline change since: Brazil passed Mexico in 2025 to become the second-largest Latter-day Saint country on earth — by the Church's own year-end 2025 statistics, Brazil counts 1,573,360 members to Mexico's 1,572,287. A thousand-member margin after decades of Mexico holding second place.`,
        ]}
      />
      <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3 text-right">Members (2023)</th>
              <th className="px-4 py-3 text-right">2019 rank</th>
            </tr>
          </thead>
          <tbody>
            {countryData.top30.map(row => (
              <tr key={row.country} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-2.5 text-stone-400">{row.rank}</td>
                <td className="px-4 py-2.5 font-medium text-stone-900">
                  {PAGE_LINKS[row.country] ? (
                    <Link href={PAGE_LINKS[row.country]} className="underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900">
                      {row.country}
                    </Link>
                  ) : (
                    row.country
                  )}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-stone-900">{fmt(row.members2023)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-stone-500">
                  {row.rank2019 === row.rank ? '—' : `was #${row.rank2019}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-stone-100 px-4 py-3 text-xs text-stone-400">
          2023 official statistics (Church News). Where a country has moved since 2019, the old rank
          is shown. Year-end 2025 figures for the top-10 countries appear on their linked pages.
        </p>
      </div>
      <SectionHeading>Where the growth is</SectionHeading>
      <Paras
        paras={[
          `Read the movement column and one continent jumps out. Nigeria climbed from #13 to #10 — it now counts ${fmt(current.get('Nigeria') ?? 274043)} members meeting in 880 congregations, the fastest rise of any large membership. The Democratic Republic of the Congo made the biggest leap on the list, #28 to #22. Ghana climbed too. African membership is young, first-generation, and growing at a pace the rest of the Church hasn't seen in decades.`,
          `Latin America remains the Church's second continent: six of the top ten countries are Spanish-speaking, together holding nearly four million members, with Brazil's Portuguese-speaking million and a half alongside. And the Philippines — #4, at ${fmt(current.get('Philippines') ?? 905082)} members with five temples under construction at once — is the Church's Asian center of gravity.`,
        ]}
      />
      <SectionHeading>The singles behind these numbers</SectionHeading>
      <Paras
        paras={[
          `Every country on this list has the same unwritten statistic: a generation of single young adults navigating small local pools, big distances, and meeting mechanisms that run on luck. That's the population People Like You is building for. Country-by-country, honestly:`,
        ]}
      />
      <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-stone-600">
        {countryData.countries.map(c => (
          <li key={c.slug}>
            <Link
              className="font-semibold text-stone-900 underline underline-offset-4"
              href={PAGE_LINKS[c.en] ?? `/lds-singles/${c.slug}`}
            >
              {COUNTRY_CONTENT[c.slug]?.h1 ?? c.en}
            </Link>
          </li>
        ))}
      </ul>
      <WaitlistCta
        title="In the United States?"
        body="People Like You is live on the waitlist in U.S. metros now — one real introduction a day, with the reason you two would work."
        button="Join the waitlist ↑"
      />
      <SourceNote>
        Top-30 ranking: official 2023 statistics as published by Church News (&ldquo;Countries with
        the most Latter-day Saints,&rdquo; 2024). Year-end 2025 membership figures cited in the text
        are from the Church&rsquo;s official country statistics pages (churchofjesuschrist.org),
        as of 31 December 2025. Official membership counts everyone on the records of the Church
        and is not an estimate of activity.
      </SourceNote>
    </ArticleShell>
  )
}
