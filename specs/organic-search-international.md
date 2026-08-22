# Organic search — international (the top-10 membership countries)

**Written 2026-08-22.** Companion to `specs/location-seo-strategy.md` (US metros — read that first; its rules on doorway pages, the sex-ratio trap, and hand-written interpretation all apply here). Trigger: Charles pointed at the Church News graphic "Countries with the most Latter-day Saints" and asked for an organic strategy covering the top 10 countries.

---

## 1. The market, ranked

From the graphic (official Church statistics, year-end 2023), with what changed since:

| # | Country | Members (2023) | Language | Note |
|---|---|---:|---|---|
| 1 | United States | 6,868,793 | English | Covered by the metro strategy |
| 2 | Mexico | 1,516,406 | Spanish | **Brazil passed Mexico in 2025** ([Deseret, 2026-08-21](https://www.deseret.com/faith/2026/08/21/latter-day-saints-in-brazil/)) |
| 3 | Brazil | 1,494,571 | Portuguese | Now #2 worldwide; 287 stakes, most outside the US |
| 4 | Philippines | 867,271 | **English**/Tagalog | 905,082 by 2026; most members per capita in Asia |
| 5 | Peru | 637,180 | Spanish | |
| 6 | Chile | 607,583 | Spanish | |
| 7 | Argentina | 481,518 | Spanish | |
| 8 | Guatemala | 290,068 | Spanish | |
| 9 | Ecuador | 264,802 | Spanish | |
| 10 | Nigeria | 232,654 | **English** | Fastest riser: #13 in 2019 → #10 in 2023 |

(Bolivia 225,140 and Colombia 215,331 sit just outside; DR Congo jumped 28→22. Africa is where the growth is.)

**Membership ≠ activity.** Activity rates in Latin America and the Philippines are commonly estimated at 20–30% vs ~40% in the US. On-page we cite official membership only (it's the citable number); internally, when sizing a market, discount accordingly. Never publish an activity-rate estimate on a country page — same class of trap as the sex ratio.

---

## 2. Why this is not premature — and what it is instead

**Demand is revealed, not hypothesized.** Mutual's own published stats put its largest user bases in: US, Brazil, Mexico, Philippines, Peru, Canada, UK, Ecuador, Chile, Argentina — essentially the membership table above ([Mutual annual report](https://blog.mutual.app/2024/01/18/mutuals-2024-annual-dating-report/)). People in these countries already download an LDS dating app at scale.

**The SERPs are empty of content.** Searches like "citas SUD" return app-store listings, one affiliate review site, and TikToks. Nobody holds content authority for LDS dating in Spanish or Portuguese. In English, "countries with the most Latter-day Saints" is held by a Blogspot and worldpopulationreview.com — beatable.

**But PLY cannot serve these users today.** US-only, English-only, metro-gated waitlist. So international organic is explicitly **not an acquisition play yet**. It is two things:

1. **Audience banking** — rankings compound for 12–24 months; the cost of owning these SERPs is lowest now, while they're empty.
2. **Demand measurement** — every international page CTAs into the waitlist with a country field. Waitlist rows by country are revealed preference, and *that data* decides whether and where the product ever goes international. No speculation required.

The CTA copy must be honest: "PLY isn't in [country] yet — tell us where you are and we'll tell you when it is." This is the Scenario-C pattern (`model-rules.md`: never a countdown to nothing), applied to countries.

---

## 3. Language tracks, not country sites

Nine countries collapse into three language tracks:

- **English** — Philippines (#4) + Nigeria (#10): 1.1M members, **zero translation cost**, and Filipinos largely search in English. This is the cheapest possible international test.
- **Portuguese** — Brazil alone justifies the track: now the #2 LDS country on earth (~1.53M), one language, one culture, and Mutual's #2 market.
- **Spanish** — one track covers six of the top ten (Mexico, Peru, Chile, Argentina, Guatemala, Ecuador ≈ 3.8M members, plus Bolivia/Colombia/Venezuela adjacent). **And the Spanish track has a servable audience on day one**: the US has hundreds of Spanish-language wards and branches, concentrated in metros we've already approved (Phoenix, DC, NYC). `/es/` content serves US Spanish-speaking LDS singles *now*, before any international launch.

---

## 4. The data asset

The international analog of the Religion Census: **Church Newsroom "Facts and Statistics" country pages** (newsroom.churchofjesuschrist.org/facts-and-statistics) — members, stakes, wards/branches, missions, temples, FamilySearch centers, per country, official and updated annually. Free to cite, no scraping issue (public press materials; same posture as the Religion Census, unlike the meetinghouse locator — see `project_lds_scrape_blocked`).

**No official sub-national data exists outside the US.** Cumorah-project city estimates are not citation-grade. Therefore: **country pages only, no international city pages.** If we ever want city granularity, the citable frame is temples ("São Paulo has a temple district of N stakes"), not member counts. Revisit only after country pages prove out.

---

## 5. Page types

### A. The global ranking page (English) — the link magnet
"Countries with the most Latter-day Saints (2026)" — our version adds what the incumbents lack: per-capita ranking (Tonga/Samoa lead), growth since 2019 (Nigeria/DR Congo story), temples and stakes per country, all sourced. This is the international `type-B` page; it feeds internal links to every country page and is the page most likely to earn media/Reddit/wiki citations.

### B. Country pages — same template as metro pages
URL pattern: `/lds-singles/philippines` (EN), `/pt/namoro-sud/brasil`, `/es/solteros-sud/mexico` — slugs in the page's language.

Sections mirror the metro template, re-grounded per country:
1. **The numbers** — members, stakes, congregations, temples, missions. Official, tabled, above the fold.
2. **What that means for dating there** — hand-written per country. Manila: dense wards, chaperone-era norms fading, huge YSA population. Brazil: #2 on earth but spread across a continent; São Paulo vs. the interior are different worlds. Mexico: second-generation members, big JAS culture.
3. **How singles actually meet** — internationally the answer is **multi-stake YSA/JAS conventions** (convenciones JAS / conferências JAS — in much of Latin America these are THE mechanism), institute, temple trips. Named and specific or not at all.
4. **The honest problem with this market** — small active pool inside huge nominal membership, distance, emigration of marriage-age members. The trust play travels.
5. **Honest CTA** — waitlist + country capture, Scenario-C copy.

### C. Sleeper queries
"¿Cuántos miembros tiene la Iglesia en México?" / "how many Mormons in the Philippines" — informational, we hold the sourced answer, page pivots to the dating content. Same hypothesis-status as the US version: GSC validates, we don't pre-buy volume estimates.

### D. The bridge content nobody else can write
- **Returned-missionary angle**: tens of thousands of US members served in exactly these nine countries; "RMs who served in Brazil" is a real affinity axis and a natural cross-link between US metro pages and country pages.
- **US Spanish-speaking wards**: "LDS dating when your ward is in Spanish" — serves Phoenix/DC/NYC today, links both directions.

---

## 6. Sequencing (recommendation)

| Phase | Gate | Ships |
|---|---|---|
| **0 — English test** (with US wave 1) | none — cost is ~3 pages | Global ranking page; Philippines page; Brazil page *in English* (catches diaspora + RM queries); **waitlist gains optional country field** |
| **1 — Portuguese** | Non-US impressions in GSC or international waitlist signups within ~60 days of Phase 0 indexing | `/pt/` Brazil page (hand-written, not translated), hreflang pair with the EN Brazil page |
| **2 — Spanish** | Phase 1 signal, or independently justified by US Spanish-ward angle | `/es/` hub + Mexico first (framed to serve US Spanish-speakers too), then Peru, Chile, Argentina |
| **3 — long tail** | Phase 2 ranks | Guatemala, Ecuador, Nigeria; re-rank the roster annually when the Church releases new stats |

Hard ceiling mirrors the US rule: ≤10 country pages, each hand-finished. Nine template-substituted country pages is the same doorway-page failure as 869 metro pages.

Any phase that ships is a falsifiable bet → the implementing session pre-registers it with the growth cockpit (metric: `ply.organic.intl_impressions` or waitlist signups by country) before pushing.

## 7. What NOT to do

- **No machine translation** of US pages into es/pt. Hand-written in-language or not at all (quality + scaled-content risk).
- **No service promises.** Every international CTA is the honest Scenario-C waitlist.
- **No international city pages** — no citable data (§4).
- **No paid translation before Phase 0 validates.** English pages are free to test with.
- **No activity-rate or gender-ratio numbers on-page** for other countries — same trap class as the US sex-ratio rule; the research base is even thinner abroad.
- **Blocked on GSC**: none of this is measurable until the Search Console DNS TXT record is added (open item in EXECUTION.md STATE). That single DNS record gates the entire measurement loop.

---

**Synopsis:** Nine countries collapse into three language tracks; demand is proven by Mutual's own user-country stats and the SERPs are empty. Phase 0 costs three English pages (global ranking + Philippines + Brazil) plus a waitlist country field, and turns international strategy from a guess into a measured readout.
