# How People Like You Works

A complete technical and product overview of the PLY system.

---

## The Core Thesis

PLY is not in the matching business. PLY is in the **introduction business**.

Compatible people are everywhere. You probably walked past three of them today. Our magic is writing an introduction so compelling that two people show up to their first conversation already excited about each other.

The matching algorithm exists to serve the introduction engine, not the other way around.

---

## The Three Layers

### Layer 1: The Filter (Binary — Pass/Fail)

Remove people who are fundamentally incompatible. This is table stakes.

**Hard filters (dealbreakers):**
- Age range (min/max)
- Distance / willingness to relocate (`same_metro`, `few_hours`, `anywhere`)
- Kids (has/wants/open/doesn't want)
- Faith importance (essential/important/nice to have/doesn't matter)
- Religion + observance level (practicing/cultural/background)
- Smoking
- Marital history

Filters are **bidirectional** — both people must pass each other's dealbreakers.

**Religion perimeter system:**
- Everyone is asked their religious background (LDS, JW, Orthodox Jewish, Catholic, etc.)
- If faith = essential + observance_match = must_match → only show same religion AND same observance level
- If faith = important → same religion required, observance preferred
- Otherwise → no filter, but data is stored for others who care

### Layer 2: The Elo Gate (Attraction Baseline)

Ensure you're shown people you could reasonably be physically attracted to.

- During onboarding, users swipe through ~15 photos (no profiles, just photos)
- Standard chess Elo: K=32 for first 20 interactions, K=16 after
- Starts at 1200
- Match candidates must be within ±150 Elo (widens to ±300 if pool is thin, then unlimited)
- Elo gating is **soft** — it widens automatically. Never leaves someone with zero matches.

**How Elo learns after onboarding:**
- Photo-stage rejection ("Not for me" after seeing the photo) → gentle Elo adjustment (K=8)
- Photo-stage interest → reinforces everything

### Layer 3: The Introduction Engine (The Magic)

Given a pool of filter-passing, Elo-eligible candidates, the system:
1. Picks the best candidate to introduce today
2. Writes a 5-7 sentence "trailer" about that person
3. Learns from the outcome

---

## The Introduction Engine

### Structure: Hook → Story → Proof → Close

Every intro follows this structure:

1. **HOOK** (1 sentence) — stops the scroll. Uses one of 3 tested hook types.
2. **STORY** (2-3 sentences) — a specific anecdote showing character through ACTION. Not adjectives. Connects actions to how the person thinks, not just what they did.
3. **PROOF** (1 sentence) — a concrete accomplishment, thing they built, or how others experience them.
4. **CLOSE** (1 sentence) — a vivid image, joke, or specific detail that stays with you. Never a rhetorical question. Never sentiment.

### The 3 Hook Types

Each Daily Three card uses a different hook type. The user's 🔥 tells us which worked.

| Hook Type | What it does | Psychological trigger |
|-----------|-------------|----------------------|
| **Quote** | Lead with their most striking actual words | Authenticity |
| **Contradiction** | Two things about them that shouldn't go together | Complexity |
| **Scene** | Paint what being around them is like | Imagination |

### Intro Tone Rules (hard constraints — never violate)

1. **Never braggy.** If a story makes the person sound like they're announcing their own virtue, don't use it. Show actions, don't celebrate them.
2. **Never personify the app.** No "you need to meet" or "okay so there's this person." No narrator voice.
3. **Contradiction > single note.** Tension between two sides is always more interesting.
4. **Close with vivid image or joke, never sentiment.** If the last sentence could go on a Hallmark card, rewrite it. No rhetorical questions.
5. **Don't explain the meaning.** Show behavior, stop. Don't add "and that tells you everything."
6. **Frame accomplishments as creation, not ego.** "Built something that didn't exist before" >> "is really good at building things."
7. **No superlatives.** Not "the greatest" or "the most amazing" — just show it.
8. **Specifics > patterns.** "Tim Ho Wan and then four more Chinese restaurants" >> "loves food."
9. **The intro is about the SUBJECT, not the reader.** Don't reference the reader's interests. They know what they like.

### Generation Pipeline

For each intro:
1. Build prompt with subject's data + reader context (used only to choose which qualities to lead with)
2. Generate 3 creative variations (same hook type, different approaches)
3. Critic scores each on: hook_power, intrigue, specificity, mystery
4. Best draft wins; if below threshold (30/50), regenerate with feedback

---

## The Daily Experience

### The Daily Three + 🔥 System

Every day, users get 3 intro cards. Narrative only — no photos.

**Actions per card:**
- 🔥 **"Tell me more"** — spends daily fire, reveals the photo
- 💾 **"Save for later"** — keeps card for future 🔥
- 👋 **"Pass"** — sends to re-pitch pool

**You get 1 🔥 per day.** That's it.

**After 🔥 → photo revealed:**
- "I'm interested" → match recorded, check for mutual
- "Not for me" → Elo signal (narrative worked, attraction didn't). Permanent rejection (Rule 1).

**If mutual match → bonus 🔥 tomorrow** (reward engagement)

### The Save Queue

If you like 2+ intros but only have 1 🔥, save the others. Saved intros stack up. You can 🔥 a saved intro any time.

This is the **monetization lever**: wanting more 🔥s = product-market fit signal.
- Free: 1 🔥/day + bonus for mutual matches
- Premium (future): 2 🔥/day

### When You Pass All 3

If you 👋 all 3 cards:
- App shows each card again one-by-one with voice feedback option + quick-tap reasons
- "Nothing grabbed me" / "Not my type" / "Too similar to yesterday" / "Intro felt generic"
- 🎙️ voice note option for richest signal

After 3 consecutive all-pass days → prompt: "We're not nailing it yet — tell us what you're looking for."

---

## The Re-Pitch System

A great match can die because the first intro used the wrong angle.

**Rules:**
- A person can be pitched up to **5 times** (1 original + 4 retries)
- Each re-pitch MUST use a **different hook type**
- Re-pitches appear **3-7 days** after the original
- The user never knows they're seeing a re-pitch (different hook = different intro)
- After 5 failed attempts → **retire permanently** (real compatibility miss)

**What re-pitches teach us:**
- Conversion on attempt 2+ proves the match was right but the angle was wrong
- Which hook type finally worked → strongest signal for the reader's preferences
- If all 5 fail → real data that this pair doesn't work

---

## The Learning Model

### Per-User Preference Model

Every user has a preference model that evolves with each interaction:

```
tier_weights: { self_expansion, i_sharing, admiration, comfort } — distribution, sums to 1
hook_effectiveness: { quote, contradiction, scene } — 🔥 rate per hook type
fires_available: int (usually 1, +1 for mutual match)
save_queue: IntroCard[] (saved intros waiting)
all_pass_streak: int (consecutive days of passing all 3)
rejection_themes: string[] (extracted from voice feedback)
```

### Update Rules

After each Daily Three interaction:
- 🔥 = **strong positive** for that hook type (+0.15 learning rate)
- 💾 = **moderate positive** (+0.08)
- 👋 = **soft negative** (-0.05)
- Re-pitch conversion = **strongest signal** (2x learning rate)
- All-pass streak ≥ 3 = trigger voice feedback prompt

### Exploration → Exploitation

- **First 5 days:** exploration rotation (vary hook types across the 3 daily cards)
- **After 5 days:** Thompson sampling — exploit best-performing hook 70%, explore 30%

---

## The Feedback Loop

Every signal feeds back into the system:

| Signal | Feeds Into | Mechanism |
|--------|-----------|-----------|
| 🔥 on a card | Hook type effectiveness (strong +) | Increase that hook's weight |
| 💾 Save | Hook type effectiveness (moderate +) | Narrative landed, not top pick |
| 👋 Pass | Hook type effectiveness (soft -) | Card → re-pitch pool |
| All 3 passed | Batch quality flag | Shift next day's hooks; trigger feedback after 3 streak |
| Per-card voice feedback | Rejection themes | Extract specific reasons per person |
| Re-pitch converts | Hook effectiveness (strongest signal) | Winning hook gets big boost |
| All 5 re-pitches fail | Candidate ranking | Retire candidate permanently |
| Passed at photo stage | Elo | Gentle adjustment (K=8). Permanent (Rule 1). |
| Interested after photo | Full positive | Reinforce everything |
| Mutual match | Engagement reward | Unlock bonus 🔥 |
| 🔥 from saved queue | Delayed strong positive | Confirms narrative held up over time |

---

## Onboarding Flow

1. **Signup** — phone OTP (primary) or email + password (fallback)
2. **About you** — first name, gender, birth year, zip code
3. **Tell us about yourself** — voice recordings (6 prompts, 2+ required, swap any)
4. **Dealbreakers** — age range, relocate, faith → religion → observance (cascading), kids, marital
5. **Photos** — 1-3 photos
6. **Profile reveal** — spinner while processing runs, then 5-dimension personality card, strikeable traits

### Voice Recording: Question Assortment

55 questions across 5 dimensions:
- 🧭 **Explorer** (Self-Expansion): 12 questions — rabbit holes, side quests, unpopular takes
- 💜 **Connector** (I-Sharing): 12 questions — what gives you chills, comfort food, green flags
- ⭐ **Builder** (Admiration): 12 questions — bets on yourself, failures, values tested
- 🏠 **Nurturer** (Comfort): 9 questions — how you recharge, hard days, morning routines
- ⚡ **Wildcard** (Fun): 10 questions — conspiracy theories, worst dates, zombie apocalypse skills

**Selection:** 1 question per dimension guaranteed + 1 user's choice. Skip → another question in the same dimension. "This isn't me" opt-out after 2 skips.

### Question Quality Tracking

Per-question metrics (tracked automatically):
- Average word count
- Word count variance (high = good triaging question)
- Average response depth
- Skip rate

---

## Extraction Pipeline (Two-Pass)

### Pass 1: Story Extraction (Claude Haiku — per memo)
Extracts WHAT HAPPENED: story summary, concrete details, people mentioned, emotions, notable quotes, response depth rating.

### Pass 2: Personality Profile (Claude Sonnet — once across ALL memos)
Reads all story extractions together. Cross-references patterns. Extracts per-dimension data points (specific and concrete, not abstract). Identifies primary energy, hidden depth, humor signature, conversation fuel.

**Key principle:** Pass 1 extracts facts. Pass 2 finds patterns. A brief mention in one memo doesn't become a trait unless it's a pattern across stories.

### Versioning + Backtest
- All prompts are versioned (v2.0)
- `backtest-extraction.ts` re-runs extraction on existing transcripts with current prompts
- Results saved as JSON with version stamps for comparison

---

## Voice Recording Resilience

Recordings are the single most valuable user input. Losing them means asking someone to re-record — unacceptable. Every layer has redundancy.

### Recording (Client-Side)

**Format selection:** Prefers `audio/mp4` on Safari (WebM/Opus can produce silent files), `audio/webm;codecs=opus` on Chrome/Firefox.

**Live audio monitoring:** `AnalyserNode` (FFT 256) checks mic input every 200ms. UI shows "Waiting for audio — speak into your mic" (gray dot) until signal detected, then "Recording..." (red pulse).

**Silent recording rejection:** On stop, checks two things:
1. Was any audio signal ever detected? (`hasAudioSignal` flag from AnalyserNode)
2. Is the file suspiciously small? (`blob.size / duration < 500` bytes/sec)

If either fails → "We didn't pick up any audio." Recording rejected, user stays on prompt.

### Upload (Immediate, Not Batched)

Each recording uploads to Supabase Storage **immediately** after the user stops recording — not held in browser memory.

- VoiceRecorder shows "Saving..." spinner during upload
- On success → stores server-confirmed `memoId` (not blob) in React state
- On failure → shows error, returns to idle, user can retry (blob still in memory as fallback)
- **On page refresh:** recordings state hydrated from server via `GET /api/voice-memo?userId=X`

This means a browser crash, tab close, or page refresh never loses a recording.

### Transcription (Retry + Model Fallback)

| Attempt | Model | On empty/short result |
|---------|-------|----------------------|
| 1 | `gpt-4o-mini-transcribe` | Retry after 1s |
| 2 | `gpt-4o-mini-transcribe` | Switch to fallback model |
| 3 | `whisper-1` | Retry after 1s |
| 4 | `whisper-1` | Mark as failed |

Transcripts < 5 characters are rejected (catches Whisper hallucinations on silent/corrupt audio).

### Processing Status Tracking

Each voice memo has a `processing_status` in the database:

| Status | Meaning |
|--------|---------|
| `pending` | Uploaded, not yet processed |
| `transcribed` | Audio → text succeeded |
| `extracted` | Full pipeline completed (story + personality + composite) |
| `failed` | Error occurred — `processing_error` has details, `retry_count` incremented |

Failed memos can be retried via `POST /api/process-memos` with `{ retryFailed: true }`.

### Failure Recovery Matrix

| Failure | Detection | Recovery |
|---------|-----------|----------|
| Silent/broken recording | Client: AnalyserNode + bytes/sec | Rejected before upload, user re-records immediately |
| Upload fails | Server returns error → VoiceRecorder shows it | User taps retry, blob still in memory |
| Page refresh mid-onboarding | Recordings already on server | Hydrated from GET /api/voice-memo on mount |
| Transcription returns empty | Server: < 5 char rejection + model fallback | 4 attempts across 2 models |
| Extraction fails | `processing_status: 'failed'` in DB | Retry via process-memos with retryFailed flag |
| Vercel 5-min timeout | Partial completion | Unprocessed memos stay `pending`, picked up on next call |

---

## The Personality Reveal

5 dimensions scored 0-100%:
- 🧭 **Explorer** — curiosity, novelty-seeking, rabbit holes
- 💜 **Connector** — shared experiences, humor resonance, aesthetic taste
- ⭐ **Builder** — ambition, mastery, values-in-action
- 🏠 **Nurturer** — warmth, communication, comfort
- ⚡ **Wildcard** — humor, unpredictability, spontaneity

**Primary type** = highest score. **Secondary** = second highest.
Headline: "You're a 🧭 Explorer with a side of ⭐ Builder"

**Strikeable traits:** Users can tap any extracted trait to remove it. Striking triggers "answer more questions" nudge.

**Profile completeness:** Richness score 0-100%. Below 80% → soft gate asking for more answers.

---

## Dashboard

4 tabs:
- **💌 Intros** — Daily Three cards with 🔥/💾/👋
- **👤 You** — personality card, strikeable traits, transcripts, "round out your profile" with inline recording
- **🔗 Invite** — share link, invite stats, queue priority points
- **⚙️ Essentials** — account info, editable hard filters, religion/observance

---

## Invite System + Queue Priority

**Every user gets a unique invite link:** `people-like-you.com/join/[code]`

**UTM tracking** on all links (sms, instagram, direct, community, empty_pool).

**Reward structure:**
- Share link → +1 queue priority
- Someone signs up → +5 priority + bonus 🔥
- Someone completes onboarding → +10 priority + bonus 🔥

**Queue priority** = tiebreaker in matching. Users who invite see new members first.

**Empty pool scenarios** all funnel to "invite friends, jump the queue" — turns dead-ends into growth loops.

---

## Model Rules (Inviolable)

1. **Photo-stage rejection is permanent and mutual.** Never re-show.
2. **Narrative-stage non-selection is NOT rejection.** Goes to re-pitch pool.
3. **Distance is bidirectional** with small proximity boost.
4. **Empty pool → invite CTA.** Never show a countdown to nothing.
5. **Elo gating is soft.** Widens automatically.
6. **Re-pitch cooldown is real time.** Expires even if user is inactive.
7. **Never show the same intro text twice.** Re-pitches get different hook types.
8. **Invite priority queue.** Inviters see new members first.
9. **Life-stage matching is layered.** Hard filters gate, soft scoring nudges at half weight.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 |
| iOS | SwiftUI (scaffolded, connects to same API) |
| Database | Supabase PostgreSQL |
| File Storage | Supabase Storage (voice memos, photos) |
| Auth | Supabase Auth (email/password, JWT) |
| Transcription | OpenAI Whisper (gpt-4o-mini-transcribe) |
| Extraction | Claude Haiku 4.5 (Pass 1) + Claude Sonnet 4.6 (Pass 2) |
| Intro Generation | Claude Sonnet 4.6 (3 drafts + critic) |
| Analytics | PostHog |
| Deployment | Vercel |

---

## Statistical Test Plan

| Users | Signal | Time Needed |
|-------|--------|-------------|
| 10 | Qualitative only — read intros, get feedback | — |
| 30 | Kill clearly worst hook type | 7 days |
| 100 | Reliable hook ranking + directional archetype breakdown | 3-7 days |
| 300 | Full archetype × hook matrix, Thompson sampling | 3 days |
| 1000 | A/B test new hooks, per-user personalization | 1 day |

---

# Project Status (March 2026)

## What's Built

| System | Status | Details |
|--------|--------|---------|
| Onboarding flow | Live | signup → basics → 6 voice prompts (2+ required, swap any) → preferences → photos |
| Voice pipeline | Live | Upload → Whisper transcription → Claude two-pass extraction → composite profile |
| Matching engine | Live | 4-factor hand-tuned scorer (values 1.5x, Big Five 1x, interests 1x, warmth 0.5x) |
| Life-stage scoring | Under test | Extracted rootedness/pace/chapter/trajectory at 0.35 weight |
| Daily intro cadence | Live | 1 match/day via cron, Like bonus, 3-day inactivity pause |
| Intro Engine v2 | Live | "The Trailer" — 3 hook types (World, Moment, Tension), Claude Sonnet narratives |
| Dashboard | Live | Hero match card, countdown timer, history, Like/Pass |
| Photo calibration | Live | Elo-based voting for attractiveness tier |
| Auth | Live | Phone-first (SMS OTP) with email fallback |
| Silent recording detection | Live | AnalyserNode signal check + bytes/sec ratio |
| iOS app | Live | Email auth, audio detection, branded screens, synced with web |
| Invite system | Live | Codes, UTM tracking, queue priority, referral rewards |
| Dockerfile | Ready | For Coolify deployment (migrating from Vercel to Hetzner) |

## What Doesn't Exist Yet

- Mutual match detection (A Liked B AND B Liked A)
- Any messaging or exchange between matched users
- Date scheduling
- Post-date feedback
- Trust/safety scoring
- Relationship trajectory tracking
- I-sharing extraction (humor signature, aesthetic resonance, emotional processing)
- Attachment proxy extraction
- Friend vouches
- Structured disclosure exchange
- Multi-draft narrative generation with critic scoring
- Narrative A/B testing
- Weekly voice journaling / living profile
- Learned matching model (embeddings)
- Conversational AI matchmaker
- Coaching engine

## Ongoing Tests

### Life-Stage Soft Scoring (weight 0.35)
- **Started:** 2026-03-24
- **Hypothesis:** Extracted life-stage signals improve match quality at 0.35 weight (~8% of total score)
- **What to watch:** Do life-stage-aligned matches convert to mutual likes more often? Are reinventors correctly distinguished from launchers for 35+ users?
- **Success:** ≥10% higher mutual-like rate for aligned matches
- **Decision point:** Review after 50 mutual matches
- **Next if successful:** Increase weight to 0.75
- **Next if failed:** Remove from scoring, keep extraction for narrative use only

---

# Build Roadmap (6 Phases)

## Phase 1: Outcome Engine Foundation

**Goal:** Make "dates per week" measurable. Build the full post-match funnel.

### 1A: Mutual Match Detection + Structured Disclosure Exchange
**Priority: CRITICAL — next to build. Nothing downstream works without this.**

- Detect when both users Like each other → create `mutual_matches` record
- **Structured disclosure exchange** (replaces free-form messaging):
  - 3 rounds of escalating, personalized prompts generated from both composite profiles via Claude Haiku
  - Round 1: Low stakes, shared ground ("You both mentioned doing something hard that nobody noticed. Tell each other about yours.")
  - Round 2: Medium stakes, curiosity ("What's something you've changed your mind about in the last year?")
  - Round 3: Higher stakes, vulnerability ("What's something you're still figuring out?")
  - Both users answer each round (voice or text); both see the other's response after both submit
  - 48h expiration per round, nudge notification at 48h, match expires at 72h
  - Cron job checks for expired rounds hourly
- UX language shift: "Like" → "I want to know more", "Pass" → "Not this time", "Mutual Match" → "You're both curious"
- After Round 3: "You two clearly have things to talk about. Want to meet?" → triggers date scheduling
- **Why not chat:** Reciprocal (both invest equally), escalating (comfort builds), collaborative (shared questions), bounded (3 rounds, not infinite pen-pal texting)
- **Gate metric:** ≥50% Round 1 completion, ≥30% complete all 3 rounds

### 1B: Date Scheduling
- User availability grid (morning/afternoon/evening per weekday)
- AI-suggested dates: 4 options with activity type + time + venue
- Activity matching from composite profiles:
  - High energy pair → rock climbing, kayaking, new trail hike
  - High openness pair → pottery class, cooking class, art workshop
  - Both humor markers → comedy show, trivia night
  - Default → outdoor market, food hall, art walk
- Google Places integration for venues near midpoint
- Pre-date nudge (24h before): AI-generated conversation starter from both profiles ("Ask about [specific detail from their voice memo]")
- **Gate metric:** ≥30% of completed exchanges → scheduled date, ≥80% confirmed

### 1C: Post-Date Feedback + Trust Scoring
- Post-date check-in 2h after date end
- Primary signal: "What surprised you about [Name]?" — extracted via Claude Haiku, fed back into the OTHER user's composite profile
- Secondary: felt safe? looked like photos? want to see again?
- Trust score computed from: dates completed, safety reports, photo accuracy, no-shows, ghosting incidents
- Trust tiers influence matching priority
- Second-date check at 5 days post-date
- Exit surveys when users leave ("Did you find someone on PLY?")
- **Gate metric:** ≥60% feedback response rate, surprise question ≥20 avg words

### 1D: Funnel Tracking Dashboard (Internal)
- Full funnel:
  ```
  Intros delivered → "I want to know more" rate → Mutual match rate →
  Exchange Round 1 → Round 2 → Round 3 →
  Date scheduled → Date confirmed → Date completed →
  "Want to see again" = Yes → Second date → Exit: "found someone"
  ```
- Weekly cohort view
- **Gate metric:** Every stage has a real number

---

## Phase 2: Extraction Upgrade

**Goal:** Capture I-sharing vectors, attachment proxy, and richer admiration signals for matching and narratives.

### 2A: Expand Extraction Pipeline
- New composite profile fields:
  - `humor_signature` — what specifically makes them laugh (examples, not categories)
  - `aesthetic_resonance` — what moves them, what they notice, what gives them chills
  - `emotional_processing` — logic-first vs emotion-first (0-1), internal vs external processing (0-1)
  - `attachment_proxy` — comfort with closeness (0-1), comfort with independence (0-1), reassurance seeking (0-1)
  - `values_in_action` — stories of values being demonstrated, not just stated
  - `demonstrated_competence` — mastery stories from voice
  - `friend_vouch_quotes` — notable quotes from friend vouches
- Updated Claude extraction prompt targets these signals explicitly
- Re-extraction batch job for all existing memos to backfill
- **Gate metric:** ≥70% of users with 3+ memos have non-empty humor_signature and aesthetic_resonance

### 2B: New Onboarding Prompts
- I-sharing prompts:
  - "What's the last thing that gave you actual chills — a song, a moment, a sentence?"
  - "When you walk into a room, what do you notice first?"
  - "Describe a moment that made you grab someone's arm and say 'did you SEE that?'"
  - "What cracks you up that other people don't find funny at all?"
- Attachment prompts:
  - "When someone you're seeing goes quiet for a day, what's your honest first thought?"
  - "How do you handle it when someone needs more space than you expected?"
- User picks 2+ from expanded bank of 12, organized by section: "Tell us about you" + "What moves you" + "How you connect"
- **Gate metric:** I-sharing prompt answerers have measurably richer extraction

### 2C: Friend Vouches
- Invite up to 3 friends to vouch for you
- Friend sees: "[Name] wants you to vouch for them. Record a 60-second voice memo: What's the thing about [Name] that people don't see right away?"
- Same extraction pipeline with vouch-specific prompt
- Vouch-sourced traits get 1.3x credibility weight in composite aggregation
- Friend's name never shared with matches
- **Gate metric:** ≥15% invite rate within 30 days, ≥40% vouch completion

---

## Phase 3: Narrative Intelligence

**Goal:** Multi-stage narrative pipeline with strategy selection, multi-draft generation, critic scoring, and A/B testing.

### 3A: Strategy Selector
- 12 strategy types across 4 research-grounded tiers:
  - **Self-expansion:** Novel world, complementary growth, perspective gap
  - **I-sharing:** Humor resonance, aesthetic/sensory sync, emotional processing match
  - **Admiration:** Values-in-action, demonstrated mastery, quiet integrity
  - **Comfort:** Communication mirror, vulnerability exchange, shared groundedness
- Every narrative must include at least one self-expansion signal + one admiration signal
- Rules engine scores each strategy 0-1 based on data availability + recipient excitement type
- **Gate metric:** All 12 types used in first 100 matches, no single type >40%

### 3B: Multi-Draft Generation + Critic
- 3 parallel Claude Sonnet calls per side (specificity focus, emotional arc focus, brevity focus)
- Critic prompt scores on 5 dimensions: specificity, arc, authenticity, brevity, connection
- Best quote from notable_quotes + friend_vouch_quotes woven in naturally
- If best score < 30/50, regenerate once with critic feedback
- Cost: ~$0.10-0.15 per match pair
- **Gate metric:** Avg critic score >35/50, high-score narratives ≥15% higher interest rate

### 3C: Narrative A/B Testing
- Experiment framework: variant assignment, result tracking, posterior probability
- First experiments: quote placement, length, comfort priming
- **Gate metric:** First experiment concludes within 6 weeks

---

## Phase 4: Living Profile

**Goal:** Weekly voice journaling keeps profiles fresh and enables second-chance matching.

### 4A: Weekly Micro-Journaling
- One prompt per week (Sunday 7 PM default, configurable)
- Prompts are about life, not dating:
  - Warmth: "Who made your week better? Tell me about them."
  - Humor: "What made you laugh this week?"
  - Depth: "What's something you changed your mind about recently?"
  - Ambition: "What are you most excited about right now?"
  - Vulnerability: "What's been hard lately?"
  - Self-expansion: "What's something new you tried or discovered this week?"
- 30 prompts across 8 signal domains, rotated to fill coverage gaps
- **Gate metric:** ≥40% record in first month, week-4 retention ≥50% of week-1

### 4B: Temporal Composite Weighting
- Decay function: `weight = max(0.1, e^(-weeks/26))`
- Onboarding entries get 0.5x base weight after 3 months
- Weekly composite snapshots with delta tracking
- **Gate metric:** 8+ journal entries → measurably different composite (cosine sim < 0.90 for ≥30%)

### 4C: Second-Chance Matching
- After embedding update, re-score previously passed users (>60 days ago, still active)
- Surface if delta > 0.15 and new score is top-10%
- Special narrative: "It wasn't the right time before, but..."
- Max 1 per user per quarter; if passed again, permanent exclude
- **Gate metric:** ≥20% higher mutual interest rate vs. average first-time matches

---

## Phase 5: Relationship Genome

**Goal:** Replace hand-tuned scorer with a learned model trained on real outcome data.

**Prerequisites:** ≥500 feedback events, ≥50 mutual matches, ≥20 completed dates with feedback

### 5A: Embedding Infrastructure
- 128-dim feature vector per user:
  - Dims 0-31: Self-expansion (interests, passions, goals)
  - Dims 32-55: I-sharing (humor signature, aesthetic resonance, emotional processing)
  - Dims 56-87: Admiration (values, competence, kindness, Big Five, energy)
  - Dims 88-99: Comfort (warmth, directness, attachment dimensions)
  - Dims 100-111: Demographics (age, location, education, Elo)
  - Dims 112-127: Behavioral (interest rate, dwell time, exchange/date completion)
- pgvector in Supabase

### 5B: Training Pipeline
- PyTorch: dot product + sigmoid on 128-dim embeddings → P(chemistry conditions)
- Walk-forward holdout validation using temporal composite snapshots
- Export ONNX for Node.js inference
- **Key constraint:** Model predicts conditions for chemistry emergence, not chemistry itself

### 5C: A/B Test Model vs. Hand-Tuned
- 50/50 stable split (hash user_id), run 4+ weeks
- **Ship criteria:** ≥10% mutual interest improvement AND ≥5% date completion improvement

---

## Phase 6: Conversational AI Matchmaker

**Goal:** Replace prompted recordings with adaptive AI conversations. Highest risk, highest reward — built last.

### 6A: Audio Match Delivery
- Text-to-speech narratives via ElevenLabs in consistent matchmaker voice
- Audio player on match card, text as fallback
- **Gate metric:** ≥60% listen rate, ≥70% prefer audio

### 6B: Post-Date Conversational Debrief
- Voice conversation replacing text feedback form
- Streaming STT (Deepgram) → Claude Haiku → ElevenLabs TTS
- Target <1.5s response time
- **Gate metric:** ≥30% more words, ≥20% richer extraction

### 6C: Conversational Onboarding
- Adaptive 8-12 minute conversation covering all 4 signal tiers
- A/B test against prompted recordings before committing
- **Gate metric:** Higher signal coverage AND ≥70% user preference

---

## Phase 7: Coaching Engine

**Goal:** Personalized coaching that helps users take better photos, give richer answers, and convert matches into dates.

- **Three surfaces:** Coaching cards on Profile tab, inline whispers at decision points, weekly AI summary
- Every touchpoint: **Observation** (data) → **Opportunity** (upside framing) → **Action** (one button)
- Reads pass patterns, photo accuracy, voice memo depth, disclosure completion, date conversion
- Surfaces the single most impactful thing to change right now
- Never punitive — scarcity = opportunity, not anxiety

---

# Research Foundation

The matching and narrative systems are grounded in four mechanisms that create romantic chemistry:

### 1. Self-Expansion (Aron & Aron)
People are attracted to those who expand their world — new perspectives, expertise, experiences. The more novel and enriching someone is relative to your current self-concept, the more attractive they become.

### 2. I-Sharing (Pinel et al., 2006-2018)
The belief that you share an identical subjective experience with someone in real-time — laughing at the same thing, noticing the same detail — creates connection more powerful than objective similarity.

### 3. Admiration (Mate-Value Signaling)
Demonstrated values, competence, and kindness create attraction through respect. Not stated values but lived values — stories of mastery and kindness markers.

### 4. Comfort/Stability (Bowlby Attachment)
Communication warmth, directness, and secure attachment behaviors create the safety needed for authenticity and vulnerability.

### Key Constraint (Joel, Eastwick & Finkel, 2017)
Machine learning can predict who is *generally desirable* but cannot predict which two specific people will experience mutual attraction. Chemistry is emergent. The model predicts *conditions under which chemistry is most likely to emerge through interaction*, not chemistry itself.

---

# What Ships When

| Phase | Deliverable | Gate Metric | Depends On |
|---|---|---|---|
| **1A** | Mutual matches + structured disclosure | ≥50% Round 1 completion | Nothing |
| **1B** | Date scheduling with AI-suggested activities | ≥30% exchanges → date | 1A |
| **1C** | Post-date feedback + trust scoring | ≥60% feedback rate | 1B |
| **1D** | Internal funnel dashboard | All stages have real numbers | 1A-1C |
| **2A** | Expanded extraction (I-sharing, attachment) | ≥70% non-empty new fields | Nothing (parallel) |
| **2B** | New onboarding prompts | Richer extraction | 2A |
| **2C** | Friend vouches | ≥15% invite, ≥40% completion | 2A |
| **3A** | Narrative strategy selector | All 12 types used | 2A |
| **3B** | Multi-draft + critic | Avg score >35/50 | 3A |
| **3C** | Narrative A/B testing | First experiment concludes | 3B |
| **4A** | Weekly journaling | ≥40% record in month 1 | 2A |
| **4B** | Temporal composites | Measurable profile drift | 4A |
| **4C** | Second-chance matching | ≥20% higher mutual interest | 4B, 5A |
| **5A** | Embedding infrastructure | Feature vectors for all users | 2A |
| **5B** | Trained model | AUC improvement | 5A, 1C |
| **5C** | A/B test model vs. hand-tuned | ≥10% mutual interest lift | 5B |
| **6A** | Audio match delivery | ≥60% listen rate | 3B |
| **6B** | Conversational debrief | ≥30% richer responses | 1C |
| **6C** | Conversational onboarding | ≥70% user preference | 6B |
| **7** | Coaching engine | Measurable funnel improvement | 1C, 2A |

**Phase 1A is the critical next step.** It unblocks mutual match detection, structured disclosure, and the entire post-match funnel.
