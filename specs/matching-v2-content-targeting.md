# Content Targeting — design under the "build for 10k" rule

**Supersedes** `specs/matching-v2-reader-archetypes-brief.md` §4 and the "logged only" downgrade I applied to it on 2026-08-24.
**Commissioned by:** Charles, 2026-08-24 — *"we don't need to only test at launch. we're building for our first 1k and 10k users, too. so don't worry too much what is immediately detectable. we want success."*
**Evidence base:** `specs/research-pitch-demand-findings.md` (craft dominates at N≈50) · decision memo F2 (Montoya) and corrected F4 (Matz).

---

## 1. The rule this establishes

> **Sort every design decision by whether it can be backfilled.**
> **Randomisation and raw measurement cannot be backfilled — do them now, regardless of current power.**
> **Derived scores, dashboards, models and analyses can be backfilled — build them when the data justifies it.**

"We can't detect it yet" is an argument for postponing the *analysis*. It is never an argument for dropping the *randomisation*. A logged-but-unrandomised factor is not a weak experiment; it is no experiment, permanently — at 10,000 users the log is still confounded and the question is still unanswerable.

Corollary: **pre-register on an event-count gate, not a calendar window.** An underpowered launch should produce a pending readout, not a forgotten question.

This rule applies beyond this document. Anything in v2 that is a coin-flip we could be making now, we make now.

---

## 2. The aiming variable was wrong, and fixing it makes the factor better-founded

The withdrawn proposal aimed content at the reader's **asset preference**, measured by a redesigned taste step. The research killed it correctly: the eight-asset taxonomy is unsupported as a reader classifier, and Sparks et al. (2020) found possessing someone else's stated ideals predicted romantic interest as well as possessing your own.

**But Sparks' null is about stated ideals — "does this person match what I said I want."** That is a different construct from **actual similarity — "are we alike"** — and the second one has the strongest surviving evidence in our whole file: Montoya et al.'s meta-analysis, 313 studies, actual similarity → attraction at **r ≈ .47 in no-interaction settings**, which is exactly what an intro card is (decision memo F2). F2 was not touched by the pitch-demand research.

So the better-founded targeting variable is not *what this reader likes in a pitch*. It is:

> **Does the pitch lead with a point where this pair is actually similar?**

Dane's 8am trailhead leads for a reader whose own last three Saturdays were trailheads. Not because she prefers outdoorsy content — because it is a point of real overlap. (Precision note from the research session: the r ≈ .47–.59 is behind *similarity levels* in lab-attitudinal studies, not behind lead placement — no study tests whether surfacing a true overlap first beats leading with the best material. `similarity_lead` is **mechanism-consistent, not mechanism-demonstrated**; E-CONTENT registers it that way, with a small expected effect.)

Three things recommend this over the withdrawn version:
1. **No new instrument.** The milieu block is already collected on both sides. The taste step stays a style + pickiness instrument, exactly as `matching_algo-v2.md` §5 originally specced.
2. **Better evidence.** It rides F2 (untouched, large, and specific to no-interaction settings) rather than F4 (corrected, click-null) or an invented taxonomy.
3. **It is a pair-level variable, not a person-type.** Nothing has to be true about the reader as a kind of person — which is what all three archetype candidates failed at.

---

## 3. The factor

```
similarity_lead ∈ { aimed, random }          randomised 50/50 per pitch, from day one

  aimed  → the pitch's leading concrete detail is drawn from a milieu dimension
           where reader and subject match (Q1 tribe, Q3, Q6, Q13, Q14, Q15, Q20, Q19 education)
  random → the leading detail is drawn uniformly from the subject's available material,
           ignoring overlap
```

If a pair has **no** milieu overlap, `aimed` is undefined — log `aimed_unavailable` and fall back to `random`, so the analysis can condition on it. Overlap availability correlates with `milieu_sim`, which is already logged per §9; the analysis must control for it or it will confound the sort term with the content term.

**Logged on `pitch_events`:** `similarity_lead`, `lead_dimension`, `overlap_dimensions[]`, `aimed_unavailable`, alongside the existing `milieu_sim`, `score_base`, `score_with_milieu`.

**Readout gate:** ~3,400 pitch events with actions, **or** 1,000 onboarded users, whichever first. Not a calendar window. Pre-registered as its own experiment (**E-CONTENT**), separate from E-STYLE and E-MILIEU.

---

## 4. What this costs the launch readout — less than I previously said

Adding an orthogonal, balanced binary factor to a factorial design barely affects power on the **main effects** of the other factors: angle and content-lead effects are estimated across both its levels. The cost falls almost entirely on interactions *involving* the new factor, which we are not trying to estimate at launch and have explicitly gated.

T-SIM should still be re-run with the factor injected — but the acceptance question changes. It is no longer "does adding this break S1/S2 at 1,200 events." It is **"does the main-effect recovery for angle and lead survive its addition."** If it does, ship it randomised. If it doesn't, that is a genuine finding about the launch design and worth knowing either way.

---

## 5. H1/H2 are pre-registered, not demoted

The corrected F4 means H1 and H2 (high-O readers → `self_expansion`/`i_sharing`; high-E → `i_sharing`, low-E → `comfort`) cannot be read out at launch. Under the rule in §1 that is a reason to **gate the readout**, not to stop collecting.

- Keep both hypotheses in the E-STYLE pre-registration, with the directional predictions unchanged.
- Change the window from 6 weeks to an **event-count gate**, with the realised MDE from T-SIM written into the registration so the pending state is honest rather than hopeful.
- The Big Five block therefore stays in the instrument at 9 items — and it cannot be backfilled anyway without forking `instrument_version` and re-onboarding everyone.

H3 (interest-led beats character-led) and H4 (position-3 drift) are **main effects** and stay on the original window. The style experiment is intact; two of its four hypotheses simply mature later.

---

## 6. RESOLVED by the research session (2026-08-24; merged 2026-09-02)

The bounce-back was answered — see `specs/research-pitch-demand-findings.md` F5 amendment and ranked-variable entry 8. Verdict: **§2 stands.** The Sparks unique-fit null is about stated-ideal matching (universally-valued traits, which is why anyone's list predicts equally); pair actual similarity is irreducibly pair-relative and does not fall to it. `similarity_lead` therefore registers as a hypothesis *with* a mechanism — subject to the §2 precision note above, and to two design requirements the evidence forces:

1. **Craft parity between arms.** The aimed cell constrains the lead to overlap material, which may be weaker than the subject's best material. Matching amplifies argument quality in both directions (Teeny et al. 2021), so an aimed lead on weak material underperforms *for craft reasons* and would masquerade as a similarity null. Identical critic threshold in both arms; log critic score per arm; check balance in the readout.
2. **Log realized overlap in the random arm** (`lead_dimension ∈ overlap_dimensions`). The random arm matches by chance, diluting the assigned contrast; analyze by realized overlap-of-lead with assignment as the instrument to recover the power.

Recognition caveat for the aiming dimensions: Rule 9 bars reader reference, so the reader must recognize the overlap unaided — prefer identity-salient dimensions (Q1 tribe, banter register) over demographically-flavored ones (Q19 education) when choosing which overlap leads.
