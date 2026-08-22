import type { MetadataRoute } from 'next'

const BASE = 'https://people-like-you.com'

// /waitlist is deliberately absent: it renders the same WaitlistCapture as the
// root and exists only so live Meta ads keep resolving. It canonicalises to /.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-08-22')

  return [
    { url: `${BASE}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/welcome`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/thesis`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
