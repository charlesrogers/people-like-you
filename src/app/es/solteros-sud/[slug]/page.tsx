import { notFound } from 'next/navigation'
import CountryArticle from '@/components/seo/CountryArticle'
import { COUNTRY_CONTENT } from '@/content/country-pages'

// Spanish country pages: /es/solteros-sud/mexico, /peru, /chile, /argentina, /guatemala, /ecuador
const ES_SLUGS = Object.values(COUNTRY_CONTENT).filter(c => c.lang === 'es').map(c => c.slug)

export const dynamicParams = false

export function generateStaticParams() {
  return ES_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = COUNTRY_CONTENT[slug]
  if (!c || c.lang !== 'es') return {}
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `/es/solteros-sud/${slug}` },
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!ES_SLUGS.includes(slug)) notFound()
  return <CountryArticle slug={slug} backHref="/es/solteros-sud" />
}
