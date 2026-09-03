import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SESSION_KEYS, getStoredUserId, getRefreshToken, hasSession, saveSession, clearSession } from '../session'

const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v) },
    removeItem: (k: string) => { store.delete(k) },
  })
})

describe('session module', () => {
  it('owns exactly the three session keys', () => {
    expect([...SESSION_KEYS]).toEqual(['ply_access_token', 'ply_refresh_token', 'ply_profile_id'])
  })

  it('round-trips a saved session', () => {
    saveSession({ userId: 'u1', accessToken: 'a', refreshToken: 'r' })
    expect(getStoredUserId()).toBe('u1')
    expect(getRefreshToken()).toBe('r')
    expect(hasSession()).toBe(true)
  })

  it('clearSession leaves nothing behind — a stale key is how the last account leaked in', () => {
    saveSession({ userId: 'u1', accessToken: 'a', refreshToken: 'r' })
    clearSession()
    for (const k of SESSION_KEYS) expect(store.has(k)).toBe(false)
    expect(hasSession()).toBe(false)
    expect(getStoredUserId()).toBeNull()
  })

  it('partial saves never clobber the other keys', () => {
    saveSession({ userId: 'u1', accessToken: 'a', refreshToken: 'r' })
    saveSession({ accessToken: 'a2' })
    expect(getStoredUserId()).toBe('u1')
    expect(getRefreshToken()).toBe('r')
  })

  it('survives localStorage throwing (private mode, blocked site data)', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
      removeItem: () => { throw new Error('blocked') },
    })
    expect(() => clearSession()).not.toThrow()
    expect(getStoredUserId()).toBeNull()
    expect(hasSession()).toBe(false)
  })
})
