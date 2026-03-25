# How It Works — The Full PLY Pipeline

End-to-end flow from signup to first date.

---

## 1. Onboarding

User records 6 voice memos answering personality prompts. Each memo is:
1. Uploaded to Supabase Storage
2. Transcribed via OpenAI Whisper (`gpt-4o-mini-transcribe`)
3. Extracted via Claude into structured personality signals (Big Five, humor style, values, goals, communication warmth, etc.)
4. Aggregated into a **composite profile** — the personality fingerprint used for matching

User also uploads photos and sets hard preferences (age, distance, faith, kids, smoking).

---

## 2. Daily Intros

Each user receives **1 intro per day** at their chosen delivery hour. An intro is a narrative written by Claude that sells the other person — it's not a profile, it's a trailer.

**How intros are generated:**
1. Matchmaker selects a candidate from the pool (Elo-gated, hard-preference filtered, never repeat)
2. Narrative Intelligence pipeline generates a personalized story using one of 12 strategies across 4 tiers (Self-Expansion, I-Sharing, Admiration, Comfort)
3. Multi-draft generation (3 candidates) → self-critique scoring → best draft ships

**User actions on an intro:**
- **Like** → gets a bonus intro immediately + checks for mutual match
- **Pass** → feedback modal (why?) → Elo adjustment if physical attraction was the reason
- **No action by midnight** → skip tomorrow, next match day after

Pass streak detection triggers interventions at 5, 8, and 12 consecutive passes.

---

## 3. Photo Reveal + Decision

When a user Likes an intro, they see the person's photos for the first time. This is the moment of truth — the narrative sold the personality, now they decide with the full picture.

- **Still interested** → Like confirmed, mutual match check runs
- **Not interested** → feedback collected (reason: not attracted, dealbreaker, etc.)

---

## 4. Mutual Match — Constrained Chat

**Trigger:** Both users Liked each other.

When a mutual match is detected, a **constrained chat** opens in the Chats tab. This is not WhatsApp — it's a focused conversation with built-in scarcity.

### Rules
- **10 messages per person** (20 total max)
- **72-hour window** — chat expires if time runs out
- Messages can be **text or voice** (voice is transcribed via Whisper and shown as text + playable audio)
- A **message counter** shows remaining messages: subtle at 7, amber at 3, red at 1 ("Last message")
- Users can share their phone number at any point in the chat — there's no restriction on content

### Why constrained?
Free-form chat kills momentum. People default to small talk, conversations fizzle, nobody proposes a date. The 10-message limit forces intentionality — every message matters. You're not chatting to chat, you're chatting to decide.

### Technical details
- Messages polled every 3 seconds (not websockets — max 20 messages, polling is fine)
- Voice messages uploaded to Supabase Storage `voice-memos` bucket under `chat/` prefix
- Message count tracked on `mutual_matches` table (`user_a_msg_count`, `user_b_msg_count`)
- When both users hit 10: status transitions from `chatting` → `deciding`

---

## 5. The Decision — Blind Yes/No

After both users have sent all 10 messages, they're presented with a single question:

> "Do you want to meet [name]?"

Two buttons: **"Yes, let's meet"** / **"Not this time"**

### The blind mechanic
- Neither person sees the other's answer. Ever.
- If both say **yes** → moves to date planning
- If either says **no** → match ends gracefully ("This one didn't work out. No worries — your next intro is coming.")
- Neither person knows who said no

### Timeout
24 hours to decide after both finish chatting. If someone doesn't decide, auto-decline.

---

## 6. Date Planning

If both said yes, the UI immediately asks for logistics — without revealing that the other person also said yes. The framing is: "Before we share the results, help us plan logistics."

### What each person submits
1. **Available times** — a 14-day calendar grid (morning / afternoon / evening per day), tap to select
2. **Location** — share device location (for midpoint calculation) + max travel time slider (10-60 min)
3. **Phone number** — shared with match once a date is confirmed

### What the system does when both submit
1. Finds **overlapping time slots** between both users
2. Calculates **geographic midpoint** from both locations
3. Calls **Google Places API** to find a date-appropriate venue near the midpoint:
   - Morning: coffee shops, bakeries, parks
   - Afternoon: restaurants, museums, activity venues
   - Evening: restaurants, entertainment
   - Filtered: 4.0+ rating, open at the scheduled time
4. Picks the **first overlapping slot + best venue**
5. Updates the mutual match with venue details + planned time
6. **Reveals phone numbers** to both users
7. Status → `date_scheduled`

### If no time overlap
User is asked to add more availability.

### If no Google Places key / no location shared
Venue is "TBD — pick a spot near you both" and phone numbers are still shared so they can coordinate.

---

## 7. Date Confirmed

The celebration screen:

- **Venue card**: name, address, rating
- **Date and time**
- **Partner's phone number** (tap to text/call)
- "The rest is up to you two. Have fun!"

From here, they coordinate day-of details via text.

---

## 8. Post-Date Feedback (existing, not yet wired to new flow)

3 hours after the scheduled time, a feedback form is triggered:

1. **Required:** "What surprised you about [name]?"
2. **Optional:** Felt safe? Looked like photos? Want to see again? Additional notes.

Surprise response is processed by Claude to extract sentiment + traits. Results feed back into:
- **Trust scores** — safety, photo accuracy, ghosting incidents → tier progression (new → established → verified → trusted)
- **Matching model** — surprise traits become training signal for what actually creates chemistry

---

## Status Flow

```
mutual match created
        ↓
    [chatting] ← 72hr expiry window
        ↓ (both hit 10 messages)
    [deciding] ← 24hr timeout
        ↓
   yes + yes → [planning]
   any no   → [declined]
        ↓
    both submit prefs
        ↓
  [date_scheduled] → phone numbers revealed
        ↓
  [date_completed] → feedback collected
        ↓
  [relationship] (optional — exit survey)
```

---

## Key Files

| Area | Files |
|------|-------|
| Chat API | `src/app/api/chat/route.ts` |
| Decision API | `src/app/api/meet-decision/route.ts` |
| Date Planning API | `src/app/api/date-planning/route.ts` |
| Google Places | `src/lib/places.ts` |
| Chat UI | `src/components/ChatWindow.tsx` |
| Decision UI | `src/components/MeetDecision.tsx` |
| Planning UI | `src/components/DatePlanning.tsx` |
| Confirmation UI | `src/components/DateConfirmed.tsx` |
| DB functions | `src/lib/db.ts` (chat/decision/planning CRUD) |
| Types | `src/lib/types.ts` (ChatMessage, MeetDecision, DatePlanningPrefs, PlannedDateInfo) |
| Migration | `migrations/007_constrained_chat.sql` |
| Chat expiry cron | `src/app/api/cron/chat-expiry/route.ts` |
| Dashboard | `src/app/dashboard/page.tsx` (Chats tab, phase-aware rendering) |
| Matches API | `src/app/api/matches/route.ts` (returns activeChatState for refresh restoration) |

---

## Cron Jobs

| Job | Schedule | What it does |
|-----|----------|-------------|
| `chat-expiry` | Hourly | Expires chats past 72hr window, records ghosting if one person engaged but the other didn't |
| `disclosure-expiry` | Hourly | Legacy — expires old disclosure rounds |
| `pre-date-nudge` | Hourly | 24hr before date: sends reminder with AI conversation starter |
| `post-date-checkin` | Hourly | 3hr after date: triggers feedback form |

---

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `GOOGLE_PLACES_API_KEY` | Venue search for date planning |
| `OPENAI_API_KEY` | Voice message transcription |
| `ANTHROPIC_API_KEY` | Narrative generation, extraction, disclosure prompts |
| `CRON_SECRET` | Auth for cron job endpoints |
