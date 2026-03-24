import { NextResponse } from 'next/server'
import { getFunnelMetrics } from '@/lib/db'

// GET: Fetch funnel metrics (internal admin)
export async function GET() {
  try {
    const metrics = await getFunnelMetrics()
    return NextResponse.json({ metrics })
  } catch {
    // If materialized view doesn't exist yet, return empty
    return NextResponse.json({ metrics: [], error: 'Funnel view not yet created' })
  }
}
