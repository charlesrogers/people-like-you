'use client'

import { createBrowserClient } from '@/lib/supabase'

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('ply_refresh_token')
      if (!refreshToken) return false

      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.refreshSession()
      if (error || !data.session) return false

      localStorage.setItem('ply_access_token', data.session.access_token)
      localStorage.setItem('ply_refresh_token', data.session.refresh_token)
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
  localStorage.removeItem('ply_access_token')
  localStorage.removeItem('ply_refresh_token')
  localStorage.removeItem('ply_profile_id')
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
