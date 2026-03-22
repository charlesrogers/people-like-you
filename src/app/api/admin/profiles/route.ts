import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAuth(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServerClient()

  // Fetch users with related counts
  const { data: users, error } = await db
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Batch fetch counts for voice memos, photos, composite profiles
  const userIds = (users ?? []).map(u => u.id)

  const [memosRes, photosRes, compositesRes] = await Promise.all([
    db.from('voice_memos').select('user_id').in('user_id', userIds),
    db.from('photos').select('user_id').in('user_id', userIds),
    db.from('composite_profiles').select('user_id, excitement_type, memo_count').in('user_id', userIds),
  ])

  // Count per user
  const memoCounts: Record<string, number> = {}
  for (const m of memosRes.data ?? []) {
    memoCounts[m.user_id] = (memoCounts[m.user_id] || 0) + 1
  }

  const photoCounts: Record<string, number> = {}
  for (const p of photosRes.data ?? []) {
    photoCounts[p.user_id] = (photoCounts[p.user_id] || 0) + 1
  }

  const composites: Record<string, { excitement_type: string | null; memo_count: number }> = {}
  for (const c of compositesRes.data ?? []) {
    composites[c.user_id] = { excitement_type: c.excitement_type, memo_count: c.memo_count }
  }

  const enriched = (users ?? []).map(u => ({
    ...u,
    voice_memo_count: memoCounts[u.id] || 0,
    photo_count: photoCounts[u.id] || 0,
    composite: composites[u.id] || null,
  }))

  return NextResponse.json({ profiles: enriched })
}
