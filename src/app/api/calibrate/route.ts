import { NextRequest, NextResponse } from 'next/server'
import { updateUserElo, getUser } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId, newElo, interactions } = await req.json()

    if (!userId || newElo === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const user = await getUser(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await updateUserElo(userId, newElo, true)

    return NextResponse.json({ ok: true, newElo })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
