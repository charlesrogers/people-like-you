import { notFound } from 'next/navigation'
import ArticleShell, {
  SectionHeading, Paras, StatsTable, FaqBlock, faqJsonLd, JsonLd, WaitlistCta, SourceNote,
} from '@/components/seo/ArticleShell'
import CountryArticle from '@/components/seo/CountryArticle'
import { METRO_CONTENT } from '@/content/metro-pages'
import { COUNTRY_CONTENT } from '@/content/country-pages'
import metros from '@/data/seo-metros.json'

// /lds-singles/[slug] serves the US metro pages and the English-language country pages
// (Philippines, Nigeria). Spanish and Portuguese country pages live under /es and /pt.
const EN_COUNTRIES = ['philippines', 'nigeria']

export const dynamicParams = false

export function generateStaticParams() {
  return [...Object.keys(METRO_CONTENT), ...EN_COUNTRIES].map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = METRO_CONTENT[slug] ?? COUNTRY_CONTENT[slug]
  if (!c) return {}
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `/lds-singles/${slug}` },
  }
}

const fmt = (n: number) => n.toLocaleString('en-US')

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (METRO_CONTENT[slug]) return <MetroPage slug={slug} />
  if (EN_COUNTRIES.includes(slug) && COUNTRY_CONTENT[slug]) return <CountryArticle slug={slug} />
  notFound()
}

function MetroPage({ slug }: { slug: string }) {
  const c = METRO_CONTENT[slug]
  const d = metros.find(m => m.slug === slug)!
  const rows: [string, string][] = [
    ['Latter-day Saints', fmt(d.adherents)],
    ['Congregations', fmt(d.cong)],
    ['Share of metro population', `${d.pct}%`],
    ['National rank (members)', `#${d.rankAdherents} of 869 metros`],
    ['National rank (share)', `#${d.rankPct} of 869 metros`],
  ]
  if (d.pool) rows.push(['Never-married residents 20–34 (all faiths)', fmt(d.pool.total)])
  return (
    <ArticleShell>
      <JsonLd data={faqJsonLd(c.faq)} />
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-stone-900">{c.h1}</h1>
      <Paras paras={c.intro} />
      <SectionHeading>The numbers</SectionHeading>
      <StatsTable
        rows={rows}
        caption={`Sources: 2020 U.S. Religion Census (congregations, adherents); American Community Survey ${d.pool ? `(${d.pool.vintage}, never-married pool)` : ''}. Metro area: ${d.name}.`}
      />
      <SectionHeading>What the numbers mean for dating here</SectionHeading>
      <Paras paras={c.meaning} />
      <SectionHeading>How people actually meet here</SectionHeading>
      <Paras paras={c.meet} />
      <SectionHeading>The rhythm of the year</SectionHeading>
      <Paras paras={c.seasonal} />
      <SectionHeading>The honest problem with this market</SectionHeading>
      <Paras paras={c.honest} />
      <FaqBlock faq={c.faq} heading="Common questions" />
      <WaitlistCta
        slug={`metro-${slug}`}
        title="People Like You is coming here"
        body="PLY is a matchmaker, not another swipe app: one real introduction a day, with the reason you two would work. Each metro opens once enough people nearby have joined — so joining from here is what moves this city up the list."
        button="Join the waitlist"
      />
      <SourceNote>
        Congregation and adherent figures are from the 2020 U.S. Religion Census (Religious
        Congregations &amp; Membership Study, usreligioncensus.org), the standard academic count of
        religious bodies in the United States. &ldquo;Congregations&rdquo; counts all wards and
        branches — the census does not distinguish singles wards. The never-married pool counts all
        residents regardless of religion (Census Bureau, ACS table B12002) and is a ceiling on the
        market, not an LDS count.
      </SourceNote>
    </ArticleShell>
  )
}

