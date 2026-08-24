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

// Digits-only phone for dedupe. Accepts 10-digit US or 11-digit with country code.
function normalizePhone(raw: unknown): string | null {
  const d = String(raw ?? '').replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) return d.slice(1)
  if (d.length === 10) return d
  return null
}

// International phones (country-page signups): digits including the country code.
// E.164 allows 8–15 digits; we can't validate per-country plans, so bounds are the check.
// The dedupe key is namespaced with the ISO country ("NG:8012345678") — US keys are bare
// 10-digit strings, and a Nigerian mobile typed without its leading 0 is ALSO 10 digits
// (70x/80x/90x prefixes overlap US area codes, including 801), so an unprefixed key
// could dedupe against a US signup and hand back someone else's referral code.
function normalizeIntlPhone(raw: unknown, country: string): string | null {
  const d = String(raw ?? '').replace(/\D/g, '')
  return d.length >= 8 && d.length <= 15 ? `${country}:${d}` : null
}

// Countries the organic pages capture for. Anything else is rejected rather than
// stored free-form — the pages only ever send these codes.
const INTL_COUNTRIES = new Set(['MX', 'BR', 'PH', 'PE', 'CL', 'AR', 'GT', 'EC', 'NG'])

// zip_locations stores "New york" / "Beverly hills" — fix the casing for display.
function titleCase(s: string | null): string | null {
  if (!s) return s
  return s.replace(/\b[a-z]/g, c => c.toUpperCase())
}

type DB = ReturnType<typeof createServerClient>

/** Live position within the signup's metro (or global if metro unresolved), after referral jumps. */
async function computePosition(db: DB, row: { created_at: string; metro_key: string | null; referral_code: string }) {
  // Signup order within the same cohort (metro, or global when unassigned). The
  // unassigned cohort excludes international rows (country set, metro always NULL) so
  // intl signups don't inflate the queue position of US ZIPs that resolve to no metro.
  let idxQ = db.from('waitlist').select('id', { count: 'exact', head: true }).lte('created_at', row.created_at)
  idxQ = row.metro_key ? idxQ.eq('metro_key', row.metro_key) : idxQ.is('metro_key', null).is('country', null)
  const { count: signupIndex } = await idxQ

  // This signup's confirmed referrals.
  const { count: referrals } = await db
    .from('waitlist').select('id', { count: 'exact', head: true }).eq('referred_by', row.referral_code)

  const bonus = JUMP_SPOTS * Math.min(referrals ?? 0, REFERRAL_CAP)
  const position = Math.max(1, (signupIndex ?? 1) - bonus)
  return { position, referrals: referrals ?? 0 }
}

/**
 * Public countdown for a metro.
 *
 * NOTE (2026-08-13): the capture form is now phone + ZIP only, so new signups carry no
 * `gender`. The women-first gate (min_women / max_ratio) can't be evaluated from waitlist
 * data alone anymore, so a metro with no gender data falls back to the headcount gate
 * (min_total). `genderTracked` tells the UI which countdown is honest to show. Decision
 * pending from Charles: re-add a one-tap gender toggle, or move the gate to headcount.
 */
async function metroCountdown(db: DB, metroKey: string) {
  const metro = METROS.find(m => m.key === metroKey)
  if (!metro) return null
  const gate = gateFor(metro)
  const { count: total } = await db.from('waitlist').select('id', { count: 'exact', head: true }).eq('metro_key', metroKey)
  const { count: women } = await db.from('waitlist').select('id', { count: 'exact', head: true }).eq('metro_key', metroKey).eq('gender', 'Woman')
  const { count: men } = await db.from('waitlist').select('id', { count: 'exact', head: true }).eq('metro_key', metroKey).eq('gender', 'Man')
  const ratio = (women ?? 0) > 0 ? (men ?? 0) / (women ?? 1) : null
  const genderTracked = (women ?? 0) + (men ?? 0) > 0

  return {
    name: metro.name,
    women: women ?? 0, men: men ?? 0, total: total ?? 0,
    minWomen: gate.min_women, minTotal: gate.min_total, maxRatio: gate.max_ratio,
    womenToGo: Math.max(0, gate.min_women - (women ?? 0)),
    totalToGo: Math.max(0, gate.min_total - (total ?? 0)),
    genderTracked,
    ready: genderTracked
      ? (women ?? 0) >= gate.min_women && (total ?? 0) >= gate.min_total && (ratio === null || ratio <= gate.max_ratio)
      : (total ?? 0) >= gate.min_total,
  }
}

// POST /api/waitlist { phone, zipcode, ref?, source? }
export async function POST(req: NextRequest) {
  try {
    // 40/min, not 8: waitlist growth runs through in-person groups (an activity, a
    // dorm, a friend group), and everyone on one WiFi shares an IP — at 8/min the
    // ninth person to sign up at an event got blocked. Still low enough to stop a script.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!rateLimit(ip, { maxAttempts: 40, windowMs: 60_000 }).ok) {
      return NextResponse.json(
        { error: "Lots of signups from your network right now — give it a minute and try again. Your spot isn't taken." },
        { status: 429 }
      )
    }

    const { phone, zipcode, ref, source, country } = await req.json()

    // ── International branch (organic country pages): phone + country, no ZIP/metro. ──
    if (country && country !== 'US') {
      if (!INTL_COUNTRIES.has(String(country))) {
        return NextResponse.json({ error: 'Unsupported country.' }, { status: 400 })
      }
      const intl_normalized = normalizeIntlPhone(phone, String(country))
      if (!intl_normalized) {
        return NextResponse.json({ error: 'Please enter a valid phone number with country code.' }, { status: 400 })
      }
      const db = createServerClient()
      const { data: existing } = await db.from('waitlist')
        .select('created_at, metro_key, referral_code')
        .eq('phone_normalized', intl_normalized).single()
      if (existing) {
        return NextResponse.json({ ok: true, alreadyJoined: true, referralCode: existing.referral_code })
      }
      const referral_code = makeReferralCode()
      const { error } = await db.from('waitlist').insert({
        phone: String(phone).trim(),
        phone_normalized: intl_normalized,
        country: String(country),
        referral_code,
        referred_by: ref ? String(ref).trim() : null,
        source: source ? String(source).slice(0, 120) : null,
      })
      if (error) {
        console.error('Waitlist intl insert error:', error)
        return NextResponse.json({ error: 'Could not join the waitlist. Please try again.' }, { status: 500 })
      }
      // No position/countdown: those are per-US-metro concepts. The page shows a
      // simple confirmation + referral link.
      return NextResponse.json({ ok: true, referralCode: referral_code })
    }

    const phone_normalized = normalizePhone(phone)
    if (!phone_normalized) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number.' }, { status: 400 })
    }

    const zip = String(zipcode ?? '').trim()
    if (!/^\d{5}$/.test(zip)) {
      return NextResponse.json({ error: 'Please enter a valid 5-digit ZIP code.' }, { status: 400 })
    }

    const db = createServerClient()

    // Resolve ZIP → city (for the "launching in <your city>" copy) and → named metro
    // (CBSA metro_area first, ZIP3 fallback) for the launch-order signal.
    const loc = await lookupZip(zip).catch(() => null)
    const city = titleCase(loc?.city ?? null)
    const state = loc?.state ?? null
    const metro = resolveMetro({ metroArea: loc?.metro_area, zipcode: zip })
    const metro_key = metro?.key ?? null
    const metro_area = metro?.name ?? loc?.metro_area ?? null

    // Already on the list? Return their existing spot rather than erroring.
    const { data: existing } = await db.from('waitlist')
      .select('created_at, metro_key, referral_code, city, state')
      .eq('phone_normalized', phone_normalized).single()
    if (existing) {
      const pos = await computePosition(db, existing)
      const countdown = existing.metro_key ? await metroCountdown(db, existing.metro_key) : null
      return NextResponse.json({
        ok: true, alreadyJoined: true, ...pos,
        referralCode: existing.referral_code,
        city: existing.city ?? city, state: existing.state ?? state,
        metro: countdown,
      })
    }

    const referral_code = makeReferralCode()
    const { data: inserted, error } = await db.from('waitlist').insert({
      phone: String(phone).trim(),
      phone_normalized,
      zipcode: zip,
      zip3: zip.slice(0, 3),
      city, state,
      metro_key, metro_area,
      metro_code: loc?.metro_code ?? null,
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
    return NextResponse.json({ ok: true, ...pos, referralCode: referral_code, city, state, metro: countdown })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

// GET /api/waitlist?code=<referral_code> — live position + referral count + metro countdown.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 })
  const db = createServerClient()
  const { data: row } = await db.from('waitlist')
    .select('created_at, metro_key, referral_code, city, state').eq('referral_code', code).single()
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const pos = await computePosition(db, row)
  const countdown = row.metro_key ? await metroCountdown(db, row.metro_key) : null
  return NextResponse.json({ ok: true, ...pos, referralCode: code, city: row.city, state: row.state, metro: countdown })
}
