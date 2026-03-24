# Activation & Retention Mechanics + Date Scheduling
## Behavioral Engine Design — March 2026

---

## 1. Core Philosophy

Most dating apps make money when you DON'T find someone. Their incentive is engagement, not outcomes. This app's incentive structure should be the opposite: **you succeed when people go on real dates and find real partners.**

That means:
- Reward action, not browsing
- Punish passivity, not selectivity
- Remove friction between "interested" and "sitting across from each other"
- Build trust through post-date safety feedback

---

## 2. The Daily Match Cadence

### The Mechanic: "Act to Unlock"

You get **1 intro per day** at a consistent time (e.g., 8:00 AM local, or user-set "match time").

**Rules:**

- You must **act on today's match** (Like or Pass) to unlock tomorrow's match.
- If you **Like** someone, you get a **bonus intro immediately** (same day, second match unlocked).
- If you **Pass**, no bonus — you wait until tomorrow.
- If you **don't act by midnight**, you **skip tomorrow entirely**. Your next match comes the day after.
- Miss **3 days in a row?** Matches pause until you manually reactivate. (Prevents dead profiles from cluttering the pool.)

### Why This Works

| Behavior | App Response | Psychology |
|----------|-------------|------------|
| Like someone | Instant bonus match | Positive reinforcement — generosity is rewarded |
| Pass on someone | Normal cadence continues | No punishment for being selective |
| Ignore / don't open | Lose tomorrow's match | Loss aversion — "use it or lose it" |
| Miss 3 days | Paused until reactivation | Protects match quality for active users |

### Anti-Gaming Considerations

- **"Like everyone to farm bonus matches"** → Liking triggers a match angle being written + sent to the other person. If you Like everyone and never message, your response rate tanks and the system deprioritizes showing you to others. Optionally: after 3 unresponded Likes, require a short voice message with your next Like.
- **"I'll just pass every day to stay active"** → Fine. Passing is legitimate. But no bonus match, so Likers get 2x the volume. Natural incentive to engage genuinely.

---

## 3. The Messaging Boost

### The Mechanic: "Message First, Rise Higher"

When you **send a message** (not just match — actually write something), you get a **priority boost** in the matching algorithm.

**How it works:**

- Sending a first message to a mutual match = **+1 boost point**
- Having a conversation reach **3+ exchanges** = **+2 boost points**
- Boost points increase your visibility: you get shown to higher-quality matches and shown earlier in the day
- Boost decays over 7 days (you have to keep being active)

### Messaging Quality Gate

To prevent "hey" spam:
- First message must be **voice memo** (15–30 sec) OR **minimum 50 characters of text**
- The app can suggest a conversation starter based on the match angle: "Ask her about the chicken coop story" or "He mentioned he's learning to weld — ask what he's building"
- Voice-first messaging is a huge differentiator and matches the app's identity

### Boost Visibility to the User

Show a simple "Activity Score" — a flame icon or meter that fills up based on recent actions. Users can see: "Your activity score is high — you're getting priority matches this week." This makes the reward tangible without exposing the algorithm.

---

## 4. The Date Scheduling Engine — "Just Go"

This is the highest-leverage feature. The gap between "mutual interest" and "actual date" is where most dating apps lose people. Kill the gap.

### How It Works

#### Step 1: Availability Windows (Set Once, Update Anytime)

During onboarding (or after first mutual match), users set their weekly availability:

```
┌──────────────────────────────────────────────┐
│  When are you generally free for a date?      │
│                                               │
│  Mon  [ ] Morning  [x] Afternoon  [ ] Evening │
│  Tue  [ ] Morning  [ ] Afternoon  [x] Evening │
│  Wed  [ ] Morning  [x] Afternoon  [x] Evening │
│  Thu  [ ] Morning  [ ] Afternoon  [x] Evening │
│  Fri  [ ] Morning  [x] Afternoon  [x] Evening │
│  Sat  [x] Morning  [x] Afternoon  [x] Evening │
│  Sun  — Unavailable (Sabbath) —               │
│                                               │
│  [Save Availability]                          │
└──────────────────────────────────────────────┘
```

**For the LDS audience:** Sundays are off by default with a toggle. This is a subtle trust signal that says "we get you."

Users can also mark specific dates as unavailable (traveling, busy week, etc.).

#### Step 2: Mutual Match → Auto-Propose 4 Options

When two people mutually Like each other, the system immediately:

1. Cross-references both availability windows for the **next 7 days**
2. Finds overlapping slots
3. Proposes **4 specific date options** — time + place

```
┌──────────────────────────────────────────────┐
│  You and Sarah are both interested!           │
│                                               │
│  Pick a time to meet:                         │
│                                               │
│  ☕ Wed 4:00 PM — Blue Copper Coffee          │
│     (2.1 mi from you, 3.4 mi from her)       │
│                                               │
│  🍦 Thu 6:30 PM — The Chocolate              │
│     (1.8 mi from you, 2.9 mi from her)       │
│                                               │
│  🌳 Fri 4:00 PM — Liberty Park              │
│     (3.0 mi from you, 1.2 mi from her)       │
│                                               │
│  ☕ Sat 10:00 AM — Publik Coffee Roasters    │
│     (2.5 mi from you, 4.1 mi from her)       │
│                                               │
│  [ Not ready yet — chat first ]               │
└──────────────────────────────────────────────┘
```

#### Step 3: Venue Selection Logic

Venues are curated based on:

- **Midpoint geography** between both users (weighted toward the closer person if asymmetric)
- **Venue type:** First dates default to casual, public, daytime-friendly — coffee shops, ice cream, parks, bakeries. No bars (LDS audience). No dinner (too high-commitment for first meet).
- **Safety:** Public places only, well-reviewed, well-lit
- **Time of day:** Morning/afternoon slots → coffee/brunch spots. Evening → dessert/walk spots.
- **Venue partnerships:** Eventually, partner with local businesses for "first date specials" — a small discount or free cookie. They get foot traffic, you get venue data.

#### Step 4: One Person Picks, Other Confirms

- Person A picks their preferred option
- Person B gets notified: "Sarah picked Wed 4:00 PM at Blue Copper. Confirm?"
- If B confirms → **Date is locked.** Both get a calendar event (with option to add to Google/Apple Calendar).
- If B doesn't like any → They can propose an alternative time from the overlap, or request to "chat first."

#### Step 5: Pre-Date Nudge (Day Before)

Push notification 24 hours before:
- "Your date with Sarah is tomorrow at 4 PM at Blue Copper. Here's a conversation starter: ask her about that time she hiked the Narrows solo."
- Include a "Need to reschedule?" option (not cancel — reschedule forces picking a new time)

#### Step 6: Post-Date Check-In (2 Hours After Scheduled Time)

Push notification:
- "How did it go with Sarah?"
- Quick tap response: 🔥 Great / 😊 Good / 😐 Meh / 👎 Not for me
- Optional: "Would you go out again?" → Yes / No
- **Safety check** (see Section 5 below)

---

## 5. Post-Date Safety & Trust System

### The "Met In Person" Badge

After a date is confirmed and the post-date check-in is completed by both parties, the person earns a **"Met IRL" count** on their profile.

**What others see:**
> "4 people have met [Name] in person. No safety concerns reported."

This is powerful because:
- It signals "this person is real and actually shows up"
- It provides social proof of physical safety
- It compounds — someone with 8 safe IRL meets is extremely trustworthy
- It's unique to this app (no swipe app tracks this)

### Safety Feedback Flow (Post-Date)

After every date, both people see a private safety screen:

```
┌──────────────────────────────────────────────┐
│  Private Safety Check                         │
│  (Only you and our safety team see this)      │
│                                               │
│  Did you feel physically safe?                │
│  [Yes, completely] [Mostly] [No]              │
│                                               │
│  Did they accurately represent themselves?    │
│  [Yes] [Somewhat] [Not at all]                │
│                                               │
│  Any concerns you'd want others to know?      │
│  [ Free text — optional ]                     │
│                                               │
│  Would you feel comfortable if a friend       │
│  went on a date with this person?             │
│  [Yes] [Maybe] [No]                           │
│                                               │
│  [Submit — this is anonymous]                 │
└──────────────────────────────────────────────┘
```

### Flag Escalation Logic

| Scenario | Action |
|----------|--------|
| 1 "No" on physical safety | Flag for manual review. Person's matches paused pending investigation. |
| 2+ "No" on physical safety | Account suspended. Manual review required to reinstate. |
| "Not at all" on representation | Warning added to internal profile. 3 strikes = profile photo re-verification required. |
| "No" on "would you recommend to a friend" | Soft signal — weighted in match scoring but no direct action. |
| Free text mentions specific threats | Immediate escalation to safety team + option to connect user with resources. |

### Trust Score (Internal, Not Shown as Number)

Each user accumulates an internal trust score based on:
- Number of IRL dates completed
- Safety feedback received
- Response rate to matches
- Message quality signals
- Whether they show up (no-show reports)
- Profile accuracy feedback

High-trust users get:
- Shown to other high-trust users first
- Priority in match queue
- Eventually: a visible "Verified Dater" badge (after 3+ safe IRL meets)

---

## 6. Retention Loops — The Full Behavioral Flywheel

```
Record voice memo → Get better match → Like → Get bonus match
                                          ↓
                                    Mutual interest
                                          ↓
                                   Auto-schedule date
                                          ↓
                                     Go on date
                                          ↓
                                  Post-date feedback
                                          ↓
                              "Met IRL" badge grows
                                          ↓
                           Higher trust = better matches
                                          ↓
                                     Tell friends
                                          ↓
                                   Friends sign up
                                          ↓
                                  Larger match pool
```

### Weekly Engagement Targets

| Action | Frequency Goal | Incentive |
|--------|---------------|-----------|
| Open app + act on match | Daily | Loss aversion (miss a day, lose a match) |
| Record a new voice memo | Weekly | "New story" badge refreshes profile; prompt via push |
| Send a first message | 2–3x/week | Boost score increases |
| Schedule a date | 1x/week | Shown to higher-quality matches next week |
| Complete post-date feedback | After every date | Required to unlock next IRL date scheduling |

### Re-engagement for Lapsed Users

| Days Inactive | Action |
|---------------|--------|
| 1 day | "You have a match waiting — act now or it expires tomorrow" |
| 3 days | Matches paused. "Welcome back! Reactivate to see who's waiting." |
| 7 days | "While you were away, 3 people expressed interest. Come back to see them." (Only show this if true.) |
| 14 days | "Your profile is now hidden. Reactivate anytime." |
| 30 days | Profile fully deactivated. Data retained for 90 days, then archived. |

---

## 7. The "No Ghosting" Mechanics

Ghosting is the #1 complaint in dating apps. Attack it structurally:

### After Mutual Match
- If neither person messages within **48 hours**, the match expires. Both get notified: "Your match with [Name] expired. Next time, say hi!"
- The person who didn't message loses 1 boost point.

### After Conversation Starts
- If someone stops responding for **72 hours** mid-conversation, the other person gets: "It looks like [Name] is busy. Want to move on?" + option to send one final nudge.
- The ghoster's response rate metric drops, affecting their match quality.

### After Date is Scheduled
- **No-show without canceling** = hard penalty. Trust score drops significantly. 2 no-shows = temporary suspension.
- **Canceling <2 hours before** = soft penalty (trust score ding).
- **Rescheduling** = no penalty (we want people to reschedule, not ghost).

---

## 8. Date Scheduling — Technical Implementation

### Data Model

```
User Availability:
  user_id
  day_of_week (0-6)
  time_slot (morning / afternoon / evening)
  is_available (bool)
  blocked_dates[] (specific dates unavailable)

Date Proposal:
  match_id
  proposed_options[] (4 options, each with datetime + venue)
  selected_option_id
  status (proposed / one_picked / confirmed / completed / cancelled / no_show)

Venue:
  venue_id
  name, address, lat/lng
  type (coffee / dessert / park / bakery / etc.)
  hours_of_operation
  first_date_friendly (bool)
  avg_rating
  lds_compatible (bool — no bar, no alcohol-primary)

Post-Date Feedback:
  date_id
  from_user_id
  felt_safe (yes / mostly / no)
  accurate_representation (yes / somewhat / not_at_all)
  recommend_to_friend (yes / maybe / no)
  free_text (optional, encrypted)
  would_go_again (yes / no)
```

### Venue Sourcing

**Phase 1:** Google Places API — filter for coffee shops, bakeries, ice cream, parks within a radius of the midpoint. Filter out bars/nightclubs. Curate a whitelist of ~50 "approved first date spots" per metro area.

**Phase 2:** Community-sourced. After dates, ask "Was this a good first date spot?" Build a ranked venue list per city from actual date feedback.

**Phase 3:** Venue partnerships. Approach top-rated spots: "We send 20 first dates a week to your shop. Want to offer a 'first date cookie' for $0?"

---

## 9. Notification Strategy

| Trigger | Channel | Timing | Message Style |
|---------|---------|--------|---------------|
| New daily match | Push + badge | User's set "match time" | "Someone new wants to share their story with you" |
| Bonus match unlocked | Push | Immediately after Like | "Nice! Here's a bonus intro — someone we think you'll love" |
| Mutual match | Push + in-app | Immediately | "It's mutual! Pick a time to meet [Name]" |
| Date confirmed | Push + calendar invite | Immediately | "You're meeting [Name] on Wed at 4 PM. Added to your calendar." |
| Pre-date nudge | Push | 24 hours before | "Tomorrow's the day! Ask [Name] about [story detail]" |
| Post-date check-in | Push | 2 hours after scheduled time | "How'd it go?" |
| Match expiring | Push | 6 hours before midnight | "Your match expires tonight — take a look before it's gone" |
| Drip voice prompt | Push | Morning (Day 1–6) | "Share today's story: What does your perfect Saturday look like?" |
| Inactivity (Day 1) | Push | Evening | "You have a match waiting" |
| Inactivity (Day 3) | Push | Morning | "We paused your matches. Tap to jump back in." |

---

## 10. Metrics Dashboard — What to Track

### North Star Metric
**Dates that happen per week** (not matches, not messages — actual dates)

### Leading Indicators
- Daily match action rate (% of users who Like or Pass each day)
- Like rate (% of matches that get a Like)
- Mutual match rate (% of Likes that become mutual)
- Message-after-match rate (% of mutual matches where someone messages)
- Date proposal acceptance rate (% of mutual matches that schedule a date)
- Date completion rate (% of scheduled dates that actually happen)
- Post-date satisfaction (% "Great" or "Good" ratings)
- Second date rate (% of completed dates where both say "would go again")

### Lagging Indicators
- Couples formed (both users deactivate citing "found someone")
- 30-day retention
- Referral rate (users who invite friends)
- Revenue per user per month

---

## 11. The "Not Feeling It" Loop — Match Quality Improvement

### The Problem

When someone passes on 5+ matches in a row, something is wrong. But they almost certainly **can't tell you what.** People don't know why they're not attracted to someone — they just aren't. And asking "why did you pass?" produces useless data ("not my type" tells you nothing).

So the system needs two strategies: **extract better signal from the user** (without asking them to explain attraction) and **nudge them to improve their own profile** (because low-quality profiles attract low-quality matches).

### Trigger: The Pass Streak Detector

Track a rolling window of pass behavior:

| Pass Streak | System Response |
|-------------|----------------|
| 3 passes in a row | No action yet. Normal selectivity. |
| 5 passes in a row | Trigger the "Help Us Help You" flow (soft) |
| 8 passes in a row | Trigger the "Refresh Your Profile" nudge (direct) |
| 12+ passes with no Like in 2 weeks | Trigger the "Reset" intervention |

### Response 1: "Help Us Help You" (After 5 Passes)

Don't ask why they passed. Instead, ask them to **tell you more about themselves.** More signal = better matching.

```
┌──────────────────────────────────────────────┐
│  We want to find you better matches.          │
│                                               │
│  The more we know about you, the better       │
│  we can find someone you'll be excited about. │
│                                               │
│  Share a new story:                           │
│                                               │
│  🎙️ "What's a quality in someone that         │
│      instantly gets your attention?"           │
│                                               │
│  🎙️ "Describe someone you admire —            │
│      what makes them special?"                │
│                                               │
│  [ Record Now ]    [ Maybe Later ]            │
└──────────────────────────────────────────────┘
```

**Why this works:** These prompts are *indirectly* about attraction preferences without asking them to describe their "type" (which produces shallow answers like "tall" or "funny"). "Describe someone you admire" reveals what they actually value in people. The LLM extraction layer can pull preference signals from these responses that directly improve match scoring.

**Additional indirect prompts for this flow:**
- "What's a story someone told you that made you instantly like them more?"
- "Think of a couple you know who are great together — what makes them work?"
- "What kind of energy makes you want to spend more time with someone?"

These all produce matchable signal without the user realizing they're describing their ideal partner.

### Response 2: "Refresh Your Profile" (After 8 Passes)

This is the "better photo always helps" nudge. Frame it as empowerment, not criticism.

```
┌──────────────────────────────────────────────┐
│  Quick tip: profiles with fresh photos get    │
│  3x more mutual matches.                     │
│                                               │
│  📸 Add a new photo                           │
│     (Outdoor light, genuine smile, no         │
│      sunglasses — these perform best)         │
│                                               │
│  🎙️ Re-record your intro story               │
│     (Your first story is the one people       │
│      hear — make it your best one)            │
│                                               │
│  ✏️ Update your preferences                   │
│     (Maybe your filters are too narrow?)      │
│                                               │
│  [ Refresh Profile ]                          │
└──────────────────────────────────────────────┘
```

**Photo guidance should be specific, not generic:**
- "Photos with natural lighting get 40% more Likes"
- "Group photos confuse people — lead with a clear solo shot"
- "Action shots (hiking, cooking, playing with a dog) outperform posed photos 2:1"
- "Your first photo should show your face clearly — no hats, no sunglasses"

**The implicit message:** The people you're being shown are in your match quality tier. If you want to be shown to different people, you need to make your own profile more compelling. You can't say this directly, but the nudge toward better photos and stories communicates it.

### Response 3: "The Reset" (After 12+ Passes / 2 Weeks No Like)

At this point, the user is either:
1. **Too picky for the current pool** (their preferences exclude almost everyone nearby)
2. **Not being shown the right people** (the algorithm is stuck)
3. **Checked out and swiping on autopilot** (they need re-engagement, not more matches)

```
┌──────────────────────────────────────────────┐
│  Let's recalibrate.                           │
│                                               │
│  It seems like we haven't found your person   │
│  yet. That's okay — let's try a fresh start.  │
│                                               │
│  Here's what we suggest:                      │
│                                               │
│  1. Record 2 new stories (we'll use these     │
│     to find different types of matches)       │
│                                               │
│  2. Expand one preference                     │
│     "You're set to 25-30 age range and        │
│      within 10 miles. Expanding to 25-33      │
│      or 20 miles would 4x your match pool."   │
│                                               │
│  3. Add or update your photos                 │
│     "A stronger first photo is the single     │
│      biggest thing you can do."               │
│                                               │
│  [ Start Fresh ]                              │
└──────────────────────────────────────────────┘
```

**Key insight for the Reset:** Show them the actual math on how their preferences limit their pool. "Within 10 miles + age 25-28 + temple recommend = 14 active users." When people see the number is tiny, they naturally loosen their filters. Don't tell them they're too picky — show them the funnel.

### The Background Signal: Learning From Passes

Even though you can't ask *why* someone passed, you can still learn from the pattern:

**What the system tracks silently on every pass:**
- How long they spent looking at the profile (< 2 seconds = immediate physical rejection, > 10 seconds = read the angle but still passed = personality/interest mismatch)
- Which photo they were viewing when they passed
- What attributes the passed person had (extract common patterns)

**After 10+ passes, the system can detect:**
- "User consistently passes on people with low storytelling scores" → prioritize showing articulate profiles
- "User spends 8+ seconds then passes" → the angle writing isn't landing, not a profile quality issue
- "User passes in < 2 seconds every time" → pure photo-driven decisions, angle quality is irrelevant for this user, prioritize photo-forward matching
- "User passes on everyone in X interest cluster but Likes in Y cluster" → re-weight interest matching

**This is the real preference extraction.** Not what people say they want — what they actually respond to. The voice memo prompts give you the stated preferences. The pass/Like behavior gives you the revealed preferences. The match engine should weight revealed preferences more heavily over time.

### The Photo Problem — Tactful Escalation

You're right that you can't tell someone "your photos are bad." But you can create structural incentives:

**Tier 1 — Passive guidance (everyone sees this during onboarding):**
"Profiles with these types of photos get the most mutual matches:" + examples of good vs. bad photo styles (without showing real people — use illustrations or stock examples).

**Tier 2 — Active nudge (after 8-pass streak):**
"A new photo could change everything. Here are the top 3 things that make a great first photo." + the specific tips listed above.

**Tier 3 — Social proof (after Reset):**
"Users who refreshed their photos after a slow week saw a 2.4x increase in mutual matches within 7 days." (Once you have the data to back this up.)

**Tier 4 — Future feature: AI photo coaching:**
User uploads a photo → system evaluates lighting, framing, expression, background → gives specific feedback: "Great smile, but the lighting is dark. Try retaking this near a window." This is technically feasible with vision models today and would be a major differentiator.

### Summary: The Full Dissatisfaction Response System

```
Pass streak detected
        ↓
   5 passes → "Tell us more about yourself" (new voice prompts)
        ↓                    ↓
   System extracts      User records new story
   better preference    → Profile enriched
   signals from         → Better matches
   pass behavior
        ↓
   8 passes → "Better photos help" + specific guidance
        ↓
   12+ passes → "Let's recalibrate" + show pool math
        ↓
   Ongoing: silent behavioral learning from every pass
   (dwell time, pattern detection, revealed vs. stated preferences)
```
