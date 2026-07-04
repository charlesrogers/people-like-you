# PLY Roadmap & Strategy Spec — July 2026

**Status:** Approved direction (2026-07-02). Phase 0 in progress.
**Supersedes:** `specs/implementation-plan.md` phasing (that doc's build order is largely complete; this doc re-plans from current state).
**Evidence base:** Codebase audit (2026-07-02) + Keeper/KeeperAI published data (~190 data posts + 2 essays by founder Jake Kozloski, the closest comparable: marriage-first matchmaking, ~650K users, claimed 10% of first dates end in marriage).

---

## 1. Thesis

> **Focus on velocity to real dates. Let the shared-community pool solve the coarse compatibility layer. Model physical attraction explicitly. Measure outcomes, not engagement.**

Keeper's data independently validates each leg:

1. **Community pool = multiplicative base-rate multiplier.** Marriage matching is a ~70-preference multiplicative problem (5 filters at 1-in-3 odds = 1 in 240 pass rate; deep-match base rate 1-in-100K to 1-in-10M). A shared-community pool zeroes several multiplicative terms at once (religion, values, lifestyle, marriage intent). This is why "meeting through church/friends" ever worked.
2. **A devout pool is a high-urgency pool.** Keeper: 10/10-faith users want marriage within 2 years at 59% vs 19% for secular. Velocity strategy and community pool are the same bet.
3. **Attraction = 18% consensus + 82% personal taste.** For a single rater, 18% of a "hot" vote is the face, 82% is the rater — yet crowds converge (95% agreement between crowds). Real couples' attractiveness correlates at r≈0.4. Architecture: keep Elo banding (consensus), add per-user directional taste (votes).
4. **Designed for exit.** Each user churns exactly once on success. North star is outcomes produced (dates → second dates → relationships → exits-for-found-someone), never engagement.

---

## 2. Current state — what IS and IS NOT built

Verified against code 2026-07-02. ✅ built & live · 🟡 partial · ❌ not built · ⚫ dead-end (built, disconnected).

### Core loop
| System | Status | Notes |
|---|---|---|
| Voice onboarding → transcription → extraction v2 → composite profile | ✅ | `gpt-4o-mini-transcribe` + Claude Haiku/Sonnet two-pass (`extraction-v2.ts`) |
| Matching engine (128-dim embedding cosine + hand-tuned fallback) | ✅ | `matchmaker.ts`, `embedding.ts` |
| Elo attraction band (±150/±300 retrieval gate) | ✅ | Calibration swipes + `not_attracted` passes (K=8) |
| Location tiers (×0.8–×1.5 multiplier, 33K zips) | ✅ | `geo.ts` |
| Intro engine v2 (trailer narratives + critic) | ✅ | `intro-engine-v2.ts`, 12 narrative strategies |
| Daily intro delivery cron (1/day, 24h expiry, auto-pause) | ✅ | `/api/cron/deliver-matches` hourly |
| Constrained chat (10-message cap, ghost detection) | ✅ | `007_constrained_chat.sql`, `ChatWindow.tsx` |
| Blind meet-decision (private mutual yes/no) | ✅ | `/api/meet-decision` — nobody ever "asks out" anybody |
| Date planning → proposal → confirm → complete | ✅ | `/api/date-planning`, `/api/dates` |
| Pre-date nudge (24h, AI conversation starter) | ✅ | `/api/cron/pre-date-nudge` |
| Post-date feedback (surprise extraction, safety, photo accuracy) | ✅ | `/api/dates/feedback` → trust scores |
| Exit survey incl. `found_someone_ply` | ✅ | `/api/exit-survey` |
| Invite loop + queue priority + friend vouches | ✅ | `/join/[code]`, `/vouch/[token]` |

### Measurement (the gap that blocks everything)
| System | Status | Notes |
|---|---|---|
| `funnel_metrics` materialized view (intro → relationship, weekly) | ✅ DB / ❌ UI | API route exists (`/api/admin/funnel`); **no page renders it** |
| Elapsed-time (velocity) metrics between stages | ❌ | All timestamps exist in tables; nothing aggregates them |
| Second-date-happened event + cron | ❌ | Planned in implementation-plan §1C, never built. Deepest real signal today is second-date *intent* |
| `mutual_matches.status='relationship'` | ❌ | Enum exists; **no code ever writes it** |
| Gender ratio per metro (pool health) | ❌ | Admin has pool health, no sex-ratio breakdown |
| Admin dashboard beyond Like-rate | 🟡 | Stops at top of funnel; everything past mutual match is SQL-only |

### Attraction vector
| System | Status | Notes |
|---|---|---|
| Per-pair calibration votes | ❌ | **Verified: `/api/calibrate` stores only the client-computed Elo scalar; individual votes are discarded** |
| Height collection + preference | ❌ | `users.height` column exists, never populated by onboarding |
| Stated appearance preferences | ❌ | Never asked |
| `not_attracted` pass-share metric | 🟡 | Reason collected per-intro; not surfaced as a tracked metric |

### Compatibility depth
| System | Status | Notes |
|---|---|---|
| Faith-intensity scalar (0–10) | ❌ | Only 3 coarse observance buckets |
| Community-depth questions (observance depth, temple-marriage intent) | ❌ | `hard_preferences.community_fields` jsonb exists, **unused** — the plumbing is there |
| "When do you want to be married?" (timeline urgency) | ❌ | Keeper's best segmentation variable; not asked |
| Kids/faith soft multipliers on embedding path | ❌ bug | `scoreCompatibility` early-returns on embedding path (`matchmaker.ts:338`), silently skipping multipliers the fallback applies |

### Dead-ends & orphans (built, disconnected)
| System | Status | Notes |
|---|---|---|
| `taste_calibration` (onboarding narrative-taste votes) | ⚫ | Written at onboarding, **zero readers** |
| `date_feedback` → matching | ⚫ | Flows only into trust scores; date success never influences future matching |
| `soft_preferences` table | ⚫ | Read by profile code, **never written by onboarding** |
| `disclosure_exchanges` (3-round structured Q&A) | ⚫ | Superseded by constrained chat; code dormant — **revival candidate for chat mini-game** (see §5) |
| Critic subscores → candidate selection | ⚫ | Stored per intro, never fed back |
| Embedding behavioral dims 112–127 | ⚫ | Reserved, all zeros |

---

## 3. Strategy inputs from Keeper data (the alpha)

- **Filter discipline is a product mechanic.** Median woman's stacked preferences eliminate 72% of men (man: 44%); 92% of ultra-filterers are women; users mark ~19 "nice-to-haves" per 1 true non-negotiable. → Collect preferences broadly, bind almost none as hard filters, learn what actually binds from pass behavior, actively push flexibility in UX.
- **Design gender-asymmetrically.** Women filter harder and differently (finance 4x, ambition 2x, humor 1.6x, degree 2x). Keeper shows the woman first; the man only sees the match after she approves. → Adopt woman-sees-first intro sequencing.
- **Pool sex-ratio is a first-class health metric.** Keeper publicly recruits the complements of its surplus personas. → Track per-metro gender ratio; acquire the scarce side.
- **Similarity for values, polarity for attraction.** "Opposites attract" is myth on values/goals/personality (similar pairs more stable); the exception is masculine/feminine polarity in attraction. Our cosine embedding (similarity) is right for Tiers 1–4; polarity belongs in the attraction model.
- **Photo selection matters.** A user's best photo beats their average by 10+ percentile points. Attraction prediction is harder for men (less consensus on male attractiveness; women's taste in men shifts with age).
- **Novelty/arousal dates beat default dates** for relationship formation (also: activity dates fit a non-drinking community).
- **Bottleneck diagnostic.** Every user's search breaks at exactly one stage: (1) not meeting anyone = top-of-funnel, (2) meeting people they don't want = filtering, (3) rejected by people they want = attractiveness, (4) dates go nowhere = connection, (5) fizzles after = retention. Fix the binding stage, not the working ones. → This is the funnel dashboard's organizing frame.
- **Business model, directional:** millennia of matchmakers charged a bounty on the marriage; dating apps get paid while you stay single. Monetization, when it comes, should be outcome-aligned.

---

## 4. Roadmap

### Phase 0 — Make the north star measurable (~1 wk) — IN PROGRESS
| Item | Status |
|---|---|
| `/admin/funnel` page rendering `funnel_metrics`, organized by the five-bottleneck frame | ❌ → building |
| Elapsed-time metrics: signup→first intro, intro→mutual, mutual→date, **signup→first completed date (north star)** | ❌ → building |
| `second-date-check` cron + write `relationship` status | ❌ → building |
| Per-metro gender ratio in pool health | ❌ → building |
| Fix embedding-path kids/faith multiplier bypass | ❌ → building |

North star (pre-launch phase): **median signup → first completed date**, guarded by second-date intent rate. Long-run: exits-for-found-someone.

### Phase 1 — Attraction architecture (~1–2 wks)
- Persist per-pair calibration votes (new table; migrate `/api/calibrate` to server-side Elo computation while at it — client-computed Elo is also a trust hole).
- Use direct "A voted yes on B's photo" as an attraction prior in `selectNextCandidate`; keep Elo band as the consensus component.
- Collect height (+ soft height preference). Soft, never hard.
- Surface `not_attracted` pass-share as the tracked health metric for this vector.
- **Woman-sees-first intro sequencing** (also halves narrative-generation cost on failed intros).

### Phase 1.5 — Assisted dating & fun (see §5 — decisions locked 2026-07-02)
- **5a conversation cards** + **5d two-tap first dates**, behind per-user flags, instrumented against V1-verified date conversion (H9).
- V1 "verified date" definition into funnel metrics (both feedbacks submitted); V2 location check-in as safety feature — design pass, then build.
- 5b voice notes parked; 5f second-date broker extends the Phase 0 cron.

### Phase 2 — Intent & community depth (~1 wk)
- Onboarding: "When do you want to be married?" + faith-intensity 0–10 + 1–2 community-config questions via `community_fields` (generic mechanism, per-community config — no community-specific branding in UX).
- Wire into soft scoring; hard-filter only at extremes.

### Phase 3 — Density-first launch (ongoing)
- One metro. Invite loop + vouches. Acquisition pointed at the scarce gender.
- Matching model **frozen** — no tuning without walk-forward outcome data.
- Filter-discipline UX: "this preference eliminates X% of your pool."

### Phase 4 — Learning loop (deferred until outcomes exist)
- Per-user taste model from calibration votes + pass reasons (the 82%).
- Wire `date_feedback` into matching; build the `taste_calibration` consumer.
- Validate embedding vs. like-rate (walk-forward); fill behavioral dims 112–127.
- Polarity signal ("relationship dynamic" question).
- Backlog: photo-test growth tool; outcome-aligned pricing.

---

## 5. Assisted Dating & Fun — DRAFT (new, needs review)

**JTBD:** *"I want to meet this person, but everything between the match and sitting across from them terrifies me or bores me. Get me over the hump."* People who are bad at dating don't fail at matching — they fail at stages 4–5 of the bottleneck frame (connection, retention). The product should carry them through the same way a good human matchmaker would: prompting, brokering, and removing every blank page.

**Design principle (from Keeper's AI-content finding):** people are most hostile to AI-generated content when it's a courtship display (profile text, messages). So assistance must **coach and structure, never ghost-write**. The user's own words, scaffolded — not synthetic charm. PLY's voice-first DNA is the unlock: people who freeze at a text box are usually fine *talking*.

What we already own that nobody is using for this:
- `conversation_fuel[]` — extraction v2 already produces "3–5 specific topics that would make this person talk for 2 hours" per user. **Currently unused in the chat experience.**
- `notable_quotes[]`, composite profiles for both sides — raw material for tailored prompts.
- Dormant `disclosure_exchanges` code — structured simultaneous Q&A, revivable as a game.
- Blind meet-decision — the single biggest "bad at dating" hump (asking someone out / fear of rejection) is ALREADY structurally removed. Nobody asks anybody out on PLY; the system brokers it. This should be a headline product message, not a hidden mechanic.
- Availability grids + `date_activity_prefs` + pre-date nudge — 80% of a date-brokering concierge already exists.

### Proposed mechanisms (each mapped to existing infra)

**5a. Conversation cards (kill the blank page).** In chat, each user sees 2–3 private, tailored cards generated from the *other* person's `conversation_fuel` and composite: "Ask her about the pottery studio she almost opened." Tap to insert a starter you then edit, or just use as inspiration. The 10-message cap stops being scary when every message has a runway. *Build: prompt template + card UI in `ChatWindow.tsx`. No new tables.*

**5b. Voice notes in chat.** Allow 20–30s voice snippets (auto-transcribed, both shown). Bad texters are often good talkers; voice is PLY's onboarding DNA and it's a courtship display that's authentically *theirs* — no AI-content backlash. Asymmetric benefit for men (Keeper: humor is a top-3 female priority — humor transmits in voice, dies in text). *Build: reuse voice-memo upload + transcription pipeline pointed at `chat_messages`.*

**5c. Both-answer reveal game (revive `disclosure_exchanges` as fun).** Optional chat mini-game: both answer the same tailored question privately; answers reveal simultaneously. Simultaneous reveal is a proven fun mechanic (no one goes first = no one is vulnerable first) — same psychology as the blind meet-decision, applied to conversation. Counts as 1 of the 10 messages, so it *raises* the value density of the cap. *Build: revive dormant code, restyle as a game, tailor questions from both composites.*

**5d. Two-tap dates ("pick one of these 4 → Confirmed!").** Assisted mode proposes 3–4 fully-specified date plans — activity (biased toward light-novelty per the arousal-date finding; non-alcohol formats by default), venue, and times drawn from both availability grids. Choosing requires two taps total (this exact interaction is already promised in `specs/03-outcome-engine.md`; the planning plumbing exists). *Build: plan-generation prompt + venue heuristics; extend `DatePlanning.tsx`.*

**5e. Date brief (pre-date confidence).** Extend the existing pre-date nudge into a private brief: 3 things to ask them about (from their composite — things the intro didn't reveal), the logistics, one reassurance ("you both said yes to this — the hard part is over"). Never punitive, always opportunity-framed. *Build: extend `/api/cron/pre-date-nudge` prompt.*

**5f. Second-date broker (assist, don't just measure).** When both post-date feedbacks say `want_to_see_again=yes`, don't wait — auto-propose the second date with the same two-tap flow. The Phase 0 `second-date-check` cron should *cause* second dates, not just count them. Highest-leverage single mechanism on the north star. *Build: extends the Phase 0 cron directly.*

**5g. "Assisted mode" as a mode.** Opt-in toggle (default ON for users whose behavioral signals show hesitation: slow first message, expired chats, passes-after-mutual). Assisted users get 5a–5f at full strength; confident users get a quieter version. The hesitation signals already exist in `chat_messages` timestamps and match lifecycle events. *Build: per-user flag + trigger heuristics.*

### What "fun" is NOT (anti-goals)
- No streaks, no engagement loops, no daily-login rewards — that's the incumbent failure mode (designed-against-exit). Fun must live *inside the pipeline to a date*, never beside it.
- No AI ghost-writing of messages. Scaffold, never substitute.
- The daily cadence + 24h expiry already provide the "Wordle-like" ritual; don't add another.

### 5h. Date verification (how do we KNOW a date happened?)

Today's truth: `post-date-checkin` cron marks a confirmed date `completed` 2.5h after its scheduled time — **completion is assumed, never verified**. Verification tiers, weakest → strongest:

| Tier | Signal | Status |
|---|---|---|
| V0 | Confirmed + time elapsed (current "completed") | ✅ built — treat as *assumed* |
| V1 | Both sides submit post-date feedback (cross-verified self-report) | ✅ data exists — **make this the "verified date" definition in funnel metrics now** |
| V2 | Location co-presence check-in: at date time, each taps "I'm here" → one-time `navigator.geolocation` grab; both within ~150m = verified. Works on mobile web, no native app needed. **Frame as a safety feature** ("let someone know you arrived") — which our demographic will actually value — verification is the byproduct, not the ask. | ❌ proposed |
| V3 | Passive/continuous location | ❌ rejected — creepy, battery, native-app territory, wrong trust posture for this brand |

Funnel dashboard should show `dates_completed` (V0, assumed) and `dates_verified` (V1) side by side; V2 upgrades verification when built.

### Decisions (Charles, 2026-07-02)
1. **Build first: 5a conversation cards + 5d two-tap first dates.** (5f second-date broker rides along with the Phase 0 cron since it extends it directly.)
2. **5b voice notes: parked.** Revisit after cards prove out.
3. **Assisted-mode rollout is experiment-driven, not heuristic-driven.** Ship mechanisms behind per-user flags; the metric that decides everything is **conversion to completed (V1-verified) dates**. No a-priori "who gets assist" rule — test and let the date data pick.

---

## 6. Hypotheses & tests

| # | Hypothesis | Test | Data source |
|---|-----------|------|-------------|
| H1 | Within-community observance variance is a major pass/date-fail driver | Faith-intensity gap vs. pass reasons & date outcomes | Phase 2 fields |
| H2 | Physical attraction is the top residual pass reason | `not_attracted` share of passes; >~40% ⇒ #1 investment area | Collected today |
| H3 | Narrative-first + delayed photo converts better than photo-first | Cohort like/date-rate by `photo_revealed_before_decision` | Collected today |
| H4 | Direct calibration votes predict intro acceptance | Like-rate where A pre-voted yes on B vs. baseline | Phase 1 |
| H5 | Woman-sees-first raises mutual-match rate per intro | A/B sequencing | Phase 1 |
| H6 | Marriage-timeline urgency predicts funnel velocity | Timeline answer vs. signup→date elapsed | Phase 0+2 |
| H7 | Embedding beats hand-tuned fallback at predicting likes | Walk-forward offline eval | Needs volume |
| H8 | Fast first date drives retention + invites, not churn | Cohort signup→first-date time vs. retention/invites | Phase 0 |
| H9 | Conversation cards raise chat→meet-decision conversion | A/B cards on/off among mutuals | Phase 1.5 |
| H10 | Second-date broker raises second-date rate vs. measure-only | A/B auto-propose on/off | Phase 1.5 |

### Confident (no test needed)
1. Community pool = multiplicative base-rate + urgency multiplier (Keeper data).
2. Attraction = Elo consensus band (keep) + per-user taste from votes (build). 18/82 + r≈0.4.
3. Intro-as-product, designed-for-exit, outcome north star.
4. Few hard filters; learn what binds from behavior.
5. Measurement before tuning — no model changes without walk-forward validation.

### Explicitly deprioritized
- Embedding/weight tuning (no validation data yet).
- Vision-model photo analysis (votes + Elo suffice at this scale).
- New matching vectors beyond the above (pool too small; filters multiply).
- Monetization mechanics (directional note only: outcome-aligned).

---

## 7. Verification
- **Phase 0 done =** `/admin/funnel` live in production with bottleneck-framed stages + elapsed times + metro sex ratio; `second-date-check` cron installed in `/etc/cron.d/coolify-apps`; a test match can reach `relationship`; multiplier fix covered by a unit test.
- **Phase 1 done =** per-pair votes persisting (verify rows in DB); height in onboarding; `not_attracted` share on admin; sequencing behind an A/B flag.
- **Phase 1.5 done =** chosen mechanisms shipped behind flags with H9/H10 instrumented.
- **Strategy validated =** H1–H6 readable from the dashboard as real users flow.
