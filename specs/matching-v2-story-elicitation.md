# Story Elicitation — First Principles

> **Status note 2026-08-24.** §1–§4 (what a usable story is, the elicitation mechanisms, the Labov completeness rubric, the agency/communion coding) stand and are unaffected by the pitch-demand research. What changed: the **eight story assets are a writer's checklist and a set of generation-side logging tags, not a reader classifier.** We do not score readers on asset preference, and `asset_priors` is not built — see `specs/research-pitch-demand-findings.md`. Asset density in a story is still worth maximising, but for craft reasons (a richer story is a better story) rather than targeting ones.

**Why this exists:** D-QD4 shipped 47 prompts written on instinct plus seven rules I asserted. Charles asked for the actual derivation: what makes people tell a good story, what the guidelines should be, how the result gets processed and categorised, how a prompt should be written up, and how all of it ties back to the questionnaire.
**Companions:** `specs/matching-v2-voice-prompt-map.md` (the prompts) · `specs/matching-v2-questionnaire-battery-v1.md` (the 23 items) · `matching_algo-v2.md` §6 (the angle matrix and tone rules) · live code: `src/lib/prompts.ts`, `src/lib/extraction-v2.ts`.
**Date:** 2026-08-23. Sources verified this session.

---

## 1. First principles: what is a "good story" *for this product*

Don't start from narrative theory. Start from the consumer. The only consumer of a voice memo is `generateTrailer`, which writes 3–4 sentences about a stranger under nine tone rules. So a good story is one those rules can be obeyed against. Read them backwards and the requirements fall out:

| tone rule (§6.5) | what it demands of the raw story |
|---|---|
| 8 · "Specifics > patterns" | **proper nouns and physical detail.** A story with no nouns produces a pitch with adjectives, which is the failure mode |
| 5 · "Don't explain the meaning — show behaviour, stop" | **an action the person took**, not a self-assessment. "I'm persistent" is unusable; "I went back four Saturdays in a row" is a pitch |
| 3 · "Contradiction > single note" | **a tension** — the thing that went wrong, the surprise, the mismatch between how they seem and what they did |
| 4 · "Close with a vivid image or joke, never sentiment" | **at least one image** the writer can steal for the last line |
| 6 · "Accomplishments as creation, not ego" | the person describing **the work**, not the outcome |
| 1 · "Never braggy" | material that is *shown*, so the pitch never has to claim anything |

So, derived rather than borrowed:

> **A usable story = ≥3 concrete nouns · 1 action taken · 1 thing that went wrong or surprised · 1 image.**

Everything else — length, emotion, polish, whether it's impressive — is irrelevant. A 25-second story about a broken carburettor beats a 60-second reflection on personal growth every time, because only one of them contains a carburettor.

**Then the convergence worth noticing.** That four-part requirement is almost exactly Labov's structure for oral narratives of personal experience: *orientation* (who/where/when → the nouns), *complicating action* (what happened → the action and the thing that went wrong), *evaluation* (why it's worth telling → the image), plus optional abstract, resolution and coda. We arrived at it from PLY's own tone rules; a linguistics literature arrived at it from recorded speech in 1972. That convergence is the licence to use Labov as the **scoring rubric** — it isn't an imported abstraction, it's the same thing our tone rules already require, with a validated name and fifty years of coding practice behind it.

---

## 2. What actually makes people tell one — eight mechanisms, ranked by leverage

**M1 · Ask for a specific occasion, not a class of event.** The largest single lever. Autobiographical-memory research draws a hard line between *specific* memories (event-specific knowledge — one occasion, one day) and *overgeneral* memories (categorical: "a memory for a general event that has occurred multiple times"). A prompt phrased as a category reliably retrieves a category, and a categorical answer contains no nouns. "What are you like when you travel" returns a personality summary; "tell me about the trip that went wrong" returns a story. *Every prompt must name an occasion.*

**M2 · Reinstate the context inside the prompt.** Mental reinstatement of context is the strongest component of the cognitive interview, which produces **~41% more correct details** than a standard interview across a 50+ study meta-analysis (Köhnken et al. 1999; Geiselman et al. 1985 found 40%). The mechanism: retrieval is most efficient when the original context is recreated at recall. In a prompt this costs four words — "start at the moment you said yes", "where were you standing" — and it is the difference between a summary and a scene.

**M3 · Give explicit permission to be trivial.** The cognitive interview's "report everything" instruction tells people to say things *whether or not they seem trivial*, because self-censorship is what strips out the concrete detail we need. Our help text currently reassures about length; it should instead reassure about **triviality**. "The small details are the good part" does more work than "30 seconds is plenty".

**M4 · Ask for the breach, not the highlight.** Tellability research (Ochs & Capps): an event is worth telling because it *breaches the frame of expectations*. And McAdams: asking for a **turning point** elicits an experience that may be positive, negative or mixed, where asking for a **high point** elicits the polished, pre-rehearsed anecdote. Prompts that ask "what went wrong", "what surprised you", "what did you get wrong" outperform "what was it like". *Caveat:* full turning-point framing can go heavy fast, which is wrong for onboarding — the usable version is a **low-stakes breach** ("how badly did it go?"), not a life turning point.

**M5 · Do not fill the silence, and never let a pause end the recording.** StoryCorps' first interviewing rule. Product translation: no visible countdown timer creating time pressure, no silence-detection auto-stop, and a pause of several seconds must be survivable. This is a UI requirement derived from an interviewing rule.

**M6 · The question is a guide, not a script — let them drift.** StoryCorps again: "if your partner goes off topic, go with it… many times important and interesting information comes out that you weren't expecting." Product translation: **an off-prompt answer is never a failure.** Extraction must not score a memo against the prompt it was given, and the UI must never say "that didn't answer the question."

**M7 · Share the question in advance.** StoryCorps recommends sending questions ahead because it materially improves what people bring. We have an unusually strong version of this and it is free — see §5.

**M8 · Reassure that what they have to say is valuable.** Also StoryCorps. This is the one mechanism that cuts against our own constraint: D7 says we can't show the reader their own pitch, so we can't demonstrate value directly. What we can do is show the *aim* — the prompt visibly built from what they just said is itself the reassurance.

**What the research says NOT to do**, notwithstanding that StoryCorps recommends it for oral history: **do not ask "how did that make you feel."** It is right for a legacy interview and wrong for us, because our tone rules forbid sentiment in the output (rule 4) and forbid explaining meaning (rule 5), so feeling-talk generates material we are contractually unable to use. It also systematically disadvantages people who narrate through subject matter rather than interiority (`tasks/lessons.md`, 2026-08-23). The feeling should arrive as a by-product of the detail, where the writer can *show* it.

---

## 3. The guidelines (supersedes D-QD4 §1)

Nine rules now, derived from §1–§2 rather than asserted. Every prompt must satisfy 1–6; 7–9 are craft.

1. **Name one occasion.** "The time", "the last", "that one". If the prompt admits a plural answer, it will get one. *(M1)*
2. **Hand them the entry point.** End with, or imply, where to start: "start at the yes", "begin with where you were standing". *(M2)*
3. **Ask for the thing, not the feeling** — the thing, the time, the who, the what-went-wrong. *(§2 closing)*
4. **Ask for the breach.** Prefer "what went wrong / what surprised you / how badly did it go" over "what was it like". Keep the stakes low. *(M4)*
5. **Never require them to be impressive or vulnerable to answer well.** The "no" options get the *better* prompt, not the consolation prompt.
6. **Unanswerable in one sentence; answerable in 45 seconds.**
7. **Quote them once, at the top, then get out of the way.** One "you said" per user. Twice reads as surveillance.
8. **Never reference the quiz as a quiz.** "You said you nerd out on…" yes. "Earlier you selected…" no.
9. **Shorter when the context is pre-loaded.** See §5 — a fished prompt inherits its scene from the option the user just tapped, so it can be far shorter than a bank prompt. Target: **bank prompts ~15 words, fished prompts ≤12, and as low as 4** where the coupling is tight.

**Help-text rule change.** Fished prompts still carry no `exampleAnswer` (it steers people off their own story), but the help text should switch from reassuring about *length* to giving permission for *triviality* (M3). Ship: **"The small stuff is the good stuff — the more specific, the better."**

**One UI requirement that is really an interviewing rule** (M5): no countdown pressure, no silence auto-stop, pauses survivable. Add to D-QD5.

---

## 4. Processing and categorisation

### 4.1 What the pipeline already does
`src/lib/extraction-v2.ts` is a two-pass system and it is in decent shape:
- **Pass 1** (Haiku, per memo) → `StoryExtraction`: `story_summary`, `concrete_details[]`, `people_mentioned[]`, `emotions_expressed[]`, `notable_quotes[]`, `response_depth: shallow|medium|deep`, `word_count`.
- **Pass 2** (Sonnet, whole profile) → `PersonalityProfile`: five dimensions (`explorer`/`connector`/`builder`/`nurturer`/`wildcard` — the same taxonomy as the prompt tiers) each with `data_points`, `confidence`, `best_quote`; plus `primary_energy`, `hidden_depth`, `humor_signature`, `conversation_fuel`, `all_quotes`, `life_stage`.

### 4.2 Three gaps, in priority order

**G-A · `response_depth` is a vibe judgment where a structural test exists.** "shallow/medium/deep" is an LLM impression with no defined criteria, so it drifts between model versions and can't be audited. Replace it with a **Labov completeness score** — four booleans plus a count, all of which a Haiku pass can extract far more reliably than a holistic judgment, and each of which corresponds to something a tone rule actually needs (§1):

```ts
narrative: {
  orientation: boolean       // who / where / when is established
  complicating_action: boolean // something happens; there is a "then"
  breach: boolean            // something went wrong, surprised, or defied expectation
  image: boolean             // at least one concrete visual the writer could steal
  concrete_noun_count: number
}
```
`usable = orientation && complicating_action && (breach || image) && concrete_noun_count >= 3`. That is the §1 derivation, executable. Keep `response_depth` alongside during changeover so nothing that reads it breaks.

**G-B · Nothing codes the axes the angle matrix is actually built on.** §6.1 defines the four angles as a 2×2 of *elevation × kinship* by *growth × warmth*. McAdams' Life Story Interview has been coded for decades on two validated dimensions — **agency** (acting on the world, mastery, control) and **communion** (connection, care, belonging) — plus **redemption** (bad→good) and **contamination** (good→bad) sequences. These map onto Charles's 2×2 almost one-to-one:

| story coding | angle it can feed |
|---|---|
| high agency + change/redemption | `self_expansion` |
| high communion + change/discovery | `i_sharing` |
| high agency + constancy | `admiration` |
| high communion + constancy | `comfort` |

So add to pass 1: `agency: 0–1`, `communion: 0–1`, `arc: 'redemption' | 'contamination' | 'steady' | null`. This is the missing link that lets the generator ask *"which of my four angles can this specific memo serve?"* instead of inferring it from a five-way personality vibe. It also gives §6.6's **thin-data swap a real input** — an angle is thin when no memo codes into its quadrant, which is a fact rather than a guess, and it makes the G3 swap-rate monitor interpretable.

**G-C · There is no follow-up on a thin story, and one follow-up is worth ~40%.** The cognitive-interview result is that context reinstatement recovers a large share of missing detail, and it is a *single extra question*. Today a memo that comes back with one noun and no action is simply accepted. Proposed: when pass 1 returns `usable === false`, offer **exactly one** follow-up, generated from what they did say, in context-reinstatement form — *"You mentioned the truck. Where were you when this happened?"* One only, skippable, never framed as a failure (M6). **Cost:** one Haiku call plus onboarding seconds, so this is a **post-pilot v1.1 item, not in the current build farm-out** — but it is the highest-ROI addition to the pipeline and the pilot should measure how many memos would trigger it.

### 4.3 Measuring prompt yield (feeds D-QD7)
Every memo already knows the prompt that produced it, and after D-QD4 it knows the prompt's `source`, `seed_item`, `seed_option` and target tier. So the loop closes: **did the `admiration`-tier prompt actually produce a high-agency, constancy-coded story?** Two numbers per prompt, reviewed monthly:
- **yield** — share of memos from this prompt where `usable === true`
- **aim** — share where the coded quadrant matches the prompt's target tier

A prompt with low yield is badly written. A prompt with high yield and low aim is well written but mis-filed, and should be re-tiered rather than rewritten. This is how the 47 prompts get better without guessing, and it is a genuinely cheap dashboard because both inputs are already being logged.

---

## 5. How this ties to the questionnaire — three mechanisms, not one

D-QD4 treated the quiz→prompt link as **targeting**. That is only the first of three, and the other two are doing more work.

**T1 · Selection.** Which story to ask for. Already specced (D-QD4 §3, coverage-greedy).

**T2 · Rehearsal and commitment.** StoryCorps recommends sharing questions in advance because it improves what people bring (M7). The questionnaire is a far stronger version of that: someone who taps *"7:15, but I have a story"* has **already retrieved the memory** in order to answer, and has publicly committed that a story exists. The subsequent prompt is not a request — it is a collection. Two design consequences:
- **The prompt should read as the direct continuation of the option**, not as a fresh question. *"Okay. Tell me the story."* works precisely because it is a continuation.
- **The lag between quiz and voice step is a cost.** Retrieval decays and commitment cools. This is an argument for keeping the quiz immediately before the voice step (already the design) and against inserting the pitch-taste step between them (it is currently specced after photos, which is correct — keep it there).

**T3 · Context pre-loading.** This is the mechanism I missed entirely when writing D-QD4. M2 says reinstating context is the single biggest detail-recovery lever, and costs prompt words. But **the option text has already done it for free.** A user who tapped *"elbow-deep in something I was making or fixing"* is already standing in the garage. The fished prompt inherits that context and does not have to rebuild it — which is why fished prompts can be dramatically shorter than bank prompts, and why the shortest prompt in the map is also the best one.

This gives a rule the map should be re-audited against (guideline 9): **prompt length should be inversely proportional to how much scene the option already carries.** Several of the 47 are currently longer than they need to be because they re-establish context the user is already inside — e.g. *"Tell me about a morning outside that went exactly right. Where were you, and what time did you start?"* follows an option that already said *"outside before most people were up"*, so the first sentence is redundant and the prompt should be roughly *"Which morning? Where were you, and what time did you start?"*

**T4 · What the quiz does NOT do for prompts, and shouldn't.** The reader's trait scores predict which angle *works on them as a reader*. They say nothing about which stories they can *tell as a subject*. Those are different people in every pitch. Do not select a user's prompts from their own Big Five — a high-O reader is not thereby a good source of `self_expansion` material. Prompt selection is driven by their milieu/identity/life answers (the story fishers) and by angle coverage; the trait scores stay on the reader side of the ledger where they belong.

---

## 6. How a prompt should be written up

Every prompt — fished or bank — ships as this record. The first four fields are what the code needs; the rest is what makes the set auditable and improvable instead of a pile of nice sentences.

```yaml
id:            q13_making_fixing
seed:          { item: Q13, option: 2 }        # null for bank prompts
text:          "What are you making or fixing right now? Walk me through where it's at."
help:          "The small stuff is the good stuff — the more specific, the better."
example:       null                             # fished prompts carry none, by design

target_tier:   admiration                       # the angle this should feed
target_coding: { agency: high, arc: steady }    # the quadrant it should land in (§4.2 G-B)

asks_for:      [orientation, complicating_action, image]   # Labov elements requested
occasion:      "current project, present tense"            # the single occasion named (M1)
entry_point:   "where it's at right now"                   # the handed entry (M2)
breach:        "what went wrong"                           # optional; the tellability hook (M4)

context_carried_by_option: high                 # → prompt may be short (T3)
word_count:    13

failure_mode:  "answers with the object only, no process"
followup:      "What's the part that's giving you trouble?"   # v1.1, one only (G-C)
```

Two fields earn their place beyond documentation: `target_coding` is what §4.3's **aim** metric is measured against, and `context_carried_by_option` is the audit hook for guideline 9.

---

## 7. What changes, concretely

| # | change | where | when |
|---|---|---|---|
| 1 | Help text switches from length-reassurance to triviality-permission: **"The small stuff is the good stuff — the more specific, the better."** | D-QD4, voice step | now — trivial, goes in the current build |
| 2 | No countdown timer, no silence auto-stop, pauses survivable | D-QD5 UX spec, voice recorder | now |
| 3 | Re-audit the 47 prompts against guideline 9 — cut the sentence that rebuilds context the option already carries | `voice-prompt-map.md` §4 | next pass, before copy freeze |
| 4 | Add `narrative{}` completeness block to pass 1; keep `response_depth` during changeover | `extraction-v2.ts` | its own task, after the quiz ships |
| 5 | Add `agency` / `communion` / `arc` coding to pass 1; wire as the thin-data-swap input | `extraction-v2.ts`, `intro-engine-v2.ts` §6.6 | with V2-T7 |
| 6 | Prompt yield + aim dashboard | D-QD7 / `/admin` | with V2-T9 |
| 7 | One context-reinstatement follow-up on unusable memos | new | v1.1, post-pilot; pilot measures the trigger rate |

Items 1 and 2 belong in the build session already running. Items 3–7 do not — they should not be bolted onto a farm-out that is already scoped and whose copy is frozen.

---

## Sources
- [McAdams, *The Life Story Interview II* (Northwestern, 2007)](https://cpb-us-e1.wpmucdn.com/sites.northwestern.edu/dist/4/3901/files/2020/11/The-Life-Story-Interview-II-2007.pdf) · [turning-point vs high-point memories (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12382990/) · [meaning-making in high/low point episodes](https://www.sciencedirect.com/science/article/abs/pii/S0092656614000221)
- [Labov's model of narrative analysis](https://www.ukessays.com/essays/english-language/labovs-model-narrative-analysis-2563.php) · [narrative structures across tellings](https://www.researchgate.net/publication/276406417_Narrative_structures_across_tellings_of_the_same_good_teaching_experience)
- [Fisher & Geiselman, the Cognitive Interview method (PDF)](https://www.hptc-pro.com/wp-content/uploads/2014/01/Cognitive-Interview-Method-Fisher-Geiselman.pdf) · [Cognitive interview overview + effect sizes](https://www.simplypsychology.org/cognitive-interview.html) · [isolating the effects of CI techniques](https://www.researchgate.net/publication/28762715_Isolating_the_effects_of_the_Cognitive_Interview_techniques)
- [Specificity vs detail in autobiographical memory retrieval (PubMed)](https://pubmed.ncbi.nlm.nih.gov/33135956/) · [Autobiographical memory specificity overview](https://www.sciencedirect.com/topics/psychology/autobiographical-memory-specificity)
- [StoryCorps — Great Interviews / Great Questions](https://storycorps.org/discover/the-great-thanksgiving-listen/for-educators/part-ii/) · [StoryCorps oral-history guidelines](https://archive.storycorps.org/question-lists/some-guidelines-on-how-to-conduct-a-good-oral-history-interview/) · [10 conversation tips (PDF)](https://acf.gov/sites/default/files/documents/otip/StoryCorps_10_Conversation_Tips_for_Interviews.pdf)
- [Tellability — living handbook of narratology](http://lhn.sub.uni-hamburg.de/index.php/Tellability.html) · [Ochs & Capps, *Living Narrative*](https://www.amazon.com/Living-Narrative-Creating-Everyday-Storytelling/dp/0674004825)
