import type { MetadataRoute } from 'next'

// Only the pre-launch marketing surface is crawlable. Everything behind the
// waitlist — the member app, the invite/vouch links, the admin tools — is
// private or single-use and must never appear in an index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin',
        '/dashboard',
        '/onboarding',
        '/calibrate',
        '/feedback',
        '/vouch/',
        '/join/',
      ],
    },
    sitemap: 'https://people-like-you.com/sitemap.xml',
  }
}
