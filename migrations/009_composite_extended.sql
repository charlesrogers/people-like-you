-- Extended composite_profiles columns for v2 extraction pipeline + Phase 2 vectors
-- Run in Supabase SQL Editor

-- Phase 2: I-sharing vectors
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS humor_signature jsonb;
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS aesthetic_resonance jsonb;
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS emotional_processing jsonb;

-- Phase 2: Attachment + admiration vectors
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS attachment_proxy jsonb;
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS values_in_action text[] DEFAULT '{}';
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS demonstrated_competence text[] DEFAULT '{}';
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS friend_vouch_quotes text[] DEFAULT '{}';

-- Phase 5: Embedding
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS embedding float8[];

-- v2 extraction fields
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS primary_energy text;
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS hidden_depth text;

-- Life-stage signals (may already exist from 008_life_stage.sql)
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS life_stage jsonb;
