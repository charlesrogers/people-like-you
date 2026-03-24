import { NextRequest, NextResponse } from 'next/server'
import { getFriendVouchByToken, getUser } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 })
  }

  const vouch = await getFriendVouchByToken(token)
  if (!vouch) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  }

  const user = await getUser(vouch.user_id)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    userName: user.first_name,
    friendName: vouch.friend_name,
    status: vouch.status,
  })
}
