import { createServerClient } from './supabase'
import type { User, HardPreferences, SoftPreferences, Photo, VoiceMemo, CompositeProfile, Match } from './types'

function db() {
  return createServerClient()
}

// ─── Users ───

export async function createUser(data: Omit<User, 'id' | 'created_at' | 'onboarding_stage' | 'elo_score' | 'elo_interactions' | 'is_seed'>): Promise<User> {
  const { data: user, error } = await db()
    .from('users')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return user
}

export async function getUser(id: string): Promise<User | null> {
  const { data, error } = await db()
    .from('users')
    .select()
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await db()
    .from('users')
    .select()
    .eq('email', email)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await db()
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await db()
    .from('users')
    .select()
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getCompatibleUsers(user: User, eloRange = 150): Promise<User[]> {
  const oppositeGender = user.gender === 'Man' ? 'Woman' : 'Man'
  const { data, error } = await db()
    .from('users')
    .select()
    .eq('gender', oppositeGender)
    .neq('id', user.id)
    .gte('elo_score', user.elo_score - eloRange)
    .lte('elo_score', user.elo_score + eloRange)

  if (error) throw error

  // If too few results, widen range
  if ((data?.length ?? 0) < 3 && eloRange < 300) {
    return getCompatibleUsers(user, 300)
  }

  // Last resort: all opposite gender
  if ((data?.length ?? 0) === 0) {
    const { data: all, error: err } = await db()
      .from('users')
      .select()
      .eq('gender', oppositeGender)
      .neq('id', user.id)
    if (err) throw err
    return all ?? []
  }

  return data ?? []
}

export async function updateUserElo(id: string, newElo: number, incrementInteractions = false): Promise<void> {
  const updates: Record<string, unknown> = { elo_score: newElo }
  if (incrementInteractions) {
    // Fetch current to increment
    const user = await getUser(id)
    if (user) updates.elo_interactions = user.elo_interactions + 1
  }
  await db().from('users').update(updates).eq('id', id)
}

// ─── Hard Preferences ───

export async function saveHardPreferences(prefs: Omit<HardPreferences, 'id'>): Promise<HardPreferences> {
  const { data, error } = await db()
    .from('hard_preferences')
    .upsert(prefs, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getHardPreferences(userId: string): Promise<HardPreferences | null> {
  const { data, error } = await db()
    .from('hard_preferences')
    .select()
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ─── Soft Preferences ───

export async function saveSoftPreferences(prefs: Omit<SoftPreferences, 'id'>): Promise<SoftPreferences> {
  const { data, error } = await db()
    .from('soft_preferences')
    .upsert(prefs, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getSoftPreferences(userId: string): Promise<SoftPreferences | null> {
  const { data, error } = await db()
    .from('soft_preferences')
    .select()
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ─── Photos ───

export async function savePhoto(photo: Omit<Photo, 'id' | 'created_at'>): Promise<Photo> {
  const { data, error } = await db()
    .from('photos')
    .insert(photo)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserPhotos(userId: string): Promise<Photo[]> {
  const { data, error } = await db()
    .from('photos')
    .select()
    .eq('user_id', userId)
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

export async function deletePhoto(id: string): Promise<void> {
  await db().from('photos').delete().eq('id', id)
}

// ─── Voice Memos ───

export async function saveVoiceMemo(memo: Omit<VoiceMemo, 'id' | 'created_at'>): Promise<VoiceMemo> {
  const { data, error } = await db()
    .from('voice_memos')
    .insert(memo)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getVoiceMemo(id: string): Promise<VoiceMemo | null> {
  const { data, error } = await db()
    .from('voice_memos')
    .select()
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getUserVoiceMemos(userId: string): Promise<VoiceMemo[]> {
  const { data, error } = await db()
    .from('voice_memos')
    .select()
    .eq('user_id', userId)
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function updateVoiceMemo(id: string, updates: Partial<VoiceMemo>): Promise<VoiceMemo> {
  const { data, error } = await db()
    .from('voice_memos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Composite Profiles ───

export async function saveCompositeProfile(profile: Omit<CompositeProfile, 'id'>): Promise<CompositeProfile> {
  const { data, error } = await db()
    .from('composite_profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getCompositeProfile(userId: string): Promise<CompositeProfile | null> {
  const { data, error } = await db()
    .from('composite_profiles')
    .select()
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ─── Matches ───

export async function saveMatch(match: Omit<Match, 'id' | 'created_at'>): Promise<Match> {
  const { data, error } = await db()
    .from('matches')
    .insert(match)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserMatches(userId: string): Promise<Match[]> {
  const { data, error } = await db()
    .from('matches')
    .select()
    .eq('user_a_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// ─── Match Feedback ───

export async function saveMatchFeedback(feedback: {
  match_id: string
  user_id: string
  action: string
  reason?: string
  details?: string
  photo_revealed_before_decision?: boolean
}): Promise<void> {
  const { error } = await db()
    .from('match_feedback')
    .insert(feedback)
  if (error) throw error
}

// ─── Prompts ───

export async function getPromptsByDay(dayNumber: number): Promise<{ id: string; text: string; category: string }[]> {
  const { data, error } = await db()
    .from('prompts')
    .select('id, text, category')
    .eq('day_number', dayNumber)
    .eq('active', true)
  if (error) throw error
  return data ?? []
}

// ─── Elo Calibration Candidates ───

export async function getCalibrationCandidates(gender: string, excludeUserId: string, limit = 15): Promise<(User & { photos: Photo[] })[]> {
  const { data, error } = await db()
    .from('users')
    .select('*, photos(*)')
    .eq('gender', gender)
    .neq('id', excludeUserId)
    .order('elo_score', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}
