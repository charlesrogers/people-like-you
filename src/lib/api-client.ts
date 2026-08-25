'use client'

import { createBrowserClient } from '@/lib/supabase'
import { clearSession, saveSession, getRefreshToken } from '@/lib/session'

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) return false

      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.refreshSession()
      if (error || !data.session) return false

      saveSession({ accessToken: data.session.access_token, refreshToken: data.session.refresh_token })
      return true
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function clearSessionAndRedirect() {
  clearSession()
  window.location.href = '/onboarding'
}

export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options)

  if (response.status === 401) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return fetch(url, options)
    } else {
      clearSessionAndRedirect()
      return response
    }
  }

  return response
}
