import { NextRequest, NextResponse } from 'next/server'
import { getUserAvailability, saveUserAvailability } from '@/lib/db'

// GET: Fetch user's availability
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const availability = await getUserAvailability(userId)
    return NextResponse.json({ availability })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT: Update user's availability
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, availability } = body

    if (!userId || !availability) {
      return NextResponse.json({ error: 'userId and availability required' }, { status: 400 })
    }

    const saved = await saveUserAvailability(userId, availability)
    return NextResponse.json({ ok: true, availability: saved })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
