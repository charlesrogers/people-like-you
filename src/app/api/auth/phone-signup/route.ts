import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Normalize to E.164 format
    const normalized = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`

    const supabase = createServerClient()

    // Send OTP via Supabase (uses Twilio when configured, test mode otherwise)
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalized,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, phone: normalized })
  } catch (err) {
    console.error('Phone signup error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
