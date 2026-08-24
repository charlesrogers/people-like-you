import Link from 'next/link'
import ArticleShell, { HeroCopy, Paras, SectionHeading } from '@/components/seo/ArticleShell'
import WaitlistForm from '@/components/WaitlistForm'
import { METRO_CONTENT } from '@/content/metro-pages'
import { COUNTRY_CONTENT } from '@/content/country-pages'
import metros from '@/data/seo-metros.json'
import countryData from '@/data/seo-countries.json'

export const metadata = {
  title: 'LDS Singles by City & Country — People Like You',
  description:
    'Honest, sourced guides to the Latter-day Saint dating market in the biggest LDS metros and countries — real numbers, real dynamics, no fluff.',
  alternates: { canonical: '/lds-singles' },
}

const fmt = (n: number) => n.toLocaleString('en-US')

const COUNTRY_HREF: Record<string, string> = {
  mexico: '/es/solteros-sud/mexico',
  brasil: '/pt/namoro-sud/brasil',
  peru: '/es/solteros-sud/peru',
  chile: '/es/solteros-sud/chile',
  argentina: '/es/solteros-sud/argentina',
  guatemala: '/es/solteros-sud/guatemala',
  ecuador: '/es/solteros-sud/ecuador',
  philippines: '/lds-singles/philippines',
  nigeria: '/lds-singles/nigeria',
}

function CardList({ items }: { items: { href: string; title: string; sub: string }[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map(i => (
        <li key={i.href}>
          <Link
            href={i.href}
            className="flex items-baseline justify-between gap-4 rounded-2xl border border-stone-200 bg-white px-5 py-4 transition hover:border-stone-300"
          >
            <span className="font-semibold text-stone-900">{i.title}</span>
            <span className="shrink-0 text-sm tabular-nums text-stone-400">{i.sub}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Page() {
  return (
    <ArticleShell
      hero={
        <>
          <HeroCopy
            h1="LDS singles, by the numbers"
            hook="A matchmaker, not another swipe app: one real introduction a day, with the reason you two would work. Join the list — or find your city below."
          />
          <WaitlistForm source="seo-hub" />
        </>
      }
    >
      <Paras
        paras={[
          `These are our honest, sourced guides to the Latter-day Saint dating market: what the community actually looks like where you live, how people actually meet there, and the problem with each market that nobody says out loud.`,
        ]}
      />
      <SectionHeading>United States, by metro</SectionHeading>
      <CardList
        items={metros.map(m => ({
          href: `/lds-singles/${m.slug}`,
          title: METRO_CONTENT[m.slug]?.h1 ?? m.name,
          sub: `${fmt(m.adherents)} members`,
        }))}
      />
      <SectionHeading>Rankings &amp; reference</SectionHeading>
      <CardList
        items={[
          { href: '/lds-singles/most-lds-metros', title: 'The 25 most Latter-day Saint metros in America', sub: '' },
          { href: '/lds-singles/lds-singles-outside-utah', title: 'Where LDS singles actually live outside Utah', sub: '' },
          { href: '/lds-singles/lds-congregations-by-metro', title: 'All 869 U.S. metros, ranked', sub: '' },
          { href: '/lds-singles/countries-with-most-latter-day-saints', title: 'The countries with the most Latter-day Saints', sub: '' },
        ]}
      />
      <SectionHeading>Around the world</SectionHeading>
      <p className="mt-2 text-sm text-stone-400">Each page is written in its country&rsquo;s language.</p>
      <CardList
        items={countryData.countries.map(c => ({
          href: COUNTRY_HREF[c.slug],
          title: COUNTRY_CONTENT[c.slug]?.h1 ?? c.en,
          sub: `${fmt(c.members)} members`,
        }))}
      />
    </ArticleShell>
  )
}
