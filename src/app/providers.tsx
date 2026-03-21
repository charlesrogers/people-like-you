'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init('phc_Nqt473j5rO9hJ2HRlYyAtb25sbtB6SL9sVuYEWF0hLG', {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
