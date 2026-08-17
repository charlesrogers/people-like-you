import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendDiscordChunked } from '@/lib/alert'

/**
 * Daily waitlist dump to Discord: every signup in the window, with phone and ZIP.
 *
 * Posts even when there were ZERO signups. That "quiet day" message is the cron's
 * heartbeat — a digest that simply stops arriving is how a dead cron hides (see the
 * scheduled-jobs rule in CLAUDE.md), so silence has to mean "broken", never "no news".
 *
 * Window defaults to 24h; ?hours=N overrides it for backfills and manual checks.
 */
export const dynamic = 'force-dynamic'

type Row = {
  phone: string | null
  zipcode: string | null
  city: string | null
  state: string | null
  metro_area: string | null
  referred_by: string | null
  created_at: string
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Dedicated channel if configured, otherwise the general webhook.
  const webhook = process.env.DISCORD_WAITLIST_WEBHOOK || process.env.DISCORD_WEBHOOK_URL
  if (!webhook) {
    return NextResponse.json(
      { error: 'No webhook configured (set DISCORD_WAITLIST_WEBHOOK or DISCORD_WEBHOOK_URL)' },
      { status: 500 }
    )
  }

  const hours = Math.min(24 * 30, Math.max(1, Number(req.nextUrl.searchParams.get('hours')) || 24))
  const cutoff = new Date(Date.now() - hours * 3600_000).toISOString()

  const db = createServerClient()
  const { data, error } = await db
    .from('waitlist')
    .select('phone, zipcode, city, state, metro_area, referred_by, created_at')
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Waitlist digest query failed:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  const rows = (data ?? []) as Row[]
  const { count: total } = await db.from('waitlist').select('id', { count: 'exact', head: true })

  const heading =
    rows.length === 0
      ? `📋 **Waitlist — no new signups in the last ${hours}h.** (${total ?? 0} on the list overall)`
      : `📋 **Waitlist — ${rows.length} new signup${rows.length === 1 ? '' : 's'} in the last ${hours}h** (${total ?? 0} total)`

  const lines = rows.map(r => {
    const where = [r.city, r.state].filter(Boolean).join(', ')
    const metro = r.metro_area ? ` · ${r.metro_area}` : ''
    const ref = r.referred_by ? ` · referred by ${r.referred_by}` : ''
    const time = new Date(r.created_at).toISOString().replace('T', ' ').slice(5, 16) + ' UTC'
    return `• \`${r.phone ?? '—'}\`  ${r.zipcode ?? '—'}${where ? ` (${where})` : ''}${metro}${ref} — ${time}`
  })

  // Per-metro tally: the whole point of collecting ZIP is knowing which city is forming.
  const byMetro = new Map<string, number>()
  for (const r of rows) byMetro.set(r.metro_area ?? 'Unassigned', (byMetro.get(r.metro_area ?? 'Unassigned') ?? 0) + 1)
  const tally = [...byMetro.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([m, n]) => `${m} ${n}`)
    .join(' · ')

  const message = [heading, ...lines, rows.length > 0 ? `\n**By metro:** ${tally}` : '']
    .filter(Boolean)
    .join('\n')

  try {
    const chunks = await sendDiscordChunked(webhook, message)
    return NextResponse.json({ ok: true, signups: rows.length, total: total ?? 0, chunks, hours })
  } catch (err) {
    // Surface the failure in the HTTP status so the cron wrapper can alert on it.
    console.error('Waitlist digest post failed:', err)
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
