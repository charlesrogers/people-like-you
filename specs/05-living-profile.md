# Proposal 5: The Living Profile — Continuous Voice Journaling + Temporal Identity Model

## The One-Sentence Version

Transform onboarding from a one-time event into a continuous voice journaling system where every new recording updates the user's embedding, keeps match narratives fresh, detects personal growth, enables "second-chance" matches, and makes PLY the only dating platform where your profile evolves as you do.

---

## Why This Exists

Right now, a user's composite profile is frozen after onboarding. They record 2-6 voice memos on day 1, the system extracts personality traits, and that extraction drives all future matches. Six months later, they're still being matched on who they were when they signed up.

This is the same problem every dating app has. Bumble profiles get stale. Hinge prompts go unchanged for years. The person behind the profile has grown, changed priorities, had experiences — but the system doesn't know.

The old Google Form was even worse — a 30-question snapshot that couldn't possibly capture someone in motion. The voice memo system is better because it captures nuance, tone, and authenticity. But it's still a snapshot.

**The real problem:** People are not static entities. They're trajectories. The 26-year-old who just moved to a new city and is focused on career is a different person at 27 when they've settled in and are thinking about relationships. The system should match them on who they're *becoming*, not just who they *were*.

---

## What We're Building

### Component 1: Weekly Micro-Journaling

**Cadence:** One prompt per week, delivered at a consistent time (user-configurable, default Sunday 7 PM).

**Prompt design principles:**
- Prompts are NOT about dating. They're about life. The system learns about you by hearing you talk about your week, your thoughts, your reactions — not by asking "what are you looking for in a partner?" again.
- Prompts should be easy to answer (low friction, 60-90 seconds) but revealing (yield personality signal).
- Prompts rotate through signal domains so the system builds up coverage over time.

**Prompt bank (organized by what they extract):**

**Warmth / Empathy:**
- "Who made your week better? Tell me about them."
- "When's the last time you helped someone without being asked?"
- "What's something kind someone did for you recently that stuck with you?"

**Humor / Lightness:**
- "What made you laugh this week?"
- "What's the most ridiculous thing that happened to you recently?"
- "If you had to describe your week as a movie genre, what would it be?"

**Depth / Values:**
- "What's something you changed your mind about recently?"
- "What conversation has been stuck in your head lately?"
- "If you could go back to Monday and give yourself one piece of advice, what would it be?"

**Ambition / Drive:**
- "What are you most excited about right now?"
- "What's something you're working on that most people don't know about?"
- "What would you do this week if you had no obligations?"

**Vulnerability / Growth:**
- "What's been hard lately?"
- "What are you learning about yourself right now?"
- "What's something you used to believe that you don't anymore?"

**Self-Expansion / Interests:**
- "What's something new you tried or discovered this week?"
- "What could you talk about for an hour right now?"
- "What's the most interesting thing you read, watched, or heard recently?"

**I-Sharing / Aesthetic Resonance** (NEW — extracts data for Tier 2 matching vectors):
- "What's the last thing that gave you actual chills — a song, a moment, a sentence?"
- "What made you stop and stare this week?"
- "What's something you wish someone else had been there to experience with you?"
- "What's a tiny detail in the world that most people walk right past but you always notice?"
- "What kind of silence feels comfortable to you?"
- "Describe a sound, smell, or image that immediately puts you at ease."

> **Research basis (Pinel et al., 2006-2018):** I-sharing — the belief that you share an identical subjective experience with someone — is one of the most powerful drivers of interpersonal connection, but the current system doesn't extract the data needed to predict it. These prompts surface what moves someone, what they notice, what triggers a shared-experience response. This data feeds directly into the I-sharing matching vectors (Spec 01) and the I-sharing narrative strategies (Spec 04). [Ref: dating_app_research.docx.md, Missing Mechanism 3]

**Attachment / Relationship Style** (NEW — extracts data for Tier 4 matching vectors):
- "When you're stressed, do you want someone close or do you want space?"
- "What does a really good evening at home look like to you?"
- "What's something a partner has done that made you feel completely safe?"

**Prompt selection algorithm:**

```
1. Check which signal domains have the OLDEST data for this user
2. Select the domain with the most stale coverage
3. Pick a prompt from that domain that hasn't been asked in the last 8 weeks
4. Apply variety: never the same prompt type two weeks in a row
```

**Delivery UX:**
- Push notification: "Your weekly check-in is ready"
- User opens app → sees the prompt → records 60-90 seconds → done
- Optional: listen to their recording before submitting (but don't encourage perfectionism)
- Positive reinforcement: "Thanks — this helps us find better matches for you. You've recorded [X] check-ins so far."

**Skipping is fine.** No penalty for missing a week. No guilt. If they miss 3 in a row, reduce frequency to biweekly. If they miss 6, stop sending until they re-engage. The matchmaker (Proposal 2) might gently ask: "We haven't heard from you in a while. Everything okay?"

### Component 2: Incremental Extraction + Temporal Embedding

Each new journal entry goes through the same extraction pipeline as onboarding memos:

```
Audio → Transcription → Extraction → Composite Update
```

**But the composite update is different from onboarding.**

**Onboarding:** All memos are roughly equal. The composite averages them with slight recency bias (1.5x for most recent).

**Ongoing journals:** Recency matters much more. The system should reflect WHO YOU ARE NOW, not an average of everything you've ever said.

**Temporal weighting scheme:**

```
weight(memo) = base_weight * decay(age_in_weeks)

Where:
  base_weight = 1.0 for journal entries, 0.5 for onboarding entries (after 3 months)
  decay(weeks) = max(0.1, e^(-weeks/26))  // 26-week half-life (~6 months)
```

This means:
- A journal entry from this week: weight 1.0
- A journal entry from 1 month ago: weight ~0.85
- A journal entry from 3 months ago: weight ~0.56
- An onboarding entry from 6 months ago: weight ~0.18
- An onboarding entry from 1 year ago: weight ~0.06

**The composite profile is recalculated after every new entry.** Old data fades. New data dominates.

**For array fields** (interests, values, goals, passion indicators): use recency-weighted frequency. An interest mentioned once 6 months ago and never again drops off. An interest mentioned in 3 of the last 5 entries rises to the top.

**For the embedding** (Proposal 1): the user's dense vector is recomputed using the temporally-weighted composite. This means the matching model sees who they are NOW, not who they were at signup.

### Component 3: Prosody and Voice Feature Analysis

Voice carries signal beyond the words. Two people can say "I love my family" and mean completely different things — detectable from how they say it.

**What to extract from audio (not transcript):**

| Feature | What it indicates | How to extract |
|---|---|---|
| Speaking rate (wpm) | Energy, excitement, anxiety | Word count / duration |
| Pitch variation (Hz std dev) | Expressiveness, emotional range | Fundamental frequency analysis |
| Pause frequency | Thoughtfulness, comfort with silence | Silence detection |
| Pause before certain topics | Hesitation, sensitivity | Topic + pause correlation |
| Energy (dB RMS) | Enthusiasm, confidence | Audio amplitude analysis |
| Laughter detection | Humor, ease | Audio classifier |
| Vocal warmth | Friendliness, approachability | Spectral features (lower formants = warmer) |
| Filler words (um, uh, like) | Comfort level, formality | Transcript analysis |

**Important:** These features are used to ENRICH the composite profile, not to judge. High filler word usage doesn't mean someone is inarticulate — it might mean they're thinking carefully. The system uses these as additional signal dimensions, not quality metrics.

**Technology:** Libraries like `librosa` (Python) can extract most of these features. Laughter detection requires a small trained classifier (or an off-the-shelf audio event detection model). This can be done in a batch processing pipeline, not real-time.

**Privacy consideration:** Prosody features are derived from audio and stored as numbers (speaking rate: 142 wpm, pitch variation: 45 Hz). The raw audio analysis happens in the extraction pipeline and is not surfaced to users or matches. Users can see their extracted traits ("You tend to speak with a lot of energy and expressiveness") but not the raw measurements.

### Component 4: Narrative Freshness

Match narratives (Proposal 4) should draw from RECENT journal entries, not just onboarding data.

**Current state:** Narrative engine uses `composite_profile` which is frozen at onboarding. Quotes are from onboarding memos only.

**New state:** Narrative engine has access to:
- Current composite profile (temporally weighted)
- Last 4 journal entry transcripts (raw text, for quote extraction)
- Topics the user has been talking about recently (extracted from journal entries)
- How the user has CHANGED recently (delta between current and 3-month-ago composite)

**This enables narratives like:**

> "Sarah's been on a cooking kick lately — she spent last weekend learning to make pasta from scratch and couldn't stop talking about it. You mentioned you love people who get obsessed with learning new things. I think you'd love watching her light up about the difference between semolina and tipo 00 flour."

That narrative is CURRENT. It references something from last week, not something from 6 months ago. It makes the introduction feel alive — like the matchmaker is telling you about someone they just talked to, not reading from a file.

**Quote freshness:** `notable_quotes` should be tagged with timestamps. The narrative engine prefers quotes from the last 30 days. Onboarding quotes are used only if no recent quotes are strong enough.

### Component 5: Profile Evolution Visualization

Show users how they've changed over time.

**Monthly insight card** (delivered once a month, optional):

```
┌──────────────────────────────────────────┐
│  Your Profile: March 2026                │
│                                          │
│  Top topics this month:                  │
│  🌱 Personal growth  📚 Reading          │
│  🏃 Running  🍳 Cooking                  │
│                                          │
│  Shift from last month:                  │
│  + More focus on creativity              │
│  + Higher energy in your recordings      │
│  - Less mention of career goals          │
│                                          │
│  Your matchmaker says:                   │
│  "You've been more playful in your       │
│  recent recordings. I'm adjusting your   │
│  matches to reflect that."               │
│                                          │
│  [ See full profile evolution ]          │
└──────────────────────────────────────────┘
```

**Detailed view:** Timeline of Big Five proxy shifts, topic clouds by month, energy level trend, key quotes by month. This is intrinsically interesting — people like seeing themselves reflected back in data. It's also a retention mechanism: users keep journaling because they want to see how the picture evolves.

**Critical:** This visualization must be POSITIVE and DESCRIPTIVE, never judgmental. "Your openness score has been trending upward" is fine. "Your neuroticism increased" is not — even if it's technically accurate. Reframe: "You've been processing more complex emotions in your recordings." No one should feel bad about their profile evolution.

### Component 6: Second-Chance Matching

The most novel feature enabled by living profiles.

**The situation:** A was shown B three months ago. A passed. At the time, A was focused on career and B was focused on travel. Now, A has been talking about wanting more adventure, and B just got back from a trip and is settling into a new job. Their profiles have converged.

**Detection algorithm:**

```
For each (A, B) pair where:
  - A passed on B more than 60 days ago
  - A's embedding has shifted significantly (cosine delta > threshold)
  - B's embedding has also shifted (or B is still active)
  - New compatibility score > old compatibility score + margin (e.g., +0.15)

Flag as second-chance candidate.
```

**Delivery:**

The matchmaker frames it differently from a normal intro:

> "I know I introduced you to Marcus a few months ago and it wasn't the right time. But you've both changed since then — you've been talking more about wanting adventure, and he just finished a big wilderness project. I think it's worth another look."

**Rules:**
- Maximum ONE second-chance match per user per quarter
- Only surface if the new compatibility score is genuinely high (top 10% of all possible matches)
- NEVER reveal why the first match was a pass: don't say "you passed because..." — say "it wasn't the right time"
- If the user passes again, that pair is permanently excluded
- Both users must have recorded at least 2 journal entries since the original match (ensures real change, not just time passing)

### Component 7: Friend Vouch Integration

The friend vouch feature (described in Spec 02, Component 5.5) lives in the Living Profile system because vouches can arrive at any time, not just during onboarding.

**How vouches feed the living profile:**
- Vouch extractions merge into composite profile with `source: friend_vouch` tag
- Friend-sourced signals get a credibility multiplier (1.3x weight) because third-party observations are more reliable than self-report [Ref: dating_app_research.docx.md, Part 5 Tier 3]
- Notable quotes from vouches are tagged as social proof and get priority in narrative generation
- Vouches don't decay with the temporal weighting scheme — a friend's assessment of your character is more stable than your weekly mood

**Periodic prompt:** Every 3 months, remind users: "Want a boost? Invite a friend to vouch for you. Profiles with friend vouches get [X]% more mutual interest."

---

## What RIGHT Looks Like

### I-sharing data is actually useful for matching
- Users matched on I-sharing vectors (humor signature + aesthetic resonance + emotional processing) show higher "click" rates on first dates than users matched on interest overlap alone
- Post-date surprise responses include "we both noticed / laughed at / reacted to the same thing" at measurably higher rates for I-sharing-matched pairs
- This is the core validation for the I-sharing prompts: do they produce data that predicts real-time connection?

### Journaling feels valuable on its own
- Users record weekly check-ins because the prompts are interesting, not because they feel obligated
- Completion rate stabilizes above 50% after 4 weeks (50% of active users record most weeks)
- Users mention the journaling prompts in conversations: "My dating app asked me the best question this week..."
- The monthly insight card has an open rate above 70%

### Match quality improves over time for active journalers
- Users with 8+ journal entries have measurably higher mutual Like rates than users with onboarding only
- This is the core validation: does the living profile actually produce better matches?
- Control group: users matched on onboarding-only composite vs. users matched on updated composite

### Second-chance matches have higher success rates than first-round
- Because both profiles have converged AND the system has more data, second-chance matches should outperform average matches
- This is a powerful retention narrative: "The longer you're here, the better we know you, and the better your matches get"

### Prosody features add signal that transcripts miss
- In A/B test: matches made with prosody features vs. without show higher mutual Like rates
- Specific validation: energy level mismatch (one high-energy, one low-energy based on voice) correlates with "no spark" passes

### Profiles feel alive, not stale
- Users who've been on the platform 6+ months feel like their matches are still fresh and relevant
- The "long-time user staleness" problem (where matches feel repetitive after a few months) is reduced because both the user's profile and the narrative content are continuously updated

---

## What WRONG Looks Like

### Journaling becomes homework
**The failure:** Users record for 3 weeks, then stop. The weekly prompt feels like a chore. Completion rates drop below 20% after the first month. The living profile feature only works for a small segment of hyper-engaged users.

**Why it happens:** The prompts aren't interesting enough. Or the payoff isn't clear — users don't see how their recordings improve their matches.

**How to prevent it:**
- Prompts must be genuinely interesting to answer — the kind of question that makes you think for a second. Test prompts with real people before shipping: "Would you want to answer this?"
- Show the CONNECTION between journaling and match quality: "Your check-in last week helped us find this match" (even if it's partially true, the reinforcement matters)
- Don't guilt-trip for missed weeks. Ever. No "You missed your check-in!" notifications.
- Vary the format: some weeks it's a question, some weeks it's a "react to this" (play a 15-second clip and ask for their reaction), some weeks it's a fill-in-the-blank
- If a user stops recording, reduce frequency rather than stopping entirely. Biweekly is better than nothing. Monthly is better than gone.
- Track and set an internal alarm: if weekly completion rate across all users drops below 30%, the prompt strategy needs rethinking

### Temporal weighting creates personality whiplash
**The failure:** User has a bad week and records a low-energy, negative journal entry. Their composite profile swings heavily toward low energy and high neuroticism. They get matched with someone who's also having a rough time. Both have a terrible date.

**Why it happens:** Recency weighting is too aggressive. One data point shouldn't swing the profile dramatically.

**How to prevent it:**
- Minimum 3 entries before the temporal model diverges significantly from onboarding baseline
- Smoothing: no single entry can shift any numeric trait by more than 0.1 (on 0-1 scale)
- Anomaly detection: if an entry's extraction is more than 1.5 standard deviations from the user's running average, flag it as an outlier and reduce its weight
- Distinguish between "bad week" (temporary mood, should be smoothed) and "life change" (genuine shift, should be reflected). Heuristic: if 3+ consecutive entries show the same shift, it's real. One entry alone is noise.
- The 26-week half-life means old entries retain 50% weight at 6 months — they don't disappear overnight. This provides stability.

### Prosody analysis is creepy
**The failure:** Users discover that the system analyzes their speaking pace, pitch, and pauses. They feel surveilled. "You're analyzing my VOICE?" becomes a PR problem.

**Why it happens:** The feature is technically impressive but emotionally invasive if not communicated properly.

**How to prevent it:**
- Be transparent upfront: during onboarding, explain "We listen to HOW you talk, not just WHAT you say — your energy, your expressiveness, your warmth. This helps us understand who you'd vibe with."
- Frame as positive: "Your voice has a warmth that comes through even when you're being sarcastic. We match you with people who appreciate that." Not: "Your pitch variation indicates moderate expressiveness."
- NEVER surface raw measurements. Users see qualitative descriptions ("You speak with a lot of energy and enthusiasm"), never quantitative ones ("Your speaking rate is 156 wpm, which is 1.2 standard deviations above average").
- Give users control: "Don't analyze my voice features" toggle. Their memos are still transcribed and text-extracted, but prosody features are not computed.
- Have a clear, simple privacy page explaining exactly what's analyzed, what's stored, and what's shared (nothing is shared — only the resulting personality traits influence matching).

### Second-chance matches feel like recycling
**The failure:** "Wait, I already passed on this person. Is the app so small that they're re-showing me people?" Users feel like the pool is exhausted.

**Why it happens:** The framing doesn't adequately convey that both people have changed. It feels like the system ran out of options.

**How to prevent it:**
- ONLY surface second-chance matches when the compatibility score has GENUINELY improved significantly (not marginal improvement)
- The narrative MUST explain what changed: "You've been talking about X more recently. Marcus has been going through Y. Three months ago this wouldn't have made sense. Now I think it does."
- Limit to 1 per quarter — it's a special event, not a regular occurrence
- Never show second-chance if the user's pool still has strong first-time candidates. Second-chance is for "better match now than anything new" situations, not "we're running low"
- If user passes on the second-chance, NEVER show that person again. Three strikes (original + second-chance + anything else) = permanent exclude.

### Data hoarding without payoff
**The failure:** The system collects 52 journal entries per year per user, runs extraction on all of them, recomputes embeddings weekly — and match quality is indistinguishable from onboarding-only profiles. All that compute and user effort for nothing.

**Why it happens:** The temporal model doesn't actually capture meaningful change, or the matching model (Proposal 1) doesn't use the temporal signal effectively, or people don't change as much as we assume in 6-month windows.

**How to prevent it:**
- A/B test from day 1: 50% of users get matches from temporally-updated profiles, 50% from onboarding-only. If after 3 months there's no difference in mutual Like rate or date rate, the feature isn't working.
- Set a kill threshold: if temporal profiles don't outperform static profiles by at least 5% on mutual Like rate after 6 months of data, deprioritize the feature
- Start simple: before building the full temporal embedding system, just test whether ADDING NEW VOICE DATA (without temporal weighting) improves matches. If more data = better matches, then temporal weighting is worth building. If more data ≠ better matches, the problem is the extraction quality, not the temporal model.
- Check whether users actually change meaningfully: compare composite profiles at month 0 vs. month 6. If the cosine similarity is > 0.95 for most users, there isn't enough drift to model.

---

## Schema Additions

```sql
-- Journal entries (extends voice_memos concept)
CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  prompt_id uuid NOT NULL, -- references the prompt bank
  prompt_text text NOT NULL, -- store the actual prompt for reference
  signal_domain text NOT NULL,
  -- warmth, humor, depth, ambition, vulnerability, self_expansion
  audio_storage_path text NOT NULL,
  duration_seconds float,
  transcript text,
  extraction jsonb, -- same MemoExtraction structure
  prosody_features jsonb,
  -- { speaking_rate_wpm, pitch_mean_hz, pitch_std_hz, pause_rate,
  --   energy_db_rms, filler_word_rate, laughter_detected: bool }
  week_number int NOT NULL, -- weeks since user signup
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_journal_user ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_journal_domain ON journal_entries(user_id, signal_domain);

-- Temporal composite snapshots (weekly)
CREATE TABLE composite_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  snapshot_at timestamptz DEFAULT now(),
  composite jsonb NOT NULL, -- full CompositeProfile at this point in time
  embedding vector(128), -- pgvector: the user's dense embedding at this point
  delta_from_previous jsonb,
  -- { openness_delta: +0.05, top_new_interests: ["pasta making"],
  --   dropped_interests: ["rock climbing"], energy_trend: "increasing" }
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_snapshots_user ON composite_snapshots(user_id, snapshot_at DESC);

-- Second-chance match candidates
CREATE TABLE second_chance_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  matched_user_id uuid REFERENCES users(id) NOT NULL,
  original_match_id uuid REFERENCES matches(id) NOT NULL,
  original_pass_at timestamptz NOT NULL,
  old_compatibility_score float NOT NULL,
  new_compatibility_score float NOT NULL,
  score_delta float NOT NULL,
  user_embedding_delta float NOT NULL, -- cosine distance of user's embedding shift
  matched_embedding_delta float NOT NULL,
  status text DEFAULT 'pending',
  -- pending, delivered, liked, passed, expired
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_second_chance_user ON second_chance_candidates(user_id, status);

-- Journal prompt bank
CREATE TABLE journal_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text NOT NULL,
  signal_domain text NOT NULL,
  active boolean DEFAULT true,
  times_used int DEFAULT 0,
  avg_recording_duration float,
  avg_extraction_richness float, -- how much signal does this prompt yield?
  created_at timestamptz DEFAULT now()
);

-- Track which prompts each user has seen
CREATE TABLE user_prompt_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  prompt_id uuid REFERENCES journal_prompts(id) NOT NULL,
  delivered_at timestamptz DEFAULT now(),
  recorded boolean DEFAULT false,
  recorded_at timestamptz,
  UNIQUE(user_id, prompt_id)
);
```

---

## Processing Pipeline

```
Weekly cron (Sunday 7 PM per user's timezone):
  │
  ▼
Select prompt for user (stale domain + variety)
  │
  ▼
Deliver prompt via push notification
  │
  ▼
User records → uploads to Supabase Storage
  │
  ▼
┌────────────────────────────────────┐
│  PROCESSING PIPELINE (async)       │
│                                    │
│  1. Transcribe (Whisper/Deepgram)  │
│  2. Extract traits (Claude Haiku)  │
│  3. Extract prosody (librosa)      │
│  4. Update composite:              │
│     a. Temporal weighting          │
│     b. Recalculate all traits      │
│     c. Update notable_quotes       │
│  5. Recompute embedding            │
│  6. Save composite snapshot        │
│  7. Check second-chance candidates │
│  8. Notify narrative engine of     │
│     fresh content                  │
└────────────────────────────────────┘
```

**Step 7 detail — Second-chance detection:**

```
After embedding update for user A:
  1. Get all users A previously passed (from match_feedback)
  2. Filter to passes > 60 days ago
  3. Filter to users still active
  4. Compute new compatibility score for each
  5. Compare to original compatibility score
  6. If delta > 0.15 AND new score is top-10% of all candidates:
     → Insert into second_chance_candidates
  7. Deliver max 1 per quarter
```

---

## Build Order

1. **Journal prompt bank** — seed with 30 prompts across 6 domains. Manually curate, don't generate.
2. **Weekly prompt delivery** — cron job, prompt selection algorithm, push notification.
3. **Journal recording + extraction** — same pipeline as onboarding voice memos, new table.
4. **Temporal composite weighting** — recency-weighted composite recalculation on each new entry.
5. **Embedding recomputation** — integrate with Proposal 1's embedding model.
6. **Narrative freshness** — narrative engine pulls from recent journal entries.
7. **Prosody analysis** — batch pipeline for voice feature extraction.
8. **Monthly insight card** — profile evolution visualization, delivered monthly.
9. **Second-chance matching** — detection algorithm, delivery with special framing.
10. **Composite snapshots** — weekly archival for evolution visualization and drift analysis.

Start with 1-3. If users are recording journal entries and the extraction adds signal, everything else follows. If users don't record, nothing else matters.

---

## The Meta-Question: Does This Work?

The entire proposal rests on two assumptions:

**Assumption 1: People change enough in 3-6 months that their dating profile should change too.**

Test: Compare composite profiles at month 0 vs. month 6 for users who journal regularly. If cosine similarity > 0.95, people aren't changing enough for temporal modeling to matter. If < 0.85, there's meaningful drift to capture.

**Assumption 2: Capturing that change improves match quality.**

Test: A/B test. Group A gets matches from temporally-updated profiles. Group B gets matches from static onboarding profiles. Measure mutual Like rate and date rate over 3 months.

If both assumptions hold, this is the most defensible competitive advantage PLY can build. No other dating app has continuous voice data, temporal personality modeling, or second-chance matching based on personal growth.

If either assumption fails, the journaling system still has value as a retention mechanism and a narrative freshness engine — but the core "living profile" thesis would need rethinking.

Run the tests before building the complex parts. Journal recording (items 1-3) is cheap and generates the data to validate everything else.
