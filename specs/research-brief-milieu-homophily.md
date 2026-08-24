# 🔫 RESEARCH BRIEF — Milieu homophily: does a D&D player attract a knitter?

**For:** a dedicated research session. **Commissioned by Charles 2026-08-24.**
**This is research, not a build. No code. The deliverable is a findings memo.**
**This is a SORT question.** Everything else currently open in matching v2 — angles, leads, register, sample pitches, content targeting — is a *pitch* question. Keep them separate; this brief is only about **who gets surfaced to whom**.

---

## 0. The question, in Charles's words

> *"i think we also might have to greatly expand our milieu research. like how well does a D&D player attract a knitter? etc. i have no idea how to approach this yet"*

PLY's whole thesis rests on **milieu** — Charles's "same game" idea: theatre kids, intellectuals, jocks-and-normies show up differently to a date and need to share a world. That intuition is currently implemented as `milieuSimilarity()` in `matching_algo-v2.md` §9, where **half the weight is exact-match on nominal quiz options**:

```
sim = 0.5·(share of M-block exact matches)
    + 0.2·eduAdjacency
    + 0.2·(1 − |politics gap| / 4)
    + 0.1·(H3 match)          — all weights are starting values (SV)
```

Under that function a D&D player and a knitter score **zero** milieu overlap. The question is whether that's correct or whether it's a modelling error that will quietly suppress good matches.

---

## 1. The hypothesis to attack

This is the commissioning session's guess. **Treat it as the thing to kill, not the thing to confirm.** The last brief in this series was commissioned the same way and correctly destroyed the hypothesis it was handed; that was the most valuable outcome available and it is again.

> **Mode over content.** Milieu compatibility may be about the *mode* of engagement rather than its *content*. A D&D player and a knitter may be highly compatible — both are deep-hobby people who make things, have opinions about materials, attend gatherings of the obsessed, and lose whole Saturdays. The content is unrelated; the relationship to a hobby is identical. On this framing the bad pairing is not D&D-vs-knitting but **deep-hobbyist vs. someone with no consuming interest at all** — a mismatch invisible to any content-based similarity measure.

Two supports to verify or dismiss, both of which may be the commissioner's flavour of guess rather than evidence:
- **Bourdieu / cultural capital**, and the **cultural omnivore** literature that followed (Peterson & Kern) — the claim that the meaningful social division is *how* people engage with culture, not *which* culture.
- **Stebbins' serious leisure perspective** — a real construct distinguishing serious leisure (amateur/hobbyist, marked by perseverance, a career trajectory, personal effort, durable benefits, a unique ethos and strong identity) from casual leisure. This is precisely the D&D/knitter commonality if it holds up.

Note that PLY's own battery may already capture mode better than content: **Q13** ("elbow-deep in something I was making or fixing") and **Q14** ("something I made" / "the gear" / "an instrument") describe a *relationship to an activity*, not the activity itself.

---

## 2. Questions to answer

Each answer needs sources, effect sizes where they exist, a confidence level, and a **"so for PLY."** "The literature does not answer this" is a finding — say it where it's true.

**Q1 · Interest and subculture homophily, net of the structural axes.** How much does shared *specific interest* predict attraction, relationship formation, or satisfaction **after controlling for** education, religion/religiosity, politics, SES and age (our F3 axes)? Is there any incremental effect, or does shared interest simply proxy for the structural variables?

**Q2 · The mode hypothesis.** Is there evidence that similarity in *engagement mode* — depth of involvement, maker vs consumer, specialist vs omnivore, planner vs spontaneous — predicts attraction over and above content similarity? Assess Bourdieu, the omnivore literature, and Stebbins' serious/casual leisure distinction. **Has anyone actually tested mode-similarity against content-similarity head to head?** If nobody has, say so plainly — that makes it an untested hypothesis PLY could be the first to test, which is a different and more honest status than "supported."

**Q3 · Usable outcome data.** Where is there real data with real decisions attached? Candidates worth chasing: OkCupid's published matching-question work (Rudder / *Dataclysm* / the OkTrends analyses, including their stated-importance weighting), the public **Columbia speed-dating dataset** (Fisman, Iyengar, Kamenica & Simonson — it contains a shared-interests correlation measure alongside actual yes/no decisions), and academic dating-app research on shared-interest matching. Report what the data show, and be explicit about what is peer-reviewed versus a company blog post.

**Q4 · Actual vs perceived similarity, decomposed.** Our F2 (Montoya et al., 313 studies) says actual similarity drives attraction at r ≈ .47 in no-interaction settings, while perceived similarity carries everything after interaction. **Which attributes' actual similarity carries that pre-interaction effect?** Attitudes, values, activities, personality, demographics — the meta-analysis has moderators. This directly determines what the sort should weight.

**Q5 · Is exact-match the wrong operator?** Our function scores exact matches on nominal options. What does the evidence suggest instead — distance in a latent space, shared-mode coding, hierarchical categories where "maker" and "outdoors" are closer than "maker" and "homebody"? And are there dimensions where **complementarity beats similarity**? The general "opposites attract" claim is largely discredited, but check whether any dimension (dominance/submissiveness is the usual candidate) survives.

**Q6 · Where does homophily stop helping?** Is there an optimum — a point where too much similarity predicts *worse* outcomes because there's nothing to learn from the other person? This matters because **PLY has a live theoretical conflict**: the milieu term rewards similarity while `self_expansion` — one of our four pitch angles — is built on Aron's self-expansion model, which says novelty and growth are attractive. Is the tension real, and does the evidence say which dominates and when?

**Q7 · Scale.** What is detectable at ~50 users in one metro, at 1,000, at 10,000? Apply the house rule already established: **randomisation and raw measurement cannot be backfilled and should be done now regardless of current power; derived scores and analyses can be.** What should PLY be *logging* from day one to answer this later?

**Q8 · The concrete recommendation.** What should the milieu function be? If the 0.5 exact-match term is wrong, what replaces it — and critically, **can the replacement be computed from the existing 22-item battery?** Instrument changes fork `instrument_version` and re-onboarding is not an option, so a recommendation derivable from items we already ask is worth far more than one requiring new questions. If new items are genuinely necessary, name them and say what they displace inside the 22-item envelope.

---

## 3. Deliverable

`specs/research-milieu-homophily-findings.md`:

1. **Headline answer, first paragraph.** Does a D&D player attract a knitter? Commit to a position.
2. **Findings F1–F8**, one per question, with sources, effect sizes, confidence and "so for PLY".
3. **Verdict on the mode hypothesis** — supported / untested / contradicted. If untested, say what PLY would have to measure to test it first.
4. **A concrete `milieuSimilarity()` recommendation**, with every weight either derived and shown, or explicitly labelled a starting value. Never present an invented constant as derived.
5. **What to log from day one** so this is answerable at 1k and 10k even if it isn't at 50.
6. **What the literature cannot tell us**, and what PLY must measure itself.

Rules: verify everything, cite links, never give an effect size without its study context. Distinguish field studies from lab studies from company blog posts. Where literatures disagree, present both and say which applies to our case. **Do not resolve a disagreement by picking whichever side flatters the existing design or the commissioning hypothesis.**

---

## 4. Context files (read, don't rewrite)

| file | why |
|---|---|
| `matching_algo-v2.md` §9 | the milieu function as it stands — the thing you may be overturning |
| `matching_algo-v2.md` §2, §3 | what the sort already does: hard filters, Elo band, location tiers, T7 attraction priors |
| `specs/matching-v2-decision-memo.md` §0, §1 F1–F3, F5 | Charles's "same game" definition in his own words, and the homogamy evidence base |
| `specs/matching-v2-questionnaire-battery-v1.md` (rc8) | the 22 items that are the only available inputs — note Q13/Q14 capture mode, not content |
| `specs/research-pitch-demand-findings.md` | the companion brief's method and standard of proof; also why the *pitch* side is now a craft problem |
| `specs/matching-v2-content-targeting.md` §1 | the backfill rule that governs the Q7 answer |
| `tasks/lessons.md` (2026-08-23 and 2026-08-24 entries) | how the last three of these went wrong — invented taxonomies, wrong problem class, designing for launch detectability |

**Constraints on any recommendation:** the matching model is frozen (`EXECUTION.md` §0.4) — changes ship only with Charles's explicit approval, one variable per commit, behind the existing `MILIEU_WEIGHT` flag with dual-score logging. Launch is one metro at 40–60 people, so distinguish sharply between what matters at that scale and what matters at 10k.

---

## 5. Launch prompt

```
🔫 Research brief: milieu homophily — does a D&D player attract a knitter? No
code, no build. The deliverable is a findings memo.

git fetch origin && git checkout -b <your-branch> origin/session/s-0822-1436

Read specs/research-brief-milieu-homophily.md first — it IS your brief. Follow
its §2 questions and §3 deliverable exactly. Then the seven context files in §4.

This is a SORT question — who gets surfaced to whom. Everything else open in
matching v2 is a PITCH question. Do not drift into pitch copy, angles, or the
taste step.

The hypothesis you are handed is the commissioner's guess and your job is to
attack it: "milieu compatibility is about the MODE of engagement, not the
CONTENT — a D&D player and a knitter are both deep-hobby makers, and the real
mismatch is deep-hobbyist vs someone with no consuming interest." Check it
against Bourdieu/cultural capital, the cultural omnivore literature, and
Stebbins' serious-leisure construct. If nobody has tested mode-similarity
against content-similarity head to head, SAY SO — "untested hypothesis" is a
completely different status from "supported," and conflating them is how the
last two of these went wrong.

Chase real outcome data: OkCupid's published matching-question work, the public
Columbia speed-dating dataset (Fisman/Iyengar/Kamenica/Simonson — it has a
shared-interests correlation variable alongside actual yes/no decisions), and
academic dating-app research on shared-interest matching.

The live conflict worth resolving in Q6: our milieu term rewards similarity,
while our self_expansion pitch angle is built on Aron's self-expansion model
which says novelty is attractive. Is that tension real?

Q8 is what Charles will actually use: a concrete milieuSimilarity() recommendation,
every weight either derived-and-shown or explicitly labelled a starting value.
Strongly prefer something computable from the existing 22-item battery —
instrument changes fork instrument_version and we cannot re-onboard anyone.

Verify everything with sources. Distinguish field studies from lab studies from
company blog posts. Where literatures disagree, present both — and do NOT resolve
it by picking whichever flatters the existing design or the hypothesis above.

Write specs/research-milieu-homophily-findings.md, commit, push your branch, and
report the headline answer inline in chat. Charles reads the chat, not the file.
```
