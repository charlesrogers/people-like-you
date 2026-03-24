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

### Step 3: Narrative Generation (Unchanged but Instrumented)

The current 3-draft → critic → best-pick pipeline is strong. Keep it.

**Add instrumentation:**
- Log which strategy was used for each intro
- Log the critic scores
- Log the outcome (interested/passed/photo_revealed_before_decision)
- This creates the dataset for the feedback loop

### Step 4: The Decision Flow — "Pick Your Favorite" (New)

**Current flow:** 1 intro per day, show narrative + photo → decide

**New flow: The Daily Three**

```
1. User opens the app → sees 3 intro cards (narrative only, no photos)
   Each card: first name + 3-4 sentence pitch, different narrative angle
   ↓
2. User reads all 3 and picks their favorite
   "Which of these people do you want to learn more about?"
   ↓
3. Chosen card → photo revealed
   a) "I'm interested" → match recorded, check for mutual
   b) "Not for me" → this is an Elo signal (liked the narrative, not the photo)
   ↓
4. The 2 unchosen cards → recycled (see Re-Pitch System below)
```

**Why 3 at a time:**

- **Choosing is more engaging than judging.** "Pick the best" feels like a game. "Swipe right or left" feels like work.
- **Built-in A/B/C test every day.** If we vary the narrative tiers across the 3 cards, the user's choice directly tells us which angle excites them most.
- **Natural scarcity.** You only get to reveal 1 photo per day. So you actually read the intros carefully instead of skimming.
- **Lower rejection friction.** You're not saying "no" to 2 people — you're just saying "this one excited me more." The other 2 aren't rejected, they're deferred.

**Daily Three composition strategy:**

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
| Picked from Daily Three | Excitement type weights (strong +) | Increase tier weight for the strategy used |
| Not picked from Daily Three | Excitement type weights (soft -) | Small decrease for that tier; candidate → re-pitch pool |
| Re-pitch converts on attempt 2+ | Excitement type weights (strongest signal) | The winning tier gets a big boost; failing tiers get decreases |
| All 5 re-pitch attempts fail | Candidate ranking | Retire candidate; flag as real incompatibility, not narrative miss |
| Passed at photo stage | Elo | Gentle Elo adjustment (K=8) for rejected person |
| Passed at photo, voice note | Elo + physical preference model | Extract physical preference signals |
| Interested after photo | Full positive signal | Reinforce everything: strategy, Elo range, candidate type |
| Voice note on any rejection | Strategy + taste map | Extract preferences, update rejection_themes |

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
    novel_world: { shown: int, interested: int },
    complementary_growth: { shown: int, interested: int },
    humor_resonance: { shown: int, interested: int },
    // ... all 12
  }

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
// The user picked Card B (tier: i_sharing). Cards A (self_expansion) and C (admiration) not picked.

// PICKED card — strong positive signal
learning_rate = 0.15
tier_weights[picked_tier] += learning_rate * (1 - tier_weights[picked_tier])

// NOT PICKED cards — soft negative (they weren't rejected, just not chosen)
soft_rate = 0.05
for each unpicked_tier:
  tier_weights[unpicked_tier] -= soft_rate * tier_weights[unpicked_tier]

normalize(tier_weights)  // sum to 1

// Strategy-level tracking
for each card in daily_three:
  strategy_scores[card.strategy].shown += 1
strategy_scores[picked_card.strategy].picked += 1

// Re-pitch conversion (STRONGEST signal — worth 2x a normal pick)
if picked card was a re-pitch:
  tier_weights[winning_tier] += learning_rate * 2 * (1 - tier_weights[winning_tier])
  for each previously_failed_tier on this candidate:
    tier_weights[failed_tier] -= learning_rate * tier_weights[failed_tier]
  normalize(tier_weights)

// Voice feedback → extract and append to rejection_themes / attraction_themes
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

### Phase 1 (Now)
- [ ] Daily Three UI: show 3 narrative-only cards, user picks 1
- [ ] Photo reveal only on the picked card
- [ ] Track: which card picked, which tier each card used, photo-stage outcome
- [ ] Re-pitch pool: candidates not picked go back with `narrative_miss` tag + cooldown timer
- [ ] Re-pitch lifecycle: max 5 attempts, different tier each time, 3-7 day cooldown
- [ ] Store tier/strategy used per intro in `daily_intros` table
- [ ] Add voice note option on photo-stage rejection
- [ ] Extract rejection voice notes with dedicated prompt

### Phase 2 (After first 50 users)
- [ ] Implement per-user `tier_weights` distribution (stored in user_cadence or new table)
- [ ] First 5 days: exploration rotation (1 card per tier across the 3 daily)
- [ ] Update tier_weights after each pick (strong +) and non-pick (soft -)
- [ ] Re-pitch conversion → 2x weight update
- [ ] Surface excitement type learning + pick rates in admin panel
- [ ] Daily Three composition engine: mix new candidates + re-pitches based on pool depth

### Phase 3 (After first 200 interactions)
- [ ] Thompson sampling for tier assignment across the Daily Three
- [ ] Voice feedback → preference extraction → rejection_themes/attraction_themes
- [ ] Feed rejection themes into candidate ranking (soft filter on intro potential)
- [ ] A/B test: fixed excitement type vs adaptive weights vs Daily Three picks

### Phase 4 (After statistical significance)
- [ ] Analyze: do re-pitches convert? At which attempt? Which tier wins?
- [ ] Analyze: predicted excitement type vs revealed (from pick data)
- [ ] If excitement types don't predict: replace with pure behavioral weights
- [ ] If they do predict: improve inference from extraction data
- [ ] Cross-user learning: "Users who picked this strategy also picked..."
- [ ] Publish findings

---

## What This Replaces

The current hand-tuned compatibility scoring (values 1.5x, Big Five 1x, interests 1x, warmth 0.5x) becomes **secondary**. It still runs as a tiebreaker when intro potential scores are similar, but the primary ranking is now: **"Who can I write the best intro about for this person, given what I've learned about what excites them?"**

The matching algorithm is no longer a static formula. It's a **learning system that gets better at exciting each individual person with every interaction.**
