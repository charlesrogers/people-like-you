# Metro pages — organic content strategy

**Written 2026-08-22.** Replaces the first draft, which was wrong: it argued against LDS content instead of building with it, and it framed the data per-ZIP when the unit is the metro area. Charles's call: **LDS content on every page, metro-level, Meta risk accepted.** Built on that premise.

---

## The data we now own

`data/lds-metro-density-2020.csv` — **869 metros**, LDS congregations and adherents each, with national ranks.

Source: [2020 U.S. Religion Census](https://www.usreligioncensus.org/), Religious Congregations & Membership Study, sheet `2020 Group by Metro`. Freely published, standard academic citation, no scraping — the meetinghouse API is closed to us (see `project_lds_scrape_blocked`), and this is the better substitute anyway because it is *citable* and covers the whole country.

**What it is:** all LDS congregations (wards + branches) per metro. **What it is not:** a YSA-ward count. The Religion Census does not break out singles wards. Do not label these "singles wards" on a page — label them congregations, which is what they are, and let the density do the work.

Charles's named metros:

| Metro | Congregations | Adherents | % of population | Rank (adherents) | Rank (%) |
|---|---:|---:|---:|---:|---:|
| Provo-Orem, UT | 1,356 | 554,604 | **82.6%** | 2 | **1** |
| Salt Lake City, UT | 1,476 | 653,868 | 52.0% | **1** | 7 |
| Boise City, ID | 265 | 115,016 | 15.0% | 8 | 21 |
| Rexburg, ID | 97 | 35,114 | 53.0% | 25 | 6 |
| Sacramento-Roseville-Folsom, CA | 120 | 75,384 | 3.1% | 16 | 114 |
| San Francisco-Oakland-Berkeley, CA | 112 | 70,288 | 1.5% | 18 | 267 |

Adjacent metros worth pages: Ogden-Clearfield (1,083 / 442,947 / 63.7%), Logan UT-ID (276 / 113,846 / 77.3%), St. George (284 / 116,156 / 64.4%), Idaho Falls (213 / 92,507 / 58.8%).

---

## The finding that should shape the page list

**The diaspora metros are far bigger than they feel.**

| Metro | Congregations | Adherents |
|---|---:|---:|
| Phoenix-Mesa-Chandler, AZ | 617 | 301,196 |
| Los Angeles-Long Beach-Anaheim, CA | 314 | 198,134 |
| Las Vegas-Henderson-Paradise, NV | 237 | 132,329 |
| Riverside-San Bernardino-Ontario, CA | 172 | 108,532 |
| Dallas-Fort Worth-Arlington, TX | 199 | 105,071 |
| Seattle-Tacoma-Bellevue, WA | 184 | 104,512 |
| Houston-The Woodlands-Sugar Land, TX | 162 | 85,938 |
| Portland-Vancouver-Hillsboro, OR-WA | 151 | 83,481 |
| Washington-Arlington-Alexandria, DC | 134 | 72,147 |

Los Angeles has **more LDS adherents than Boise**. Phoenix has more than triple Rexburg's. Nobody writes the good "LDS dating in Phoenix" page, because everyone assumes the audience is Utah. Utah metros are where the launch is; the diaspora metros are where the *organic* upside is, because the SERPs are empty and the pain is sharper — a dense community spread across a huge metro is exactly the market where you cannot meet people through your ward and a brokered introduction beats a feed.

---

## Page types

### A. Metro page — one per metro, the workhorse

URL: `/lds-singles/provo-orem`, `/lds-singles/phoenix`, etc.

Recommended over `/dating/[metro]` now that community language is allowed: it matches the query, and it is the phrase people actually type.

Sections, in order:

1. **The numbers.** Congregations, adherents, share of population, national rank. A real table, above the fold. This is the citable asset and the reason the page exists.
2. **What that means for dating here.** The interpretation, and it must differ per metro — this is what stops the pages being templates. Provo: enormous pool, brutal velocity, you have met everyone by your third semester. Phoenix: big community, 40-minute drives, your ward is not your dating pool. Rexburg: tiny, seasonal, empties in summer. San Francisco: 1.5% of the population, so the community is real but you will not stumble into it.
3. **How people actually meet here.** Named, specific, local. Institute, specific singles wards' reputations, FHE groups, the actual venues.
4. **The seasonal rhythm.** Semester ramp, YSA ward reshuffle, summer emptying, post-mission waves. Real, specific, and nobody writes it well. Provo's calendar is genuinely different from Phoenix's.
5. **The honest problem with this market.** The trust play — say the true, slightly unflattering thing. This is what makes the page worth linking to.
6. **PLY here** — CTA, and the live status when it clears the floor (§4).

### B. Ranking / comparison pages — the link magnets

These earn the backlinks that make the metro pages rank. We have the data to own them outright:

- **"The 25 U.S. metros with the highest LDS population share"** — Provo-Orem #1 at 82.6%. Definitive, sourced, shareable.
- **"Where LDS singles actually live outside Utah"** — the diaspora table above. Genuinely surprising; this is the one most likely to get picked up.
- **"LDS congregations by metro: the full list"** — all 869, sortable. Reference page, accumulates links forever.

### C. The sleeper query type

**"How many Latter-day Saints live in [metro]?"** is informational, high-intent-adjacent, and we hold the authoritative sourced answer for 869 metros. It puts us in front of exactly the right audience at the top of the funnel, and the page pivots naturally into the dating content.

I have no search-volume data to size this — **GSC will tell us within weeks of verification, and that is the cheapest possible validation.** Treat it as the top hypothesis to check, not a measured fact.

---

## What NOT to build

**Not 869 pages.** Google's scaled-content-abuse policy targets template-with-variable-substitution at scale; documented enforcement runs 60–90% ranking loss with **no Search Console message**. The differentiator is section 2 of the metro template — the per-metro interpretation. If a page's only unique content is the numbers in the table, it is a doorway page.

Ship **8–12 hand-finished metro pages**. The full 869 live as rows on the type-B reference page, not as URLs.

---

## The countdown ("% of the way there")

Already a decided feature (T16 revised). Metro pages are its home. But `waitlist` currently holds **2 rows**, and `model-rules.md` Scenario C rule 4 is explicit: *"Never show a countdown timer to nothing."* Show the counter above a floor; below it, Scenario C copy ("You're early to [area]" + invite CTA). **The floor is Charles's number to set — I am not inventing one and calling it derived.**

---

## The singles overlay — RESOLVED, no API key needed

Charles's Census key never activated (API returns `invalid_key.html`). Not needed: the ACS 5-year **table-based Summary File** is keyless bulk download —
`https://www2.census.gov/programs-surveys/acs/summary_file/2023/table-based-SF/data/5YRData/acsdt5y2023-b12002.dat`
(323 MB, one file per table; metro rows are `GEO_ID` prefix `310M700US`, geography lookup in `documentation/Geos20235YR.txt`). Table B12002, never-married ages 20–34, summing `E006/E007/E008` (male) and `E099/E100/E101` (female).

Saved: `data/acs-nevermarried-20-34-2023.csv`, and joined to the Religion Census in `data/metro-pages-data.csv`.

### The seven approved metros

| Metro | LDS congs | LDS adherents | % of pop | Never-married 20–34 |
|---|---:|---:|---:|---:|
| Salt Lake City-Murray, UT | 1,476 | 653,868 | 52.0% | 169,697 |
| Provo-Orem-Lehi, UT | 1,356 | 554,604 | 82.6% | 88,092 |
| Phoenix-Mesa-Chandler, AZ | 617 | 301,196 | 6.2% | 691,293 |
| Boise City, ID | 265 | 115,016 | 15.0% | 89,916 |
| Washington-Arlington-Alexandria | 134 | 72,147 | 1.1% | 898,116 |
| New York-Newark-Jersey City | 107 | 62,194 | 0.3% | 2,982,294 |
| Rexburg, ID | 97 | 35,114 | 53.0% | 11,770 |

(CBSA names differ slightly between sources — 2020 Religion Census says "Provo-Orem" / "Salt Lake City", 2023 ACS says "Provo-Orem-Lehi" / "Salt Lake City-Murray". Same CBSA codes, 39340 and 41620.)

---

## ⚠ The sex-ratio trap — do not ship the raw Census ratio

ACS gives never-married women per 100 men, ages 20–34: **Provo-Orem 76.3, Boise 77.0, SLC 78.8, Phoenix 82.3, Rexburg 88.5, DC 92.6, NYC 93.4.** Read naively, that says Utah has a surplus of single *men*.

**Publishing that on an LDS dating page would be wrong and would contradict our own product thesis.** It measures all never-married residents regardless of religion. Among *active Latter-day Saints* the ratio runs hard the other way — ARIS / Trinity College work (Phillips, Cragun, Kosmin) puts Utah's LDS gender ratio around 60:40 female-to-male, roughly 150 women per 100 men, because men leave the faith at higher rates. Utah has more men than women overall *and* a large surplus of single LDS women. Both are true; they are different populations.

Use Census counts for **pool size only**. For the gender skew, cite the LDS-specific research explicitly and at the level it was measured (state, not metro).

**And the gap between the two ratios is the single best content idea we have.** "Utah County has 76 never-married women per 100 never-married men overall — but among active Latter-day Saints it runs the other way, closer to 150 to 100. Here is why, and what it means for you." Counterintuitive, sourced, nobody has written it well, and it sets up the women-first mechanic without arguing for it.

---

**Synopsis:** We now hold LDS congregation + adherent counts for all 869 US metros, sourced and citable, saved at `data/lds-metro-density-2020.csv`. Build 8–12 hand-written metro pages (not 869) plus three ranking pages as link magnets. The non-obvious call: weight toward diaspora metros — Phoenix has 617 congregations and LA has more adherents than Boise, the SERPs there are empty, and that market is exactly where a brokered introduction beats a swipe feed.

---

## ADDENDUM 2026-08-22 — the full US metro roster, in waves

Charles asked for the strategy across *major US metros* (and the top-10 countries — that half lives in `specs/organic-search-international.md`). The 8–12-page ceiling above stands per wave, not forever; the roster grows only when GSC proves the prior wave ranks.

**Wave 1 — eight metros + the three type-B ranking pages.** The seven approved metros **plus Philadelphia** (Charles, 2026-08-22: "I do want philly and dc" — DC was already wave 1; Philly added despite its modest numbers: 37 congregations, 18,600 adherents, 0.3%). SHIPPED 2026-08-22 as `/lds-singles/*`.

**Wave 2 — the diaspora eight** (gate: wave-1 pages earning impressions in GSC): Los Angeles, Las Vegas, Dallas–Fort Worth, Seattle, Houston, Portland, Ogden–Clearfield, St. George. All from the diaspora/adjacent tables above; each has ≥83K adherents or ≥64% share. LA alone has more adherents than Boise and no good page exists for it.

**Wave 3 — the long tail** (gate: ≥3 wave-2 pages ranking page 1–2 for "lds singles [city]"): Logan, Idaho Falls, Riverside–San Bernardino, Sacramento, San Francisco, Denver, Atlanta, Chicago. Stop at ~25 metro URLs total, ever — beyond that the per-metro interpretation can't stay genuinely distinct and we're building doorway pages.

**Keyword architecture per metro page:** primary "lds singles [city]"; secondaries "lds dating [city]", "latter-day saint singles [city]". The word "Mormon" still carries real query volume but is against the Church's style guidance and off-brand for the audience — capture it with one FAQ entry ("Is this a Mormon dating site?") + FAQPage schema, never in titles or H1s.

**Technical checklist (once, with wave 1):** `/lds-singles/` hub page linking all metro + ranking pages; metro pages in the sitemap; Dataset schema on the type-B reference table, FAQPage on metro pages; breadcrumbs. All measurement is gated on the Search Console DNS TXT record (still open in EXECUTION.md STATE).

---

## PARKED — LDS singles per metro (Charles's static-rate method)

The metro table above puts LDS adherents next to all-population never-married counts. **Those columns are not comparable** — NYC's 2.98M never-married 20–34 is the whole city, while its LDS single pool is a subset of 62,194 adherents. Do not ship that table as-is.

Charles's fix: derive one static LDS-single rate per age decile nationally and apply it to each metro's adherent count.

Inputs gathered so far:
- **LDS adherents nationally (2020 Religion Census):** 6,721,031 across 14,567 congregations — 2.03% of US population.
- **US never-married (ACS 2023 5-yr, all religions):** 20–29 = 34,570,110; 30–39 = 16,797,698.
- Still needed: LDS age distribution and never-married share by decile. Pew's Religious Landscape Study (2023–24 refresh) publishes both by religious tradition; the numbers were not pulled before this was parked.

Method when resumed: `LDS_singles(metro, decile) = LDS_adherents(metro) × LDS_share_in_decile × LDS_never_married_rate_in_decile`. Label the output an estimate and show the derivation — it is a modeled number, not a measured one.
