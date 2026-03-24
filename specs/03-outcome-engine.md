# Proposal 3: The Outcome Engine — Date Scheduling, Feedback Loops, and Relationship Trajectory

## The One-Sentence Version

Build the entire post-match lifecycle: mutual match detection, automated date scheduling, venue selection, pre-date preparation, post-date intelligence gathering, trust/safety scoring, anti-ghosting mechanics, and relationship trajectory tracking — so the north star metric ("dates that happen per week") becomes measurable.

---

## Why This Exists

The current system ends at Like/Pass. The activation-retention spec describes a complete post-match lifecycle, but none of it is built. Right now:

- There's no way to detect mutual matches (A Liked B AND B Liked A)
- There's no messaging between matched users
- There's no date scheduling
- There's no post-date feedback
- There's no way to know if a match led to a real date
- There's no way to know if a date led to a relationship
- The north star metric ("dates that happen per week") is literally unmeasurable

This means the matching model (Proposal 1) is training on Like/Pass signals — a proxy three steps removed from the actual outcome. It's like optimizing a sales funnel by measuring who reads the email, not who buys.

---

## What We're Building

### System 1: Mutual Match Detection + Conversation Initiation

**Trigger:** Both users have Liked each other (directly or via bonus intro).

**What happens immediately:**
1. Both users receive a notification: "You have a mutual match!"
2. Both see a "Mutual Match" card on their dashboard with the other person's intro narrative
3. Photos are revealed to both (if not already)
4. A 48-hour conversation window opens

**Structured Disclosure Exchange (not free-form messaging):**

> **Research basis (Aron et al., 1997 — 36 Questions):** Structured, escalating, reciprocal self-disclosure between strangers produces strong feelings of closeness. Free-form texting is a race to the bottom — people default to "hey" and small talk. The 36 Questions worked because vulnerability increased gradually: "I didn't notice we had entered intimate territory until we were already there." PLY should design the disclosure process rather than leaving it to chance. [Ref: dating_app_research.docx.md, Confirmation 3]

Instead of a chat window, the system presents **3-5 escalating exchange prompts**, personalized to both users' composite profiles:

**Round 1 (Low stakes, shared ground):**
System generates a prompt based on the SHARED theme from both narratives. Example: "You both mentioned doing something hard that nobody noticed. Tell each other about yours." Both users answer (voice or text). Both read/listen to the other's answer.

**Round 2 (Medium stakes, curiosity):**
Based on Round 1 answers + composite profiles. Example: "What's something you've changed your mind about in the last year?" Both answer, both read.

**Round 3 (Higher stakes, vulnerability):**
Example: "What's something you're still figuring out?" or "What do you wish someone understood about you?"

**After Round 3:** "You two clearly have things to talk about. Want to meet?" → Date scheduling triggers.

**Why this is better than chat:**
- Reciprocal: both people invest equally (no "she sent 3 paragraphs, he sent 'lol cool'")
- Escalating: vulnerability increases gradually, building comfort
- Collaborative: answering the same question together feels like a shared experience, not an evaluation
- Bounded: 3-5 exchanges, not infinite pen-pal texting that delays meeting
- The prompts ARE the investment mechanism from the thesis

**Expiration:** If either person doesn't answer within 48 hours after a round, the exchange pauses. After 72 hours, the match expires with a warm message.

**Voice-first encouraged:** "Record your answer — it's how they got to know you in the first place."

**What we're NOT building:** A full chat system. PLY is not a messaging app. The structured exchange bridges match → date, not match → pen-pal.

### System 2: Date Scheduling Engine

**Trigger:** Mutual match with active conversation (at least 2 messages exchanged) OR either user taps "Let's meet."

**Step 1: Availability Collection**

Each user sets weekly availability (collected once, editable anytime):

```
{
  monday:    { morning: false, afternoon: true,  evening: true  },
  tuesday:   { morning: false, afternoon: false, evening: true  },
  wednesday: { morning: false, afternoon: true,  evening: true  },
  thursday:  { morning: false, afternoon: false, evening: true  },
  friday:    { morning: false, afternoon: true,  evening: true  },
  saturday:  { morning: true,  afternoon: true,  evening: true  },
  sunday:    { morning: false, afternoon: false, evening: false }   // default off
}
```

Availability is stored in `user_availability` table. Users set this once during onboarding (Step 3, after preferences) and can update anytime.

**Step 2: Time Slot Generation**

System finds overlapping windows in the next 7 days:

```
Algorithm:
1. Get both users' availability grids
2. Find overlapping slots in next 7 days
3. Rank by preference:
   a. Evening slots preferred (more date-like)
   b. Weekend > weekday
   c. Sooner > later (momentum matters)
4. Select top 4 options
5. Format as specific times: "Thursday 7:00 PM", "Saturday 2:00 PM"
```

If fewer than 2 overlapping slots exist in the next 7 days: extend to 14 days. If still fewer than 2: show a message asking one user to add more availability.

**Step 3: Venue Selection**

For each time slot, the system proposes a venue.

**Activity/venue selection — bias toward novel shared experiences:**

> **Research basis (Aron et al., 2000; Dutton & Aron, 1974):** Shared participation in novel and arousing activities increases relationship quality compared to mundane activities. Arousal from exciting experiences gets misattributed to romantic attraction. Coffee is the worst possible first date — it's familiar, low-energy, and creates an interview dynamic. The system should suggest activities that are slightly challenging, slightly exciting, and slightly outside both people's comfort zones. [Ref: dating_app_research.docx.md, Missing Mechanism 2]

**Preferred categories (novel/active — suggest first):**
- Cooking classes, pottery studios, art workshops (making something together)
- Escape rooms, trivia nights (problem-solving together)
- Outdoor markets, food hall crawls, street festivals (exploring together)
- Live music, comedy shows (shared emotional experience → I-sharing fuel)
- Rock climbing gyms, kayaking, hiking new trails (mild physical arousal)
- Museum or gallery exhibits (shared aesthetic reactions → I-sharing)

**Acceptable fallback categories (familiar/passive — suggest only if novel options unavailable):**
- Bookstore cafes, dessert spots (still better than plain coffee)
- Parks with walking paths (at least there's movement)

**NOT:** Bars, clubs, restaurants (too much commitment), coffee chains (interview vibes), anyone's home, movie theaters (no interaction)

**Activity matching based on both profiles:**
- Both scored high on energy/enthusiasm? → Suggest active: climbing, kayaking, hiking
- Both scored high on openness? → Suggest creative: pottery, cooking class, art workshop
- Both scored high on humor? → Suggest comedy show, trivia night
- One adventurous + one homebody? → Split the difference: food hall, outdoor market (novel but low physical demand)
- System should reference the activity suggestion in the pre-date nudge: "You're doing a pottery class together — fair warning, it's harder than it looks, but that's kind of the point"

**Location:** Geographic midpoint between both users (or configurable — "near me" / "near them" / "halfway")
**Quality signals:** Google Places rating ≥ 4.0, sufficient reviews (≥50), photos available
**Open during the proposed time slot** — verify hours

**Venue data source:** Google Places API (Nearby Search → Place Details). For activities (cooking classes, escape rooms), supplement with Yelp or Eventbrite APIs.

**Fallback:** If no novel experiences are available in the area, suggest a park walk or bookstore cafe — never plain coffee.

**Step 4: Proposal Presentation**

One user sees: "Pick a time and place for your date with [Name]"

```
┌──────────────────────────────────────┐
│  Thursday, March 26 · 7:00 PM        │
│  Blue Bottle Coffee · 2.3 mi away    │
│  ⭐ 4.6 · "cozy, great for talking" │
│  [ Select ]                          │
├──────────────────────────────────────┤
│  Saturday, March 28 · 2:00 PM        │
│  Rose Park · 1.8 mi away             │
│  ⭐ 4.4 · "beautiful walking paths" │
│  [ Select ]                          │
├──────────────────────────────────────┤
│  Saturday, March 28 · 7:00 PM        │
│  Crumble & Cream · 3.1 mi away       │
│  ⭐ 4.7 · "best desserts in town"   │
│  [ Select ]                          │
├──────────────────────────────────────┤
│  Sunday, March 29 · 4:00 PM          │
│  Tattered Cover · 2.7 mi away        │
│  ⭐ 4.5 · "bookstore cafe, relaxed" │
│  [ Select ]                          │
└──────────────────────────────────────┘
```

**Who picks first?** The person who sent the first message. This rewards initiative.

**Step 5: Confirmation**

Other user sees: "[Name] suggested Thursday at 7 PM at Blue Bottle Coffee."
Options: "Confirm" / "Suggest different time" (goes back to slot selection)

**Step 6: Calendar Integration**

Both users receive:
- In-app confirmation with date details
- Optional: Google Calendar / Apple Calendar invite (via .ics file download or CalDAV)
- The calendar event includes: venue name, address, date's first name, and a PLY-generated note: "Conversation starter: Ask about [specific thing from their profile]"

**Step 7: Pre-Date Nudge**

24 hours before the date, both users receive a notification:

> "Your date with [Name] is tomorrow at 7 PM. Here's something to ask about: [Name] mentioned they recently [specific detail from their voice memo]. That could be a great conversation opener."

The conversation starter is generated by the narrative engine based on the subject's composite profile — something specific, not generic.

### System 3: Post-Date Intelligence Gathering

**Trigger:** 2 hours after the scheduled date end time (date start + 90 minutes).

**Check-in method:** Conversational (Proposal 2) if available. Otherwise, structured form.

**Structured form version (MVP):**

> **Research basis (Eastwick & Finkel, 2008; dating_app_research.docx.md Part 6):** Asking "why did you not like this person" produces garbage data — people cite surface-level dealbreakers that aren't actually dealbreakers. Instead, lead with "What surprised you?" — surprises reveal where the match hypothesis was right or wrong, and the data is actionable.

```
What surprised you about [Name]?
[ text field — REQUIRED, this is the primary feedback ]

Quick check (private — never shared with your date):

1. Did you feel physically safe?               [ Yes ] [ No ]
2. Did they look like their photos?             [ Yes ] [ Somewhat ] [ No ]
3. Do you want to see them again?               [ Yes ] [ Maybe ] [ No ]

Optional: Anything else we should know?
[ text field ]
```

**Key change from v1:** "What surprised you?" is REQUIRED and comes FIRST. It replaces the emoji rating and "would you recommend" (which produces socially desirable answers). The surprise question generates the highest-signal training data because it reveals where the system's model of both people was accurate or wrong.

**Conversational version (Proposal 2 integration):**

> "Hey, you had your date with [Name] earlier. How'd it go?"

System extracts the same signals from the conversation, plus richer context about what worked, what didn't, and why.

**Data routing:**

| Signal | Where it goes |
|---|---|
| "What surprised you" (positive) | Updates OTHER user's composite profile + strongest narrative validation signal |
| "What surprised you" (negative or neutral) | Matching model feedback: where was the match hypothesis wrong? |
| "Felt unsafe" | Safety system → immediate flag for review |
| "Didn't look like photos" | Photo accuracy score on the other user |
| "Want to see again" = Yes | Training signal (weight: 5x) for matching model — strongest positive |
| "Want to see again" = No, despite positive surprise | Training signal: chemistry conditions were present but chemistry didn't emerge — this is expected and normal (Joel et al.) |
| "Want to see again" = No, negative surprise | Training signal: match hypothesis was wrong — downweight this pairing's feature pattern |

### System 4: Trust and Safety Scoring

Every user accumulates a trust score based on their behavior across the full lifecycle.

**Trust score components:**

```
trust_score = weighted_sum(
  dates_completed,              // +3 per date completed
  safety_positive_reports,      // +5 per "felt safe" from date partner
  photo_accuracy_reports,       // +2 per "looked like photos"
  positive_surprise_reports,    // +3 per positive "what surprised you" response from date partner
  disclosure_rounds_completed,  // +1 per structured exchange completed (up to 5)
  no_shows,                     // -15 per no-show
  safety_negative_reports,      // -20 per "felt unsafe"
  ghosting_incidents,           // -3 per expired mutual match with no response
  photo_mismatch_reports        // -5 per "didn't look like photos"
)
```

**Trust tiers:**

| Tier | Threshold | Badge | Effect |
|---|---|---|---|
| New | 0-10 | None | Standard matching |
| Established | 10-30 | None visible | Priority in matching queue |
| Verified Dater | 30+ (requires 3+ completed dates) | "Verified" badge | Badge shown on profile, priority matching |
| Trusted | 50+ | "Trusted" badge | Access to premium features (if any) |

**Safety escalation:**

| Trigger | Action |
|---|---|
| 1 "felt unsafe" report | Flag for manual review. No immediate action. |
| 2 "felt unsafe" reports from different people | Temporary suspension pending review |
| 1 "felt unsafe" + details suggesting harm | Immediate suspension + incident report |
| 2 no-shows | 7-day suspension with explanation |
| 3+ no-shows | Account deactivation |
| 3+ "didn't look like photos" | Photo re-verification required |

**Critical rule: Safety reports are NEVER shared with the reported user.** The reporter must feel completely safe providing honest feedback. The reported user sees "Your account is under review" — never "Sarah said she felt unsafe."

### System 5: Anti-Ghosting Mechanics

**Mutual match expiration:**
- 48 hours after mutual match with no message from either side → match expires
- Both users see: "This match expired. Next time, send that first message — even 'hey, I loved what the matchmaker said about you' is enough."
- Both lose 1 boost point (affects matching priority)

**Mid-conversation ghosting:**
- If one user hasn't responded in 72 hours after a conversation started:
  - Waiting user sees: "It's been a few days. [Name] might be busy. We'll let you know if they respond, but in the meantime, we have someone else for you." (bonus match triggered)
  - Silent user gets a nudge: "[Name] is waiting to hear from you. If you're not feeling it, that's okay — just let them know." With a "I'm not interested" button that gracefully ends the conversation

**No-show detection:**
- Post-date check-in asks "Did [Name] show up?" (Yes/No)
- If "No": prompt for details (were they late? did they cancel last minute? no communication at all?)
- "No communication at all" = hard no-show → trust penalty + suspension risk
- "Cancelled last minute" = soft no-show → warning, no penalty if first time

### System 6: Relationship Trajectory Tracking

**The funnel we're measuring:**

**UX language note:** Throughout the system, replace evaluation-frame language with curiosity-frame language:
- "Like" → "I want to know more"
- "Pass" → "Not this time"
- "Mutual Match" → "You're both curious"
- This reduces the sense of being judged and shifts the frame from approval/rejection to exploration.

> **Research basis (Strubel & Petrie, 2017; Liepmann et al., 2025):** Dating apps create constant evaluation and rejection, which is the opposite of the comfort that's the 3rd most cited element of chemistry. The language should signal curiosity, not judgment. [Ref: dating_app_research.docx.md, Missing Mechanism 4]

```
Intro Delivered
    ↓ ("I want to know more" rate)
Interested
    ↓ (mutual interest rate)
Mutual Match
    ↓ (first message rate)
Conversation Started
    ↓ (date proposed rate)
Date Scheduled
    ↓ (date completion rate)
Date Happened
    ↓ (second date rate)
Second Date
    ↓ (relationship formation)
Left Platform Together
```

**Every transition is a metric.** Every drop-off is a problem to solve.

**Exit survey** (when a user deactivates or pauses for 30+ days):

> "Before you go — we'd love to know why. This helps us get better."
>
> - I found someone (on PLY)
> - I found someone (elsewhere)
> - I'm taking a break from dating
> - The matches weren't right for me
> - I wasn't meeting enough people
> - Other: [text]

"I found someone on PLY" is the ultimate success metric. Track which match led to the relationship. That pairing becomes a GOLD training example — weight 10x in the embedding model.

**Second date tracking:**
After a date where both users said "want to see again" = Yes:
- 5 days later: "Have you seen [Name] again since your date?"
- If yes → strongest possible positive training signal
- If no → "What happened?" (optional, free text)

---

## What RIGHT Looks Like

### The system removes friction, not adds it
- Date scheduling feels like magic: "We found 4 times that work for both of you, at places you'll both like"
- Users don't have to negotiate logistics over text
- The 48-hour expiration creates healthy urgency without pressure
- Pre-date nudges reduce anxiety with specific, personalized conversation starters

### You can actually measure the north star metric
- "Dates per week" is a real number on a real dashboard
- You can trace the full funnel: intro → like → mutual match → message → date → second date → relationship
- You know EXACTLY where the funnel leaks and can fix each stage independently

### Safety feels baked in, not bolted on
- Post-date check-ins are quick and feel natural
- Users trust that their safety feedback is private and acted upon
- The "Verified Dater" badge creates a positive flywheel: users want to earn trust, which requires going on real dates and being decent
- Bad actors are identified and removed quickly

### The anti-ghosting mechanics feel fair, not punitive
- Expiration messages are warm, not accusatory
- Nudges give people an easy, guilt-free out ("I'm not interested" button)
- Boost point losses are small enough to not feel punishing but large enough to create behavioral incentive
- The system doesn't guilt-trip — it empathizes and redirects

### Data flows back to improve everything else
- Mutual Like data trains the matching model (Proposal 1) better than one-sided Likes
- Post-date "what surprised you" enriches composite profiles
- Date-outcome data trains the narrative model (Proposal 4): which narrative styles lead to dates?
- Second-date data reveals which matching dimensions matter for lasting connection vs. first-date chemistry

---

## What WRONG Looks Like

### Over-engineering kills spontaneity
**The failure:** The date scheduling system feels like booking a doctor's appointment. Users set availability, review 4 proposals, confirm slots, accept calendar invites — and by the time the logistics are done, the momentum is dead.

**Why it happens:** Optimizing for logistical correctness (no double-bookings, perfect venue matching, calendar integration) at the expense of emotional momentum.

**How to prevent it:**
- The system should feel like a helpful friend, not a booking engine
- Minimize steps: ideally it's "Pick one of these 4" → "Confirmed!" — two taps total
- Calendar integration is OPTIONAL, not required
- If users want to handle logistics themselves ("Let's just meet at 7"), let them. The system should make it easy to bypass scheduling and just mark "we have a date planned"
- The venue suggestion is a convenience, not a mandate. "We suggest Blue Bottle, but go wherever feels right"

### Surveillance feeling
**The failure:** Post-date check-ins feel intrusive. Users feel monitored — like the app is watching their relationship. "Did you see them again?" feels like a parole officer, not a friend.

**Why it happens:** Optimizing for data collection without considering how the user feels about being asked.

**How to prevent it:**
- Every check-in is optional and easy to dismiss
- Framing matters enormously: "We'd love to hear how it went" not "Please rate your date"
- Don't ask too often. One check-in per date. One follow-up about second dates. Then stop.
- If a user consistently skips check-ins, STOP ASKING. Respect the signal.
- Never imply consequences: "This helps us make better matches" not "Your response helps us improve your matches" (the latter implies you'll get worse matches if you don't respond)

### The trust system becomes a caste system
**The failure:** High-trust users get dramatically better matches. Low-trust new users get leftover candidates. The platform bifurcates into "verified insiders" and "unproven outsiders," making it hostile to newcomers.

**Why it happens:** Trust tiers affect matching priority. If high-trust users are preferentially shown to other high-trust users, new users only see other new users — creating a cold-start ghetto.

**How to prevent it:**
- Trust tiers affect BADGE DISPLAY ONLY for the first 3 tiers
- Matching priority boost from trust is capped at 10% — it's a tiebreaker, not a filter
- New users are GUARANTEED to see at least one Verified Dater in their first 5 intros
- The matching model (Proposal 1) NEVER uses trust score as a feature — it would learn to segregate
- Monitor: if new user retention drops after trust badges launch, trust is acting as a barrier, not an incentive

### Anti-ghosting becomes anti-user
**The failure:** Users feel punished for having a busy week. They went on vacation, missed a few matches, came back to find their boost score tanked and their matches worse. Or: they're talking to someone they like and stop using the app — then get penalized for "ghosting" the daily intros.

**Why it happens:** The system treats inaction as a negative signal universally, without context.

**How to prevent it:**
- "Snooze" feature: users can pause for 1-7 days with no penalty. "Going on vacation? Snooze your matches and pick up when you're back."
- Distinguish between "inactive on the platform" (might be dating someone!) and "ghosted a specific person" (left them hanging)
- Boost decay is slow (7-day half-life) and recoverable with one action
- If a user goes inactive after a mutual match (suggesting they might be dating that person), DON'T penalize — celebrate: "Looks like things might be going well with [Name]. We'll be here if you need us."
- Weekly pause check-in: "You haven't been active this week. Everything good?" with options: "I'm busy" / "I'm seeing someone" / "Pause my account"

### Venue selection is embarrassing
**The failure:** The system suggests a Starbucks, a closed restaurant, or a bar when the user explicitly doesn't drink. Users lose trust in the system's judgment.

**Why it happens:** Google Places API returns results by proximity and rating without enough contextual filtering. Or the place data is stale (closed on Tuesdays, recently shut down, etc.).

**How to prevent it:**
- Filter aggressively: ONLY categories explicitly whitelisted (cafe, bakery, dessert_shop, park, museum, bookstore)
- Check hours: confirm the venue is open during the proposed time slot using the Google Places hours data
- Minimum review threshold: 50+ reviews, 4.0+ rating
- NO chains in the first 3 suggestions (Starbucks, Dunkin, etc.) — save as fallback only
- User feedback loop: after a date, "Was the venue good?" If consistently "no" for a venue, blacklist it
- Curated venue lists per metro area as an override layer — start with the 10 biggest metros and hand-pick 20 venues each
- If in doubt, suggest a park. Parks are always appropriate, always open, always free.

---

## Schema Additions

```sql
-- User availability for date scheduling
CREATE TABLE user_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL UNIQUE,
  availability jsonb NOT NULL DEFAULT '{}',
  -- jsonb structure: { "monday": { "morning": bool, "afternoon": bool, "evening": bool }, ... }
  updated_at timestamptz DEFAULT now()
);

-- Mutual matches (created when both users Like)
CREATE TABLE mutual_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) NOT NULL,
  user_a_id uuid REFERENCES users(id) NOT NULL,
  user_b_id uuid REFERENCES users(id) NOT NULL,
  status text NOT NULL DEFAULT 'active',
  -- active, expired_no_message, conversation, date_scheduled, date_completed, relationship, closed
  created_at timestamptz DEFAULT now(),
  expired_at timestamptz,
  UNIQUE(match_id)
);

-- Messages within mutual matches (limited, not a full chat)
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mutual_match_id uuid REFERENCES mutual_matches(id) NOT NULL,
  sender_id uuid REFERENCES users(id) NOT NULL,
  content text, -- text message content
  voice_path text, -- or voice memo storage path
  voice_duration_seconds float,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_messages_match ON messages(mutual_match_id, created_at);

-- Scheduled dates
CREATE TABLE scheduled_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mutual_match_id uuid REFERENCES mutual_matches(id) NOT NULL,
  proposed_by uuid REFERENCES users(id) NOT NULL,
  confirmed_by uuid REFERENCES users(id),
  scheduled_at timestamptz NOT NULL,
  venue_name text,
  venue_address text,
  venue_place_id text, -- Google Places ID for reference
  status text NOT NULL DEFAULT 'proposed',
  -- proposed, confirmed, completed, cancelled, no_show
  pre_nudge_sent boolean DEFAULT false,
  post_checkin_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Post-date feedback
CREATE TABLE date_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date_id uuid REFERENCES scheduled_dates(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL, -- the person giving feedback
  about_user_id uuid REFERENCES users(id) NOT NULL, -- the date partner
  overall_rating text, -- great, fine, not_great
  felt_safe boolean,
  looked_like_photos text, -- yes, somewhat, no
  would_recommend boolean,
  want_to_see_again text, -- yes, maybe, no
  what_surprised_you text,
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(scheduled_date_id, user_id)
);

-- Trust scores (computed, updated after each date)
CREATE TABLE trust_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL UNIQUE,
  score float NOT NULL DEFAULT 0,
  dates_completed int DEFAULT 0,
  safety_positive int DEFAULT 0,
  safety_negative int DEFAULT 0,
  photo_accuracy_positive int DEFAULT 0,
  photo_accuracy_negative int DEFAULT 0,
  recommend_positive int DEFAULT 0,
  no_shows int DEFAULT 0,
  ghosting_incidents int DEFAULT 0,
  tier text DEFAULT 'new', -- new, established, verified, trusted
  verified_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Exit surveys
CREATE TABLE exit_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  reason text NOT NULL,
  -- found_someone_ply, found_someone_elsewhere, taking_break, matches_wrong, not_enough_people, other
  found_match_id uuid REFERENCES matches(id), -- if they found someone on PLY, which match?
  details text,
  created_at timestamptz DEFAULT now()
);

-- Funnel metrics (materialized view, refreshed hourly)
CREATE MATERIALIZED VIEW funnel_metrics AS
SELECT
  date_trunc('week', m.created_at) as week,
  COUNT(DISTINCT m.id) as intros_delivered,
  COUNT(DISTINCT CASE WHEN di.status = 'liked' THEN di.id END) as likes,
  COUNT(DISTINCT mm.id) as mutual_matches,
  COUNT(DISTINCT CASE WHEN msg_count.cnt > 0 THEN mm.id END) as conversations,
  COUNT(DISTINCT sd.id) as dates_scheduled,
  COUNT(DISTINCT CASE WHEN sd.status = 'completed' THEN sd.id END) as dates_completed,
  COUNT(DISTINCT CASE WHEN es.reason = 'found_someone_ply' THEN es.id END) as relationships
FROM matches m
LEFT JOIN daily_intros di ON di.match_id = m.id
LEFT JOIN mutual_matches mm ON mm.match_id = m.id
LEFT JOIN LATERAL (
  SELECT COUNT(*) as cnt FROM messages msg WHERE msg.mutual_match_id = mm.id
) msg_count ON true
LEFT JOIN scheduled_dates sd ON sd.mutual_match_id = mm.id
LEFT JOIN exit_surveys es ON es.found_match_id = m.id
GROUP BY 1;
```

---

## Build Order

1. **Mutual match detection** — query for reciprocal Likes, create mutual_match record, notify both users
2. **Simple messaging** — 10-message-limit text chat within mutual matches, 48h expiration
3. **Post-date feedback form** — structured form (not conversational yet), trust score computation
4. **Date scheduling MVP** — availability grid + time slot matching, NO venue selection yet (just propose times)
5. **Venue selection** — Google Places integration, filtered and ranked
6. **Anti-ghosting mechanics** — expiration, nudges, boost adjustments
7. **Trust badges** — display on profile, earn through completed dates
8. **Calendar integration** — .ics file generation, optional Google Calendar API
9. **Funnel dashboard** — internal admin view of all metrics at every funnel stage
10. **Exit survey** — triggered on deactivation or 30-day inactivity

Item 1 is a few hours of work and immediately unlocks the most important feedback signal. Start there.
