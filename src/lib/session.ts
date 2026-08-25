'use client'

/**
 * One owner for the browser session.
 *
 * These three keys were being read and cleared by hand in five different files,
 * which is how a fresh signup ended up inheriting the previous user's state.
 * Everything that touches the session goes through here.
 */
const ACCESS = 'ply_access_token'
const REFRESH = 'ply_refresh_token'
const PROFILE = 'ply_profile_id'

export const SESSION_KEYS = [ACCESS, REFRESH, PROFILE] as const

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn() } catch { return fallback }
}

export function getStoredUserId(): string | null {
  return safe(() => localStorage.getItem(PROFILE), null)
}

export function getRefreshToken(): string | null {
  return safe(() => localStorage.getItem(REFRESH), null)
}

export function hasSession(): boolean {
  return getStoredUserId() !== null
}

export function saveSession(opts: { userId?: string | null; accessToken?: string | null; refreshToken?: string | null }) {
  safe(() => {
    if (opts.userId) localStorage.setItem(PROFILE, opts.userId)
    if (opts.accessToken) localStorage.setItem(ACCESS, opts.accessToken)
    if (opts.refreshToken) localStorage.setItem(REFRESH, opts.refreshToken)
  }, undefined)
}

/** Clears every session key. Nothing else should remove them individually. */
export function clearSession() {
  safe(() => { for (const k of SESSION_KEYS) localStorage.removeItem(k) }, undefined)
}

/** Clear and go somewhere. The only sanctioned way out of a session. */
export function signOut(redirectTo = '/') {
  clearSession()
  safe(() => { window.location.href = redirectTo }, undefined)
}
