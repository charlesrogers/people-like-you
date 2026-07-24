import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { lookupZip } from '@/lib/geo'
import { resolveMetro, gateFor, METROS } from '@/lib/metros'
import { rateLimit } from '@/lib/rate-limit'

// Each confirmed referral moves you up this many spots (capped to bound gaming).
const JUMP_SPOTS = 25
const REFERRAL_CAP = 20

function makeReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 7; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

type DB = ReturnType<typeof createServerClient>

/** Live position within the signup's metro (or global if metro unresolved), after referral jumps. */
async function computePosition(db: DB, row: { created_at: string; metro_key: string | null; referral_code: string }) {
  // Signup order within the same cohort (metro, or global when unassigned).
  let idxQ = db.from('waitlist').select('id', { count: 'exact', head: true }).lte('created_at', row.created_at)
  idxQ = row.metro_key ? idxQ.eq('metro_key', row.metro_key) : idxQ.is('metro_key', null)
  const { count: signupIndex } = await idxQ

  // This signup's confirmed referrals.
  const { count: referrals } = await db
    .from('waitlist').select('id', { count: 'exact', head: true }).eq('referred_by', row.referral_code)

  const bonus = JUMP_SPOTS * Math.min(referrals ?? 0, REFERRAL_CAP)
  const position = Math.max(1, (signupIndex ?? 1) - bonus)
  return { position, referrals: referrals ?? 0 }
}

/** Public countdown for a metro: women joined vs the gate, and whether it's ready. */
async function metroCountdown(db: DB, metroKey: string) {
  const metro = METROS.find(m => m.key === metroKey)
  if (!metro) return null
  const gate = gateFor(metro)
  const { count: total } = await db.from('waitlist').select('id', { count: 'exact', head: true }).eq('metro_key', metroKey)
  const { count: women } = await db.from('waitlist').select('id', { count: 'exact', head: true }).eq('metro_key', metroKey).eq('gender', 'Woman')
  const { count: men } = await db.from('waitlist').select('id', { count: 'exact', head: true }).eq('metro_key', metroKey).eq('gender', 'Man')
  const ratio = (women ?? 0) > 0 ? (men ?? 0) / (women ?? 1) : null
  return {
    name: metro.name,
    women: women ?? 0, men: men ?? 0, total: total ?? 0,
    minWomen: gate.min_women, minTotal: gate.min_total, maxRatio: gate.max_ratio,
    womenToGo: Math.max(0, gate.min_women - (women ?? 0)),
    ready: (women ?? 0) >= gate.min_women && (total ?? 0) >= gate.min_total && (ratio === null || ratio <= gate.max_ratio),
  }
}

// POST /api/waitlist { email, phone?, zipcode?, gender?, ref?, source? }
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!rateLimit(ip, { maxAttempts: 8, windowMs: 60_000 }).ok) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a minute.' }, { status: 429 })
    }

    const { email, phone, zipcode, gender, ref, source } = await req.json()
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    if (!cleanEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
    }

    const db = createServerClient()
    const zip = zipcode && /^\d{5}$/.test(String(zipcode).trim()) ? String(zipcode).trim() : null

    // Resolve ZIP → named metro (CBSA metro_area first, ZIP3 fallback).
    let metro_key: string | null = null
    let metro_area: string | null = null
    if (zip) {
      const loc = await lookupZip(zip).catch(() => null)
      const metro = resolveMetro({ metroArea: loc?.metro_area, zipcode: zip })
      if (metro) { metro_key = metro.key; metro_area = metro.name }
      else if (loc?.metro_area) { metro_area = loc.metro_area }
    }

    const { data: existing } = await db.from('waitlist')
      .select('created_at, metro_key, referral_code').eq('email', cleanEmail).single()
    if (existing) {
      const pos = await computePosition(db, existing)
      const countdown = existing.metro_key ? await metroCountdown(db, existing.metro_key) : null
      return NextResponse.json({ ok: true, alreadyJoined: true, ...pos, referralCode: existing.referral_code, metro: countdown })
    }

    const referral_code = makeReferralCode()
    const { data: inserted, error } = await db.from('waitlist').insert({
      email: cleanEmail,
      phone: phone ? String(phone).trim() : null,
      zipcode: zip,
      metro_key, metro_area,
      gender: gender === 'Man' || gender === 'Woman' ? gender : null,
      referral_code,
      referred_by: ref ? String(ref).trim() : null,
      source: source ? String(source).slice(0, 120) : null,
    }).select('created_at, metro_key, referral_code').single()
    if (error || !inserted) {
      console.error('Waitlist insert error:', error)
      return NextResponse.json({ error: 'Could not join the waitlist. Please try again.' }, { status: 500 })
    }

    const pos = await computePosition(db, inserted)
    const countdown = metro_key ? await metroCountdown(db, metro_key) : null
    return NextResponse.json({ ok: true, ...pos, referralCode: referral_code, metro: countdown })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

// GET /api/waitlist/status?code=<referral_code> — live position + referral count + metro countdown.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })
  const db = createServerClient()
  const { data: row } = await db.from('waitlist')
    .select('created_at, metro_key, referral_code').eq('referral_code', code).single()
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const pos = await computePosition(db, row)
  const countdown = row.metro_key ? await metroCountdown(db, row.metro_key) : null
  return NextResponse.json({ ok: true, ...pos, referralCode: code, metro: countdown })
}
