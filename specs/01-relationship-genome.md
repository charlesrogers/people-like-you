# Proposal 1: The Relationship Genome — Embedding-Based Neural Matching Engine

## The One-Sentence Version

Replace hand-tuned weighted scoring with a learned model that converts every user into a dense vector and predicts the **conditions for chemistry to emerge** — not chemistry itself — from pairwise embeddings, trained on real date and relationship outcomes.

> **Critical research constraint (Joel, Eastwick & Finkel, 2017):** Machine learning can predict who is *generally desirable* but cannot predict which two specific people will experience mutual attraction. Chemistry is emergent, not predictable from traits. Therefore this model does NOT predict "will A and B have chemistry." It predicts "do A and B have the conditions — self-expansion potential, I-sharing fuel, admiration vectors, comfort compatibility — under which chemistry is most likely to emerge through interaction." [Ref: dating_app_research.docx.md, Part 2]

---

## Why This Exists

The current `matchmaker.ts` uses four hand-picked factors with hand-picked weights:

- Values overlap: 1.5x
- Big Five complementarity: 1x (with a hand-picked "sweet spot" of 0.1-0.3 difference)
- Interest intersection: 1x (with a hand-picked 2.3x novelty bonus)
- Communication warmth: 0.5x

Every one of those weights is a guess. The 0.1-0.3 Big Five sweet spot is borrowed from self-expansion theory literature, not validated on PLY users. The 2.3x novelty multiplier is a hunch. And the entire system ignores most of the data we collect: humor style, excitement type, kindness markers, vulnerability scores, storytelling ability, energy/enthusiasm, goals, passion indicators, notable quotes — none of it factors into the compatibility score.

Worse, the system can't learn. User A passes on 15 people with high values overlap and consistently Likes people with complementary energy levels? The scorer doesn't notice. The weights are the same on day 1 as day 1,000.

---

## What We're Building

### Layer 1: User Embedding Model

Every user gets a dense vector (128-256 dimensions) that encodes their full identity as the system understands it.

**Inputs to the embedding:**

**Tier 1 — Self-Expansion Vectors** (what makes someone interesting to THIS person):
- Interest tags (bag-of-words or learned embedding)
- Passion indicators (bag-of-words or learned embedding)
- Goals (bag-of-words or learned embedding)
- Novel expertise domains (extracted from voice — what worlds do they inhabit?)
- Growth trajectory direction (career/family/creative/spiritual — where they're headed, not where they are)
- Perspective gap score (how different are their life experiences from a given candidate?)

**Tier 2 — I-Sharing Vectors** (what makes two people likely to "click" in real-time):
- Humor signature — NOT categorical (witty/goofy/etc) but granular: what specifically makes them laugh, what references land, what kind of absurdity they enjoy (extracted from voice memos via examples they give)
- Aesthetic/sensory resonance — what moves them, what they notice, what gives them chills (new extraction target — see Spec 02)
- Emotional processing style — do they lead with logic or emotion? Process by talking or doing? (2 floats: logic-first vs emotion-first, internal vs external processing)

> **Research basis (Pinel et al., 2006-2018):** I-sharing — the belief that you share an identical subjective experience with someone in real-time — increases liking even for objectively dissimilar people. Two people who laugh at the same thing, notice the same detail, react the same way to a stimulus will "click" regardless of surface compatibility. [Ref: dating_app_research.docx.md, Missing Mechanism 3]

**Tier 3 — Admiration Vectors** (what makes someone see the other as high-value):
- Values (bag-of-words or learned embedding)
- Values-in-action evidence (stories of values being lived, not just stated)
- Demonstrated competence narratives (extracted mastery stories from voice)
- Kindness markers count + quality score
- Social proof signals (friend vouch data when available — see Spec 05)

**Tier 4 — Comfort/Stability Vectors** (what makes someone feel safe enough to be authentic):
- Communication warmth + directness (2 floats)
- Attachment proxy dimensions (3 floats — new):
  - comfort-with-closeness (0-1): extracted from behavioral questions about intimacy
  - comfort-with-independence (0-1): how they handle partner needing space
  - reassurance-seeking (0-1): what they need when anxious
- Big Five proxy (5 floats) — primarily agreeableness + neuroticism matter here
- Vulnerability/authenticity score (1 float)

> **Research basis (Bowlby/Hazan & Shaver; Liepmann et al., 2025):** Comfort is the 3rd most cited element of romantic chemistry. Attachment style combinations predict which relationships trigger destructive patterns. Assessed through behavioral questions, not clinical labels. [Ref: dating_app_research.docx.md, Missing Mechanism 4 + Part 5 Tier 4]

**Personality & Communication:**
- Energy/enthusiasm, storytelling ability (2 floats)
- Excitement type (one-hot of 4 categories)

From user profile:
- Age (normalized)
- Location (metro-area embedding or lat/long)
- Education level (ordinal)
- Height (normalized)

From hard_preferences (used as FILTERS, not embedding inputs):
- Age range, distance, faith, kids, smoking — applied before scoring, never overridden

From soft_preferences:
- All soft preference selections

From behavioral history (once available):
- Like rate (what % of intros they Like)
- Average time-to-action (how quickly they act on intros)
- Behavioral pass signals (dwell time, photo reveal timing — NOT stated pass reasons, which are unreliable)
- Elo score and trajectory

> **Research basis (Eastwick & Finkel, 2008):** Stated preferences do not predict actual desire. People think they know what they want, but different attributes matter when they actually interact. The model should weight revealed behavioral signals heavily over stated preference alignment. [Ref: dating_app_research.docx.md, Confirmation 4]

**Embedding architecture:**

The simplest version that works: a feed-forward network with one or two hidden layers that maps the concatenated input features to a 128-dim vector, trained end-to-end with the compatibility predictor.

Don't start with a transformer. Don't start with a GNN. Start with the dumbest thing that can learn.

### Layer 2: Chemistry Conditions Predictor

Given `(embedding_A, embedding_B)`, predict `P(conditions_for_chemistry | A and B interact)`.

**Critical reframe:** We are NOT predicting "will these two people like each other." Joel et al. (2017) proved that's impossible from pre-interaction data. We are predicting "if these two people interact (structured disclosure, date, conversation), how likely is chemistry to emerge?" This means:
- The model optimizes for **interaction outcomes** (dates, second dates, relationships), not **evaluation outcomes** (Likes/Passes on a narrative card)
- A Like on a narrative is weak signal — it means the *story* was compelling. A second date is strong signal — it means the *people* connected.

**Architecture options (in order of complexity, start with #1):**

1. **Dot product + sigmoid**: `P = sigmoid(dot(e_A, e_B) + bias)`. This is collaborative filtering. It works. Start here.

2. **Bilinear interaction**: `P = sigmoid(e_A^T W e_B + bias)`. The matrix W lets the model learn asymmetric interactions (A's openness interacts differently with B's extraversion than vice versa).

3. **MLP on concatenated embeddings**: `P = MLP([e_A; e_B; e_A * e_B; |e_A - e_B|])`. Most expressive, but needs the most data to train without overfitting.

**Training signal hierarchy — interaction outcomes over evaluation outcomes:**

1. Relationship formed (both left platform together) — weight: 10x
2. 3+ dates happened — weight: 7x
3. Second date happened — weight: 5x
4. First date completed + both said "want to see again" — weight: 4x
5. First date completed — weight: 3x
6. Post-interaction "what surprised you" was positive — weight: 2x
7. Mutual Like (both Liked each other) — weight: 1.5x
8. One-sided Like — weight: 0.5x (weak positive — narrative quality confounds this)
9. Expiration (no action) — weight: -0.2x (very weak negative — could be busy, not bad match)
10. Pass — weight: -0.3x (weak negative — could be narrative failure, not match failure)

**Key difference from v1:** Likes/Passes are dramatically downweighted compared to date outcomes. A Like means the narrative hooked them. A date means the *person* hooked them. We train on the latter.

> **Research basis:** "Stated preferences do not predict behavior" (Eastwick & Finkel, 2008). Asking "why didn't you like them" produces garbage data — people cite surface dealbreakers that aren't actual dealbreakers. The model should learn from what people DO (go on dates, come back for more), not what they SAY (pass reasons). [Ref: dating_app_research.docx.md, Part 6 Feedback Loop Design]

### Layer 3: Cold-Start Strategy

New users have no behavioral history. Their embedding is computed from profile + composite data only.

**Blending schedule:**
- 0-5 interactions: 100% content-based embedding (profile + voice data), 0% behavioral
- 5-15 interactions: Linear blend toward behavioral
- 15+ interactions: Primarily behavioral, content-based as regularizer

This is essentially a multi-armed bandit: explore (show diverse matches to learn preferences) vs. exploit (show matches the model is confident about).

**Exploration strategy for new users:**
- First 5 matches should be *deliberately diverse* across excitement types, energy levels, and communication styles
- Track not just Like/Pass but *dwell time* on the narrative, *whether they revealed the photo*, and *time between photo reveal and decision*
- These micro-signals are training data even before the user explicitly acts

### Layer 4: Embedding Drift Detection

Track each user's embedding over time. When the vector moves significantly (cosine distance > threshold), flag for the narrative engine:

- "This user's interests have shifted toward outdoor/adventure content in the last month"
- "This user's vulnerability scores have been increasing — they're opening up more"
- "This user's pass rate spiked 3 weeks ago — possible life event"

This feeds into Proposal 5 (Living Profile) but the infrastructure belongs here.

---

## What RIGHT Looks Like

### The model learns non-obvious chemistry conditions
- Two users with very different stated preferences but high I-sharing potential (same humor signature, similar aesthetic resonance) get matched — and they click on the date
- The system discovers that "high vulnerability + high humor" creates conditions for chemistry even though no human would weight those two factors together
- The system learns that self-expansion potential (novel expertise gaps) predicts second dates better than interest overlap predicts first Likes
- Match quality measured by **date outcomes** (not Like rates) improves monotonically as the model sees more data

### The model respects hard preferences absolutely
- Hard preferences (age, distance, faith, kids, smoking) are NEVER overridden by the learned model
- Hard preferences are applied as filters BEFORE the model scores — the model only ranks within the eligible pool
- A user who sets "faith: essential" never sees a match where faith isn't essential to the other person, no matter how high the embedding similarity

### The cold-start experience is good, not just "not bad"
- New users get interesting, diverse matches from day 1 because the content-based embedding is meaningful even without behavioral data
- The system doesn't need 50 interactions to become useful — it should noticeably improve by interaction 5
- New users don't feel like they're being experimented on even though exploration is happening

### The system is transparent about what it's learning
- If a user asks "why did you match me with this person?", the system can point to specific factors: "You both value independence and creative expression. Your humor styles complement each other — you're witty-dry, they're storytelling-warm. And you both mentioned wanting to travel more."
- This explainability comes from the embedding structure, not a separate explanation model

### Performance
- Embedding computation: < 500ms per user
- Pairwise scoring across full candidate pool: < 2 seconds
- Nightly retraining on new feedback: < 30 minutes
- Total cost per match: < $0.01 in compute (excluding LLM narrative generation)

---

## What WRONG Looks Like

### Popularity bias
**The failure:** The model learns that conventionally attractive, high-Elo users get Liked more, so it ranks them higher for everyone. The system degenerates into a "hot people get shown first" engine — exactly what swipe apps do.

**Why it happens:** If you train naively on Like/Pass data, the model optimizes for "who gets Liked" rather than "who gets *mutually* Liked." A user with 80% Like rate gets recommended to everyone, but they only Like back 5% of the time.

**How to prevent it:**
- Train on *mutual* outcomes, not one-sided Likes
- Include Elo similarity as a feature so the model learns to match within tiers
- Add a diversity constraint: no user can be shown to more than N% of the pool in a given week
- Weight the loss function by `1 / sqrt(likes_received)` so popular users don't dominate the gradient

### Echo chamber / filter bubble
**The failure:** The model learns that users Like people similar to themselves, so it only shows "more of the same." The self-expansion thesis — that growth comes from complementary differences — gets optimized away.

**Why it happens:** Similarity is a strong baseline predictor. If 60% of Likes go to similar people, the model will lean heavily on similarity because it's the easiest pattern to learn.

**How to prevent it:**
- Explicitly include a "novelty bonus" in the training objective: matches where interest overlap is LOW but outcome is POSITIVE get upweighted
- Reserve 1 in 5 matches as "expansion slots" where the model is constrained to show someone with low embedding similarity but high complementarity on specific dimensions
- Track whether users who get more diverse matches have better long-term outcomes (dates, relationships) even if their short-term Like rates are lower

### Overfitting to small pool
**The failure:** With a small user base (hundreds, not millions), the model memorizes individual users rather than learning generalizable patterns. It knows "User 47 likes User 12" but not "people who value vulnerability tend to match well with people who value empathy."

**Why it happens:** Neural networks with more parameters than training examples will overfit. 128-dim embeddings for 200 users = way more parameters than data points.

**How to prevent it:**
- Start with MUCH smaller embeddings (16-32 dims) until the user base justifies more
- Heavy regularization (dropout, weight decay, embedding norm constraints)
- Use the content-based embedding as an anchor: the learned embedding is initialized from and regularized toward the content-based version
- Don't retrain from scratch nightly — fine-tune from previous checkpoint with low learning rate
- Set a minimum threshold: don't switch from hand-tuned weights to learned model until you have at least 500 feedback events

### Feedback loop death spiral
**The failure:** Model recommends A to B. B passes. Model learns "A is bad for people like B." But A would have been great for B — the narrative just wasn't compelling that day, or B was in a bad mood. Over time, perfectly good matches get permanently downranked because of noisy negative feedback.

**Why it happens:** Passes are ambiguous. "Not interested" can mean "bad match" or "bad day" or "I'm talking to someone else" or "the narrative didn't hook me." Treating all passes equally poisons the training data.

**How to prevent it:**
- Give passes a much lower weight than Likes in the loss function (0.3x vs 1x)
- Passes with reason "not attracted" should affect Elo, not the embedding model
- Passes with reason "no spark from description" should feedback to the narrative model (Proposal 4), not the matching model
- Only passes with reason "dealbreaker" should strongly affect the matching model
- Add a "forgetting" mechanism: feedback older than 6 months gets exponentially downweighted. People change.

### The Joel Trap: predicting desirability instead of chemistry conditions
**The failure:** The model learns to predict who is *generally popular* (gets Liked by many people) rather than who will connect with *this specific person*. This is exactly what Joel et al. (2017) showed happens — ML can predict general desirability but not dyadic chemistry.

**Why it happens:** General desirability is a much stronger signal in the data than pairwise chemistry. Users with high Elo, great photos, and compelling voice memos get Liked by everyone. The model learns "show popular people" because it's the easiest way to increase Like rates.

**How to prevent it:**
- Train on MUTUAL and INTERACTION outcomes, not one-sided Likes (this is why the training signal hierarchy above downweights Likes)
- Include an explicit "conditions" decomposition in the model: separate sub-scores for self-expansion potential, I-sharing similarity, admiration opportunity, and comfort compatibility — then combine them. This forces the model to learn pairwise features, not individual desirability
- Add a "surprise" metric: matches where the model's pairwise score is HIGH but both users' individual popularity is LOW should be upweighted when they lead to good dates. These are the non-obvious matches that prove the model is learning chemistry conditions, not desirability
- Periodically audit: for the model's top recommendations, how much variance comes from individual features vs. pairwise features? If >60% is individual, the model is predicting desirability, not chemistry conditions

### The "good enough" trap
**The failure:** The model gets 10% better than hand-tuned weights and everyone declares victory. But 10% better on Like rates might mean 0% better on dates-that-happen, because the model learned to write better-sounding narratives (which Proposal 4 handles) rather than actually finding better matches.

**Why it happens:** Optimizing for the wrong metric. Like rate is a proxy. Date rate is closer to truth. Relationship formation is the real metric.

**How to prevent it:**
- Primary evaluation metric: mutual Like rate (not one-sided)
- Secondary: date scheduling rate among mutual Likes
- Tertiary: second date rate among first dates
- NEVER optimize directly for one-sided Like rate
- A/B test the learned model against the hand-tuned scorer on REAL OUTCOME METRICS, not proxy metrics
- The hand-tuned scorer should remain the control group for at least 6 months after the learned model launches

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                    TRAINING PIPELINE                 │
│                    (nightly batch)                   │
│                                                     │
│  feedback_events ──→ training_data_builder           │
│  composite_profiles ──→ feature_extractor            │
│  user_profiles ──→ feature_extractor                 │
│                          │                           │
│                          ▼                           │
│                 embedding_model.train()               │
│                          │                           │
│                          ▼                           │
│              model_checkpoint → S3/storage            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  INFERENCE PIPELINE                   │
│                  (per match request)                  │
│                                                     │
│  user_A_profile ──→ embed(A) ──→ e_A                │
│                                    │                 │
│  candidate_pool ──→ [embed(B₁), embed(B₂), ...]    │
│                         │                            │
│                         ▼                            │
│  hard_preference_filter(candidates)                  │
│                         │                            │
│                         ▼                            │
│  score(e_A, e_Bᵢ) for each surviving candidate      │
│                         │                            │
│                         ▼                            │
│  rank + apply diversity constraints                  │
│                         │                            │
│                         ▼                            │
│  top_match → narrative_engine (Proposal 4)           │
└─────────────────────────────────────────────────────┘
```

### Data requirements before launch
- Minimum 500 feedback events (Likes + Passes with reasons)
- Minimum 50 mutual Likes
- Minimum 10 dates-that-happened (for validation, not training)
- If you don't have this yet, keep the hand-tuned scorer and COLLECT DATA

### Technology choices
- **Framework:** PyTorch (training) + ONNX export (inference in Node.js via onnxruntime-node)
- **Training infra:** Single GPU instance (A10G or similar), nightly cron
- **Embedding storage:** Supabase `pgvector` extension — store embeddings directly in the users table
- **Candidate retrieval:** For small pools (<10K users), brute-force dot product is fine. For larger pools, use pgvector's approximate nearest neighbor index
- **Model versioning:** Every training run produces a versioned checkpoint. A/B test by assigning users to model versions.

### Migration path from current system
1. Ship the current hand-tuned scorer as-is
2. Add instrumentation to collect all the training signals listed above
3. When data thresholds are met, train v0.1 of the learned model
4. A/B test: 50% hand-tuned, 50% learned model
5. Evaluate on mutual Like rate + date rate after 4 weeks
6. If learned model wins on both metrics, gradually increase to 80/20, then 100%
7. Keep the hand-tuned scorer as permanent fallback for cold-start users

---

## What This Does NOT Do

- It does NOT replace the narrative engine — it feeds into it
- It does NOT handle physical attraction — that's the Elo system's job
- It does NOT decide what to say in the introduction — Proposal 4 does that
- It does NOT collect new data — it learns from data the other systems collect
- It does NOT work without sufficient data — the hand-tuned scorer is the bridge
