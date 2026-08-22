import type { MetadataRoute } from 'next'
import { METRO_CONTENT } from '@/content/metro-pages'
import { COUNTRY_CONTENT } from '@/content/country-pages'

const BASE = 'https://people-like-you.com'

// Organic content cluster (specs/location-seo-strategy.md + organic-search-international.md).
const RANKING_PAGES = [
  'most-lds-metros',
  'lds-singles-outside-utah',
  'lds-congregations-by-metro',
  'countries-with-most-latter-day-saints',
]

const COUNTRY_PATH: Record<string, (slug: string) => string> = {
  en: slug => `/lds-singles/${slug}`,
  es: slug => `/es/solteros-sud/${slug}`,
  pt: slug => `/pt/namoro-sud/${slug}`,
}

// /waitlist is deliberately absent: it renders the same WaitlistCapture as the
// root and exists only so live Meta ads keep resolving. It canonicalises to /.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-08-22')

  const content: MetadataRoute.Sitemap = [
    { url: `${BASE}/lds-singles`, lastModified, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE}/es/solteros-sud`, lastModified, changeFrequency: 'monthly' as const, priority: 0.6 },
    ...Object.keys(METRO_CONTENT).map(slug => ({
      url: `${BASE}/lds-singles/${slug}`, lastModified, changeFrequency: 'monthly' as const, priority: 0.7,
    })),
    ...RANKING_PAGES.map(slug => ({
      url: `${BASE}/lds-singles/${slug}`, lastModified, changeFrequency: 'monthly' as const, priority: 0.7,
    })),
    ...Object.values(COUNTRY_CONTENT).map(c => ({
      url: `${BASE}${COUNTRY_PATH[c.lang](c.slug)}`, lastModified, changeFrequency: 'monthly' as const, priority: 0.6,
    })),
  ]

  return [
    { url: `${BASE}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/welcome`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/thesis`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
    ...content,
  ]
}
