import { NextRequest } from 'next/server'
import { createServerClient } from './supabase'

/**
 * Extract authenticated user ID from request.
 *
 * Priority:
 * 1. Supabase Auth JWT in Authorization header
 * 2. Fallback: userId query param or body field (backward compat for web app)
 *
 * Returns userId string or null if not authenticated.
 */
export async function getAuthUserId(req: NextRequest): Promise<string | null> {
  // Try Supabase Auth JWT first
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const supabase = createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) {
      return user.id
    }
  }

  // Fallback: query param
  const url = new URL(req.url)
  const queryUserId = url.searchParams.get('userId')
  if (queryUserId) return queryUserId

  return null
}

/**
 * Extract userId from FormData (for multipart uploads).
 * Checks auth header first, then falls back to userId field in form.
 */
export async function getAuthUserIdFromForm(req: NextRequest, formData: FormData): Promise<string | null> {
  // Try Supabase Auth JWT first
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const supabase = createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (!error && user) {
      return user.id
    }
  }

  // Fallback: userId in form data
  return formData.get('userId') as string | null
}
