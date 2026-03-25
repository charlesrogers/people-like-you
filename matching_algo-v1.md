# Matching Algorithm v1 — People Like You

## The Core Thesis

PLY is not in the matching business. PLY is in the **introduction business**.

Our magic is not finding compatible people — compatible people are everywhere. Our magic is writing an introduction so compelling that two people show up to their first conversation already excited about each other.

The matching algorithm exists to serve the introduction engine, not the other way around.

---

## Three Layers

### Layer 1: The Filter (Binary — Pass/Fail)

Remove people who are fundamentally incompatible. This is table stakes.

**Hard filters (dealbreakers):**
- Age range (min/max)
- Distance / willingness to relocate
- Kids (has/wants/open/doesn't want)
- Faith importance
- Smoking
- Marital history

**These are boolean.** Either you pass or you don't. No scoring, no weighting. If someone fails a dealbreaker, they're invisible to you.

### Layer 2: The Elo Gate (Attraction Baseline)

Ensure you're shown people you could reasonably be physically attracted to.

**How it works today:**
- During onboarding, you swipe through ~15 photos (no profiles, just photos)
- Standard chess Elo: K=32 for first 20 interactions, K=16 after
- Starts at 1200
- Match candidates must be within ±150 Elo (widens to ±300 if pool is thin)

**How Elo learns after onboarding:**
- When you pass someone and select "not attracted" as the reason → their Elo nudges down (K=8, gentle)
- When you're interested → your Elo adjusts based on the outcome
- Photo-revealed-before-decision is tracked — if you read the intro, loved it, then saw the photo and passed, that's an Elo signal (not a narrative signal)

**Key insight:** Elo handles the physical attraction question. The narrative engine handles everything else.

### Layer 3: The Introduction Engine (The Magic)

This is where PLY lives or dies. Given a pool of filter-passing, Elo-eligible candidates, the system must:

1. Pick the best candidate to introduce today
2. Pick the best narrative angle for THIS specific recipient
3. Write a 3-4 sentence introduction that makes the recipient excited
4. Learn from the outcome

---

## The Introduction Engine — How It Actually Works

### Step 1: Candidate Ranking

From the Elo-eligible pool, rank candidates by **intro potential** — not compatibility score. The question is: "Who can I write the most compelling introduction about for this specific person?"

**Intro potential score:**
- **Data richness** (0-1): How many voice memos does the candidate have? How rich is their composite? More data = better intro material.
- **Narrative strategy fit** (0-1): Score all 12 narrative strategies for this pair. The MAX strategy score is what matters — we only need one great angle.
- **Novelty** (0-1): Has the recipient seen someone similar recently? Diverse intros keep engagement high.
- **Quote quality** (0-1): Does the candidate have notable quotes that score ≥3 on our relevance metric?

Weighted: `intro_potential = strategy_fit * 0.5 + data_richness * 0.2 + novelty * 0.2 + quote_quality * 0.1`

### Step 2: Excitement Type Discovery

We start with a hypothesis about what excites each user (explorer/nester/intellectual/spark), inferred from their Big Five + soft preferences. **But we don't trust it.**

Instead, we treat excitement type as a **prior that gets updated with every interaction.**

**The experiment:**
- First 5 intros: test across all 4 tiers. Show the user narratives from each tier to see what they respond to.
  - Intro 1: Self-expansion angle (Tier 1)
  - Intro 2: I-sharing angle (Tier 2)
  - Intro 3: Admiration angle (Tier 3)
  - Intro 4: Comfort angle (Tier 4)
  - Intro 5: Best-scoring angle from Intros 1-4
- Track which tier got "interested" vs "not interested"
- Update excitement type weights accordingly

**Excitement type becomes a distribution, not a label:**
```
Sarah's excitement weights after 10 intros:
  self_expansion: 0.35  (responded to 2/3 explorer-style intros)
  i_sharing:      0.25  (responded to 1/2)
  admiration:     0.30  (responded to 2/3)
  comfort:        0.10  (responded to 0/2)
```

These weights directly modify narrative strategy selection. Over time, the system converges on what actually excites each person — not what we predicted from their Big Five.

### Step 3: Narrative Generation — "The Trailer"

Each intro is a trailer, not a blurb. Structure: **Hook → Story → Proof → Close.**

**3 Hook Types (tested via Daily Three):**
- **Quote** — lead with their actual words (tests: does raw authenticity hook?)
- **Contradiction** — two things that shouldn't go together (tests: does complexity hook?)
- **Scene** — paint what being around them is like (tests: does imagination hook?)

Each Daily Three card uses a different hook type. The user's 🔥 tells us which hook type worked. Over time: Archetype × Hook matrix fills in.

**Intro Tone Rules (hard constraints, never violate):**
1. **Never braggy.** If a story makes the person sound like they're announcing their own virtue, don't use it that way. Show actions, don't celebrate them.
2. **Never personify the app.** No "you need to meet" or "okay so there's this person." No narrator voice.
3. **Contradiction > single note.** Tension between two sides of someone is always more interesting than developing one theme.
4. **Close with vivid image or joke, never sentiment.** If the last sentence could go on a Hallmark card, rewrite it. No rhetorical questions.
5. **Don't explain the meaning.** Show behavior, stop. Don't add "and that tells you everything."
6. **Frame accomplishments as creation, not ego.** "Built something that didn't exist before" >> "is really good at building things."
7. **No superlatives.** Not "the greatest" or "the most amazing" — just show it.
8. **Specifics > patterns.** "Tim Ho Wan and then four more Chinese restaurants" >> "loves food."
9. **The intro is about the SUBJECT, not the reader.** Don't reference the reader's interests or say "you'd love." They know what they like.

**3-draft parallel generation per hook type:**
- 3 creative variations generated per card
- Critic scores each on: hook_power, intrigue, specificity, mystery
- Best draft wins; if below threshold, regenerate with feedback

**Instrumentation:**
- Log hook_type used for each intro
- Log the critic scores
- Log the outcome (🔥/💾/👋, photo-stage decision)
- This creates the dataset for the hook type ranking model

### Step 4: The Decision Flow — The Daily Three + 🔥 System

**Current flow:** 1 intro per day, show narrative + photo → decide

**New flow:**

#### The Daily Three

Every day, you get 3 intro cards. Narrative only — first name + 3-4 sentence pitch. No photos.

Each card has two actions:
- 🔥 **"Tell me more"** → spends your daily 🔥, reveals the photo
- 👋 **"Pass"** → card goes to re-pitch pool

#### The 🔥 (Fire) System

**You get 1 🔥 per day.** That's it.

```
Daily flow:

1. Open app → see 3 narrative cards
   ↓
2. Read them. You have 1 🔥 to spend.
   Options for each card:
   - 🔥 "Tell me more" (spend your fire → photo reveals)
   - 👋 "Pass"
   - 💾 "Save for later" (moves to your saved queue)
   ↓
3. If you 🔥 a card → photo revealed
   a) "I'm interested" → match recorded, check for mutual
   b) "Not for me" → Elo signal (narrative worked, attraction didn't)
   ↓
4. If mutual match → you unlock a BONUS 🔥 tomorrow (reward)
   ↓
5. Un-🔥'd cards that you 👋'd → re-pitch pool
   Un-🔥'd cards that you 💾'd → saved queue
```

#### The Save Queue

If you like 2 (or all 3!) intros but only have 1 🔥, you can **save** the others.

Saved intros stack up in your queue. They don't expire. You can 🔥 a saved intro any time you have a fire to spend.

**This is the monetization lever:**

If someone has 5 saved intros and only gets 1 🔥/day, they're going to want more fires. That's the premium product:
- **Free:** 1 🔥/day + bonus 🔥 for mutual matches
- **Premium (future):** 2 🔥/day, or buy individual 🔥

The save queue also tells us something: **saved = strong positive signal even without spending a fire.** A saved intro means the narrative landed — the user was genuinely interested but had to choose. This is a high-quality signal for tier_weights.

#### When You Pass All 3

If you 👋 all 3 cards (no 🔥, no 💾), that's a strong signal that the batch didn't land.

**The Rejection Feedback Flow:**

```
User passes all 3 → app shows:

"None of these grabbed you? Help us do better."

Then shows each card again, one at a time (mini-cards):
  Card 1: [Name + first line of narrative]
    → 🎙️ voice feedback button OR quick-tap reasons
  Card 2: [Name + first line of narrative]
    → 🎙️ voice feedback button OR quick-tap reasons
  Card 3: [Name + first line of narrative]
    → 🎙️ voice feedback button OR quick-tap reasons

Quick-tap reasons (optional, can skip):
  - "Nothing grabbed me"
  - "Not my type of person"
  - "Too similar to yesterday"
  - "Intro felt generic"

Voice feedback (richest signal):
  🎙️ "Tell us what you're looking for"
  → Whisper transcribe → Claude extract → update rejection_themes
```

This is OPTIONAL — user can skip the whole thing. But if they engage, it's the highest-value data we collect.

**Consecutive all-pass streak:**
- 3 days of all-pass → app surfaces a gentler prompt: "We're still learning what excites you. Mind telling us what you're looking for?" with voice note option
- System also shifts next day's tier composition to be maximally different from the last 3 days

#### Why This Design Works

- **Choosing > judging.** Pick your favorite from 3 is a game. Swipe yes/no is work.
- **Built-in A/B/C test.** We vary tiers across the 3 cards. Your pick tells us which angle lands.
- **Natural scarcity.** 1 🔥/day means you read carefully. No mindless swiping.
- **Save queue = engagement + monetization.** Wanting more fires = product-market fit signal.
- **Rejection feedback loop.** All-pass triggers the richest learning signal we have.
- **No one gets "rejected."** Unpicked cards go to re-pitch pool. They come back with a better angle.

#### Daily Three Composition Strategy

For the first 5 days (exploration phase):
- Card A: Self-expansion angle (Tier 1)
- Card B: I-sharing angle (Tier 2)
- Card C: Admiration or Comfort angle (Tier 3/4)
- All 3 should be different people from the eligible pool

After exploration phase (exploitation + exploration):
- Card A: Best-performing tier for this user (70% exploit)
- Card B: Second-best tier (20% exploit)
- Card C: Random/underexplored tier (10% explore)
- Mix of new candidates and re-pitches

### The Re-Pitch System

A great match can die because the first intro used the wrong angle. The re-pitch system fixes this.

**Rules:**
- A person can be pitched to you up to **5 times total** (1 original + 4 retries)
- Each re-pitch MUST use a **different narrative tier** than all previous attempts
- Re-pitches appear **3-7 days** after the original (not the next day — that'd feel repetitive)
- Re-pitches are mixed into the Daily Three alongside new candidates
- The user never knows they're seeing a re-pitch (different angle = feels like a different intro)

**Re-pitch lifecycle:**
```
Attempt 1: Self-expansion angle → user picks a different card
  ↓ (3-7 day cooldown)
Attempt 2: I-sharing angle → user picks a different card
  ↓ (3-7 day cooldown)
Attempt 3: Admiration angle → user picks this one! → photo reveal
  ↓
RESULT: The match was good. The first two angles were wrong.
  → Update Sarah's tier_weights: admiration ↑, self_expansion ↓, i_sharing ↓
```

Or:
```
Attempt 1-5: All tiers tried, never picked → RETIRE permanently
  → This person genuinely doesn't excite you. Move on.
  → Signal: possible compatibility miss (not just narrative miss)
```

**What re-pitches teach us:**
- Conversion on attempt 2+ proves the MATCH was right but the ANGLE was wrong
- Which tier finally worked → strongest excitement type signal we can get
- If all 5 fail → real data point that this pair doesn't work (feeds into future candidate ranking)

**Re-pitch pool management:**
- Track per-candidate: `{ user_id, candidate_id, attempts: [{tier, date, picked: bool}] }`
- When composing Daily Three, mix: ~2 new candidates + ~1 re-pitch (varies based on pool depth)
- If re-pitch pool is empty (everyone's been tried), all 3 are new

### Two Rejection Points = Two Signals

The flow creates two distinct rejection moments:

**Not picked from the Daily Three (narrative stage):**
- The introduction didn't excite you enough to beat the other 2
- This is a **narrative/strategy signal** — soft negative
- Candidate goes to re-pitch pool (if attempts < 5)
- Tier weight for the used strategy gets a small decrease

**Passed after photo reveal (photo stage):**
- The introduction worked (you picked it!) but physical attraction wasn't there
- This is an **Elo signal** — the narrative engine did its job, the Elo gate was too wide
- Gentle Elo adjustment (K=8) for the rejected person
- Capture voice feedback: "What about the photo didn't match what you imagined?"

If we don't separate these, we can't learn which system needs improving.

### Step 5: The Feedback Loop (New)

When someone passes, capture WHY via voice note (preferred) or text.

**Rejection reasons (structured + voice):**

At narrative stage (pre-photo):
- "Nothing grabbed me" → narrative quality issue
- "Not my type of person" → strategy/angle mismatch
- "Too similar to someone I already know" → novelty issue
- 🎙️ "Tell us more" (voice note) → richest signal

At photo stage (post-narrative):
- "Not attracted" → pure Elo signal
- 🎙️ "Tell us more" (voice note) → may reveal physical preference patterns

**Voice feedback extraction:**
- Same pipeline as onboarding: Whisper transcribe → Claude Haiku extract
- But with a DIFFERENT extraction prompt focused on:
  - What specifically didn't land?
  - Was it the person or the presentation?
  - What would have made this more interesting?
  - Any revealed preferences ("I prefer someone more [X]")

**What the feedback feeds into:**

| Signal | Feeds Into | Mechanism |
|--------|-----------|-----------|
| 🔥 on a card | Excitement type weights (strong +) | Increase tier weight for the strategy used |
| 💾 Save (not 🔥) | Excitement type weights (moderate +) | Narrative landed — increase tier weight, but less than 🔥 |
| 👋 Pass | Excitement type weights (soft -) | Small decrease for that tier; candidate → re-pitch pool |
| All 3 passed (no 🔥, no 💾) | Batch quality flag | Shift next day's tiers; trigger feedback prompt after 3 streak |
| Per-card voice feedback (all-pass flow) | Strategy + taste map | Extract specific rejection reasons per person |
| Re-pitch converts on attempt 2+ | Excitement type weights (strongest signal) | The winning tier gets a big boost; failing tiers get decreases |
| All 5 re-pitch attempts fail | Candidate ranking | Retire candidate; flag as real incompatibility |
| Passed at photo stage (post-🔥) | Elo | Gentle Elo adjustment (K=8) for rejected person |
| Passed at photo, voice note | Elo + physical preference model | Extract physical preference signals |
| Interested after photo | Full positive signal | Reinforce everything: strategy, Elo range, candidate type |
| Mutual match (both interested) | Engagement reward | Unlock bonus 🔥 for next day |
| 🔥 from saved queue | Excitement type (delayed strong +) | Same as daily 🔥 but confirms the narrative held up over time |

---

## The Learning Model

The system maintains a **per-user preference model** that evolves with every interaction:

```
UserPreferenceModel {
  // Excitement type distribution (updated every interaction)
  tier_weights: {
    self_expansion: float,  // starts from Big Five inference
    i_sharing: float,
    admiration: float,
    comfort: float,
  }

  // Strategy-level learning (which specific strategies work)
  strategy_scores: {
    novel_world: { shown: int, fired: int, saved: int },
    complementary_growth: { shown: int, fired: int, saved: int },
    humor_resonance: { shown: int, fired: int, saved: int },
    // ... all 12
  }

  // 🔥 system state
  fires_available: int            // usually 1, +1 for mutual match bonus
  save_queue: IntroCard[]         // saved intros waiting to be 🔥'd
  all_pass_streak: int            // consecutive days of passing all 3

  // Rejection patterns (extracted from voice feedback)
  rejection_themes: string[]       // e.g. ["too outdoorsy", "not ambitious enough"]
  attraction_themes: string[]      // e.g. ["humor", "creative", "driven"]

  // Elo trajectory
  elo_score: float
  elo_confidence: float           // increases with more interactions

  // Narrative quality bar
  min_critic_score: float         // starts at 30, adjusts based on engagement
}
```

**Update rules:**

After each Daily Three interaction:
```
learning_rate = 0.15
save_rate = 0.08      // saves are positive but weaker than 🔥
soft_negative = 0.05  // passes are mild negatives

// Example: User 🔥'd Card B (i_sharing), 💾 saved Card A (self_expansion), 👋 passed Card C (admiration)

// 🔥 card — strong positive
tier_weights[fired_tier] += learning_rate * (1 - tier_weights[fired_tier])

// 💾 saved card — moderate positive (narrative landed, just not the top pick)
tier_weights[saved_tier] += save_rate * (1 - tier_weights[saved_tier])

// 👋 passed card — soft negative
tier_weights[passed_tier] -= soft_negative * tier_weights[passed_tier]

normalize(tier_weights)  // sum to 1

// Strategy-level tracking
for each card in daily_three:
  strategy_scores[card.strategy].shown += 1
if fired: strategy_scores[fired_card.strategy].fired += 1
if saved: strategy_scores[saved_card.strategy].saved += 1

// Re-pitch conversion (STRONGEST signal — worth 2x a normal 🔥)
if fired card was a re-pitch:
  tier_weights[winning_tier] += learning_rate * 2 * (1 - tier_weights[winning_tier])
  for each previously_failed_tier on this candidate:
    tier_weights[failed_tier] -= learning_rate * tier_weights[failed_tier]
  normalize(tier_weights)

// All-pass (no 🔥, no 💾) — flag batch miss
if all_three_passed:
  all_pass_streak += 1
  if all_pass_streak >= 3:
    trigger_voice_feedback_prompt()
  // Shift next day's tier composition to be maximally different

// 🔥 from saved queue — delayed strong positive (confirms narrative held up)
if fired_from_save_queue:
  tier_weights[saved_tier] += learning_rate * (1 - tier_weights[saved_tier])
  normalize(tier_weights)

// Voice feedback (from all-pass flow) → extract per-card and append to rejection_themes
```

---

## What We're Testing

The fundamental question: **Do people's excitement types match their revealed preferences?**

- Do self-reported "explorers" actually respond to novelty-forward intros?
- Do "nesters" actually prefer warmth-focused intros, or do they secretly love the excitement of an explorer pitch?
- Is excitement type stable, or does it shift based on mood/season/life stage?

**How we test:**
- First 5 intros deliberately rotate through all 4 tiers (exploration phase)
- After 5 intros, use Thompson sampling: exploit the best-performing tier 70% of the time, explore the others 30%
- Track the divergence between predicted excitement type and revealed excitement type
- Surface this data in the admin panel

**Success metrics:**
- **Pick rate by tier** — which tiers get chosen from the Daily Three (per user + aggregate)
- **Pick rate by strategy** — which of the 12 strategies get chosen most
- **Re-pitch conversion rate** — what % of re-pitched candidates eventually get picked? At which attempt?
- **Re-pitch tier delta** — when a re-pitch converts, how different was the winning tier from attempt 1?
- **Photo-stage pass rate** — lower = better Elo calibration (narrative worked, attraction didn't)
- **Photo-stage interest rate** — higher = narrative + Elo both calibrated well
- **Predicted vs revealed excitement type** — does Big Five inference match actual pick patterns?
- **Daily Three engagement** — do users read all 3 or just pick the first? (time-on-card signal)
- **Voice feedback rate** — what % of photo-stage rejections include a voice note?
- **Retirement rate** — what % of candidates exhaust all 5 attempts without being picked?

---

## Implementation Priority

### Phase 1 (Now — core experience)
- [ ] Daily Three UI: show 3 narrative-only cards (no photos)
- [ ] 🔥 system: 1 fire per day, spend it to reveal a photo
- [ ] 💾 Save button: save intros to a queue for later
- [ ] 👋 Pass button: sends card to re-pitch pool
- [ ] Save queue UI: browse saved intros, spend 🔥 from queue
- [ ] Photo reveal flow: 🔥 → photo shown → "Interested" or "Not for me"
- [ ] All-pass rejection flow: show cards one-by-one with voice feedback option + quick-tap reasons
- [ ] Track per-intro: tier used, strategy used, action (fired/saved/passed), photo outcome
- [ ] Store in `daily_intros` table: `tier`, `strategy`, `action`, `fired_at`, `saved_at`, `passed_at`
- [ ] Re-pitch pool: passed candidates get `narrative_miss` tag + 3-7 day cooldown
- [ ] Re-pitch lifecycle: max 5 attempts, different tier each time
- [ ] Voice feedback extraction with dedicated rejection-analysis prompt
- [ ] Bonus 🔥 on mutual match

### Phase 2 (After first 50 users — learning system)
- [ ] Per-user `tier_weights` distribution (new `user_preference_model` table)
- [ ] `all_pass_streak` tracking → trigger voice feedback after 3 consecutive
- [ ] First 5 days: exploration rotation (each day's 3 cards cover different tiers)
- [ ] Update tier_weights after each interaction (🔥 = strong +, 💾 = moderate +, 👋 = soft -)
- [ ] Re-pitch conversion → 2x weight update for winning tier
- [ ] 🔥 from save queue → delayed strong positive signal
- [ ] Surface in admin panel: tier pick rates, save rates, all-pass rates, re-pitch conversion rates

### Phase 3 (After first 200 interactions — optimization)
- [ ] Thompson sampling for tier assignment across the Daily Three
- [ ] Voice feedback → preference extraction → rejection_themes/attraction_themes
- [ ] Feed rejection themes into candidate ranking (soft filter on intro potential)
- [ ] A/B test: fixed excitement type vs adaptive weights vs behavioral
- [ ] Premium tier: 2 🔥/day (monetization experiment)

### Phase 4 (After statistical significance — research)
- [ ] Analyze: do re-pitches convert? At which attempt? Which tier wins?
- [ ] Analyze: predicted excitement type vs revealed (from 🔥 + 💾 data)
- [ ] Analyze: save queue behavior (do people 🔥 their saves? how long do they wait?)
- [ ] If excitement types don't predict: replace with pure behavioral weights
- [ ] If they do predict: improve inference from extraction data
- [ ] Cross-user learning: "Users who 🔥'd this strategy also 🔥'd..."
- [ ] Publish findings

---

## What This Replaces

The current hand-tuned compatibility scoring (values 1.5x, Big Five 1x, interests 1x, warmth 0.5x) becomes **secondary**. It still runs as a tiebreaker when intro potential scores are similar, but the primary ranking is now: **"Who can I write the best intro about for this person, given what I've learned about what excites them?"**

The matching algorithm is no longer a static formula. It's a **learning system that gets better at exciting each individual person with every interaction.**
