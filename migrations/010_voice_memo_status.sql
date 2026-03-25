-- Processing status tracking for voice memos
-- Enables retry logic and failure recovery without re-recording
ALTER TABLE voice_memos ADD COLUMN IF NOT EXISTS processing_status text NOT NULL DEFAULT 'pending';
ALTER TABLE voice_memos ADD COLUMN IF NOT EXISTS processing_error text;
ALTER TABLE voice_memos ADD COLUMN IF NOT EXISTS retry_count int NOT NULL DEFAULT 0;

-- Backfill: mark existing memos with transcripts as extracted
UPDATE voice_memos SET processing_status = 'extracted' WHERE transcript IS NOT NULL AND transcript != '';
