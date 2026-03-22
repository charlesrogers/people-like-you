// Core data types for People Like You

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string | null
  gender: 'Man' | 'Woman'
  seeking: 'Men' | 'Women'
  birth_year: number | null
  state: string | null
  height: string | null
  education: string | null
  onboarding_stage: string
  elo_score: number
  elo_interactions: number
  community: string
  is_seed: boolean
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
  created_at: string
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
}

export interface Match {
  id: string
  user_a_id: string
  user_b_id: string
  angle_narrative: string | null
  angle_style: string | null
  expansion_points: string[]
  created_at: string
}

export interface Prompt {
  id: string
  text: string
  day_number: number
  category: string
  active: boolean
}
