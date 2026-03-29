// Core data types for People Like You

export interface User {
  id: string
  email: string | null
  phone_number: string | null
  first_name: string
  last_name: string | null
  gender: 'Man' | 'Woman'
  seeking: 'Men' | 'Women'
  birth_year: number | null
  state: string | null
  zipcode: string | null
  latitude: number | null
  longitude: number | null
  metro_code: string | null
  height: string | null
  education: string | null
  onboarding_stage: string
  elo_score: number
  elo_interactions: number
  community: string
  religion: string | null
  observance_level: string | null
  invite_code: string | null
  invited_by: string | null
  invite_count: number
  queue_priority: number
  is_seed: boolean
  profile_status: 'active' | 'paused' | 'hidden' | 'deactivated'
  created_at: string
}

export interface HardPreferences {
  id: string
  user_id: string
  age_range_min: number | null
  age_range_max: number | null
  distance_radius: 'same_metro' | 'few_hours' | 'anywhere' | null
  faith_importance: 'essential' | 'important' | 'nice_to_have' | 'doesnt_matter' | null
  kids: 'has' | 'wants' | 'open' | 'doesnt_want' | null
  marital_history: 'never_married' | 'divorced' | null
  smoking: 'yes' | 'no' | 'sometimes' | 'dealbreaker' | null
  observance_match: 'must_match' | 'prefer_same' | 'respect_only' | null
  community_fields: Record<string, unknown>
}

export interface SoftPreferences {
  id: string
  user_id: string
  humor_style: string[]
  energy_level: 'adventurous' | 'homebody' | 'balanced' | null
  communication_style: 'direct' | 'gentle' | 'expressive' | null
  life_stage_priority: 'career' | 'family' | 'balanced' | null
  date_activity_prefs: string[]
}

export interface Photo {
  id: string
  user_id: string
  storage_path: string
  public_url: string
  sort_order: number
  created_at: string
}

export interface VoiceMemo {
  id: string
  user_id: string
  prompt_id: string
  audio_storage_path: string
  duration_seconds: number | null
  transcript: string | null
  extraction: MemoExtraction | null
  day_number: number
  processing_status: 'pending' | 'transcribed' | 'extracted' | 'failed' | 'replaced'
  processing_error: string | null
  retry_count: number
  created_at: string
}

// --- Extraction Types (Phase 2: expanded with I-sharing, attachment, admiration) ---

export interface HumorSignature {
  what_makes_them_laugh: string[]
  humor_examples: string[]
  laugh_triggers: string[]
}

export interface AestheticResonance {
  what_moves_them: string[]
  what_they_notice: string[]
  chills_triggers: string[]
}

export interface EmotionalProcessing {
  logic_vs_emotion: number  // 0 = pure emotion-first, 1 = pure logic-first
  internal_vs_external: number  // 0 = processes internally, 1 = processes by talking
}

export interface AttachmentProxy {
  comfort_with_closeness: number  // 0-1
  comfort_with_independence: number  // 0-1
  reassurance_seeking: number  // 0-1
}

export interface LifeStageSignals {
  rootedness: number            // 0=nomadic, 1=deeply planted
  life_pace: number             // 0=slow/settled, 1=high-intensity
  life_chapter: 'launching' | 'building' | 'established' | 'reinventing' | null
  trajectory_momentum: number   // 0=stable/content, 1=actively changing
  trajectory_directions: string[] // 0-3 concrete directions
  confidence: number
}

export interface MemoExtraction {
  big_five_signals: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  humor_style: string
  communication_warmth: number
  communication_directness: number
  energy_enthusiasm: number
  storytelling_ability: number
  passion_indicators: string[]
  kindness_markers: string[]
  vulnerability_authenticity: number
  interest_tags: string[]
  values: string[]
  goals: string[]
  notable_quotes: string[]
  // Phase 2: I-sharing signals (optional — populated by updated extraction)
  humor_signature?: HumorSignature | null
  aesthetic_resonance?: AestheticResonance | null
  emotional_processing?: EmotionalProcessing | null
  // Phase 2: Attachment signals (optional)
  attachment_signals?: AttachmentProxy | null
  // Phase 2: Admiration signals (optional)
  values_in_action_stories?: string[]
  competence_stories?: string[]
}

export interface CompositeProfile {
  id: string
  user_id: string
  big_five_proxy: Record<string, number>
  humor_style: string | null
  communication_warmth: number | null
  communication_directness: number | null
  energy_enthusiasm: number | null
  storytelling_ability: number | null
  passion_indicators: string[]
  kindness_markers: string[]
  vulnerability_authenticity: number | null
  interest_tags: string[]
  values: string[]
  goals: string[]
  excitement_type: 'explorer' | 'nester' | 'intellectual' | 'spark' | null
  notable_quotes: string[]
  memo_count: number
  last_updated: string
  // Phase 2: I-sharing vectors (optional — populated by updated extraction)
  humor_signature?: HumorSignature | null
  aesthetic_resonance?: AestheticResonance | null
  emotional_processing?: EmotionalProcessing | null
  // Phase 2: Attachment vectors (optional)
  attachment_proxy?: AttachmentProxy | null
  // Phase 2: Admiration vectors (optional)
  values_in_action?: string[]
  demonstrated_competence?: string[]
  friend_vouch_quotes?: string[]
  // Phase 5: Embedding (optional)
  embedding?: number[] | null
  // Life-stage signals (extracted from voice memos — see model-rules.md Rule 9)
  life_stage?: LifeStageSignals | null
}

// --- Match Types (Phase 3: expanded with narrative metadata) ---

export interface Match {
  id: string
  user_a_id: string
  user_b_id: string
  angle_narrative: string | null
  angle_style: string | null
  expansion_points: string[]
  created_at: string
  // Phase 3: Narrative intelligence (optional — populated by narrative pipeline)
  narrative_for_a?: string | null
  narrative_for_b?: string | null
  narrative_strategy?: NarrativeStrategyType | null
  narrative_a_critic_score?: number | null
  narrative_b_critic_score?: number | null
  narrative_a_used_quote?: boolean
  narrative_b_used_quote?: boolean
  compatibility_score?: number | null
  life_stage_score?: number | null
  // Phase 3: A/B testing (optional)
  narrative_experiment_id?: string | null
  narrative_variant?: 'a' | 'b' | null
}

export interface Prompt {
  id: string
  text: string
  day_number: number
  category: string
  active: boolean
}

// --- Phase 1: Outcome Engine Types ---

export type MutualMatchStatus =
  | 'active'
  | 'exchange_in_progress'
  | 'chatting'
  | 'deciding'
  | 'planning'
  | 'date_scheduled'
  | 'date_completed'
  | 'relationship'
  | 'expired'
  | 'declined'

export interface MutualMatch {
  id: string
  match_id: string
  user_a_id: string
  user_b_id: string
  status: MutualMatchStatus
  current_round: number
  created_at: string
  expired_at: string | null
  chat_started_at: string | null
  chat_expires_at: string | null
  user_a_msg_count: number
  user_b_msg_count: number
  planned_venue_name: string | null
  planned_venue_address: string | null
  planned_venue_place_id: string | null
  planned_at: string | null
  user_a_phone: string | null
  user_b_phone: string | null
  nudge_sent_at: string | null
  pause_offered_at: string | null
}

export interface DisclosureExchange {
  id: string
  mutual_match_id: string
  round_number: number
  prompt_text: string
  user_a_response: string | null
  user_a_response_voice_path: string | null
  user_a_responded_at: string | null
  user_b_response: string | null
  user_b_response_voice_path: string | null
  user_b_responded_at: string | null
  expires_at: string
  created_at: string
}

export interface UserAvailability {
  id: string
  user_id: string
  availability: {
    monday: DaySlots
    tuesday: DaySlots
    wednesday: DaySlots
    thursday: DaySlots
    friday: DaySlots
    saturday: DaySlots
    sunday: DaySlots
  }
  updated_at: string
}

export interface DaySlots {
  morning: boolean
  afternoon: boolean
  evening: boolean
}

export type DateStatus = 'proposed' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface ScheduledDate {
  id: string
  mutual_match_id: string
  proposed_by: string
  confirmed_by: string | null
  scheduled_at: string
  activity_type: string | null
  venue_name: string | null
  venue_address: string | null
  venue_place_id: string | null
  status: DateStatus
  pre_nudge_sent: boolean
  post_checkin_sent: boolean
  conversation_starter: string | null
  created_at: string
}

export interface DateFeedback {
  id: string
  scheduled_date_id: string
  user_id: string
  about_user_id: string
  what_surprised_you: string
  surprise_sentiment: 'positive' | 'negative' | 'neutral' | null
  surprise_extracted_traits: Record<string, unknown>
  felt_safe: boolean | null
  looked_like_photos: 'yes' | 'somewhat' | 'no' | null
  want_to_see_again: 'yes' | 'maybe' | 'no' | null
  additional_notes: string | null
  created_at: string
}

export type TrustTier = 'new' | 'established' | 'verified' | 'trusted'

export interface TrustScore {
  id: string
  user_id: string
  score: number
  dates_completed: number
  safety_positive: number
  safety_negative: number
  photo_accuracy_positive: number
  photo_accuracy_negative: number
  positive_surprises: number
  no_shows: number
  ghosting_incidents: number
  disclosure_rounds_completed: number
  tier: TrustTier
  verified_at: string | null
  updated_at: string
}

export type ExitReason =
  | 'found_someone_ply'
  | 'found_someone_elsewhere'
  | 'taking_break'
  | 'matches_wrong'
  | 'not_enough_people'
  | 'other'

export interface ExitSurvey {
  id: string
  user_id: string
  reason: ExitReason
  found_match_id: string | null
  details: string | null
  created_at: string
}

// --- Phase 2: Friend Vouches ---

export type VouchStatus = 'invited' | 'recorded' | 'processed'

export interface FriendVouch {
  id: string
  user_id: string
  friend_name: string
  friend_email: string | null
  invite_token: string
  audio_storage_path: string | null
  duration_seconds: number | null
  transcript: string | null
  extraction: Record<string, unknown> | null
  status: VouchStatus
  created_at: string
}

// --- Phase 3: Narrative Intelligence Types ---

export type NarrativeStrategyTier = 'self_expansion' | 'i_sharing' | 'admiration' | 'comfort'

export type NarrativeStrategyType =
  // Tier 1: Self-Expansion
  | 'novel_world'
  | 'complementary_growth'
  | 'perspective_gap'
  // Tier 2: I-Sharing
  | 'humor_resonance'
  | 'aesthetic_sync'
  | 'emotional_processing_match'
  // Tier 3: Admiration
  | 'values_in_action'
  | 'demonstrated_mastery'
  | 'social_proof'
  | 'vulnerability_anchor'
  // Tier 4: Comfort
  | 'warmth_priming'
  | 'communication_fit'

export interface NarrativeStrategy {
  tier: NarrativeStrategyTier
  type: NarrativeStrategyType
  rationale: string
  dataPoints: string[]
  mandatoryElements: {
    selfExpansionSignal: string
    admirationSignal: string
  }
}

export interface NarrativeDraft {
  text: string
  styleEmphasis: 'specificity' | 'emotional_arc' | 'brevity'
}

export interface CriticScore {
  specificity: number       // 1-5, weight 3x
  emotional_arc: number     // 1-5, weight 2x
  authenticity: number      // 1-5, weight 2x
  brevity: number           // 1-5, weight 1x
  connection: number        // 1-5, weight 2x
  total: number             // weighted sum, max 50
  feedback: string
}

export interface NarrativeExperiment {
  id: string
  name: string
  hypothesis: string | null
  variant_a_config: Record<string, unknown>
  variant_b_config: Record<string, unknown>
  status: 'active' | 'concluded' | 'abandoned'
  started_at: string
  concluded_at: string | null
  winner: 'a' | 'b' | 'inconclusive' | null
  results: Record<string, unknown> | null
}

// --- Phase 5: Embedding Types ---

export interface FeatureVector {
  vector: number[]  // 128 dimensions
  metadata: {
    userId: string
    computedAt: string
    version: number
  }
}

// --- Activity Types for Date Scheduling ---

export type ActivityType =
  | 'cooking_class'
  | 'pottery_class'
  | 'art_workshop'
  | 'escape_room'
  | 'trivia_night'
  | 'comedy_show'
  | 'live_music'
  | 'outdoor_market'
  | 'food_hall'
  | 'art_walk'
  | 'museum_exhibit'
  | 'rock_climbing'
  | 'kayaking'
  | 'hiking_new_trail'
  | 'bookstore_cafe'
  | 'dessert_spot'
  | 'park_walk'

export interface DateSuggestion {
  scheduledAt: string
  activityType: ActivityType
  venueName: string | null
  venueAddress: string | null
  venuePlaceId: string | null
  venueRating: number | null
  venueDescription: string | null
  distanceFromA: string | null
  distanceFromB: string | null
}

// --- Constrained Chat Types ---

export interface ChatMessage {
  id: string
  mutual_match_id: string
  sender_id: string
  content: string
  voice_url: string | null
  transcript: string | null
  message_number: number
  created_at: string
}

export interface MeetDecision {
  id: string
  mutual_match_id: string
  user_id: string
  decision: 'yes' | 'no'
  created_at: string
}

export interface DatePlanningPrefs {
  id: string
  mutual_match_id: string
  user_id: string
  available_slots: Array<{ date: string; slot: 'morning' | 'afternoon' | 'evening' }>
  location_preferences: {
    latitude?: number
    longitude?: number
    max_travel_minutes?: number
    neighborhood_description?: string
  }
  submitted_at: string
}

export interface PlannedDateInfo {
  venue_name: string
  venue_address: string
  venue_place_id: string | null
  planned_at: string
  partner_phone: string
  partner_name: string
}
