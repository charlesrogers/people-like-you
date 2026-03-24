# PLY Implementation Plan

## Current State (March 2026)

**What exists and works:**
- Onboarding flow: basics → 6 voice prompts (2+ required) → hard/soft preferences → photos
- Voice pipeline: upload → OpenAI transcription → Claude Haiku extraction → composite profile aggregation
- Matching: hand-tuned 4-factor scorer (values 1.5x, Big Five 1x, interests 1x, warmth 0.5x)
- Narrative generation: single Claude Sonnet call per match side
- Daily intro cadence: cron delivers one match/day, Like/Pass, bonus on Like
- Elo calibration: photo-based voting to establish attractiveness tier
- Dashboard: hero match card, countdown timer, history

**What does NOT exist:**
- Mutual match detection
- Any messaging between users
- Date scheduling
- Post-date feedback
- Trust/safety scoring
- Any data beyond Like/Pass (no dates, no relationships, no surprise feedback)
- I-sharing extraction (aesthetic resonance, emotional processing)
- Attachment extraction
- Friend vouches
- Structured disclosure exchange
- Multi-draft narrative generation
- Narrative A/B testing
- Journal entries / living profile
- Learned matching model

**Schema:** Supabase PostgreSQL. Tables: users, hard_preferences, soft_preferences, photos, voice_memos, composite_profiles, matches, match_feedback, prompts, email_drips, daily_intros, user_cadence.

**Stack:** Next.js 15 / TypeScript / Tailwind v4 / Supabase / Vercel. LLMs: Claude (extraction + narratives), OpenAI (transcription).

---

## Build Order

```
Phase 1: Outcome Engine Foundation (Spec 03)
    ↓ generates training data for everything else
Phase 2: Extraction Upgrade (Spec 01 + 02 inputs)
    ↓ captures I-sharing, attachment, richer signals
Phase 3: Narrative Intelligence (Spec 04)
    ↓ uses new extraction data for better intros
Phase 4: Living Profile (Spec 05)
    ↓ continuous data feeds matching + narratives
Phase 5: Relationship Genome (Spec 01)
    ↓ learned model trained on Phase 1-4 data
Phase 6: Conversational AI (Spec 02)
    ↓ most ambitious UX change, benefits from all systems
```

---

## Phase 1: Outcome Engine Foundation

**Goal:** Make the north star metric ("dates per week") measurable. Build the funnel from mutual match → conversation → date → feedback → relationship tracking.

**Duration estimate: 4-6 sprints (2-week sprints)**

### 1A: Mutual Match Detection + Structured Disclosure Exchange
**Priority: CRITICAL — nothing else works without this**

**Schema changes:**

```sql
-- Mutual matches
CREATE TABLE mutual_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) NOT NULL UNIQUE,
  user_a_id uuid REFERENCES users(id) NOT NULL,
  user_b_id uuid REFERENCES users(id) NOT NULL,
  status text NOT NULL DEFAULT 'active',
  -- active, exchange_in_progress, date_scheduled, date_completed, relationship, expired
  current_round int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expired_at timestamptz
);

-- Structured disclosure exchanges (replaces free-form messaging)
CREATE TABLE disclosure_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mutual_match_id uuid REFERENCES mutual_matches(id) NOT NULL,
  round_number int NOT NULL, -- 1, 2, or 3
  prompt_text text NOT NULL,
  user_a_response text,
  user_a_response_voice_path text,
  user_a_responded_at timestamptz,
  user_b_response text,
  user_b_response_voice_path text,
  user_b_responded_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(mutual_match_id, round_number)
);
CREATE INDEX idx_disclosure_match ON disclosure_exchanges(mutual_match_id, round_number);
```

**Code changes:**

| File | Change |
|---|---|
| `src/lib/types.ts` | Add `MutualMatch`, `DisclosureExchange` interfaces |
| `src/lib/db.ts` | Add `createMutualMatch()`, `getDisclosureExchange()`, `submitDisclosureResponse()`, `checkForMutualMatch()` |
| `src/app/api/feedback/route.ts` | After Like: check if other user also Liked → create mutual match → generate Round 1 prompt |
| `src/app/api/disclosure/route.ts` | NEW — GET (fetch current round), POST (submit response) |
| `src/lib/disclosure-prompts.ts` | NEW — Generate personalized exchange prompts from both composite profiles |
| `src/app/dashboard/page.tsx` | Add mutual match state: show exchange UI when active, render partner's response after both submit |
| `src/components/DisclosureExchange.tsx` | NEW — UI for the structured exchange: see prompt, record/type answer, see partner's answer |

**Prompt generation logic (`disclosure-prompts.ts`):**

```typescript
// Round 1: Low stakes, shared ground
// Find the theme that connects both narratives and build a prompt around it
// Example: "You both mentioned doing something hard that nobody noticed. Tell each other about yours."

// Round 2: Medium stakes, curiosity
// Based on Round 1 answers + composites
// Example: "What's something you've changed your mind about in the last year?"

// Round 3: Higher stakes, vulnerability
// Example: "What's something you're still figuring out?"
```

Each round prompt is generated by Claude Haiku using both composite profiles + previous round answers. Personalized, not from a fixed bank.

**Expiration logic:**
- Each round expires 48h after both users see it
- If one user responds and the other doesn't within 48h → nudge notification
- If still no response after 72h → match expires with warm message
- Cron job checks for expired rounds hourly

**UX language change:**
- "Like" → "I want to know more"
- "Pass" → "Not this time"
- "Mutual Match" → "You're both curious"
- Update `dashboard/page.tsx`, `MatchCard.tsx`, `api/feedback/route.ts`

**What RIGHT looks like:** Two users complete 3 rounds of increasingly personal exchange in 3-5 days, then the system prompts "Want to meet?"

**What WRONG looks like:** Users treat it like a chore — submit one-word answers, don't read partner's response, drop off after Round 1. If Round 1 completion < 60%, the prompts aren't compelling enough.

**Gate metric:** ≥50% of mutual matches complete at least Round 1. ≥30% complete all 3 rounds.

---

### 1B: Date Scheduling

**Schema changes:**

```sql
CREATE TABLE user_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL UNIQUE,
  availability jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE scheduled_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mutual_match_id uuid REFERENCES mutual_matches(id) NOT NULL,
  proposed_by uuid REFERENCES users(id) NOT NULL,
  confirmed_by uuid REFERENCES users(id),
  scheduled_at timestamptz NOT NULL,
  activity_type text, -- cooking_class, escape_room, art_walk, market, live_music, etc.
  venue_name text,
  venue_address text,
  venue_place_id text,
  status text NOT NULL DEFAULT 'proposed',
  -- proposed, confirmed, completed, cancelled, no_show
  pre_nudge_sent boolean DEFAULT false,
  post_checkin_sent boolean DEFAULT false,
  conversation_starter text, -- AI-generated, specific to both profiles
  created_at timestamptz DEFAULT now()
);
```

**Code changes:**

| File | Change |
|---|---|
| `src/lib/types.ts` | Add `UserAvailability`, `ScheduledDate` interfaces |
| `src/lib/db.ts` | Add CRUD for availability + dates |
| `src/app/api/availability/route.ts` | NEW — GET/PUT user availability |
| `src/app/api/dates/route.ts` | NEW — POST propose date, PUT confirm/cancel |
| `src/app/api/dates/suggestions/route.ts` | NEW — GET 4 time+activity suggestions based on both users' availability + profiles |
| `src/lib/activity-matcher.ts` | NEW — Match activity type to both users' composite profiles (energy, openness, interests) |
| `src/app/onboarding/page.tsx` | Add availability grid as Step 3.5 (after preferences, before photos) |
| `src/app/dashboard/page.tsx` | Add date scheduling flow after Round 3 disclosure |
| `src/components/AvailabilityGrid.tsx` | NEW — Weekly morning/afternoon/evening toggle grid |
| `src/components/DateProposal.tsx` | NEW — Show 4 options with activity + time + venue |

**Activity matching logic (`activity-matcher.ts`):**

```typescript
function suggestActivity(profileA: CompositeProfile, profileB: CompositeProfile): ActivityType {
  const avgEnergy = ((profileA.energy_enthusiasm || 0.5) + (profileB.energy_enthusiasm || 0.5)) / 2
  const avgOpenness = ((profileA.big_five_proxy.openness || 0.5) + (profileB.big_five_proxy.openness || 0.5)) / 2

  if (avgEnergy > 0.7) return pickFrom(['rock_climbing', 'kayaking', 'hiking_new_trail'])
  if (avgOpenness > 0.7) return pickFrom(['pottery_class', 'cooking_class', 'art_workshop'])
  // Both have humor markers → comedy/trivia
  // Default → outdoor_market, food_hall, art_walk
}
```

**Google Places integration:** Search for activity-type venues near the midpoint. Filter by rating, hours, reviews. Return top match per time slot.

**Pre-date nudge (cron, 24h before):** Generate conversation starter from both profiles via Claude Haiku. Specific, not generic: "Ask about [detail from their voice memo]."

**Gate metric:** ≥30% of completed exchanges result in a scheduled date. ≥80% of scheduled dates are confirmed.

---

### 1C: Post-Date Feedback + Trust Scoring

**Schema changes:**

```sql
CREATE TABLE date_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date_id uuid REFERENCES scheduled_dates(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  about_user_id uuid REFERENCES users(id) NOT NULL,
  what_surprised_you text NOT NULL, -- PRIMARY feedback signal
  felt_safe boolean,
  looked_like_photos text, -- yes, somewhat, no
  want_to_see_again text, -- yes, maybe, no
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(scheduled_date_id, user_id)
);

CREATE TABLE trust_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL UNIQUE,
  score float NOT NULL DEFAULT 0,
  dates_completed int DEFAULT 0,
  safety_positive int DEFAULT 0,
  safety_negative int DEFAULT 0,
  photo_accuracy_positive int DEFAULT 0,
  photo_accuracy_negative int DEFAULT 0,
  positive_surprises int DEFAULT 0,
  no_shows int DEFAULT 0,
  ghosting_incidents int DEFAULT 0,
  tier text DEFAULT 'new',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE exit_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  reason text NOT NULL,
  found_match_id uuid REFERENCES matches(id),
  details text,
  created_at timestamptz DEFAULT now()
);
```

**Code changes:**

| File | Change |
|---|---|
| `src/app/api/dates/feedback/route.ts` | NEW — POST date feedback, compute trust score update |
| `src/app/api/cron/post-date-checkin/route.ts` | NEW — Cron: 2h after date end, send check-in notification |
| `src/app/api/cron/second-date-check/route.ts` | NEW — Cron: 5 days after date, ask "Have you seen them again?" |
| `src/lib/trust.ts` | NEW — Trust score computation + tier assignment |
| `src/components/DateFeedback.tsx` | NEW — Post-date feedback form (surprise question first) |
| `src/app/dashboard/page.tsx` | Show feedback prompt when post-date check-in is pending |

**"What surprised you?" extraction:**
After user submits text, run through Claude Haiku to extract:
- Sentiment (positive/negative/neutral surprise)
- Specific attributes mentioned (feeds into OTHER user's composite)
- Whether the match hypothesis was confirmed or refuted

**Trust score computation:** See Spec 03 for formula. Recalculate after every date feedback submission.

**Gate metric:** ≥60% of completed dates get at least one feedback response. "What surprised you?" responses average ≥20 words (not throwaway answers).

---

### 1D: Funnel Tracking Dashboard (Internal)

**Code changes:**

| File | Change |
|---|---|
| `src/app/admin/funnel/page.tsx` | NEW — Internal dashboard showing full funnel metrics |
| `src/app/api/admin/funnel/route.ts` | NEW — Query funnel data across all stages |

**Metrics tracked:**
```
Intros delivered → "I want to know more" rate → Mutual match rate →
Exchange Round 1 completion → Round 2 → Round 3 →
Date scheduled rate → Date confirmed rate → Date completed rate →
"Want to see again" = Yes rate → Second date rate →
Exit survey "found someone on PLY" rate
```

Weekly cohort view: for users who joined week N, what does the funnel look like?

**Gate metric:** Dashboard exists and updates automatically. Every stage of the funnel has a real number.

---

## Phase 2: Extraction Upgrade

**Goal:** Expand the extraction pipeline to capture I-sharing vectors, attachment proxy, aesthetic resonance, and richer admiration signals — so the matching and narrative systems have the data they need.

**Duration: 2-3 sprints**

### 2A: Expand MemoExtraction and CompositeProfile Types

**Schema changes:**

```sql
-- Add new columns to composite_profiles
ALTER TABLE composite_profiles ADD COLUMN humor_signature jsonb DEFAULT '{}';
-- { "what_makes_them_laugh": ["absurdist situations", "wordplay"],
--   "humor_examples": ["..."], "laugh_triggers": ["..."] }

ALTER TABLE composite_profiles ADD COLUMN aesthetic_resonance jsonb DEFAULT '{}';
-- { "what_moves_them": ["live music", "mountain views"],
--   "what_they_notice": ["architecture", "light quality"],
--   "chills_triggers": ["..."] }

ALTER TABLE composite_profiles ADD COLUMN emotional_processing jsonb DEFAULT '{}';
-- { "logic_vs_emotion": 0.6, "internal_vs_external": 0.3 }

ALTER TABLE composite_profiles ADD COLUMN attachment_proxy jsonb DEFAULT '{}';
-- { "comfort_with_closeness": 0.7, "comfort_with_independence": 0.6,
--   "reassurance_seeking": 0.4 }

ALTER TABLE composite_profiles ADD COLUMN values_in_action text[] DEFAULT '{}';
-- Stories of values being lived, not just stated

ALTER TABLE composite_profiles ADD COLUMN demonstrated_competence text[] DEFAULT '{}';
-- Mastery stories extracted from voice

ALTER TABLE composite_profiles ADD COLUMN friend_vouch_quotes text[] DEFAULT '{}';
-- Notable quotes from friend vouches
```

**Code changes:**

| File | Change |
|---|---|
| `src/lib/types.ts` | Expand `MemoExtraction` with new fields: `humor_signature`, `aesthetic_resonance`, `emotional_processing`, `attachment_signals`, `values_in_action_stories`, `competence_stories`. Expand `CompositeProfile` with corresponding aggregate fields. |
| `src/lib/extraction.ts` | Update Claude Haiku extraction prompt to extract new fields. Add new extraction categories for I-sharing and attachment prompts. |
| `src/lib/extraction.ts` | Update `buildCompositeProfile()` to aggregate new fields with temporal weighting. |

**Extraction prompt update:**

The current extraction prompt asks for Big Five, humor_style (categorical), warmth, directness, etc. Add:

```
## I-Sharing Signals (extract if present):
- humor_signature: What SPECIFICALLY makes them laugh? Not a category — concrete examples, references, types of absurdity.
- aesthetic_resonance: What moves them? What do they notice? What gives them chills? What stops them in their tracks?
- emotional_processing: Do they lead with logic or emotion when telling stories? Do they process by talking through it or sitting with it?

## Attachment Signals (extract if behavioral evidence exists):
- comfort_with_closeness: Evidence of ease or discomfort with intimacy/vulnerability (0-1)
- comfort_with_independence: Evidence of ease or discomfort with partner autonomy/space (0-1)
- reassurance_seeking: Evidence of needing reassurance vs. self-soothing (0-1)

## Admiration Signals:
- values_in_action: Specific stories where they DEMONSTRATED values, not just stated them
- demonstrated_competence: Stories of mastery — what have they gotten genuinely good at?
```

**Backward compatibility:** New fields default to null/empty. Existing composite profiles continue to work. New fields populate as users record new memos or existing memos get re-extracted.

**Re-extraction option:** Run a one-time batch job to re-extract all existing voice memos with the updated prompt. This backfills data for existing users.

**Gate metric:** After re-extraction, ≥70% of users with 3+ memos have non-empty `humor_signature` and `aesthetic_resonance` fields.

---

### 2B: New Onboarding Prompts

Add prompts that specifically target I-sharing and attachment signals. These supplement (don't replace) the existing 6 prompts.

**Schema changes:**

```sql
-- Expand prompt categories
ALTER TABLE prompts DROP CONSTRAINT prompts_category_check;
ALTER TABLE prompts ADD CONSTRAINT prompts_category_check
  CHECK (category IN ('warmth', 'humor', 'depth', 'ambition', 'vulnerability', 'i_sharing', 'attachment', 'self_expansion'));

-- Add new prompts
INSERT INTO prompts (id, text, day_number, category) VALUES
  ('chills_moment', 'What''s the last thing that gave you actual chills — a song, a moment, a sentence?', 0, 'i_sharing'),
  ('notice_first', 'When you walk into a room, what do you notice first?', 0, 'i_sharing'),
  ('grab_arm', 'Describe a moment that made you grab someone''s arm and say "did you SEE that?"', 0, 'i_sharing'),
  ('not_funny_to_others', 'What cracks you up that other people don''t find funny at all?', 0, 'i_sharing'),
  ('partner_goes_quiet', 'When someone you''re seeing goes quiet for a day, what''s your honest first thought?', 0, 'attachment'),
  ('needs_space', 'How do you handle it when someone needs more space than you expected?', 0, 'attachment');
```

**Code changes:**

| File | Change |
|---|---|
| `src/app/onboarding/page.tsx` | Add new prompts to the voice recording step. User picks 2+ from expanded bank of 12 prompts. Organize by section: "Tell us about you" (existing 6) + "What moves you" (i_sharing) + "How you connect" (attachment). |

**Gate metric:** Users who record at least 1 I-sharing prompt have measurably richer `humor_signature` and `aesthetic_resonance` fields than those who don't.

---

### 2C: Friend Vouch Feature

**Schema changes:**

```sql
CREATE TABLE friend_vouches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL, -- the user being vouched for
  friend_name text NOT NULL,
  friend_email text,
  invite_token text UNIQUE NOT NULL,
  audio_storage_path text,
  duration_seconds float,
  transcript text,
  extraction jsonb,
  status text DEFAULT 'invited', -- invited, recorded, processed
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_vouches_user ON friend_vouches(user_id);
CREATE INDEX idx_vouches_token ON friend_vouches(invite_token);
```

**Code changes:**

| File | Change |
|---|---|
| `src/app/api/vouch/invite/route.ts` | NEW — POST: generate invite link with token |
| `src/app/api/vouch/record/route.ts` | NEW — POST: friend uploads voice memo via invite link |
| `src/app/vouch/[token]/page.tsx` | NEW — Public page: friend sees "[Name] wants you to vouch for them. Record a 60-second voice memo answering: What's the thing about [Name] that people don't see right away?" |
| `src/lib/extraction.ts` | Add `extractFromVouch()` — same pipeline but with vouch-specific prompt |
| `src/app/dashboard/page.tsx` or settings | Add "Invite a friend to vouch for you" CTA |

**Extraction from vouch:** Uses same pipeline but extraction prompt emphasizes: "This is a THIRD-PARTY description of someone. Extract: what qualities does the friend highlight? What specific stories or examples do they give? What's the most quotable line?"

**Integration:** Vouch quotes get added to `composite_profiles.friend_vouch_quotes`. Vouch-sourced traits get 1.3x credibility weight in composite aggregation.

**Limits:** Max 3 vouches per user. Friend can't vouch if they're also a user matching with the same gender.

**Gate metric:** ≥15% of users invite at least one friend within first 30 days. Vouch completion rate (friend actually records) ≥40%.

---

## Phase 3: Narrative Intelligence

**Goal:** Upgrade from single-shot narrative generation to multi-stage pipeline with strategy selection, multi-draft generation, critic scoring, and quote integration.

**Duration: 2-3 sprints**

### 3A: Strategy Selector

**Code changes:**

| File | Change |
|---|---|
| `src/lib/narrative-strategy.ts` | NEW — Score all 12 strategy types across 4 tiers. Select winner based on data availability + recipient excitement type + historical effectiveness. |
| `src/lib/matchmaker.ts` | Update `generateMatchAngle()` to call strategy selector first, pass strategy to generation. |

**Implementation:**

```typescript
interface NarrativeStrategy {
  tier: 'self_expansion' | 'i_sharing' | 'admiration' | 'comfort'
  type: string // 'novel_world', 'humor_resonance', 'values_in_action', etc.
  rationale: string // why this strategy was chosen — passed to generator
  dataPoints: string[] // specific data to reference
  mandatoryElements: {
    selfExpansionSignal: string // every narrative needs one
    admirationSignal: string // every narrative needs one
  }
}

function selectStrategy(
  recipient: CompositeProfile,
  subject: CompositeProfile,
  compatibilityBreakdown: Record<string, number>
): NarrativeStrategy
```

Rules engine, not ML. Scores each strategy 0-1 based on available data, applies excitement type modifiers, picks highest. If top two are within 10%, randomly pick (exploration).

**Gate metric:** Strategy selector covers all 12 types within first 100 matches. No single strategy accounts for >40% of selections.

---

### 3B: Multi-Draft Generation + Critic

**Code changes:**

| File | Change |
|---|---|
| `src/lib/matchmaker.ts` | Replace single `writeAngle()` call with `generateDrafts()` → `scoreDrafts()` → pick winner pipeline. |
| `src/lib/narrative-critic.ts` | NEW — Critic prompt scores drafts on 5 dimensions (specificity, arc, authenticity, brevity, connection). Returns scores + winner. |

**Implementation:**

`generateDrafts()`: 3 parallel Claude Sonnet calls with same strategy but different style emphasis:
- Draft 1: "Prioritize specificity — use concrete details from voice memos"
- Draft 2: "Prioritize emotional arc — build anticipation, deliver payoff"
- Draft 3: "Prioritize brevity and punch — every word earns its place"

`scoreDrafts()`: Single Claude Sonnet call with all 3 drafts + rubric. Returns scores per dimension + overall. If best score < 30/50, regenerate once with critic feedback.

**Quote integration:** Before drafts are generated, select best quote from `notable_quotes` + `friend_vouch_quotes` (if available). Score on relevance to strategy, specificity, brevity, emotional weight. Pass selected quote to generators with instruction to weave it in naturally.

**Schema addition:**
```sql
ALTER TABLE matches ADD COLUMN narrative_strategy text;
ALTER TABLE matches ADD COLUMN narrative_a_critic_score float;
ALTER TABLE matches ADD COLUMN narrative_b_critic_score float;
ALTER TABLE matches ADD COLUMN narrative_a_used_quote boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN narrative_b_used_quote boolean DEFAULT false;
```

**Cost control:** 3 drafts + 1 critic = ~4 Sonnet calls per side = ~8 per match pair. At $0.003/1K input tokens, ~$0.10-0.15 per match pair. Acceptable for daily delivery; for bonus matches, can fall back to single-draft with strategy.

**Gate metric:** Average critic score > 35/50. Narratives with critic score >40 have ≥15% higher "I want to know more" rate than those with score <35.

---

### 3C: Narrative A/B Testing Framework

**Schema changes:**

```sql
CREATE TABLE narrative_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hypothesis text,
  variant_a_config jsonb NOT NULL,
  variant_b_config jsonb NOT NULL,
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  concluded_at timestamptz,
  winner text,
  results jsonb
);

ALTER TABLE matches ADD COLUMN narrative_experiment_id uuid REFERENCES narrative_experiments(id);
ALTER TABLE matches ADD COLUMN narrative_variant text; -- 'a' or 'b'
```

**Code changes:**

| File | Change |
|---|---|
| `src/lib/narrative-experiment.ts` | NEW — Assign matches to experiments, apply variant config, track results |
| `src/app/admin/experiments/page.tsx` | NEW — Internal: create/view/conclude experiments |

**First experiments to run:**
1. Quote placement: in first sentence vs. as climax
2. Length: 2 sentences vs. 4 sentences
3. Comfort priming: include warmth/ease signal vs. don't

**Gate metric:** First experiment reaches conclusion (95% posterior probability on primary metric) within 6 weeks.

---

## Phase 4: Living Profile

**Goal:** Weekly voice journaling that keeps profiles fresh, enables second-chance matching, and generates continuous training data.

**Duration: 2-3 sprints**

### 4A: Journal Prompt Bank + Weekly Delivery

**Schema changes:**

```sql
CREATE TABLE journal_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text NOT NULL,
  signal_domain text NOT NULL,
  -- warmth, humor, depth, ambition, vulnerability, self_expansion, i_sharing, attachment
  active boolean DEFAULT true,
  times_used int DEFAULT 0,
  avg_recording_duration float,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  prompt_id uuid REFERENCES journal_prompts(id) NOT NULL,
  prompt_text text NOT NULL,
  signal_domain text NOT NULL,
  audio_storage_path text NOT NULL,
  duration_seconds float,
  transcript text,
  extraction jsonb,
  week_number int NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_journal_user ON journal_entries(user_id, created_at DESC);

CREATE TABLE user_prompt_history (
  user_id uuid REFERENCES users(id) NOT NULL,
  prompt_id uuid REFERENCES journal_prompts(id) NOT NULL,
  delivered_at timestamptz DEFAULT now(),
  recorded boolean DEFAULT false,
  PRIMARY KEY(user_id, prompt_id)
);
```

**Code changes:**

| File | Change |
|---|---|
| `src/app/api/journal/prompt/route.ts` | NEW — GET: select next prompt for user (stale domain + variety) |
| `src/app/api/journal/record/route.ts` | NEW — POST: upload journal entry, trigger async extraction |
| `src/app/api/cron/journal-delivery/route.ts` | NEW — Weekly cron: deliver prompt notification to eligible users |
| `src/app/journal/page.tsx` | NEW — Journal recording page: see prompt, record, submit |
| `src/components/JournalRecorder.tsx` | NEW — Reuse VoiceRecorder with journal-specific UI |

**Prompt selection algorithm:**
1. Check which signal domains have oldest data for this user
2. Select domain with most stale coverage
3. Pick prompt from that domain not asked in last 8 weeks
4. Never same domain two weeks in a row

**Seed 30 prompts** across 8 domains (see Spec 05 for full list including I-sharing and attachment prompts).

**Gate metric:** ≥40% of active users record at least 1 journal entry in their first month. Week-4 retention of journaling ≥50% of week-1.

---

### 4B: Temporal Composite Weighting

**Code changes:**

| File | Change |
|---|---|
| `src/lib/extraction.ts` | Update `buildCompositeProfile()` to accept journal entries with temporal weighting. Decay function: `weight = max(0.1, e^(-weeks/26))`. Onboarding entries get 0.5x base weight after 3 months. |
| `src/lib/db.ts` | Update `getCompositeProfile()` to include journal entries in aggregation. |

**Schema addition:**
```sql
CREATE TABLE composite_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  snapshot_at timestamptz DEFAULT now(),
  composite jsonb NOT NULL,
  delta_from_previous jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_snapshots_user ON composite_snapshots(user_id, snapshot_at DESC);
```

Weekly cron saves a snapshot after recomputing composites. Delta tracking enables the monthly insight card and second-chance detection.

**Gate metric:** Users with 8+ journal entries have measurably different composite profiles than their onboarding-only versions (cosine similarity < 0.90 for ≥30% of active journalers).

---

### 4C: Second-Chance Matching

**Schema + code changes:** See Spec 05 for full schema. Detection algorithm runs weekly after composite snapshots are saved.

**Implementation:** After embedding update for user A, query all previously passed users (>60 days ago, still active), recompute compatibility, flag if delta > 0.15 and new score is top-10%.

**Delivery:** Special narrative framing: "it wasn't the right time before, but..." Max 1 per user per quarter. If passed again, permanent exclude.

**Gate metric:** Second-chance matches that surface have ≥20% higher mutual interest rate than the user's average first-time matches.

---

## Phase 5: Relationship Genome

**Goal:** Replace hand-tuned scorer with a learned model trained on real interaction outcome data collected in Phases 1-4.

**Duration: 3-4 sprints**

**Prerequisites:**
- ≥500 feedback events from Phase 1 (Likes + passes + date outcomes)
- ≥50 mutual matches
- ≥20 completed dates with feedback
- I-sharing and attachment extraction data from Phase 2

### 5A: Feature Engineering + Embedding Infrastructure

**Code changes:**

| File | Change |
|---|---|
| `src/lib/embedding.ts` | NEW — Convert composite profile → feature vector. Concatenate all Tier 1-4 inputs. Handle missing data (default to 0.5 for floats, zero vector for missing categories). |
| Supabase migration | Enable `pgvector` extension. Add `embedding vector(128)` column to `composite_profiles`. |

**Feature vector structure (ordered by tier):**

```
Tier 1 — Self-Expansion (dims 0-31):
  interest_tags embedding (16 dims, learned or bag-of-words)
  passion_indicators embedding (8 dims)
  goals embedding (8 dims)

Tier 2 — I-Sharing (dims 32-55):
  humor_signature embedding (8 dims)
  aesthetic_resonance embedding (8 dims)
  emotional_processing (2 floats: logic_vs_emotion, internal_vs_external)
  humor_style one-hot (6 dims)

Tier 3 — Admiration (dims 56-87):
  values embedding (16 dims)
  values_in_action count (1 float)
  competence_stories count (1 float)
  friend_vouch available (1 float)
  kindness_markers count (1 float)
  vulnerability_authenticity (1 float)
  social_proof_quality (1 float)
  Big Five proxy (5 floats)
  storytelling_ability (1 float)
  energy_enthusiasm (1 float)

Tier 4 — Comfort/Stability (dims 88-99):
  communication_warmth (1 float)
  communication_directness (1 float)
  attachment: comfort_with_closeness (1 float)
  attachment: comfort_with_independence (1 float)
  attachment: reassurance_seeking (1 float)
  agreeableness (1 float, from Big Five)
  neuroticism (1 float, from Big Five)

Demographics (dims 100-111):
  age normalized (1 float)
  location embedding (8 dims)
  education ordinal (1 float)
  Elo normalized (1 float)

Behavioral (dims 112-127, zeros until available):
  interest rate (1 float)
  avg time-to-action (1 float)
  dwell time pattern (4 floats)
  exchange completion rate (1 float)
  date completion rate (1 float)
  surprise sentiment average (1 float)
  [padding to 128]
```

### 5B: Training Pipeline

**Technology:** Python script (PyTorch), runs on a scheduled cloud instance (not Vercel). Exports ONNX model for inference in Node.js.

**Training data builder:**
1. Query all feedback events, mutual matches, disclosure exchanges, dates, date feedback
2. Build positive pairs (mutual interest, completed dates, second dates, relationships) with weights from Spec 01
3. Build negative pairs (passes, expired matches) with lower weights
4. For each pair, compute feature vectors from composite profiles at the time of the match (use composite snapshots)

**Model:** Start with dot product + sigmoid (Architecture #1). 128-dim embeddings → dot product → sigmoid → P(chemistry conditions).

**Validation:** Hold out 20% of data. Primary metric: AUC on mutual interest prediction. Secondary: AUC on date completion prediction.

**Deployment:** Export to ONNX. Load in Node.js via `onnxruntime-node`. Replace `scoreCompatibility()` in `matchmaker.ts` with `scoreWithModel()`.

### 5C: A/B Test Model vs. Hand-Tuned

**Code changes:**

| File | Change |
|---|---|
| `src/lib/matchmaker.ts` | Add model-based scorer alongside hand-tuned scorer. Randomly assign users to model vs. control. |
| `src/app/api/admin/ab-test/route.ts` | NEW — View A/B test results: mutual interest rate, date rate, second date rate by group |

**Assignment:** 50/50 split. Stable per user (hash user_id to group). Run for 4+ weeks.

**Ship criteria:** Model beats hand-tuned on BOTH mutual interest rate AND date completion rate with 90% posterior probability.

**Gate metric:** Learned model achieves ≥10% improvement on mutual interest rate AND ≥5% improvement on date completion rate vs. hand-tuned scorer.

---

## Phase 6: Conversational AI Matchmaker

**Goal:** Replace prompted voice recordings with adaptive AI conversations for onboarding, match delivery (audio), and post-date debriefs.

**Duration: 4-6 sprints**

**This is the highest-risk, highest-reward phase. Build it last because it benefits from all other systems being in place.**

### 6A: Audio Match Delivery (lowest risk, ship first)

Convert text narratives to audio using TTS in the matchmaker's voice.

**Code changes:**

| File | Change |
|---|---|
| `src/lib/tts.ts` | NEW — Generate audio from narrative text using ElevenLabs API. Consistent voice ID. Cache common phrases. |
| `src/app/api/matches/audio/route.ts` | NEW — GET: return audio file for a match intro |
| `src/app/dashboard/page.tsx` | Add audio player to MatchCard. Play audio first, show text as fallback/reference. |

**Voice selection:** Create a custom ElevenLabs voice for the matchmaker character. Warm, mid-tempo, slight smile. Test with 10 users before committing.

**Cost:** ~$0.01-0.03 per narrative audio. Pre-render during cron delivery, not on-demand.

**Gate metric:** ≥60% of users listen to audio intro (vs. reading text). User preference survey: ≥70% prefer audio.

### 6B: Post-Date Conversational Debrief

Replace structured feedback form with a brief voice conversation.

**Implementation:** Use a simpler version of the full conversational engine — 3-4 guided questions, not free-form. The matchmaker asks "What surprised you about [Name]?", listens, follows up once, then asks safety/logistics questions.

**Technology:** Streaming STT (Deepgram) → Claude Haiku for follow-up generation → ElevenLabs TTS for matchmaker response.

**Latency target:** <1.5s response time. Use filler phrases ("Hmm, yeah...") while generating.

**Gate metric:** Conversational debriefs yield ≥30% more words per response than text form. Extracted signal richness (number of non-empty fields) is ≥20% higher.

### 6C: Conversational Onboarding (highest risk)

Replace 6 fixed prompts with an adaptive 8-12 minute conversation.

**This is a major UX change.** A/B test against prompted recordings before committing. If conversational onboarding doesn't produce richer composite profiles with ≥70% user preference, keep the prompted approach.

**Implementation:** Full conversation engine with signal coverage tracking, adaptive follow-ups, session persistence.

**Gate metric:** Composite profiles from conversational onboarding have higher signal coverage (more non-null fields) than prompted, AND ≥70% of users prefer the conversational experience in blind comparison.

---

## Cross-Cutting Concerns

### Vercel Deployment
- All API routes must be serverless-compatible
- LLM calls may need longer timeouts (Vercel Pro: 60s max for serverless, 300s for streaming)
- TTS audio files stored in Supabase Storage, not Vercel filesystem (read-only)
- Cron jobs via Vercel Cron (vercel.json)

### Cost Tracking
- Add cost logging to every LLM call: model, input_tokens, output_tokens, cost_usd
- Monthly budget alerts at $100, $250, $500
- Per-user cost tracking for Phase 3 (multi-draft narratives are the biggest cost driver)

### Privacy
- Voice memos and journal entries are private — never shared raw with matches
- Only extracted signals and AI-generated narratives are shared
- Friend vouches: friend's name is never shared, only extracted content
- Post-date feedback: "What surprised you?" about a person is used to update THEIR profile, but is never shown to them verbatim
- Attachment proxy is stored as behavioral dimensions, never as clinical labels

### Testing Strategy
- Unit tests for scoring functions, strategy selection, temporal weighting
- Integration tests for the full pipeline: voice memo → extraction → composite → matching → narrative
- Manual QA for narrative quality: read 20 narratives per sprint, score against rubric
- A/B test every major change before shipping to 100%

---

## Summary: What Ships When

| Phase | Key Deliverable | Gate Metric | Depends On |
|---|---|---|---|
| 1A | Mutual matches + structured disclosure | ≥50% Round 1 completion | Nothing |
| 1B | Date scheduling with novel activities | ≥30% of exchanges → date | 1A |
| 1C | Post-date feedback + trust | ≥60% feedback response rate | 1B |
| 1D | Funnel dashboard | All stages have real numbers | 1A-1C |
| 2A | Expanded extraction (I-sharing, attachment) | ≥70% non-empty new fields | Nothing (parallel with 1) |
| 2B | New onboarding prompts | Richer extraction from I-sharing prompts | 2A |
| 2C | Friend vouches | ≥15% invite rate, ≥40% completion | 2A |
| 3A | Narrative strategy selector | All 12 types used in first 100 matches | 2A |
| 3B | Multi-draft + critic | Avg critic score >35/50 | 3A |
| 3C | Narrative A/B testing | First experiment concludes in 6 weeks | 3B |
| 4A | Weekly journaling | ≥40% record in first month | 2A |
| 4B | Temporal composites | Measurable profile drift for journalers | 4A |
| 4C | Second-chance matching | ≥20% higher mutual interest vs. average | 4B, 5A |
| 5A | Embedding infrastructure | Feature vectors for all users | 2A |
| 5B | Trained model | AUC improvement on held-out data | 5A, 1C (needs date data) |
| 5C | A/B test model | ≥10% mutual interest improvement | 5B |
| 6A | Audio match delivery | ≥60% listen rate | 3B |
| 6B | Conversational debrief | ≥30% richer responses | 1C |
| 6C | Conversational onboarding | ≥70% user preference | 6B |

**Phase 1A is the single most important deliverable.** It unblocks mutual match detection, structured disclosure, and the entire post-match funnel. Start here, ship fast, iterate.
