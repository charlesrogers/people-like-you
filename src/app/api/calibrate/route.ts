import { NextRequest, NextResponse } from 'next/server'
import { updateUserElo, getUser } from '@/lib/db'

export async function POST(req: NextRequest) {
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
}
