# 🔫 RESEARCH BRIEF — What makes a pitch card get fired

**For:** a dedicated research session (Opus 5 or GPT-5.5 via Codex for the literature sweep). **Commissioned by Charles 2026-08-23.**
**This is a research brief, not a build. No code. The deliverable is a findings memo.**

---

## 0. The reframe that commissions this

PLY's intro card is a **creative asset**. A 🔥 fire is a **click**. So the governing question is direct-response advertising, not mate selection:

> **What makes a 3–4 sentence card about a stranger get clicked — and how much of that is craft versus targeting?**

The prior session got this wrong. It reasoned from mate-preference research (pair attraction is unpredictable; stated preferences don't predict in-vivo behaviour), concluded that no useful taxonomy of readers exists, and filled the hole with an **invented** eight-asset taxonomy plus a made-up illustration (Anne the fashion student responds to "the noticing", Jessica the gourmand responds to "the long thing"). Charles's response is the reason this brief exists:

> *"we're not trying to engineer matches, we're trying to engineer DEMAND and ctr, you know?"*
> *"is that really what people are responding to? do jessica and anne differ really that much?"*

**Treat the eight-asset taxonomy and the Anne/Jessica claim as hypotheses to attack, not as premises.** If the evidence says variance lives in craft rather than in reader targeting, say so plainly — that is the most useful finding this brief could return.

---

## 1. The live controversy to resolve

Two well-evidenced positions point opposite ways, and PLY's architecture depends on which is closer to right at our scale.

**Position A — targeting works, and it's big.** Matz, Kosinski et al. (PNAS 2017): 3.5M people, real field experiments, ads framed to the recipient's extraversion or openness produced **up to 40% more clicks and 50% more purchases** than mismatched framing — using coarse, noisy trait proxies. This is already `specs/matching-v2-decision-memo.md` F4 and it is the entire justification for the reader instrument.

**Position B — targeting is mostly illusory; creative quality and reach dominate.** The Ehrenberg-Bass / Byron Sharp tradition argues buyers of competing brands are largely undifferentiated and segmentation is mostly an artefact; the Binet & Field / IPA databank tradition finds creative quality and emotional priming dominate measured business effects.

**The question is not who is right in general.** It is: **for a short piece of person-descriptive copy, how large is the reader × content interaction relative to the creative-quality main effect?** If craft dominates, PLY should spend its budget on making every pitch excellent and stop trying to aim them. If the interaction is real and sizeable, content calibration is the product.

---

## 2. Questions to answer

Each answer must carry **"so for PLY"** and a confidence level. Say "the literature does not answer this" where true — that is a finding.

**Q1 · Resolve Matz vs Ehrenberg-Bass.** What is the measured effect size of message-to-person matching in real field experiments, and under what conditions does it hold or vanish? Has Matz replicated? What are the strongest critiques? Does the effect survive when creative quality is held constant?

**Q2 · Peter Fader.** Charles asked specifically. What does Fader's work contribute here — latent heterogeneity models (Pareto/NBD, BTYD), customer centricity, his critique of personas and segmentation? Note his position that heterogeneity is **real but continuous**, and assess whether that argues for a continuous preference vector over named archetypes. Does he have anything on *creative* response, or only on value and propensity?

**Q3 · Archetypes with measured conversion.** Charles: *"don't we have marketing archetypes for how people see themselves with measured conversion rate success?"* Find out. Are there brand/persona/archetype systems with published conversion or lift data attached — or is the archetype literature entirely unmeasured? Look at VALS, PRIZM/Mosaic, Jungian brand archetypes, System1's emotional testing databases, regulatory-focus fit, construal-level fit. **Distinguish sharply between frameworks with measured lift and frameworks that merely sound explanatory.**

**Q4 · Large-N headline and creative experiments.** What are the measured, transferable variables from large-scale click experiments? Start with the **Upworthy Research Archive** (~32,000 headline A/B experiments, ~150,000 headlines, publicly released) and comparable email-subject-line and thumbnail/title corpora. Which effects are robust, which are context-bound, and **which plausibly transfer to a 3–4 sentence card describing a real person** — bearing in mind our nine tone rules forbid rhetorical questions, superlatives, sentiment closes, and any narrator voice.

**Q5 · Dating-specific.** Anything with measured outcomes on what makes a profile or a message get a like/reply. Distinguish photo effects from text effects. What predicts *text-driven* response once photos are controlled?

**Q6 · Framing fit.** Evidence with measured lift for message-framing matches: regulatory focus (promotion/prevention), construal level, emotional vs rational appeals, self-referencing. Are these better-evidenced targeting axes than personality traits?

**Q7 · The Goodhart problem.** What does the literature say about engagement-optimised creative and downstream satisfaction — clickbait lift versus regret, unsubscribes, bounce? PLY has a real cost here: Rule 1 makes a photo-stage rejection permanent, so a fire that ends in a pass burns the pair forever. Our guardrail is already designed (photo-interest-given-fire by angle, G2). Is it the right one?

**Q8 · Heterogeneity, decomposed.** Separate three things the prior session ran together: (a) heterogeneity in **propensity** (some readers fire more — almost certainly real and Fader-shaped), (b) heterogeneity in **response to creative variation** (the contested one), (c) the **subject** main effect (some people are just more appealing). What do the data say about the relative size of each? T-SIM already assumes candidate variance dominates reader variance — is that assumption supported?

---

## 3. Deliverable

`specs/research-pitch-demand-findings.md`:

1. **Headline answer, first paragraph.** Is the reader × content interaction worth engineering at N≈50 readers and ~1,200 events, or should PLY spend everything on craft? Commit to a position.
2. **Findings F1–F8**, one per question, each with sources, effect sizes where they exist, confidence, and "so for PLY".
3. **Verdict on the eight-asset taxonomy** — supported, partially supported, or unsupported. If unsupported, propose what should replace it, grounded in measured work rather than intuition.
4. **Verdict on the Anne/Jessica claim** specifically. Do two readers with different tastes differ enough in *what content converts them* to be worth targeting, or is that an intuition with no evidence behind it?
5. **A ranked list of testable copy variables** for the pitch generator — things with measured effect elsewhere that survive our tone rules and could be randomised in Phase R.
6. **What the literature cannot tell us**, and what PLY would have to measure itself.

Rules: verify everything, cite links, never present an effect size without its study context. Distinguish field experiments from lab studies from vendor white papers, and say which is which. Where two literatures disagree, present both and say which applies to our case and why. **Do not resolve a disagreement by picking the one that flatters the existing design.**

---

## 4. Context files (read, don't rewrite)

| file | why |
|---|---|
| `specs/matching-v2-decision-memo.md` §1 | F1–F7, the existing evidence base, incl. Matz as F4 |
| `matching_algo-v2.md` §6 | the four angles, two content leads, and the nine tone rules any recommendation must survive |
| `specs/matching-v2-story-elicitation.md` | the eight assets — **the thing you are attacking** |
| `specs/matching-v2-reader-archetypes-brief.md` | the proposal built on them, including the taste-step redesign |
| `specs/matching-v2-test-plan.md` §4 | T-SIM, the power constraint any new factor must survive |
| `tasks/lessons.md` (2026-08-23, framing entry) | how this went wrong the first time |

---

## 5. Launch prompt

```
🔫 Research brief: what makes a PLY pitch card get fired. No code, no build —
the deliverable is a findings memo.

git fetch origin && git checkout -b <your-branch> origin/session/s-0822-1436

Read specs/research-brief-pitch-demand.md first — it IS your brief, follow its
§2 questions and §3 deliverable exactly. Then the five context files in its §4.

The core reframe: PLY's intro card is a creative asset and a 🔥 fire is a click,
so this is a direct-response advertising question, not a mate-selection one. A
prior session framed it as mate selection, concluded no useful reader taxonomy
exists, and invented an eight-asset taxonomy plus an "Anne vs Jessica" story to
fill the gap. Charles pushed back: "we're not trying to engineer matches, we're
trying to engineer DEMAND and ctr" and "do jessica and anne differ really that
much?"

Your job is to attack that taxonomy with evidence, not to elaborate it. The
single most valuable thing you can return is "the variance is in craft, not in
targeting — stop aiming and make every pitch excellent," IF that is what the
evidence says.

Central controversy to resolve: Matz/Kosinski (PNAS 2017, 3.5M people,
personality-matched ads → up to 40% more clicks) versus the Ehrenberg-Bass /
Byron Sharp position that segmentation is largely illusory and reach plus
creative quality dominate. Which applies to a 3–4 sentence card about a person,
at a scale of ~50 readers and ~1,200 events?

Charles specifically asked about Peter Fader and about whether any marketing
archetype system has measured conversion data attached. Answer both directly.
Also mine the Upworthy Research Archive (~32k headline A/B experiments,
publicly released) and comparable large-N click corpora for transferable
variables — bearing in mind our tone rules forbid rhetorical questions,
superlatives, sentiment closes and narrator voice.

Verify everything with sources and links. Distinguish field experiments from
lab studies from vendor white papers. Where two literatures disagree, present
both — and do NOT resolve it by picking whichever flatters the existing design.

Write specs/research-pitch-demand-findings.md, commit, push your branch, and
report the headline answer inline in chat. Charles reads the chat, not the file.
```
