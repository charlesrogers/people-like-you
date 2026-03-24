# Extraction & Question Assortment Spec v1

## The Two Problems

### Problem 1: Question assortment doesn't reliably elicit the right data
Charles recorded multiple memos. The extraction surfaced "Political philosophy and governance structures" (which he never said) but missed: charismatic, great teacher, lover of animals, deeply curious about everything. The questions didn't create the right openings for his actual personality to come through.

### Problem 2: Extraction is too literal and too abstract
The current Claude Haiku prompt extracts what was SAID but misses what was DEMONSTRATED. "Political philosophy" was probably inferred from a brief mention, while the way he talked about building things (demonstrating drive, curiosity, teaching instinct) was captured as a surface-level interest tag rather than a core personality signal.

---

## Part 1: Question Assortment Redesign

### The Core Principle
From the research: "People think they know what they want, but when they actually interact, different attributes matter." (Eastwick & Finkel, 2008)

The same applies to questions. We don't ask "what are your passions?" We create openings where passions EMERGE from stories.

### Current Problem
6 random questions weighted by tier. If someone gets 2 Self-Expansion questions, 1 I-Sharing, 1 Admiration, 1 Comfort, 1 Fun — and they happen to get questions they don't connect with — we get thin data across the board.

### New Approach: Guaranteed Coverage + Adaptive Depth

**Minimum viable profile requires signal in ALL 5 dimensions:**
- 🧭 Explorer (Self-Expansion): at least 1 strong response
- 💜 Connector (I-Sharing): at least 1 strong response
- ⭐ Builder (Admiration): at least 1 strong response
- 🏠 Nurturer (Comfort): at least 1 strong response
- ⚡ Wildcard (Fun): at least 1 strong response

**Initial 6 questions: 1 per dimension + 1 user's choice**
- Question 1: Explorer prompt
- Question 2: Connector prompt
- Question 3: Builder prompt
- Question 4: Nurturer prompt
- Question 5: Wildcard prompt
- Question 6: User picks from any dimension (tells us what they gravitate toward)

**If they skip a question in a dimension:**
- Offer another question FROM THE SAME DIMENSION first
- After 2 skips in the same dimension, offer the opt-out: "This just isn't me" button
- Opting out of a dimension = real data (low score on that dimension is informative)

**After initial 6, the system evaluates extraction quality:**

```
For each dimension, check:
  - Did we get at least 1 concrete story? (not just "I like hiking")
  - Did we extract at least 2 specific traits?
  - Did we get a notable quote?

Dimensions below threshold → recommend more questions in that dimension
All dimensions above threshold → optional "show another side" unlock
```

### Question Quality Filter
Not all questions in the bank are equal. Some reliably produce rich stories; others get generic 10-second answers.

**Track per-question metrics (over time):**
- Average response duration
- Average extraction richness (count of non-null fields extracted)
- Notable quote hit rate

Use these metrics to weight question selection. Drop questions that consistently produce thin data.

---

## Part 2: Extraction Redesign

### Current Approach (Problems)
Single Claude Haiku prompt extracts 25+ fields from one transcript. This is:
1. Too many fields for one pass — the model spreads attention thin
2. Too literal — extracts what was said, not what was demonstrated
3. Missing behavioral signals — HOW someone talks reveals as much as WHAT they say
4. No cross-referencing — each memo extracted independently, missing patterns

### New Approach: Two-Pass Extraction

#### Pass 1: Story Extraction (What happened)
**Model:** Claude Haiku 4.5
**Focus:** Extract the STORY, not the personality

```
Prompt: You are extracting structured data from a dating app voice memo transcript.

The person answered this prompt: "{prompt_text}"

Extract:
1. story_summary: 1-2 sentence summary of what they actually talked about
2. concrete_details: specific names, places, numbers, objects mentioned
3. people_mentioned: who they talked about and their relationship
4. emotions_expressed: what feelings came through (not stated, DEMONSTRATED)
5. notable_quotes: 2-3 most vivid, specific phrases (direct quotes or close paraphrases)
6. response_depth: shallow (generic, could be anyone) | medium (some specifics) | deep (unique, vivid, personal)

Rules:
- Only extract what was ACTUALLY SAID. Do not infer topics not discussed.
- Notable quotes must be specific and vivid. "I like hiking" is NOT notable. "I named my sourdough starter Gerald" IS notable.
- If the response is shallow/generic, say so. Don't inflate.
```

#### Pass 2: Personality Signal Extraction (What it reveals)
**Model:** Claude Sonnet 4.6 (more capable model for inference)
**Input:** Pass 1 output + the original transcript + ALL other Pass 1 outputs for this user
**Focus:** What does this PATTERN OF STORIES reveal about who this person is?

```
Prompt: You are the world's best personality analyst for a dating matchmaker.

You have transcripts from {memo_count} voice memos from the same person. Your job is to figure out who this person ACTUALLY IS — not what they said, but what their stories reveal about them.

Here are their story extractions:
{all_pass1_outputs}

From the RESEARCH on romantic chemistry, we know these dimensions matter:

1. SELF-EXPANSION (Explorer): What new worlds could this person open for someone? What are they genuinely curious about? What would make someone think "I've never met anyone like this"?

2. I-SHARING (Connector): What makes this person laugh? What moves them? What would create a "click" moment with the right person? Look for: specific humor examples, aesthetic taste, emotional reactions.

3. ADMIRATION (Builder): What has this person DONE that demonstrates character? Not stated values — VALUES IN ACTION. Specific stories where they showed courage, competence, kindness, or growth. "She quit her job to..." not "she values courage."

4. COMFORT (Nurturer): How does this person make others feel? Evidence of warmth, attentiveness, reliability. Look for how they talk about other people.

5. WILDCARD: What's unexpected about this person? What doesn't fit the pattern? What would make someone go "wait, really?"

For each dimension, extract:
- 0-3 specific, concrete data points (not abstract traits)
- A confidence score (0-1): how much evidence do we have?
- The best quote that demonstrates this dimension

CRITICAL RULES:
- "Charismatic" is not a data point. "He talks about welcoming isolated people into conversations at parties" IS a data point.
- "Values authenticity" is not a data point. "He said he'd rather lose an argument by being honest than win by performing" IS a data point.
- If you don't have evidence for a dimension, say so. Confidence: 0. Don't fabricate.
- Look for BEHAVIORAL signals: someone who talks about their dog for 2 minutes without being asked is demonstrating something different than someone who lists "animal lover" as an interest.
- Cross-reference stories. If 3 out of 4 stories involve teaching or explaining things to people, that's a pattern the individual stories might not surface.

Also extract:
- primary_energy: What is this person's dominant vibe? (1 sentence, specific)
- hidden_depth: What would surprise someone who just met them? (1 sentence)
- humor_signature: How are they funny? Give an actual example from their words.
- conversation_fuel: What topics would make this person talk for 2 hours? (specific topics, not categories)
```

### Why Two Passes?

Pass 1 is cheap (Haiku) and factual. It creates clean input for Pass 2.

Pass 2 is expensive (Sonnet) but only runs ONCE after all memos are collected. It sees the FULL picture — all stories together — and can identify patterns that single-memo extraction misses.

The current system extracts each memo independently with Haiku, then aggregates with weighted averages. This means it can extract "political philosophy" from one memo even though the person barely mentioned it, and that datapoint persists into the composite.

The new system: Haiku extracts facts per memo. Sonnet reads ALL facts and builds the personality picture. Cross-referencing catches patterns. The "political philosophy" false positive gets diluted because Sonnet sees it wasn't a pattern across stories.

---

## Part 3: What Changes

### Database
- `voice_memos.extraction` field: now stores Pass 1 output (story extraction)
- New field or table: `composite_profiles` stores Pass 2 output (personality signals)
- Pass 2 output replaces the current aggregation logic

### Files to modify
- `src/lib/extraction.ts`:
  - `extractMemo()` → Pass 1 (story extraction with Haiku)
  - New `buildPersonalityProfile()` → Pass 2 (personality analysis with Sonnet, runs after all memos)
  - Remove current `aggregateComposite()` weighted averaging (replaced by Pass 2)
- `src/lib/prompts.ts`:
  - Restructure `getOnboardingPrompts()` → guaranteed 1 per dimension + 1 user choice
  - Add skip-in-dimension logic
  - Add per-question quality tracking (future)
- `src/app/onboarding/page.tsx`:
  - Voice step: enforce dimension coverage
  - Skip → same dimension replacement first
  - "This isn't me" opt-out after 2 skips in same dimension

### What stays the same
- Whisper transcription (Pass 0) is unchanged
- Narrative strategy selection reads from composite_profiles (same interface)
- Match scoring reads from composite_profiles (same interface)
- The 55-question bank stays — just the SELECTION logic changes

---

## Part 4: Extraction Quality Metrics

Track per-user:
- Response depth distribution (how many shallow vs deep responses)
- Dimension coverage (which dimensions have strong signal)
- Notable quote count (more = richer profile = better intros)
- Cross-reference pattern count (how many patterns Pass 2 identified)

Track per-question:
- Average response duration
- Average response_depth rating
- Notable quote hit rate
- Which dimensions it reliably produces signal for

Surface all of this in the admin panel.

---

## Part 5: Implementation Priority

### Phase 1 (Now — question assortment)
- [ ] Restructure question selection: 1 per dimension + 1 user choice
- [ ] Skip → same dimension replacement
- [ ] "This isn't me" opt-out after 2 skips in same dimension
- [ ] Track which dimension each question was served for

### Phase 2 (Next — two-pass extraction)
- [ ] Build Pass 1 prompt (story extraction, Haiku)
- [ ] Build Pass 2 prompt (personality analysis, Sonnet)
- [ ] Run Pass 2 after all memos collected (replaces aggregation)
- [ ] Validate: run both old and new extraction on same transcripts, compare output

### Phase 3 (After validation)
- [ ] Replace old extraction pipeline with two-pass
- [ ] Update personality-reveal.ts to read new composite format
- [ ] Per-question quality metrics
- [ ] Admin panel: extraction quality dashboard
