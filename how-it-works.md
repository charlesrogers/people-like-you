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

1. **Signup** — email + password
2. **About you** — first name, gender, birth year, zip code
3. **Tell us about yourself** — voice recordings (6 prompts, 1 per dimension guaranteed)
4. **Dealbreakers** — age range, relocate, faith → religion → observance (cascading), kids, marital
5. **Photos** — 1-3 photos
6. **Taste calibration** — "Now let's see what excites you" — read seed narratives, like/pass
7. **Profile reveal** — 5-dimension personality card, strikeable traits, "round out your profile"

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
