/**
 * Simple in-memory rate limiter for auth endpoints.
 * Limits by IP address. Resets on container restart (acceptable for our scale).
 */

const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  ip: string,
  { maxAttempts = 10, windowMs = 60_000 } = {}
): { ok: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: maxAttempts - 1 }
  }

  entry.count++
  if (entry.count > maxAttempts) {
    return { ok: false, remaining: 0 }
  }

  return { ok: true, remaining: maxAttempts - entry.count }
}
