-- Add zipcode column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS zipcode text;
