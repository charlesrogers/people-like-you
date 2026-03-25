-- Phone-First Auth Migration
-- Run in Supabase SQL Editor

-- Add phone number to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number text UNIQUE;

-- Make email optional (phone-first, email collected later)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Index for phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
