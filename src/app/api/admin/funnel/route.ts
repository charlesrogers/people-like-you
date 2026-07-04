import { NextRequest, NextResponse } from 'next/server'
import { getFunnelMetrics, getUserJourneys, getPoolGenderRatio, refreshFunnelViews } from '@/lib/db'

function checkAuth(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const m = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  return Math.round(m * 10) / 10
}

// GET: Funnel metrics + velocity (elapsed-time) medians + per-metro gender ratio
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Refresh materialized views so the dashboard is current (cheap at this scale)
  try {
    await refreshFunnelViews()
  } catch (err) {
    console.error('Funnel: refresh_funnel_views failed (views may predate migration 014)', err)
  }

  try {
    const [metrics, journeys, genderRatio] = await Promise.all([
      getFunnelMetrics(),
      getUserJourneys(),
      getPoolGenderRatio(),
    ])

    // Velocity medians — real users when any exist, otherwise seeds (pre-launch testing)
    const real = journeys.filter(j => !j.is_seed)
    const cohort = real.length > 0 ? real : journeys
    const days = (field: string) =>
      cohort.map(j => j[field]).filter((v): v is number => typeof v === 'number')

    const velocity = {
      cohort: real.length > 0 ? 'real' : 'seed',
      cohortSize: cohort.length,
      medianDays: {
        signupToIntro: median(days('days_signup_to_intro')),
        signupToMutual: median(days('days_signup_to_mutual')),
        mutualToDate: median(days('days_mutual_to_date')),
        signupToDate: median(days('days_signup_to_date')), // north star
      },
      counts: {
        withIntro: days('days_signup_to_intro').length,
        withMutual: days('days_signup_to_mutual').length,
        withDate: days('days_signup_to_date').length,
      },
    }

    return NextResponse.json({ metrics, velocity, genderRatio })
  } catch (err) {
    console.error('Funnel: query error', err)
    return NextResponse.json({ metrics: [], velocity: null, genderRatio: [], error: 'Funnel views not available — run migration 014' })
  }
}
