# PLY One-Year Plan — July 2026 → July 2027

**Goal: $1M/year run-rate ($83K MRR) by month 12, subscription-only, operated solo + AI at ~10 hrs/wk.**
Companion doc: `specs/roadmap-2026-07.md` (product phases, hypotheses, matching architecture). This doc is the business layer on top of it.

---

## 1. The math

$1M/yr = **$83.3K MRR**. Everything below is sized against it.

| Price point | Payers needed at run-rate |
|---|---|
| $29/mo | ~2,870 |
| $39/mo | ~2,140 |

**Funnel assumptions (stated so they can be falsified):**
- Signup → activated (onboarding complete, first intro delivered): **60%**
- Activated → paying, hard paywall after 14-day trial: **35–50%** (matchmaking-intent audience, not swipe-casual; Keeper data shows devout users have 3x marriage urgency — this is why the pool choice carries the conversion assumption)
- Blended: **~21–30% of signups become payers**

→ Target: **~10–13K signups over the year**, concentrated in dense LDS metros, at roughly 200/wk average (backloaded: ~50/wk in Q1, ~400/wk in Q4).

**Average subscriber lifetime**: assume **5–7 months** (churn = success + give-up + seasonal). At $29/mo → **LTV ≈ $150–200**. This bounds CAC: organic/referral must stay <$20, paid must stay <$50–65 (LTV:CAC ≥ 3).

### Scenarios (honesty section)
| | Bear | Base | Bull ($1M) |
|---|---|---|---|
| Signups yr 1 | 2,500 | 6,000 | 12,000 |
| Payers at M12 | 500 | 1,400 | 2,900 |
| Run-rate | $175K | $490K | $1M |
| What it requires | Utah Valley works, nothing else does | UV + 1 metro + influencer channel works | All 3 channels work, 3+ metros, women-first solved, viral success stories |

$1M in year 1, solo, is a **top-decile outcome**. The plan is built so the Base case is a healthy business ($40K MRR, ~90% margin) and every quarter has a gate that tells us which scenario we're living in. What must be true for Bull: female supply solved (§4), success stories land publicly by Q2, and paid CAC under $65 when it turns on in Q3.

---

## 2. Subscription-misalignment guardrails

We chose the model our own spec criticizes: subscription pays us while members are still single. The failure mode of every incumbent is that this incentive leaks into product decisions. Structural guardrails, adopted now:

1. **North star never changes**: verified dates → relationships. Never engagement, never subscriber-months.
2. **No pacing mechanics that extend subscriber lifetime.** Intro cadence, match quality, and the second-date broker are tuned to end the search fast. If a product change increases revenue but slows time-to-relationship, it doesn't ship.
3. **Publish success metrics** (relationships formed, median time-to-first-date) on a public page. Accountability is the moat vs. Mutual/Match-style incumbents — none of them dare publish this.
4. **Celebrate churn-on-success.** Every `found_someone_ply` exit gets an alumni story ask. Alumni content is the top of the marketing funnel (§5) — success churn literally becomes acquisition.
5. **Framing**: the subscription is a **matchmaker retainer** ("we work for you until it works"), not an access fee. Copy, pricing page, and cancellation flow all reflect it — cancellation on success is a win screen, not a retention gauntlet.

---

## 3. Quarterly plan

Each quarter: revenue gate + product theme + marketing theme + devops theme. Gates missed by >50% trigger the §7 pivot review, not silent continuation.

### Q1 (Jul–Sep 2026) — Prove the loop. Free beta, one metro.
- **Product**: Merge Phase 0 → main (funnel dashboard, velocity metrics, second-date-check — built, on staging now); apply migration 014. Ship Phase 1 (persist attraction votes, height, woman-sees-first sequencing), Phase 2 (marriage-timeline + faith-intensity + community-config fields), Phase 1.5 first mechanisms (conversation cards, two-tap dates). Build Stripe integration behind a flag — **off**.
- **Marketing**: Organic only. Utah Valley. Invite/vouch loops (already built) + YSA-community and campus presence + founder build-in-public content. **Women-first recruiting** from day one (§4) — every event, referral bonus, and seed effort biased to female signups.
- **DevOps**: Automated nightly Postgres backups offsite + restore drill (currently unverified — do first); make the photos bucket non-public with signed URLs (it is public today); add migration step to staging workflow (gap found July 2026).
- **Gate**: 500 members · ≥25 V1-verified dates · second-date intent ≥40% · gender ratio ≤1.5:1 · north-star median (signup→first date) < 21 days.

### Q2 (Oct–Dec 2026) — Turn on money.
- **Product**: Paywall on — 14-day full-service trial, then $29/mo (founding members grandfathered at $19). Billing portal, dunning, cancel-on-success flow. Second-date broker + date brief. V2 location check-in (safety framing). Support automation (AI concierge).
- **Marketing**: Success-story engine goes live (first cohort's relationships should exist by now — if not, the Q1 gate caught it). Influencer push: LDS-adjacent micro-creators, wedding/family podcast circuit, BYU-sphere. Referral upgrade: converted invite = free month.
- **DevOps**: Payment webhooks monitored (Tier 1 alert); revenue dashboard added to `/admin/funnel`.
- **Gate**: 300–500 payers ($9–15K MRR) · trial→paid ≥35% · churn <8%/mo · CAC measured per channel.

### Q3 (Jan–Mar 2027) — Scale channels + metros.
- **Product**: Phase 4 learning loop begins (per-user taste model from accumulated calibration votes; date outcomes into matching — walk-forward validated, per model rules). Metro-launch playbook productized (waitlist page per metro, density threshold before activation).
- **Marketing**: Paid acquisition on **only if** Q2 shows LTV:CAC ≥3 headroom (Meta/TikTok, women-targeted creative first). Metro expansion: SLC → Mesa/Gilbert AZ → Rexburg ID. Each metro: seed women-first, 8-week density sprint, don't activate intros until ratio ≤2:1.
- **DevOps**: Server upgrade decision point (~5K+ users): bigger Hetzner box + Postgres tuning; load test the cron pipeline.
- **Gate**: 1,200 payers (~$36K MRR) · ≥1 metro besides Utah Valley self-sustaining · paid CAC <$65 or paid stays off.

### Q4 (Apr–Jun 2027) — Compound.
- **Product**: Double down on whatever the funnel dashboard says is the binding bottleneck (that's why we built it first). Native app wrapper only if PWA push/retention data demands it. Optional: second community config (Catholic, Jewish, or evangelical vertical) — the generic-platform architecture makes this a config change + new channels, not a new product.
- **Marketing**: Scale the proven channel mix; alumni-wedding content flywheel at full speed.
- **Gate**: **2,800 payers · $83K MRR run-rate · ≥40 relationships formed · published success page live.**

---

## 4. The binding constraint: female supply

Everything in this plan is downstream of one number: **women in the pool per metro**. Evidence: our own pool is 16M/6W today; Keeper's stacked-preference data shows the median woman eliminates 72% of men (men: 44%), and Keeper publicly begs for women in its surplus segments. Female supply sets match quality for men, which sets male conversion and retention. Rules:
- Every marketing dollar/hour is women-first until a metro hits ≤1.5:1.
- Woman-sees-first sequencing (Phase 1) makes the product itself women-respecting — this is also the marketing message to women: *your face is never in a feed; nobody sees you until we're confident, and you approve him first.*
- Track per-metro ratio on `/admin/funnel` (built); acquisition retargets the scarce side weekly.
- Safety features (V2 check-in, trust tiers, verification) are women-first features and get priority accordingly.

---

## 5. Marketing engine

**Positioning vs. Mutual** (the incumbent LDS swipe app): PLY is the anti-swipe. "One real introduction a day. Nobody ever asks anyone out — we broker it. Designed to be deleted, for real — we publish our numbers." Mutual's weaknesses are structural (engagement-funded swipe feed); they cannot copy accountability without breaking their model.

**Channel sequence & why:**
1. **Organic/community (Q1→)** — pool too thin for paid; density comes from tight-community word-of-mouth; costs time not money.
2. **Influencer (Q2→)** — needs success stories as ammunition; micro-creators in the LDS-adjacent space are cheap ($100–500/post) and high-trust.
3. **Paid (Q3→)** — only after LTV and trial-conversion are measured; women-targeted creative first; kill if CAC >$65.

**The success-story flywheel** (the compounding asset): exit survey (`found_someone_ply`) → automated alumni interview ask → story/reel/podcast guest → drives the next cohort. Weddings are the highest-trust content in this community. Target: every relationship formed yields ≥1 content artifact.

**Brand voice**: conversational, witty, brief, never salesy (house rule). The no-LDS-branding rule holds: the *product* stays generic; community targeting lives entirely in channels and creative.

---

## 6. DevOps & cost plan

Infra stays **Coolify/Hetzner + self-hosted Supabase** (hard rule — no Vercel/Heroku/Neon).

| Item | Now | At 3K members | At 10K |
|---|---|---|---|
| Hetzner (CX43 → CCX/dedicated) | ~$55/mo | ~$120/mo | ~$300/mo |
| AI APIs (onboarding extraction ~$0.15–0.40/user; intros ~$0.01/day/user) | <$20/mo | ~$400/mo | ~$1.2K/mo |
| Resend, Sentry, misc | ~$30/mo | ~$150/mo | ~$300/mo |
| Stripe fees | — | ~3% of revenue | ~3% |
| **Total OpEx** | **<$150/mo** | **<$1K/mo + fees** | **<$2.5K/mo + fees** |

→ **~90% gross margin at scale.** No paid service gets added without an explicit cost call-out (house rule).

**Hardening checklist (Q1, ordered):** offsite backups + restore drill → photos bucket → private + signed URLs → staging migration step → payment webhook alerting (Q2) → load test crons (Q3) → quarterly restore drills thereafter.

**Solo-operability rules**: every recurring task is a cron or an AI workflow; runbooks live in the repo (`docs/runbooks/`); anything requiring >30 min/wk of manual Charles-time gets automated or cut. Support = AI concierge with escalation to email.

---

## 7. Risks & kill criteria

| Risk | Signal | Response |
|---|---|---|
| Cold start fails in UV | Q1 gate <50% (under 250 members or <12 verified dates) | Stop building, run 4-week women-first recruiting sprint only; if still dead, re-examine channel or metro choice before touching product |
| Gender imbalance persists | Ratio >2:1 at any gate | Freeze male acquisition entirely; paid spend 100% women |
| Trial→paid <20% | Q2 | Price test ($19), lengthen trial, or move paywall later in funnel (after first mutual) before questioning the model |
| Churn >12%/mo | Q2–Q3 | Diagnose via bottleneck frame — churn is a symptom of no-dates, fix supply/matching not retention gimmicks |
| Mutual copies the intro model | Anytime | Accelerate accountability moat (published metrics) + community depth; they can't publish success rates without indicting their feed |
| Subscription misalignment creep | Any product decision that trades time-to-relationship for revenue | §2 guardrails are the veto; this doc is the tiebreaker |
| Solo bus factor | — | Runbooks + automation from Q1; revenue buys part-time community ops in Q3 if Base case or better |

**Standing pivot rule**: two consecutive quarterly gates missed by >50% = stop and re-plan the model (pricing, community, or metro), not grind harder on the same plan.

---

## 8. What Charles's 10 hrs/wk goes to

Roughly: 4 hrs community/marketing presence (the one thing AI can't do — being a trusted human in the community), 3 hrs reviewing/directing AI build sessions, 2 hrs success-story/content, 1 hr metrics review against this doc's gates. Everything else is delegated to automation or doesn't happen.

---

*Written 2026-07-06. Review at each quarterly gate; update scenarios with actuals.*
