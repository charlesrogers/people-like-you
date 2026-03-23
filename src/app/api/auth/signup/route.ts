import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createUser, getUserByEmail } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password, first_name, last_name, gender, birth_year, state, community } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if user already exists in our users table
    const existing = await getUserByEmail(email)
    if (existing) {
      // Try to sign in instead
      const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        return NextResponse.json({ error: 'Account already exists. Please log in.' }, { status: 409 })
      }
      return NextResponse.json({
        id: existing.id,
        access_token: session.session?.access_token,
        refresh_token: session.session?.refresh_token,
        expires_at: session.session?.expires_at,
      })
    }

    // Create Supabase Auth user via standard signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 })
    }

    // Create user row in our users table with the auth user's ID
    const user = await createUser({
      id: authData.user.id,
      email,
      first_name: first_name || '',
      last_name: last_name || null,
      gender: gender || 'Man',
      seeking: gender === 'Woman' ? 'Men' : 'Women',
      birth_year: birth_year || null,
      state: state || null,
      height: null,
      education: null,
      community: community || 'general',
    } as Parameters<typeof createUser>[0])

    // If signUp returned a session directly (email confirmation disabled)
    if (authData.session) {
      return NextResponse.json({
        id: user.id,
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
      })
    }

    // If email confirmation is enabled, sign in to get tokens
    const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return NextResponse.json({
        id: user.id,
        error: 'Account created but sign-in failed. Please log in.',
      }, { status: 201 })
    }

    return NextResponse.json({
      id: user.id,
      access_token: session.session?.access_token,
      refresh_token: session.session?.refresh_token,
      expires_at: session.session?.expires_at,
    })
  } catch (err) {
    console.error('Signup error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
