# Proposal 4: The Narrative Intelligence System — Multi-Model Story Architecture

## The One-Sentence Version

Rearchitect match introductions from a single LLM call into a multi-stage pipeline: strategy selection, multi-draft generation, self-critique, quote integration, A/B testing, and bidirectional narrative coherence — because the narrative IS the product.

---

## Why This Exists

The current `generateMatchAngle()` function is roughly:

```
1. Build a system prompt with recipient's excitement type + both profiles
2. Call Claude Sonnet once
3. Return the result
```

This works for MVP. But it has structural problems:

**Quality is inconsistent.** Sometimes the narrative nails it — specific, emotionally resonant, makes you want to meet the person. Sometimes it's generic fluff: "You both value connection and growth." The difference between a great intro and a mediocre one is probably the difference between a Like and a Pass.

**There's no learning.** The system generates 100 narratives. 60 lead to Likes, 40 lead to Passes. What was different about the 60? Was it the narrative style? The specific details chosen? The emotional arc? Right now, we have no way to know. The next 100 narratives are generated the same way.

**It's one-shot.** A human matchmaker wouldn't draft one introduction and send it. They'd think about what angle to lead with, draft something, read it back, refine it, maybe start over with a different approach. The current system skips all of this.

**Quotes are wasted.** The system stores `notable_quotes` from voice memos — the most authentic, specific data we have — but the narrative prompt just dumps them in context and hopes the model uses them well.

**The two sides don't relate.** `narrative_for_a` and `narrative_for_b` are generated independently. When A and B meet, there's no through-line. A great matchmaker would prime both people with complementary angles that create a shared discovery moment on the first date.

---

## What We're Building

### Stage 1: Narrative Strategy Selection

Before generating any text, the system decides *what kind of story to tell*.

**Strategy types — organized by the 4 chemistry mechanism tiers:**

> **Research mapping:** Each strategy corresponds to one of the four mechanisms that create romantic chemistry (Aron self-expansion, Pinel I-sharing, mate-value admiration, Bowlby comfort). Every narrative MUST include at least one self-expansion signal AND one admiration signal, regardless of which strategy leads. [Ref: dating_app_research.docx.md, Part 5 + Part 7]

**Tier 1 — Self-Expansion Strategies** (how this person expands your world):

| Strategy | When to use | Example opening |
|---|---|---|
| **Novel world** | Subject has expertise/experience in a domain recipient hasn't explored but has latent interest in | "You've never met anyone who does what Sarah does. And that's exactly the point." |
| **Complementary growth** | One user's strength maps to the other's growth edge | "You mentioned you're trying to be more spontaneous. Marcus IS spontaneity..." |
| **Perspective gap** | Life experiences diverge in enriching ways (different cultures, career paths, problem-solving approaches) | "On paper, you two don't make sense. But listen to this..." |

**Tier 2 — I-Sharing Strategies** (why these two would "click" in real-time):

| Strategy | When to use | Example opening |
|---|---|---|
| **Humor resonance** | Both users have similar granular humor signatures (not just "both funny" but laugh at the same things) | "Sarah said something that made me actually laugh out loud. And knowing your sense of humor, I think it would get you too..." |
| **Aesthetic/sensory sync** | Both users notice the same things, are moved by the same stimuli | "You both mentioned getting chills from the same kind of moment — the kind of thing most people walk right past..." |
| **Emotional processing match** | Both process emotions the same way (both talk-it-out or both sit-with-it) | "There's something about how Marcus thinks through things that reminds me of the way you described your own mind working..." |

> **Research basis (Pinel et al., 2006-2018):** I-sharing — the belief that you share an identical subjective experience with someone — creates connection more powerful than objective similarity. These narratives prime the reader to look for shared reactions on the date, making I-sharing moments more likely to be noticed. [Ref: dating_app_research.docx.md, Missing Mechanism 3]

**Tier 3 — Admiration Strategies** (what makes this person genuinely impressive):

| Strategy | When to use | Example opening |
|---|---|---|
| **Values-in-action** | Subject has stories of living their values, not just stating them | "You told me you admire people who show up even when nobody's watching. Let me tell you what Marcus does..." |
| **Demonstrated mastery** | Subject has a specific competence story that would resonate with recipient's value hierarchy | "Sarah taught herself something most people would never attempt — and the way she talks about it tells you everything..." |
| **Social proof** | Friend vouch data is available for the subject | "Marcus's best friend told us something about him that he'd never say about himself..." |
| **Vulnerability anchor** | Subject shared something deeply authentic | "There's a moment in Marcus's voice recording where he gets quiet and says..." |

**Tier 4 — Comfort Strategies** (why this person would feel safe):

| Strategy | When to use | Example opening |
|---|---|---|
| **Warmth priming** | Subject scored high on warmth + kindness markers, recipient's attachment style benefits from reassurance | "I think you'd feel really at ease with Sarah. There's a quality in how she talks about people..." |
| **Communication fit** | Both users have compatible communication styles (both direct, or both gentle) | "You both have the same way of saying what you mean — direct but kind. That's rarer than you'd think." |

> **Research basis (Liepmann et al., 2025):** Comfort is the 3rd most cited element of romantic chemistry. Narratives that prime comfort ("you'd feel at ease") reduce approach anxiety and increase the likelihood that users actually meet. [Ref: dating_app_research.docx.md, Missing Mechanism 4]

**How the strategy is chosen:**

```
Input: recipient_profile, subject_profile, compatibility_breakdown, chemistry_conditions_score

1. Score each strategy based on the data available:

   Tier 1 (Self-Expansion):
   - novel_world_score = count(subject_interests NOT in recipient_interests) * latent_interest_bridge_score
   - complementary_growth_score = max(strength_to_growth_edge_mappings)
   - perspective_gap_score = (1 - surface_similarity) * deep_compatibility

   Tier 2 (I-Sharing):
   - humor_resonance_score = humor_signature_similarity(recipient, subject)  // granular, not categorical
   - aesthetic_sync_score = sensory_resonance_overlap(recipient, subject)
   - processing_match_score = emotional_processing_similarity(recipient, subject)

   Tier 3 (Admiration):
   - values_in_action_score = count(subject.values_in_action_stories)
   - mastery_score = max(subject.demonstrated_competence_stories)
   - social_proof_score = has_friend_vouch(subject) ? vouch_quality : 0
   - vulnerability_score = max(subject.vulnerability, subject.authenticity)

   Tier 4 (Comfort):
   - warmth_score = subject.warmth * recipient.reassurance_seeking
   - communication_fit_score = communication_style_compatibility(recipient, subject)

2. Apply recipient preference modifiers:
   - excitement_type == "explorer" → boost Tier 1 strategies 1.5x
   - excitement_type == "intellectual" → boost Tier 1 + Tier 3
   - excitement_type == "spark" → boost Tier 2 (I-sharing) 1.5x
   - excitement_type == "nester" → boost Tier 3 + Tier 4

3. MANDATORY CHECK: Does the winning strategy include at least one self-expansion signal?
   If not, append a self-expansion element from Tier 1 data, even if Tier 1 wasn't the primary strategy.
   Every narrative must answer: "How would knowing this person expand your world?"

4. MANDATORY CHECK: Does the winning strategy include at least one admiration signal?
   If not, append an admiration element from Tier 3 data.
   Every narrative must answer: "What is genuinely impressive about this person?"

5. Apply historical effectiveness (once available):
   - For users similar to recipient, which strategies led to dates (not just Likes)?
   - Boost strategies that historically lead to INTERACTION outcomes, not just evaluation outcomes

6. Select top strategy. If top two are within 10%, randomly choose one (for exploration).
```

**The strategy is EXPLICIT in the prompt to the generation model.** Not "write an introduction" but "write a COMPLEMENTARY GROWTH introduction where you lead with how Marcus's spontaneity relates to Sarah's stated desire to be more adventurous."

### Stage 2: Multi-Draft Generation

Generate 3 candidate narratives for the selected strategy.

**Why 3?**
- 1 is a lottery ticket — quality depends entirely on the single generation
- 5+ is expensive and has diminishing returns
- 3 gives enough variety to pick a winner without 3x the cost

**Each draft gets a different instruction emphasis:**

Draft 1: "Prioritize specificity. Use concrete details from their voice memos."
Draft 2: "Prioritize emotional arc. Build anticipation, then deliver the payoff."
Draft 3: "Prioritize brevity and punch. Make every word count. Shortest draft wins if it hits as hard."

All 3 drafts receive the same strategy, same profiles, same data — but the stylistic instruction varies. This creates genuine diversity, not just temperature-based randomness.

### Stage 3: Self-Critique and Selection

A critic model (can be the same LLM, different prompt) evaluates all 3 drafts.

**Scoring rubric:**

```
For each draft, score 1-5 on:

SPECIFICITY (weight: 3x)
- Does it reference specific details from the subject's voice memos or profile?
- Could this introduction apply to anyone, or only to this specific person?
- 1 = completely generic ("you both value growth")
- 5 = unmistakably about one person ("she described the 4 AM rain runs")

EMOTIONAL ARC (weight: 2x)
- Does it create anticipation? Does the reader want to know more?
- Is there a beginning, middle, and payoff?
- 1 = flat list of attributes
- 5 = you feel something reading it

AUTHENTICITY (weight: 2x)
- Would a real friend say this? Or does it sound like AI marketing copy?
- Is the tone warm without being saccharine?
- 1 = "Amazing person who will change your life!"
- 5 = "Honestly, I think you'd really like talking to her"

BREVITY (weight: 1x)
- Is it 3-4 sentences? Does every sentence earn its place?
- 1 = rambling, 6+ sentences, repetitive
- 5 = tight, every word matters

CONNECTION TO RECIPIENT (weight: 2x)
- Does it explain WHY this person is interesting TO THE RECIPIENT specifically?
- Does it reference something about the recipient's profile/values/interests?
- 1 = generic "you might like them"
- 5 = "you told me you admire people who X — here's someone who does exactly that"

Total = (specificity * 3) + (arc * 2) + (authenticity * 2) + (brevity * 1) + (connection * 2)
Max = 50
```

**Selection:** Pick the highest-scoring draft. If top two are within 3 points, pick the shorter one.

**Rejection threshold:** If the best draft scores below 30/50, regenerate with the feedback: "The previous drafts were too generic. Here's what was missing: [critic's notes]. Try again with more specificity."

Maximum 2 regeneration attempts. If still below threshold, use the best available draft — don't block match delivery on narrative quality.

### Stage 4: Quote Integration Engine

The most powerful tool in the narrative arsenal is the subject's own words.

**Quote selection criteria:**

From the subject's `notable_quotes` array (up to 6 quotes stored), select the ONE best quote for this narrative:

```
Score each quote on:
1. Relevance to narrative strategy (0-3)
   - If strategy is "vulnerability" and quote shows vulnerability → 3
   - If strategy is "humor" and quote is funny → 3
   - If no connection to strategy → 0

2. Specificity (0-2)
   - Unique, surprising, could only come from this person → 2
   - Somewhat generic → 1
   - Platitude → 0

3. Brevity (0-2)
   - Under 15 words → 2
   - 15-30 words → 1
   - Over 30 words → 0 (too long to integrate smoothly)

4. Emotional weight (0-3)
   - Makes you stop and think → 3
   - Interesting → 2
   - Fine → 1
   - Flat → 0
```

**Integration rules:**
- The quote appears ONCE in the narrative, not dropped in randomly but woven into the story
- It's introduced with context: "When I asked her about [topic], she said: '[quote]'" — not just floating quotation marks
- The quote should be the emotional peak of the narrative — the moment where the reader thinks "I want to meet this person"
- If no quote scores above 5/10, don't force it. A great narrative without a quote beats a mediocre one with a shoehorned quote.

**Example of good integration:**

> "I want to tell you about Marcus. You told me you admire people who commit to hard things quietly — without needing anyone to see. When I asked Marcus about a time he was proud, he got quiet for a second and said: 'The mornings I ran in the rain when nobody was counting.' He's a wilderness guide who traded a finance career for something that actually made him feel alive. I think you two have more in common than you'd guess."

The quote is the hinge of the entire narrative. It proves the matchmaker's claim with evidence in the subject's own voice.

### Stage 5: Bidirectional Narrative Coherence

When A and B meet, they should discover complementary hooks planted by the system.

**How it works:**

When generating `narrative_for_a` (about B, for A to read) and `narrative_for_b` (about A, for B to read), the system ensures:

1. Both narratives reference a SHARED THEME — a value, interest, or life experience that connects them
2. Each narrative emphasizes a DIFFERENT FACET of that theme — so when they meet, they discover the other half
3. Neither narrative reveals what the OTHER person was told — the discovery moment happens in person

**Example:**

Both users value "doing things the hard way when it matters."

*Narrative for A (about B):*
> "Sarah ran an ultramarathon last year, but the part she talked about wasn't the finish line. It was the training runs at 4 AM in the rain. She said: 'Nobody was counting those miles but me.' You told me you respect people who do the work when nobody's watching. I think you'd respect Sarah."

*Narrative for B (about A):*
> "When Marcus left finance to become a wilderness guide, everyone thought he was crazy. He said the hardest part wasn't the pay cut — it was 'sitting with the uncertainty of not knowing if I'd made the right call.' You told me you admire people who make hard choices and own them. Marcus made the hardest one."

**What happens on the date:** A mentions the ultramarathon. B mentions the career change. They realize: "Wait — we both value the same thing, from completely different angles." The shared discovery creates a bonding moment that the system designed but neither person expected.

**Implementation:**

```
1. Generate narrative_for_a first
2. Extract the core theme and angle used
3. Pass theme + "complementary constraint" to narrative_for_b generation:
   "The narrative for the other person emphasized [theme] through [angle].
    Your narrative should reference the same theme through a DIFFERENT angle
    so they discover common ground when they meet."
4. Critic evaluates BOTH narratives together for coherence
```

### Stage 6: A/B Testing Framework

**The hypothesis engine:**

At any time, we should be running 2-3 active experiments on narrative style. Examples:

| Experiment | Variant A | Variant B | Metric |
|---|---|---|---|
| Quote placement | Quote in first sentence | Quote as climax | Like rate |
| Length | 2 sentences | 4 sentences | Like rate + read-through |
| Recipient reference | Mentions recipient's values | Doesn't mention recipient | Like rate |
| Tone | Warm and earnest | Playful and teasing | Like rate by excitement type |
| Photo timing | Narrative first, photo after | Photo and narrative together | Like rate + "not attracted" pass rate |

**Assignment:** Each match is randomly assigned to one variant. Assignment is stored with the match record.

**Analysis:** After N matches per variant (minimum 50 per cell), compute:
- Like rate per variant
- Like rate per variant PER EXCITEMENT TYPE (what works for explorers may not work for nesters)
- Mutual match rate per variant (did the narrative quality affect the other direction too?)
- Date scheduling rate per variant (did the narrative create matches that went further?)

**Shipping winners:** When a variant wins with 95% confidence on the primary metric (Like rate), it becomes the default. The losing variant is retired. A new experiment starts.

**The learning accumulates.** Over 12 months, you've run 20 experiments and the narrative system is 20 incremental improvements better than where it started.

---

## What RIGHT Looks Like

### Every narrative passes the "which person?" test
- Read the narrative. Can you tell which SPECIFIC person it's about? If you could swap in a different user and the narrative still works, it's too generic. This is the single most important quality bar.

### Users quote the narratives back to their dates
- "My matchmaker told me you ran in the rain at 4 AM" — the narrative created a conversation topic before the date started
- This is measurable: in post-date debriefs, ask "Did you reference your introduction during the conversation?"

### Like rates improve measurably over time
- As experiments accumulate and the strategy selector gets feedback, Like rates trend upward
- The improvement is not just "more Likes" but "more mutual Likes" — the narratives are creating genuine interest, not just curiosity

### The critic catches bad narratives before users see them
- Zero narratives go out that are pure generic fluff
- The rejection rate (critic score < 30/50) is 5-15% — low enough that most generations are good, high enough that the bar is real

### Both people feel primed for the same conversation
- Bidirectional coherence means first dates have a natural starting point
- Post-date feedback includes "we immediately found common ground" at higher rates than before coherence was implemented

---

## What WRONG Looks Like

### The critic becomes a bottleneck
**The failure:** The critic model rejects 40% of narratives, causing regeneration loops that slow match delivery to 30+ seconds and triple LLM costs.

**Why it happens:** Setting the quality bar too high without ensuring the generation model can consistently hit it. Or the critic's rubric doesn't match what users actually value.

**How to prevent it:**
- The rejection threshold (30/50) should be calibrated on REAL USER DATA — score 100 past narratives, see which scores correlated with Likes vs. Passes, set the threshold at the inflection point
- If rejection rate exceeds 20%, the problem is the generation prompt, not the threshold. Fix the prompt.
- Hard cap: maximum 2 regeneration attempts. After that, ship the best draft. A mediocre narrative delivered on time beats a perfect narrative delivered 2 hours late.
- Monitor critic agreement with user behavior: if the critic gives a narrative 45/50 and the user passes, or gives 32/50 and the user Likes, the rubric needs recalibration

### Over-produced narratives feel fake
**The failure:** Multi-draft generation + self-critique produces narratives that are too polished. They read like marketing copy, not like a friend telling you about someone. Users feel manipulated.

**Why it happens:** Optimizing for "sounds good" rather than "sounds real." The critic rewards eloquence, and the generator learns to be eloquent at the expense of authenticity.

**How to prevent it:**
- The AUTHENTICITY score (weight: 2x) in the critic rubric explicitly penalizes marketing language
- Add negative examples to the generation prompt: "Do NOT write anything that sounds like: 'Prepare to be amazed by someone extraordinary.' DO write things that sound like: 'Honestly, I think you'd really like this person.'"
- Include imperfection cues: the matchmaker can express uncertainty ("I'm not 100% sure about this one, but I have a feeling"), admit limits ("I don't know if you two would agree on politics, but I think you'd have a hell of a conversation"), or be casual ("She's funny. Like, actually funny, not dating-profile funny.")
- User feedback: add a "How did this intro feel?" reaction after Like/Pass: "Felt authentic" / "Felt generic" / "Felt like marketing." Track this.

### Quote forcing creates awkward narratives
**The failure:** Every narrative is forced to include a quote, even when the available quotes are mundane. "She said: 'I really enjoy spending time with my family.'" That quote adds nothing. The narrative would be better without it.

**Why it happens:** Treating quote integration as mandatory rather than optional.

**How to prevent it:**
- Quote integration is CONDITIONAL on the best quote scoring above 5/10
- If no quote is strong enough, the narrative uses paraphrasing instead: "She talked about her family with this warmth that you could hear in her voice" — references the memo without quoting directly
- Track: do narratives WITH quotes get higher Like rates than narratives WITHOUT? If not, quotes aren't adding value and the threshold should be raised

### Bidirectional coherence is too clever
**The failure:** Both narratives reference the same theme so explicitly that when A and B meet, it feels staged. "Wait, my matchmaker said the EXACT same thing about us..." breaks the illusion.

**Why it happens:** The complementary constraint is too tight. Both narratives reference the same value with the same framing.

**How to prevent it:**
- The shared theme should be IMPLICIT, not explicit. A's narrative doesn't say "you both value hard work" — it tells a story that embodies hard work. B's narrative tells a DIFFERENT story that also embodies it.
- The constraint to the B-side generation should be: "Reference the same underlying theme but through completely different surface-level content"
- If both narratives use the same word (e.g., "commitment"), it's too close — the critic should flag this
- Test: show both narratives side-by-side to a human reviewer. If the connection is OBVIOUS, it's too on-the-nose. It should be something they discover, not something they're told.

### A/B tests run forever without shipping
**The failure:** Every experiment runs to N=200 because the results are noisy. By the time one ships, three new experiments are queued. The system is always testing, never improving.

**Why it happens:** Narrative quality is inherently noisy — Like/Pass depends on many factors beyond the narrative. Effect sizes are small (5% improvement). Statistical power requires large samples.

**How to prevent it:**
- Run experiments on RELATIVE metrics within the same match: "For this match, which narrative style would you prefer?" (show both to a third-party reviewer, not the actual user)
- Use Bayesian analysis instead of frequentist — ship when 90% posterior probability, don't wait for p<0.05
- Limit concurrent experiments to 2. Don't split traffic too thin.
- If an experiment hasn't reached significance after 4 weeks, call it inconclusive and move on. Don't extend indefinitely.
- The biggest improvements come from fixing BAD narratives, not optimizing GOOD ones. Focus experiments on the bottom quartile of narrative quality.

---

## Technical Architecture

```
Match Selected (from Proposal 1)
        │
        ▼
┌─────────────────────────────┐
│  STRATEGY SELECTOR           │
│  Input: both profiles,       │
│    compatibility breakdown,  │
│    recipient excitement type │
│  Output: strategy + rationale│
│  Model: rules engine +       │
│    historical effectiveness  │
│  Latency: < 100ms            │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│  MULTI-DRAFT GENERATOR       │
│  Input: strategy, profiles,  │
│    quotes, A/B variant       │
│  Output: 3 candidate drafts  │
│  Model: Claude Sonnet 4.6    │
│  Latency: ~3s (parallel)     │
│  Cost: ~$0.03                │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│  QUOTE SELECTOR              │
│  Input: strategy, subject's  │
│    notable_quotes            │
│  Output: best quote + score  │
│  Model: rules engine or      │
│    Claude Haiku              │
│  Latency: < 500ms            │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│  CRITIC                      │
│  Input: 3 drafts, rubric,    │
│    profiles                  │
│  Output: scores + winner     │
│  Model: Claude Sonnet 4.6    │
│  Latency: ~2s                │
│  Cost: ~$0.02                │
└─────────────────────────────┘
        │
        ▼
  Score > 30/50?
   ├── YES → Final narrative
   └── NO  → Regenerate (max 2x)
        │
        ▼
┌─────────────────────────────┐
│  COHERENCE CHECK             │
│  (only for B-side narrative) │
│  Input: A's narrative,       │
│    B's candidate drafts      │
│  Output: B narrative that    │
│    complements A             │
│  Model: Claude Sonnet 4.6    │
│  Latency: ~2s                │
│  Cost: ~$0.02                │
└─────────────────────────────┘
        │
        ▼
  Store both narratives
  Assign A/B test variant
  Ready for delivery
```

**Total cost per match pair:** ~$0.09-0.15 (both sides, including potential regeneration)
**Total latency:** ~7-10 seconds (acceptable for cron-based delivery; for bonus matches, can parallelize)

### Database additions

```sql
-- Narrative metadata for learning
ALTER TABLE matches ADD COLUMN narrative_strategy text;
-- shared_values, complementary_growth, unexpected, humor, vulnerability, expansion

ALTER TABLE matches ADD COLUMN narrative_a_critic_score float;
ALTER TABLE matches ADD COLUMN narrative_b_critic_score float;

ALTER TABLE matches ADD COLUMN narrative_ab_test_variant text;
-- e.g., "quote_placement_v2", "length_short"

ALTER TABLE matches ADD COLUMN narrative_a_used_quote boolean DEFAULT false;
ALTER TABLE matches ADD COLUMN narrative_b_used_quote boolean DEFAULT false;

-- Narrative experiments
CREATE TABLE narrative_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  variant_a_config jsonb NOT NULL,
  variant_b_config jsonb NOT NULL,
  status text DEFAULT 'active', -- active, concluded, abandoned
  started_at timestamptz DEFAULT now(),
  concluded_at timestamptz,
  winner text, -- 'a', 'b', 'inconclusive'
  results jsonb -- final stats
);
```

---

## Build Order

1. **Strategy selector** — rules-based, no ML. Map compatibility breakdown to narrative strategy.
2. **Multi-draft generation** — 3 drafts per match with varied style instructions. Pick the longest (as a lazy heuristic — longer usually means more specific).
3. **Critic model** — score drafts, pick winner. Replace the "pick longest" heuristic.
4. **Quote integration** — score quotes, integrate best one, measure impact on Like rate.
5. **Bidirectional coherence** — generate B-side with A-side constraint.
6. **A/B testing infrastructure** — variant assignment, metric tracking, analysis tooling.
7. **Historical effectiveness feedback** — strategy selector learns from past Like rates per strategy per user type.

Start with 1+2 — they're a weekend project and immediately improve narrative quality. 3 is a few days. 4-7 are incremental.
