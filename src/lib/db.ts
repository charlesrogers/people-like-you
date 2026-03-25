import { createServerClient } from './supabase'
import type {
  User, HardPreferences, SoftPreferences, Photo, VoiceMemo, CompositeProfile, Match,
  MutualMatch, DisclosureExchange, UserAvailability, ScheduledDate, DateFeedback,
  TrustScore, TrustTier, ExitSurvey, FriendVouch, ChatMessage, MeetDecision, DatePlanningPrefs
} from './types'

function db() {
  return createServerClient()
}

// ─── Users ───

export async function createUser(data: Omit<User, 'id' | 'created_at' | 'onboarding_stage' | 'elo_score' | 'elo_interactions' | 'is_seed' | 'profile_status'> & { id?: string }): Promise<User> {
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
    .eq('profile_status', 'active')
    .neq('id', user.id)
    .gte('elo_score', user.elo_score - eloRange)
    .lte('elo_score', user.elo_score + eloRange)

  if (error) throw error

  // Apply hard preference filters (Rule 9, Layer 1)
  const filtered = await applyHardFilters(user, data ?? [])

  // If too few results, widen range
  if (filtered.length < 3 && eloRange < 300) {
    return getCompatibleUsers(user, 300)
  }

  // Last resort: all opposite gender (still apply hard filters)
  if (filtered.length === 0) {
    const { data: all, error: err } = await db()
      .from('users')
      .select()
      .eq('gender', oppositeGender)
      .eq('profile_status', 'active')
      .neq('id', user.id)
    if (err) throw err
    return applyHardFilters(user, all ?? [])
  }

  return filtered
}

// --- Hard Preference Filters (Rule 9, Layer 1) ---
// Bidirectional: both users' hard preferences must be satisfied.

async function applyHardFilters(user: User, candidates: User[]): Promise<User[]> {
  if (candidates.length === 0) return []

  const userPrefs = await getHardPreferences(user.id)
  const candidatePrefsMap = await getHardPreferencesForUsers(candidates.map(c => c.id))
  const currentYear = new Date().getFullYear()

  return candidates.filter(candidate => {
    const candPrefs = candidatePrefsMap.get(candidate.id) ?? null

    // Age filter (bidirectional)
    if (user.birth_year && candidate.birth_year) {
      const userAge = currentYear - user.birth_year
      const candAge = currentYear - candidate.birth_year
      if (userPrefs?.age_range_min != null && candAge < userPrefs.age_range_min) return false
      if (userPrefs?.age_range_max != null && candAge > userPrefs.age_range_max) return false
      if (candPrefs?.age_range_min != null && userAge < candPrefs.age_range_min) return false
      if (candPrefs?.age_range_max != null && userAge > candPrefs.age_range_max) return false
    }

    // Kids incompatibility (bidirectional)
    if (userPrefs?.kids && candPrefs?.kids) {
      const incompatible = areKidsIncompatible(userPrefs.kids, candPrefs.kids)
      if (incompatible) return false
    }

    // Faith filter (only when essential + must_match)
    if (isEssentialFaithMismatch(user, userPrefs, candidate, candPrefs)) return false
    if (isEssentialFaithMismatch(candidate, candPrefs, user, userPrefs)) return false

    // Smoking dealbreaker (bidirectional)
    if (isSmokingDealbreaker(userPrefs?.smoking, candPrefs?.smoking)) return false

    return true
  })
}

function areKidsIncompatible(a: string, b: string): boolean {
  const conflicts: [string, string][] = [
    ['wants', 'doesnt_want'],
    ['doesnt_want', 'wants'],
    ['has', 'doesnt_want'],
    ['doesnt_want', 'has'],
  ]
  return conflicts.some(([x, y]) => a === x && b === y)
}

function isEssentialFaithMismatch(
  userA: User, prefsA: HardPreferences | null,
  userB: User, _prefsB: HardPreferences | null,
): boolean {
  if (prefsA?.faith_importance !== 'essential') return false
  if (prefsA?.observance_match !== 'must_match') return false
  // Religion must match
  if (userA.religion && userB.religion && userA.religion !== userB.religion) return true
  // Observance level must match
  if (userA.observance_level && userB.observance_level && userA.observance_level !== userB.observance_level) return true
  return false
}

function isSmokingDealbreaker(aSmoking: string | null | undefined, bSmoking: string | null | undefined): boolean {
  if (aSmoking === 'dealbreaker' && (bSmoking === 'yes' || bSmoking === 'sometimes')) return true
  if (bSmoking === 'dealbreaker' && (aSmoking === 'yes' || aSmoking === 'sometimes')) return true
  return false
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

export async function getHardPreferencesForUsers(userIds: string[]): Promise<Map<string, HardPreferences>> {
  if (userIds.length === 0) return new Map()
  const { data, error } = await db()
    .from('hard_preferences')
    .select()
    .in('user_id', userIds)
  if (error) throw error
  const map = new Map<string, HardPreferences>()
  for (const row of (data ?? []) as HardPreferences[]) map.set(row.user_id, row)
  return map
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

export async function saveVoiceMemo(memo: Omit<VoiceMemo, 'id' | 'created_at' | 'processing_status' | 'processing_error' | 'retry_count'>): Promise<VoiceMemo> {
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

// ─── Daily Intros ───

export interface DailyIntro {
  id: string
  user_id: string
  match_id: string
  matched_user_id: string
  narrative: string
  status: 'pending' | 'liked' | 'passed' | 'expired'
  intro_type: 'daily' | 'bonus'
  scheduled_at: string
  delivered_at: string | null
  acted_at: string | null
  expires_at: string
  voice_message_required: boolean
  voice_message_path: string | null
  created_at: string
}

export interface UserCadence {
  id: string
  user_id: string
  delivery_hour: number
  timezone: string
  is_paused: boolean
  is_hidden: boolean
  paused_at: string | null
  last_action_at: string | null
  consecutive_inactive_days: number
  consecutive_passes: number
  consecutive_unresponded_likes: number
  total_likes: number
  total_passes: number
  next_match_user_id: string | null
  created_at: string
  updated_at: string
}

export async function saveDailyIntro(intro: Omit<DailyIntro, 'id' | 'created_at'>): Promise<DailyIntro> {
  const { data, error } = await db()
    .from('daily_intros')
    .insert(intro)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getDailyIntro(userId: string, status?: string): Promise<DailyIntro | null> {
  let query = db()
    .from('daily_intros')
    .select()
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: false })
    .limit(1)

  if (status) query = query.eq('status', status)

  const { data, error } = await query.single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getCurrentDailyIntro(userId: string): Promise<DailyIntro | null> {
  // Get today's pending or most recent intro
  const { data, error } = await db()
    .from('daily_intros')
    .select()
    .eq('user_id', userId)
    .eq('intro_type', 'daily')
    .order('scheduled_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getCurrentBonusIntro(userId: string): Promise<DailyIntro | null> {
  const { data, error } = await db()
    .from('daily_intros')
    .select()
    .eq('user_id', userId)
    .eq('intro_type', 'bonus')
    .eq('status', 'pending')
    .order('scheduled_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateDailyIntro(id: string, updates: Partial<DailyIntro>): Promise<DailyIntro> {
  const { data, error } = await db()
    .from('daily_intros')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getIntroHistory(userId: string, limit = 20): Promise<DailyIntro[]> {
  const { data, error } = await db()
    .from('daily_intros')
    .select()
    .eq('user_id', userId)
    .neq('status', 'pending')
    .order('scheduled_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function getPreviouslyShownUserIds(userId: string): Promise<string[]> {
  const { data, error } = await db()
    .from('daily_intros')
    .select('matched_user_id')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map(d => d.matched_user_id)
}

export async function expirePendingIntros(userId: string): Promise<number> {
  const { data, error } = await db()
    .from('daily_intros')
    .update({ status: 'expired' })
    .eq('user_id', userId)
    .eq('status', 'pending')
    .select('id')
  if (error) throw error
  return data?.length ?? 0
}

// ─── User Cadence ───

export async function getUserCadence(userId: string): Promise<UserCadence | null> {
  const { data, error } = await db()
    .from('user_cadence')
    .select()
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function ensureUserCadence(userId: string): Promise<UserCadence> {
  const existing = await getUserCadence(userId)
  if (existing) return existing

  const { data, error } = await db()
    .from('user_cadence')
    .insert({ user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateUserCadence(userId: string, updates: Partial<UserCadence>): Promise<UserCadence> {
  const { data, error } = await db()
    .from('user_cadence')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getEligibleUsersForDelivery(currentHourUtc: number): Promise<UserCadence[]> {
  // For MVP, deliver to all non-paused, non-hidden users at their delivery hour
  // TODO: timezone-aware delivery hour matching
  const { data, error } = await db()
    .from('user_cadence')
    .select()
    .eq('delivery_hour', currentHourUtc)
    .eq('is_paused', false)
    .eq('is_hidden', false)
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

// ─── Phase 1: Mutual Matches ───

export async function checkForMutualMatch(matchId: string, userId: string, matchedUserId: string): Promise<MutualMatch | null> {
  // Check if the other user also expressed interest in this match
  const { data: otherFeedback } = await db()
    .from('match_feedback')
    .select('id')
    .eq('user_id', matchedUserId)
    .eq('action', 'interested')
    .limit(1)

  // Check if there's a match record where matchedUser is user_a and userId is user_b
  const { data: reverseMatch } = await db()
    .from('daily_intros')
    .select('match_id')
    .eq('user_id', matchedUserId)
    .eq('matched_user_id', userId)
    .eq('status', 'liked')
    .limit(1)

  if (!reverseMatch?.length && !otherFeedback?.length) return null

  // Mutual interest detected — create mutual match
  return createMutualMatch(matchId, userId, matchedUserId)
}

export async function createMutualMatch(matchId: string, userAId: string, userBId: string): Promise<MutualMatch> {
  const { data, error } = await db()
    .from('mutual_matches')
    .insert({
      match_id: matchId,
      user_a_id: userAId,
      user_b_id: userBId,
      status: 'active',
      current_round: 0,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMutualMatch(id: string): Promise<MutualMatch | null> {
  const { data, error } = await db()
    .from('mutual_matches')
    .select()
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getMutualMatchByMatchId(matchId: string): Promise<MutualMatch | null> {
  const { data, error } = await db()
    .from('mutual_matches')
    .select()
    .eq('match_id', matchId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getActiveMutualMatches(userId: string): Promise<MutualMatch[]> {
  const { data: asA } = await db()
    .from('mutual_matches')
    .select()
    .eq('user_a_id', userId)
    .neq('status', 'expired')

  const { data: asB } = await db()
    .from('mutual_matches')
    .select()
    .eq('user_b_id', userId)
    .neq('status', 'expired')

  return [...(asA ?? []), ...(asB ?? [])]
}

export async function updateMutualMatch(id: string, updates: Partial<MutualMatch>): Promise<MutualMatch> {
  const { data, error } = await db()
    .from('mutual_matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Phase 1: Disclosure Exchanges ───

export async function createDisclosureRound(
  mutualMatchId: string,
  roundNumber: number,
  promptText: string,
  expiresInHours = 48
): Promise<DisclosureExchange> {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expiresInHours)

  const { data, error } = await db()
    .from('disclosure_exchanges')
    .insert({
      mutual_match_id: mutualMatchId,
      round_number: roundNumber,
      prompt_text: promptText,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()
  if (error) throw error

  // Update mutual match status and round
  await updateMutualMatch(mutualMatchId, {
    status: 'exchange_in_progress',
    current_round: roundNumber,
  } as Partial<MutualMatch>)

  return data
}

export async function getDisclosureExchanges(mutualMatchId: string): Promise<DisclosureExchange[]> {
  const { data, error } = await db()
    .from('disclosure_exchanges')
    .select()
    .eq('mutual_match_id', mutualMatchId)
    .order('round_number')
  if (error) throw error
  return data ?? []
}

export async function getCurrentDisclosureRound(mutualMatchId: string): Promise<DisclosureExchange | null> {
  const { data, error } = await db()
    .from('disclosure_exchanges')
    .select()
    .eq('mutual_match_id', mutualMatchId)
    .order('round_number', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function submitDisclosureResponse(
  exchangeId: string,
  userId: string,
  mutualMatch: MutualMatch,
  response: string,
  voicePath?: string
): Promise<DisclosureExchange> {
  // Determine if user is A or B in the mutual match
  const isUserA = mutualMatch.user_a_id === userId
  const updates: Record<string, unknown> = {}

  if (isUserA) {
    updates.user_a_response = response
    updates.user_a_responded_at = new Date().toISOString()
    if (voicePath) updates.user_a_response_voice_path = voicePath
  } else {
    updates.user_b_response = response
    updates.user_b_responded_at = new Date().toISOString()
    if (voicePath) updates.user_b_response_voice_path = voicePath
  }

  const { data, error } = await db()
    .from('disclosure_exchanges')
    .update(updates)
    .eq('id', exchangeId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getExpiredDisclosureRounds(): Promise<(DisclosureExchange & { mutual_match_id: string })[]> {
  const now = new Date().toISOString()
  const { data, error } = await db()
    .from('disclosure_exchanges')
    .select()
    .lt('expires_at', now)
    .or('user_a_responded_at.is.null,user_b_responded_at.is.null')
  if (error) throw error
  return data ?? []
}

// ─── Phase 1: User Availability ───

export async function getUserAvailability(userId: string): Promise<UserAvailability | null> {
  const { data, error } = await db()
    .from('user_availability')
    .select()
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function saveUserAvailability(userId: string, availability: UserAvailability['availability']): Promise<UserAvailability> {
  const { data, error } = await db()
    .from('user_availability')
    .upsert({
      user_id: userId,
      availability,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Phase 1: Scheduled Dates ───

export async function createScheduledDate(dateData: Omit<ScheduledDate, 'id' | 'created_at' | 'pre_nudge_sent' | 'post_checkin_sent'>): Promise<ScheduledDate> {
  const { data, error } = await db()
    .from('scheduled_dates')
    .insert(dateData)
    .select()
    .single()
  if (error) throw error

  // Update mutual match status
  await updateMutualMatch(dateData.mutual_match_id, { status: 'date_scheduled' } as Partial<MutualMatch>)

  return data
}

export async function getScheduledDate(id: string): Promise<ScheduledDate | null> {
  const { data, error } = await db()
    .from('scheduled_dates')
    .select()
    .eq('id', id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getScheduledDateByMutualMatch(mutualMatchId: string): Promise<ScheduledDate | null> {
  const { data, error } = await db()
    .from('scheduled_dates')
    .select()
    .eq('mutual_match_id', mutualMatchId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateScheduledDate(id: string, updates: Partial<ScheduledDate>): Promise<ScheduledDate> {
  const { data, error } = await db()
    .from('scheduled_dates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUpcomingDates(hoursAhead = 24): Promise<ScheduledDate[]> {
  const now = new Date()
  const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)

  const { data, error } = await db()
    .from('scheduled_dates')
    .select()
    .eq('status', 'confirmed')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', cutoff.toISOString())
  if (error) throw error
  return data ?? []
}

export async function getRecentlyCompletedDates(hoursBack = 3): Promise<ScheduledDate[]> {
  const cutoff = new Date()
  cutoff.setHours(cutoff.getHours() - hoursBack)

  const { data, error } = await db()
    .from('scheduled_dates')
    .select()
    .eq('status', 'completed')
    .eq('post_checkin_sent', false)
    .gte('scheduled_at', cutoff.toISOString())
  if (error) throw error
  return data ?? []
}

// ─── Phase 1: Date Feedback ───

export async function saveDateFeedback(feedback: Omit<DateFeedback, 'id' | 'created_at'>): Promise<DateFeedback> {
  const { data, error } = await db()
    .from('date_feedback')
    .insert(feedback)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getDateFeedback(scheduledDateId: string): Promise<DateFeedback[]> {
  const { data, error } = await db()
    .from('date_feedback')
    .select()
    .eq('scheduled_date_id', scheduledDateId)
  if (error) throw error
  return data ?? []
}

export async function getPendingDateFeedback(userId: string): Promise<(ScheduledDate & { mutual_match: MutualMatch })[]> {
  // Find completed dates where this user hasn't given feedback yet
  const { data: completedDates, error: datesErr } = await db()
    .from('scheduled_dates')
    .select('*, mutual_matches(*)')
    .eq('status', 'completed')

  if (datesErr) throw datesErr
  if (!completedDates?.length) return []

  // Filter to dates involving this user where they haven't given feedback
  const results: (ScheduledDate & { mutual_match: MutualMatch })[] = []
  for (const date of completedDates) {
    const mm = date.mutual_matches as unknown as MutualMatch
    if (mm.user_a_id !== userId && mm.user_b_id !== userId) continue

    const { data: existingFeedback } = await db()
      .from('date_feedback')
      .select('id')
      .eq('scheduled_date_id', date.id)
      .eq('user_id', userId)
      .limit(1)

    if (!existingFeedback?.length) {
      results.push({ ...date, mutual_match: mm })
    }
  }
  return results
}

// ─── Phase 1: Trust Scores ───

export async function getTrustScore(userId: string): Promise<TrustScore | null> {
  const { data, error } = await db()
    .from('trust_scores')
    .select()
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function ensureTrustScore(userId: string): Promise<TrustScore> {
  const existing = await getTrustScore(userId)
  if (existing) return existing

  const { data, error } = await db()
    .from('trust_scores')
    .insert({ user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTrustScore(userId: string, updates: Partial<TrustScore>): Promise<TrustScore> {
  const { data, error } = await db()
    .from('trust_scores')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Phase 1: Exit Surveys ───

export async function saveExitSurvey(survey: Omit<ExitSurvey, 'id' | 'created_at'>): Promise<ExitSurvey> {
  const { data, error } = await db()
    .from('exit_surveys')
    .insert(survey)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Phase 1: Funnel Metrics ───

export async function getFunnelMetrics(): Promise<Record<string, unknown>[]> {
  const { data, error } = await db()
    .from('funnel_metrics')
    .select()
    .order('week', { ascending: false })
    .limit(12)
  if (error) throw error
  return data ?? []
}

// ─── Phase 2: Friend Vouches ───

export async function createFriendVouch(vouch: Pick<FriendVouch, 'user_id' | 'friend_name' | 'friend_email' | 'invite_token'>): Promise<FriendVouch> {
  const { data, error } = await db()
    .from('friend_vouches')
    .insert(vouch)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getFriendVouchByToken(token: string): Promise<FriendVouch | null> {
  const { data, error } = await db()
    .from('friend_vouches')
    .select()
    .eq('invite_token', token)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getUserFriendVouches(userId: string): Promise<FriendVouch[]> {
  const { data, error } = await db()
    .from('friend_vouches')
    .select()
    .eq('user_id', userId)
  if (error) throw error
  return data ?? []
}

export async function updateFriendVouch(id: string, updates: Partial<FriendVouch>): Promise<FriendVouch> {
  const { data, error } = await db()
    .from('friend_vouches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Constrained Chat ───

export async function getChatMessages(mutualMatchId: string): Promise<ChatMessage[]> {
  const { data, error } = await db()
    .from('chat_messages')
    .select()
    .eq('mutual_match_id', mutualMatchId)
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function sendChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
  const { data, error } = await db()
    .from('chat_messages')
    .insert(message)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getChatMessageCount(mutualMatchId: string, senderId: string): Promise<number> {
  const { count, error } = await db()
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('mutual_match_id', mutualMatchId)
    .eq('sender_id', senderId)
  if (error) throw error
  return count ?? 0
}

// ─── Meet Decisions ───

export async function saveMeetDecision(decision: Omit<MeetDecision, 'id' | 'created_at'>): Promise<MeetDecision> {
  const { data, error } = await db()
    .from('meet_decisions')
    .insert(decision)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMeetDecision(mutualMatchId: string, userId: string): Promise<MeetDecision | null> {
  const { data, error } = await db()
    .from('meet_decisions')
    .select()
    .eq('mutual_match_id', mutualMatchId)
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getMeetDecisions(mutualMatchId: string): Promise<MeetDecision[]> {
  const { data, error } = await db()
    .from('meet_decisions')
    .select()
    .eq('mutual_match_id', mutualMatchId)
  if (error) throw error
  return data ?? []
}

// ─── Date Planning Preferences ───

export async function saveDatePlanningPrefs(prefs: Omit<DatePlanningPrefs, 'id' | 'submitted_at'>): Promise<DatePlanningPrefs> {
  const { data, error } = await db()
    .from('date_planning_prefs')
    .upsert(prefs, { onConflict: 'mutual_match_id,user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getDatePlanningPrefs(mutualMatchId: string): Promise<DatePlanningPrefs[]> {
  const { data, error } = await db()
    .from('date_planning_prefs')
    .select()
    .eq('mutual_match_id', mutualMatchId)
  if (error) throw error
  return data ?? []
}

// ─── Expired Chats (for cron) ───

export async function getExpiredChats(): Promise<MutualMatch[]> {
  const now = new Date().toISOString()
  const { data, error } = await db()
    .from('mutual_matches')
    .select()
    .eq('status', 'chatting')
    .lt('chat_expires_at', now)
  if (error) throw error
  return data ?? []
}
