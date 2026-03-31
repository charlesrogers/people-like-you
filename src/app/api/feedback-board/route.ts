import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const APP_ID = 'people-like-you'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const sort = req.nextUrl.searchParams.get('sort') || 'votes' // votes | newest

  const db = createServerClient()

  // Get all open/in-progress requests for this app
  const { data: requests, error } = await db
    .from('feedback_requests')
    .select('*')
    .eq('app_id', APP_ID)
    .in('status', ['open', 'in_progress', 'done'])
    .order(sort === 'newest' ? 'created_at' : 'vote_count', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get this user's votes so we can show which they've upvoted
  let userVotes: Set<string> = new Set()
  if (userId) {
    const { data: votes } = await db
      .from('feedback_votes')
      .select('request_id')
      .eq('user_id', userId)

    userVotes = new Set((votes ?? []).map(v => v.request_id))
  }

  const enriched = (requests ?? []).map(r => ({
    ...r,
    voted: userVotes.has(r.id),
  }))

  return NextResponse.json({ requests: enriched })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, action } = body

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const db = createServerClient()

  // Submit a new request
  if (action === 'submit') {
    const { title, description } = body
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    const { data, error } = await db
      .from('feedback_requests')
      .insert({
        app_id: APP_ID,
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, request: data })
  }

  // Vote / unvote
  if (action === 'vote' || action === 'unvote') {
    const { requestId } = body
    if (!requestId) {
      return NextResponse.json({ error: 'requestId required' }, { status: 400 })
    }

    if (action === 'vote') {
      const { error } = await db
        .from('feedback_votes')
        .insert({ request_id: requestId, user_id: userId })

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ error: 'Already voted' }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Increment vote count
      const { data: current } = await db
        .from('feedback_requests')
        .select('vote_count')
        .eq('id', requestId)
        .single()
      if (current) {
        await db
          .from('feedback_requests')
          .update({ vote_count: (current.vote_count || 0) + 1 })
          .eq('id', requestId)
      }
    } else {
      await db
        .from('feedback_votes')
        .delete()
        .eq('request_id', requestId)
        .eq('user_id', userId)

      // Decrement vote count
      const { data: current } = await db
        .from('feedback_requests')
        .select('vote_count')
        .eq('id', requestId)
        .single()
      if (current) {
        await db
          .from('feedback_requests')
          .update({ vote_count: Math.max(0, (current.vote_count || 0) - 1) })
          .eq('id', requestId)
      }
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
