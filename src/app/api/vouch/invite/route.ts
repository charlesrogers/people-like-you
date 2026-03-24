import { NextRequest, NextResponse } from 'next/server'
import { createFriendVouch, getUserFriendVouches } from '@/lib/db'
import { randomUUID } from 'crypto'

// POST: Create a friend vouch invite
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, friendName, friendEmail } = body

  if (!userId || !friendName) {
    return NextResponse.json({ error: 'userId and friendName required' }, { status: 400 })
  }

  // Check limit: max 3 vouches per user
  const existing = await getUserFriendVouches(userId)
  if (existing.length >= 3) {
    return NextResponse.json({ error: 'Maximum 3 friend vouches allowed' }, { status: 400 })
  }

  const token = randomUUID().replace(/-/g, '').slice(0, 16)

  const vouch = await createFriendVouch({
    user_id: userId,
    friend_name: friendName,
    friend_email: friendEmail || null,
    invite_token: token,
  })

  const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/vouch/${token}`

  return NextResponse.json({
    ok: true,
    vouch,
    inviteUrl,
  })
}
