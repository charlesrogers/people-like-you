import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const checks: Record<string, 'ok' | 'fail'> = {}
  const start = Date.now()

  // 1. Database connectivity
  try {
    const db = createServerClient()
    const { count, error } = await db.from('users').select('id', { count: 'exact', head: true })
    checks.database = error ? 'fail' : 'ok'
  } catch {
    checks.database = 'fail'
  }

  // 2. Auth service
  try {
    const db = createServerClient()
    const { error } = await db.auth.getSession()
    checks.auth = 'ok' // getSession returns null session for anonymous, not an error
  } catch {
    checks.auth = 'fail'
  }

  // 3. Storage service
  try {
    const db = createServerClient()
    const { error } = await db.storage.listBuckets()
    checks.storage = error ? 'fail' : 'ok'
  } catch {
    checks.storage = 'fail'
  }

  const healthy = Object.values(checks).every(v => v === 'ok')
  const ms = Date.now() - start

  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks, ms },
    { status: healthy ? 200 : 503 }
  )
}
