import posthog from 'posthog-js'

// gtag is injected by <GoogleAnalytics> in layout.tsx, so it may not exist yet on a
// very early interaction, and it never exists for visitors running a content blocker.
declare global {
  interface Window {
    gtag?: (command: 'event', name: string, params?: Record<string, unknown>) => void
  }
}

/**
 * Send one event to both PostHog and GA4.
 *
 * PostHog is the product-analytics system of record; GA4 exists so organic traffic can
 * be attributed — a signup that GA4 never sees cannot be tied back to the landing page
 * or the search query that produced it, which is the whole reason GA4 is installed.
 *
 * Properties must stay non-identifying: metro and state are fine, phone and ZIP are not.
 */
export function track(event: string, props: Record<string, unknown> = {}) {
  try {
    posthog.capture(event, props)
  } catch {
    // Analytics must never break a conversion flow.
  }
  try {
    window.gtag?.('event', event, props)
  } catch {
    // Blocked or not yet loaded — the PostHog copy still lands.
  }
}
