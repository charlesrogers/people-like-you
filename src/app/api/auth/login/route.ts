import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserByEmail } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Basic email format check
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Check if user exists in our DB first
    const existingUser = await getUserByEmail(email)
    if (!existingUser) {
      return NextResponse.json({ error: 'No account found with that email. Did you mean to sign up?' }, { status: 404 })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Supabase returns generic "Invalid login credentials" for wrong password
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json({ error: 'Wrong password. Try again or reset it.' }, { status: 401 })
      }
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({
      id: existingUser.id || data.user?.id,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_at: data.session?.expires_at,
    })
  } catch (err) {
    console.error('Login error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
