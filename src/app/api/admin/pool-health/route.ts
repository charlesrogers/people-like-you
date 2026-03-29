import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAuth(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()

  // 1. Active users with empty pool alerts
  const { data: emptyPoolAlerts } = await db
    .from('admin_alerts')
    .select('user_id, metadata, created_at')
    .eq('alert_type', 'empty_pool')
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  // 2. Get all active users with their demographics for segmentation
  const { data: users } = await db
    .from('users')
    .select('id, gender, birth_year, zipcode, religion, observance_level, metro_code, latitude, longitude')
    .eq('profile_status', 'active')

  // 3. Get hard preferences for all active users
  const { data: prefs } = await db
    .from('hard_preferences')
    .select('user_id, age_range_min, age_range_max, distance_radius, faith_importance, kids, religion, observance_match')

  // 4. Get user cadence pool states
  const { data: cadences } = await db
    .from('user_cadence')
    .select('user_id, pool_state, pool_state_reason, is_paused')

  const currentYear = new Date().getFullYear()
  // Keep prefs/currentYear refs to avoid unused-var lint errors in future use
  void prefs
  void currentYear

  const cadenceMap = new Map((cadences ?? []).map(c => [c.user_id, c]))

  // Build segments
  const segments: Record<string, { total: number; empty_pool: number; paused: number; users: string[] }> = {}

  function addToSegment(key: string, userId: string, isEmpty: boolean, isPaused: boolean) {
    if (!segments[key]) segments[key] = { total: 0, empty_pool: 0, paused: 0, users: [] }
    segments[key].total++
    if (isEmpty) segments[key].empty_pool++
    if (isPaused) segments[key].paused++
    if (isEmpty) segments[key].users.push(userId)
  }

  const emptyPoolUserIds = new Set((emptyPoolAlerts ?? []).map(a => a.user_id))

  for (const user of (users ?? [])) {
    const cad = cadenceMap.get(user.id)
    const isEmpty = emptyPoolUserIds.has(user.id) || cad?.pool_state === 'empty_pool'
    const isPaused = cad?.is_paused || false

    // Gender segment
    addToSegment(`gender:${user.gender || 'unknown'}`, user.id, isEmpty, isPaused)

    // Age bracket
    if (user.birth_year) {
      const age = currentYear - user.birth_year
      const bracket = age < 25 ? '18-24' : age < 30 ? '25-29' : age < 35 ? '30-34' : age < 40 ? '35-39' : '40+'
      addToSegment(`age:${bracket}`, user.id, isEmpty, isPaused)
    }

    // Metro/location
    addToSegment(`metro:${user.metro_code || 'unknown'}`, user.id, isEmpty, isPaused)

    // Religion (if set)
    if (user.religion) {
      addToSegment(`religion:${user.religion}`, user.id, isEmpty, isPaused)
    }

    // Combined gender+metro for cross-tab
    addToSegment(`${user.gender || '?'}@${user.metro_code || '?'}`, user.id, isEmpty, isPaused)
  }

  // Sort segments by empty_pool count descending
  const sortedSegments = Object.entries(segments)
    .map(([key, val]) => ({ segment: key, ...val }))
    .sort((a, b) => b.empty_pool - a.empty_pool)

  return NextResponse.json({
    totalUsers: (users ?? []).length,
    totalEmptyPool: emptyPoolUserIds.size,
    emptyPoolAlerts: (emptyPoolAlerts ?? []).length,
    segments: sortedSegments,
    recentAlerts: (emptyPoolAlerts ?? []).slice(0, 20),
  })
}
