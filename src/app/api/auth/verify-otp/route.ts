import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { phone, token } = await req.json()

    if (!phone || !token) {
      return NextResponse.json({ error: 'Phone and verification code are required' }, { status: 400 })
    }

    const normalized = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`

    const supabase = createServerClient()

    // Verify OTP
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalized,
      token,
      type: 'sms',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    // Check if user record already exists in our users table
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single()

    let userId = data.user.id
    let isNew = false

    if (!existing) {
      // Create user record — minimal, rest filled in during onboarding
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        phone_number: normalized,
        first_name: '',
        gender: 'Man', // default, updated in basics step
        seeking: 'Women',
        onboarding_stage: 'basics',
        elo_score: 1200,
        elo_interactions: 0,
        community: 'general',
        is_seed: false,
        profile_status: 'active',
      })

      if (insertError) {
        console.error('Failed to create user record:', insertError)
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
      }
      isNew = true
    }

    return NextResponse.json({
      id: userId,
      is_new: isNew,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    })
  } catch (err) {
    console.error('OTP verification error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
