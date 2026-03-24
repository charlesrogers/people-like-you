import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUserByEmail } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  // Look up the user in our users table to get the correct profile ID
  const user = await getUserByEmail(email)

  return NextResponse.json({
    id: user?.id || data.user?.id,
    access_token: data.session?.access_token,
    refresh_token: data.session?.refresh_token,
    expires_at: data.session?.expires_at,
  })
}
