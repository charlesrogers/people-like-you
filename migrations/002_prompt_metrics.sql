-- Prompt quality tracking: word count, duration, sentence count per voice memo response
-- Applied: 2026-03-23

CREATE TABLE prompt_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  word_count int NOT NULL,
  sentence_count int NOT NULL,
  duration_seconds int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);
