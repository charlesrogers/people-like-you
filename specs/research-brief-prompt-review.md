# 🔫 REVIEW BRIEF — Adversarial review of all 102 voice prompts

**For:** a dedicated review session. **Commissioned by Charles 2026-08-24.**
**No code, no build.** The deliverable is a per-prompt verdict table plus rewrites for whatever fails.

---

## 0. Why this exists

The commissioning session wrote the elicitation theory, wrote 47 fished prompts against it, then audited and rewrote the 55-prompt bank against it — and **self-reviewed badly.** It graded `laugh_hardest` ("Tell us about the last time you laughed so hard you couldn't breathe") as one of the two best prompts in the bank and made it the model for 30 rewrites. Charles killed it in one line:

> *"i am not sure people are going to remember the last time they laughed so hard (also how would we use that to make someone sound great to a potential match?????!!?!?"*

He is right twice. The bank's own example answer for that prompt is *"My roommate tried a backflip into the pool, grabbed the fence, the fence broke, and he fell in sideways"* — **a story about a roommate.** Vivid, well-told, and completely useless for describing the person who told it.

**Two failure modes the existing rules do not catch, and which you are here to catch:**

**A · Retrievability.** "The last time X" demands a search-and-verify over autobiographical memory that people cannot perform — recall returns the most *available* episode, not the most recent. "A time X" returns the most vivid instance, which is what we actually want. Several prompts, old and rewritten, ask for "the last time" of something nobody indexes that way.

**B · The protagonist test.** All four pitch angles are feeling contracts **about the subject**. A prompt whose typical answer casts the answerer as a *witness*, an *audience*, or a *victim of someone else's antics* produces material about a third party. No amount of craft converts that into a pitch. Every one of the six elicitation rules optimises narrative *quality*; none checks narrative **ownership**.

---

## 1. Scope — 102 prompts

| set | count | file |
|---|---|---|
| bank v2 (17 unchanged + 30 rewritten + 8 replacements) | 55 | `specs/matching-v2-prompt-bank-v2.md` |
| fished prompts (every option of the 11 seeding items) | 47 | `specs/matching-v2-voice-prompt-map.md` §4 |

Review **all 102**, including the 17 the previous session passed unchanged — its judgement is exactly what's in question.

---

## 2. The method — simulate, then try to write the pitch

Do not review these by reading them and forming an opinion. That is what failed. **Generate the evidence.**

For each prompt:

1. **Simulate three answers**, 30–45 seconds of speech each, from three different plausible members of PLY's pool (mid-20s to mid-30s, one metro, mixed gender, mixed how-talkative). Write them as a real person would actually speak — with the digressions, the "I don't know", the trailing off. Do not write the ideal answer. Write the **modal** answer.
2. **Grade retrievability**: could a real person produce this answer within about five seconds of thinking? If the prompt requires exhaustive search ("the last time…", "the most…", "the best…"), mark it.
3. **Apply the protagonist test**: in each simulated answer, who is the protagonist? The answerer, or someone/something else?
4. **Then try to write one pitch sentence** about the answerer, from that answer, obeying the nine tone rules in `matching_algo-v2.md` §6.5. **If you cannot write a sentence that would make a stranger want to meet this person, the prompt fails** — regardless of how good the story is.
5. Record which of the four angles (`self_expansion`, `i_sharing`, `admiration`, `comfort`) the material could feed, if any.

That fourth step is the acid test and it is Charles's question made executable: *how would we use this to make someone sound great to a potential match?*

---

## 3. Criteria (all nine — the previous six plus the two new ones)

| # | criterion | fails when |
|---|---|---|
| 1 | **Protagonist** *(new)* | typical answer makes the answerer a witness, audience, or bystander |
| 2 | **Retrievability** *(new)* | requires exhaustive search or superlative ranking; "the last/most/best time" |
| 3 | **Pitchable** | you cannot write a usable pitch sentence from the modal answer |
| 4 | **One occasion** | admits a categorical or plural answer |
| 5 | **Entry point** | doesn't say where to start |
| 6 | **Thing not feeling** | asks how it felt, what it meant, or what they needed |
| 7 | **Breach available** | no room for what went wrong or surprised |
| 8 | **No impressive/vulnerable gate** | "proudest", "hardest", "best", or requires a confession |
| 9 | **Answerable in 45s, not in one sentence** | too big or too small |

A prompt failing **1, 2, or 3** dies or gets rewritten — those are disqualifying. Failing 4–9 is a fixable defect.

---

## 4. Deliverable

`specs/prompt-review-findings.md`:

1. **Headline: how many of the 102 survive.** Give the number in the first line.
2. **Verdict table** — one row per prompt: id · set · pass/fix/kill · which criteria failed · which angles its material can feed.
3. **The simulated answers** for every prompt that failed, so the verdict is auditable rather than asserted.
4. **Rewrites** for everything marked fix, each re-tested by the same simulate-then-pitch method.
5. **Replacements** for everything killed, holding tier balance constant (`ONBOARDING_WEIGHTS` in `src/lib/prompts.ts` must not need to change) — and for fished prompts, holding the option→prompt mapping complete, since every answer option needs one.
6. **Angle-coverage check.** After all changes, can every angle still be fed? `i_sharing` was already the thinnest tier and the protagonist test may cut into it hardest, since humour and taste prompts are the most likely to be about something the person *witnessed*.
7. **A verdict on the example answers.** The bank's `exampleAnswer` strings sit directly under each prompt and several model the exact failure — `recharge`'s is *"No alarm, coffee on the porch, zero plans. That's how I come back to life,"* a summary with a sentiment close. They teach the wrong behaviour twice over. Grade them and rewrite the ones that fail.

**Be adversarial. Assume every prompt fails until its simulated answers prove otherwise.** The previous session's self-review passed a prompt whose own documented example is a story about a roommate; a review that returns "most of these are fine" has not done the job.

---

## 5. Context files (read, don't rewrite)

| file | why |
|---|---|
| `specs/matching-v2-story-elicitation.md` | the theory — §1 what a usable story is, §2 the eight mechanisms, §3 the rules, §4 the Labov rubric |
| `specs/matching-v2-prompt-bank-v2.md` | the 55 bank prompts under review |
| `specs/matching-v2-voice-prompt-map.md` §4 | the 47 fished prompts under review |
| `matching_algo-v2.md` §6.1, §6.3, §6.5 | the four feeling contracts, the Dane grid, and the nine tone rules any pitch sentence must obey |
| `src/lib/prompts.ts` | the live bank, `PromptDef`, `ONBOARDING_WEIGHTS`, and every current `exampleAnswer` |
| `specs/research-pitch-demand-findings.md` | craft dominates; also the confirmed CTR-negative devices |
| `tasks/lessons.md` (2026-08-24 protagonist entry) | the specific failure this brief exists to correct |

**Do not change** the four angles, the tone rules, `PromptDef`, or the tier taxonomy. Prompts are content; everything else is settled.

---

## 6. Launch prompt

```
🔫 Adversarial review of all 102 PLY voice prompts. No code, no build — the
deliverable is a per-prompt verdict table with rewrites.

git fetch origin && git checkout -b <your-branch> origin/session/s-0822-1436

Read specs/research-brief-prompt-review.md first — it IS your brief. Follow its
§2 method and §4 deliverable exactly. Then the seven context files in §5.

Why you exist: the previous session wrote the elicitation theory AND the prompts
AND then reviewed its own work, and got it badly wrong. It graded
laugh_hardest — "Tell us about the last time you laughed so hard you couldn't
breathe" — as one of the two best prompts in the bank. Charles killed it: people
can't retrieve "the last time" of anything, and more importantly the bank's own
example answer for it is "my roommate tried a backflip into the pool, the fence
broke, he fell in sideways" — a story about a ROOMMATE. Useless for describing
the person who told it.

So there are two criteria the existing rules miss and you are here to enforce:
RETRIEVABILITY (can a real person answer in ~5 seconds of thought — "the
last/most/best time" usually fails) and the PROTAGONIST TEST (does a typical
answer make the answerer the protagonist, or a witness?).

Do NOT review by reading and forming an opinion — that is exactly what failed.
Generate evidence: for each prompt simulate THREE modal answers as real people
actually speak, then try to write one pitch sentence about the answerer under
the nine tone rules in matching_algo-v2.md §6.5. If you cannot write a sentence
that would make a stranger want to meet this person, the prompt fails no matter
how good the story is.

Be adversarial. Assume every prompt fails until its simulated answers prove
otherwise — including the 17 the previous session passed unchanged. A review
that comes back "most of these are fine" has not done the job.

Also grade the exampleAnswer strings in src/lib/prompts.ts. Several model the
exact failure they sit under.

Write specs/prompt-review-findings.md, commit, push your branch, and report the
headline number — how many of the 102 survive — inline in chat. Charles reads
the chat, not the file.
```
