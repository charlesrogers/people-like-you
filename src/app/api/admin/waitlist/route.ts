import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { METROS, gateFor } from '@/lib/metros'

function checkAuth(req: NextRequest): boolean {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

// GET /api/admin/waitlist → per-metro launch readiness, sorted by how close each is to its gate.
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServerClient()
  const { data, error } = await db.from('waitlist').select('metro_key, gender, created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = data ?? []

  const tally = (predicate: (r: { metro_key: string | null; gender: string | null }) => boolean) => {
    const set = rows.filter(predicate)
    const women = set.filter(r => r.gender === 'Woman').length
    const men = set.filter(r => r.gender === 'Man').length
    return { total: set.length, women, men, unknown: set.length - women - men }
  }

  const metros = METROS.map(m => {
    const t = tally(r => r.metro_key === m.key)
    const gate = gateFor(m)
    const ratio = t.women > 0 ? t.men / t.women : null
    const ready = t.women >= gate.min_women && t.total >= gate.min_total && (ratio === null || ratio <= gate.max_ratio)
    // Distance-to-gate: 0 = ready, higher = further. Women are the binding side.
    const womenGap = Math.max(0, gate.min_women - t.women)
    const totalGap = Math.max(0, gate.min_total - t.total)
    return {
      key: m.key, name: m.name,
      ...t, ratio,
      minWomen: gate.min_women, minTotal: gate.min_total, maxRatio: gate.max_ratio,
      womenGap, totalGap, ready,
      pctWomen: Math.min(100, Math.round((t.women / gate.min_women) * 100)),
    }
  })

  // Ready first, then closest to the women floor, then most signups.
  metros.sort((a, b) =>
    Number(b.ready) - Number(a.ready) || a.womenGap - b.womenGap || b.total - a.total)

  const unassigned = tally(r => !r.metro_key)
  const totals = tally(() => true)

  return NextResponse.json({ metros, unassigned, totals })
}
