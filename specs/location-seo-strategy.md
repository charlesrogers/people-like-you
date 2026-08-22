# Location pages — organic content strategy

**Written 2026-08-22.** Answers Charles's question: what should location pages contain, and what would actually help us rank?

---

## HARD CONSTRAINTS (check every proposal against these)

1. **LOCKED — EXECUTION.md Decision Log #4 (standing):** "No community-specific branding in UX; generic platform + per-community config." Restated at EXECUTION.md §9 line 297: *"No LDS-specific words anywhere in product UX. Community targeting lives in marketing channels, not the product."*
2. **Meta dating authorization is still pending and gates the entire paid plan.** launch-plan §5: never assert/imply the viewer's attributes; the landing page must match the ad. Reviewers inspect the product.
3. **model-rules.md Scenario C, rule 4:** "Never show a countdown timer to nothing."
4. Domain `people-like-you.com` was created **2026-03-21** — five months old, effectively zero authority, zero indexed pages until robots.txt/sitemap.xml shipped 2026-08-22.

Constraints 1 and 2 are the reason the recommendation below is *not* the ward-count page.

---

## 1. The finding that changes the plan: ward counts are the wrong hook

The instinct — *density is our differentiated number* — is right. The specific execution fails on three independent grounds, any one of which is disqualifying.

**a) The intent is navigational, not dating.** Someone searching "YSA ward map Utah County" wants to know where to attend church on Sunday. They are not shopping for a matchmaker. The SERP is owned by [maps.churchofjesuschrist.org](https://maps.churchofjesuschrist.org), individual stake sites ([provoysa18.org](https://provoysa18.org/wards), [utahvalleysouthysa.com](https://www.utahvalleysouthysa.com/ward-and-building-locations)), the [FamilySearch wiki](https://www.familysearch.org/en/wiki/Wards_and_Branches_of_The_Church_of_Jesus_Christ_of_Latter-day_Saints_in_Salt_Lake_City,_Salt_Lake_County,_Utah), and Wikipedia. Traffic that converts near zero.

**b) The SERP is unwinnable.** We would be competing against the Church's own official locator, for the Church's own members' navigational query, on a five-month-old domain with no backlinks.

**c) It breaks constraint 1 and endangers constraint 2.** "247 singles wards within 15 miles" is community-specific vocabulary on an indexable page of the product domain, published while dating authorization is pending. That trades the gate on the entire paid plan for traffic that does not convert.

**The fix is to keep the density idea and change the source.** See §3.

> **Dependency note.** The parallel session executing `specs/meetinghouse-density-scrape.md` hit an expired API token and a sandbox block on extracting the client-side credential, and was mid-way through a Terms-of-Use review when it paused. Treat that dataset as **not yet available and possibly not obtainable within ToS**. Nothing in this strategy depends on it. If it does land, it is an internal targeting asset (which metros to open next) — that use has no constraint problem at all, because it never appears on a public page.

---

## 2. What the winning page actually looks like

The incumbent for the money query is [provo.com/student-life/dating-in-provo](https://provo.com/student-life/dating-in-provo/) — "Dating in Provo: An Honest Guide (2026)". Its shape:

- **3,500–4,000 words**, ten H2s, eleven H3s
- **Cited statistics**: median marriage age 24.8 women / 26.1 men; one in four BYU students married; students average ~two dates a month
- **Named venues**: Y Mountain, Provo River Parkway, Utah Lake, Alpine Loop, Covey Center, Riverwoods, Center Street
- **Segment-specific H3s**: freshman, returned missionary, not LDS, feeling pressure, non-student, BYU–UVU
- **A trust play as its closing section**: *"What Is Actually Known Here, and What Only Gets Repeated"* — it wins by pointing out that everyone else's numbers are unsourced

That last section is the opening. **They win by complaining that nobody sources the numbers. We win by being the source of the numbers.**

---

## 3. The proprietary asset: a Census-sourced Singles Density Index

**Source:** Census ACS 5-year, table **B12002** — "Sex by Marital Status by Age for the Population 15 Years and Over." Never-married counts, split by sex, by age band, available at ZCTA, tract, and county level. Free API; requires a free key from `api.census.gov/data/key_signup.html` (verified 2026-08-22: the API now 302s to a "Missing Key" page without one — **no billing account, unlike Cloud DNS**).

**Join:** our `zip_locations` table already holds **33,144 US ZIPs with lat/lng, city, state, metro_area, metro_code**, and `src/lib/geo.ts` already implements haversine distance. So for any ZIP we can compute:

- never-married adults 21–35 within 5 / 15 / 30 / 60 miles
- **the sex ratio** — never-married women per 100 never-married men in that radius
- density per square mile, and the national percentile rank

Why this beats the ward count on every axis:

| | Ward count | Census density |
|---|---|---|
| Sourced & citable | Estimated, contested | Federal, footnotable |
| Community-neutral | ✗ breaks Decision #4 | ✓ |
| Meta risk pre-authorization | Real | None |
| Coverage | Utah-heavy | All 33,144 ZIPs |
| Obtainable today | Blocked on auth/ToS | Free key, no billing |
| Anyone else publishing it at radius granularity | — | Not that I can find |

**The sex ratio is the headline number, not the raw count.** PLY's entire launch mechanic is the female-supply constraint (launch-plan §16: women skip the line). A page that says "there are N never-married women aged 21–35 per 100 men within 30 miles of Provo" is simultaneously the most shareable stat we own, the most press-friendly, and a direct restatement of the product thesis. It is the "see what others miss by synthesizing data into a clear decision" JTBD, executed literally.

---

## 4. Answering "sparse density vs. rich density pages"

Yes — and **the sparse pages are the better half of the strategy.** This is the non-obvious finding.

**Rich-density pages** (Provo, Salt Lake, Rexburg, Mesa) target crowded SERPs. provo.com, KSL, BYU Universe, and every LDS-dating listicle are already there. We will win these eventually, on the strength of §3's data, but slowly.

**Sparse-density pages** target people with an acute struggling moment and no competition for the query. Someone in a market with forty never-married adults in their band within thirty miles has already dated the pool. Their search is not "best dating app" — it is closer to *"how to date when there are no single people where I live."* Nobody has written the good version of that page.

And it maps to product capability we already ship:

- `src/lib/geo.ts` — `DISTANCE_RADIUS_MAX_TIER`, tier multipliers, haversine; long-distance matching is built
- `model-rules.md` Scenario C — *"Want to see people within a few hours? Some of the best connections start long-distance."*

Mutual cannot serve this user, because a swipe feed in a sparse market is an empty feed. A brokered one-introduction-a-day model degrades gracefully across distance in a way a feed does not. **The sparse-market page is the one place our product is categorically better, and the query has no incumbent.** Lower volume per page, far higher intent, and it compounds into a national footprint instead of a Utah-only one.

Recommended split: build the sparse pages first, as the wedge; the rich pages second, when the Index has earned enough links to compete.

---

## 5. Page architecture — three tiers

**Tier 1 — The Index (one page).** National, sortable, the link magnet. Every metro ranked by never-married density and sex ratio, with a radius lookup. This is what earns citations and backlinks; it is what makes Tier 2 rank later. Build first.

**Tier 2 — Metro guides (6–10 pages, hand-finished, 2,500+ words).** Only metros we actually intend to open. Structure, mirroring what works and adding what provo.com cannot:

1. The numbers here (our Census data — the hook)
2. What the sex ratio means for you specifically
3. How people actually meet here
4. Where to go — named, specific venues
5. Segment advice
6. Live: how close this metro is to opening

**Tier 3 — DO NOT BUILD thousands of ZIP pages.** Google's scaled-content-abuse policy explicitly targets template-with-variable-substitution at scale; the documented pattern is "`[service]` in `[city]`" across hundreds of locations with only the variables changing, and enforcement has run 60–90% ranking losses with **no Search Console manual-action message**. Location pages survive only when each carries real, page-specific data and editorial work. On a five-month-old domain this is a site-level risk, not a per-page one. ZIP-level data lives behind a lookup on the Index, not as indexable URLs.

**On the map:** Google cannot read a map. Ship every map with an HTML table equivalent in the same page; the table is what ranks, the map is what gets shared. Never map-only.

---

## 6. "% of the way there"

This is already a decided feature — T16 (revised): per-metro go-live gate on count + ratio, with a public per-gender countdown as the invite driver. Location pages are its natural home.

**But it cannot ship as-is.** The `waitlist` table currently holds **2 rows**, both zip3 840. A page reading "2 of 50" destroys credibility, violates the activation-tone rule (scarcity = opportunity, never anxiety), and breaks model-rules Scenario C rule 4 outright.

Gate it: show the live countdown only above a floor; below the floor show the Scenario C copy ("You're early to [area]" + invite CTA). **The floor is a judgment call Charles should set — I am not going to invent a number and present it as derived.**

---

## 7. Honest timeline

The domain is five months old with no authority and, as of today, no indexed pages. Competitive local queries realistically take 6–12 months. The Index is the accelerant because it earns links; the guides are the compounding asset.

**Judge Q1 organic on indexed pages and impressions, not signups.** Anyone promising signups from SEO this quarter is guessing.

**Before any of this matters:** `/` is a bare phone+ZIP form with essentially no body copy, and it is the URL that ranks. The three pages with real content are `/welcome`, `/faq`, `/thesis`. Fixing that is worth more than the first three location pages combined, and it is a prerequisite, not a parallel track.

---

## 8. Sequencing (respects the Meta gate)

| Phase | Work | Meta risk |
|---|---|---|
| 0 | Fix GSC TXT to apex. Give `/` real body copy (or route organic to `/welcome`). | none |
| 1 | Free Census key → build the density dataset → ship the Index. | none — community-neutral |
| 2 | Sparse-market guides (the wedge), then rich-market guides. | none — community-neutral |
| 3 | *Only after authorization lands:* decide whether community-specific pages are worth it at all. | gated |

If Charles wants community-explicit content regardless, the lower-risk home is a **separate content property**, not `people-like-you.com`. Tradeoff to name plainly: a separate domain protects the Meta gate and the locked product-UX rule, but starts at zero authority and passes little benefit to the main domain.

---

**Synopsis:** Location pages are worth building, but the ward-count version is the wrong page — wrong intent, unwinnable SERP, and it risks Meta authorization for traffic that will not convert. The same idea sourced from Census B12002 is free, defensible, community-neutral, and covers all 33,144 ZIPs we already have. Build the sparse-market pages first: no incumbent, acute pain, and the one query set where our brokered model beats a swipe feed outright.
