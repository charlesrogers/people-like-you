import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { lookupZip } from '@/lib/geo'
import { rateLimit } from '@/lib/rate-limit'

// Short, URL-safe referral code.
function makeReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 7; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
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

    // Resolve zip → metro for the "which geography to launch first" signal.
    let metro_code: string | null = null
    let metro_area: string | null = null
    if (zipcode && /^\d{5}$/.test(String(zipcode).trim())) {
      const loc = await lookupZip(String(zipcode).trim()).catch(() => null)
      if (loc) { metro_code = loc.metro_code; metro_area = loc.metro_area }
    }

    // Already on the list? Return their existing position rather than erroring.
    const { data: existing } = await db.from('waitlist').select('id, referral_code, created_at').eq('email', cleanEmail).single()
    if (existing) {
      const { count } = await db.from('waitlist').select('id', { count: 'exact', head: true }).lte('created_at', existing.created_at)
      return NextResponse.json({ ok: true, alreadyJoined: true, position: count ?? null, referralCode: existing.referral_code })
    }

    const referral_code = makeReferralCode()
    const { error } = await db.from('waitlist').insert({
      email: cleanEmail,
      phone: phone ? String(phone).trim() : null,
      zipcode: zipcode ? String(zipcode).trim() : null,
      metro_code, metro_area,
      gender: gender === 'Man' || gender === 'Woman' ? gender : null,
      referral_code,
      referred_by: ref ? String(ref).trim() : null,
      source: source ? String(source).slice(0, 120) : null,
    })
    if (error) {
      console.error('Waitlist insert error:', error)
      return NextResponse.json({ error: 'Could not join the waitlist. Please try again.' }, { status: 500 })
    }

    const { count } = await db.from('waitlist').select('id', { count: 'exact', head: true })
    return NextResponse.json({ ok: true, position: count ?? null, referralCode: referral_code })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
