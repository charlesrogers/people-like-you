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

### Step 4: The Decision Flow (New)

**Current flow:** Show narrative + photo → decide

**New flow:**

```
1. Show narrative only (name + narrative, no photo)
   ↓
2. User reads it. Two options:
   a) "I'm interested — show me more" → reveal photo
   b) "Not for me" → capture why (see Step 5)
   ↓
3. Photo revealed. Two options:
   a) "I'm interested" → match recorded, check for mutual
   b) "Not for me" → this is an Elo signal (liked the narrative, not the photo)
```

**Why this matters:**

The two rejection points give us two different signals:
- **Rejected at narrative stage** → the introduction didn't land. This is a narrative/strategy problem. Feed back into intro engine.
- **Rejected at photo stage** → the introduction worked but physical attraction wasn't there. This is an Elo problem. Adjust Elo.

If we don't separate these, we can't learn.

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
| Rejected at narrative, reason = "nothing grabbed me" | Narrative quality | Lower critic threshold, regenerate more aggressively |
| Rejected at narrative, reason = "not my type" | Excitement type weights | Decrease weight of the tier/strategy used |
| Rejected at narrative, voice note | Strategy selection + matching | Extract preferences, update taste map |
| Rejected at photo, reason = "not attracted" | Elo | Gentle Elo adjustment (K=8) |
| Rejected at photo, voice note | Elo + physical preference model | Extract physical preference signals |
| Interested at narrative stage | Excitement type weights | Increase weight of the tier/strategy used |
| Interested after photo | Full positive signal | Reinforce everything: strategy, Elo range, candidate type |

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

After each interaction:
```
// Excitement type update (Bayesian-ish)
learning_rate = 0.15  // aggressive early, could decay
if interested:
  tier_weights[used_tier] += learning_rate * (1 - tier_weights[used_tier])
  normalize(tier_weights)  // sum to 1
if passed_at_narrative:
  tier_weights[used_tier] -= learning_rate * tier_weights[used_tier]
  normalize(tier_weights)

// Strategy-level tracking
strategy_scores[used_strategy].shown += 1
if interested:
  strategy_scores[used_strategy].interested += 1

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
- Interest rate by tier (which tiers convert best per user)
- Interest rate by strategy (which of the 12 strategies convert best)
- Narrative-stage pass rate (lower = better intros)
- Photo-stage pass rate (lower = better Elo calibration)
- Predicted vs revealed excitement type correlation
- Voice feedback richness (are people giving useful feedback?)

---

## Implementation Priority

### Phase 1 (Now)
- [ ] Split the decision flow: narrative-first → "interested in more" → photo reveal
- [ ] Track rejection stage (narrative vs photo) separately
- [ ] Add voice note option on rejection
- [ ] Extract rejection voice notes with dedicated prompt
- [ ] Store tier/strategy used per intro in `daily_intros` table

### Phase 2 (After first 50 users)
- [ ] Implement per-user `tier_weights` distribution
- [ ] First-5-intros exploration rotation
- [ ] Update tier_weights after each interaction
- [ ] Surface excitement type learning in admin panel

### Phase 3 (After first 200 interactions)
- [ ] Thompson sampling for tier selection (explore/exploit)
- [ ] Voice feedback → preference extraction → rejection_themes/attraction_themes
- [ ] Feed rejection themes into candidate filtering (soft filter)
- [ ] A/B test: current fixed excitement type vs adaptive weights

### Phase 4 (After statistical significance)
- [ ] Publish findings: do excitement types predict intro response?
- [ ] If not: replace excitement type system with pure behavioral weights
- [ ] If yes: improve Big Five → excitement type inference from extraction data
- [ ] Cross-user learning: "Users who liked this strategy also liked..."

---

## What This Replaces

The current hand-tuned compatibility scoring (values 1.5x, Big Five 1x, interests 1x, warmth 0.5x) becomes **secondary**. It still runs as a tiebreaker when intro potential scores are similar, but the primary ranking is now: **"Who can I write the best intro about for this person, given what I've learned about what excites them?"**

The matching algorithm is no longer a static formula. It's a **learning system that gets better at exciting each individual person with every interaction.**
