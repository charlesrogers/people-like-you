import { NextRequest, NextResponse } from 'next/server'
import { enforceBlock, getUser } from '@/lib/db'

// POST /api/block { userId, targetUserId }
// Silent, absolute, bidirectional. The blocked user is never notified.
export async function POST(req: NextRequest) {
  try {
    const { userId, targetUserId } = await req.json()
    if (!userId || !targetUserId) {
      return NextResponse.json({ error: 'userId and targetUserId required' }, { status: 400 })
    }
    if (userId === targetUserId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
    }
    const target = await getUser(targetUserId)
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    await enforceBlock(userId, targetUserId, 'manual')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Block error:', err)
    return NextResponse.json({ error: 'Failed to block' }, { status: 500 })
  }
}
