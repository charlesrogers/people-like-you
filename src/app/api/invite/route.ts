import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { getUser, updateUser } from '@/lib/db'

function generateCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// GET: Get or create invite code + stats
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const user = await getUser(userId)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Generate invite code if missing
  let code = user.invite_code
  if (!code) {
    code = generateCode()
    await updateUser(userId, { invite_code: code })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://people-like-you.com'

  return NextResponse.json({
    code,
    inviteCount: user.invite_count || 0,
    queuePriority: user.queue_priority || 0,
    links: {
      default: `${baseUrl}/join/${code}?utm_source=direct&utm_medium=invite&utm_campaign=profile_share`,
      sms: `${baseUrl}/join/${code}?utm_source=sms&utm_medium=invite&utm_campaign=queue_jump`,
      instagram: `${baseUrl}/join/${code}?utm_source=instagram&utm_medium=story&utm_campaign=share_type`,
      community: `${baseUrl}/join/${code}?utm_source=community&utm_medium=invite&utm_campaign=community_growth`,
    },
  })
}

// POST: Track invite events
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { invite_code, event_type, utm_source, utm_medium, utm_campaign, referrer_user_id, referred_user_id } = body

  if (!invite_code || !event_type) {
    return NextResponse.json({ error: 'invite_code and event_type required' }, { status: 400 })
  }

  const db = createServerClient()

  // Log the event
  await db.from('invite_events').insert({
    invite_code,
    event_type,
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    referrer_user_id: referrer_user_id || null,
    referred_user_id: referred_user_id || null,
    user_agent: req.headers.get('user-agent') || null,
  })

  // Award queue priority based on event type
  if (referrer_user_id) {
    const pointsMap: Record<string, number> = {
      link_generated: 1,
      page_viewed: 0,  // notified but no points for views
      signup_completed: 5,
      onboarding_completed: 10,
    }
    const points = pointsMap[event_type] || 0
    if (points > 0) {
      const user = await getUser(referrer_user_id)
      if (user) {
        await updateUser(referrer_user_id, {
          queue_priority: (user.queue_priority || 0) + points,
          invite_count: event_type === 'onboarding_completed' ? (user.invite_count || 0) + 1 : user.invite_count,
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
