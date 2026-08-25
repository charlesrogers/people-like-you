# D-QD4 — Voice-Prompt Map

**Charter:** `specs/matching-v2-questionnaire-deep-dive.md` D-QD4. **Supersedes** `matching_algo-v2.md` §4.4.
**Battery:** `specs/matching-v2-questionnaire-battery-v1.md` (rc10). **Governing principle:** the quiz is hidden data; **the stories are the pitch material.** This file is where the quiz turns into stories, which makes it the highest-value artefact of V2-T0.
**Live code it plugs into:** `src/lib/prompts.ts` — `QUESTION_BANK` (56 prompts, tiered `self_expansion | i_sharing | admiration | comfort | fun`), `getOnboardingPrompts(6)`, `PromptDef`. The voice step renders `text` / `helpText` / `exampleAnswer` and already handles skip-and-replace.

---

## 1. What makes a prompt yield a usable story

Seven rules. Every one of the 47 prompts below obeys them; any future prompt must.

1. **One occasion, not a summary.** "Tell me about the time…" — never "What are you like when…". A summary answer produces adjectives; an occasion produces nouns, and the intro engine needs nouns.
2. **Ask about the thing, not the feeling.** Never "how did that make you feel", "what did it mean to you". The feeling arrives through the detail on its own; asking for it directly gets a worse, more self-conscious answer — and it systematically disadvantages people who narrate through subject matter rather than through interiority (`tasks/lessons.md`, 2026-08-23). Where a prompt could go either way, it asks for **the thing, the time, the who, the what went wrong**.
3. **Give them the first sentence.** The prompt should make it obvious where to start. "Start at the moment you said yes" costs four words and removes the hardest part.
4. **Unanswerable in one sentence, answerable in 45 seconds.** No yes/no, no list.
5. **Never require them to be impressive or vulnerable to answer well.** The "no" options (Q5.4, Q14.6, Q15.5, Q21.4) get prompts that are *better* than the "yes" options, not consolation prompts.
6. **Quote once, at the top, then get out of the way.** One "you said" per user, on the first fished prompt. Twice reads as surveillance.
7. **Never reference the quiz as a quiz.** "You said you nerd out on…" is fine. "Earlier you selected…" is not.

**No `exampleAnswer` on fished prompts.** Bank prompts keep theirs. A worked example under a prompt written *about this person's own answer* steers them toward the example and away from their actual story — and the example can directly contradict what they just told us. Fished prompts carry `helpText` only; the renderer falls back to a neutral reassurance line ("30 seconds is plenty"). **Pilot must check this** — blank-mic anxiety is the risk we are trading against.

---

## 2. Module shape

New file `src/lib/voice-prompt-map.ts`. Reuses `PromptDef` unchanged so the voice step needs no UI work.

```ts
export interface FishedPrompt extends Omit<PromptDef, 'exampleAnswer'> {
  exampleAnswer?: never
  source: 'fished'
  seed: { itemId: string; optionIndex: number }   // logged on the voice_memo row
}

// key = `${itemId}:${optionIndex}`
export const FISHED_PROMPTS: Record<string, FishedPrompt>

// Q19 is a template, not a table entry
export function q19Prompt(m9Text: string | null): FishedPrompt | null
```

Bank prompts are tagged `source: 'bank'` at selection time. Every `voice_memos` row stores `prompt_source` and `prompt_seed` so item-level story yield is measurable (D-QD7).

---

## 3. Selection rule

**6 prompts, up to 3 fished.** Not more: all-fished reads as interrogation, and the bank prompts are proven. Not fewer: three is where "they actually listened" becomes unmistakable.

```
1. slot 1  ← Q19 verbatim prompt if Q19 answered (text or transcript). Else the
             highest-yield available fished prompt. This is the payoff moment.
2. slots 2–3 ← greedy angle coverage over the remaining fished prompts:
             at each step take the fished prompt whose tier is not yet covered.
             Never two prompts seeded by items in the same block.
3. slots 4–6 ← bank prompts, filling tiers still uncovered, then `fun`.
4. Guarantee: across the 6, all four angles covered where the bank allows.
```

**Why angle coverage is the objective and not "most interesting prompt":** the generator's thin-data swap (`matching_algo-v2.md` §6.6) fires when the assigned angle's feeding fields are empty, and every swap is a logged event that muddies the style experiment. G3 flags any angle swapping >20%. Selecting prompts for coverage is the cheapest way to keep every angle writable for every user — the questionnaire's job is to make sure no reader's composite is missing a whole quadrant.

**Skip handling.** The live step already replaces a skipped prompt via `getRandomPrompt`. Extend: a skipped *fished* prompt is replaced by the next fished prompt by coverage, and only falls back to the bank when fished candidates are exhausted. Never re-offer a skipped prompt.

**Fallback ladder:** fished → bank prompt in the needed tier → any unused bank prompt. A user who skipped the whole quiz gets exactly today's behaviour, unchanged.

---

## 4. The map — 38 prompts (rc10 numbering)

Format: `option → prompt` · *(tier)*. Renumbered for battery rc10; the five cut items took no prompts with them.

### Q1 · At seventeen, everyone knew you as:
| option | prompt | tier |
|---|---|---|
| theatre kid | "Tell me about a night on stage that still lands when you think about it. What went right — or what went wrong?" | i_sharing |
| jock | "What were you actually good at back then? Tell me how you found out." | admiration |
| honor-roll grinder | "What were you grinding for at seventeen? Tell me whether it turned out to be worth it." | admiration |
| the one organizing the hang | "Tell me about something you organised at seventeen that actually happened. How many people, and what went wrong?" | admiration |
| happily unaffiliated | "What were you doing at seventeen while everyone else was doing the school thing?" | i_sharing |
| a completely different person | **"You said you're a completely different person now. What changed — and when did you notice?"** | admiration |

### Q2 · It's 10pm at the wedding reception. Where are you?
| option | prompt | tier |
|---|---|---|
| already home, shoes off | "Tell me about the last party you left early and were glad about. Where'd you go instead?" | comfort |
| at a side table, deep in the actual conversation | "Tell me about a conversation at a party you're still thinking about. What was it about?" | i_sharing |
| outside, handing out sparklers | "Tell me about the last thing you ended up running that you never signed up to run." | admiration |
| on the dance floor since the first song | "Tell me about the last night you closed down. Who else was still there at the end?" | i_sharing |

### Q4 · One free day in a city you've never been to.
| option | prompt | tier |
|---|---|---|
| I'm not missing the must-see things | "What's one must-see that was genuinely worth it, and one that absolutely wasn't?" | self_expansion |
| whatever's near where I'm staying | "Tell me about a trip where the best part happened within three blocks of where you were staying." | comfort |
| I walk until something happens | "Tell me about a walk that turned into something. Where were you?" | self_expansion |
| I've had places saved on Instagram for months | "What's a place you saved months ago and finally went to? Was it what you pictured?" | self_expansion |

### Q7 · You're meeting someone at 7.
| option | prompt | tier |
|---|---|---|
| I'm there at 6:50 | "What do you do with the ten minutes when you get somewhere early?" | comfort |
| I'm there at 7 | "Who taught you to be on time?" | comfort |
| 7:05, and I texted | "What's the thing that always makes you five minutes late?" | fun |
| 7:15, but I have a good excuse | **"Okay. Tell me the story."** | fun |

### Q8 · Your closest friend is getting back together with the ex. Again.
| option | prompt | tier |
|---|---|---|
| I say exactly what I think | "Tell me about a time you said the hard thing to someone you love. How did it land?" | admiration |
| I say it once, then I'm supportive | "Tell me about a time you said your piece once and then showed up anyway." | admiration |
| I ask questions until they hear themselves | "Tell me about a time you got someone to figure something out for themselves." | admiration |
| I keep my mouth shut and stay close | "Tell me about a time you stayed close to someone through something you didn't agree with." | comfort |

### Q9 · Your last three Saturdays, honestly:
| option | prompt | tier |
|---|---|---|
| outside before most people were up | "Tell me about a morning outside that went exactly right. Where were you, and what time did you start?" | self_expansion |
| deliberately doing nothing, and it was glorious | "Walk me through your best empty Saturday. What actually ended up happening?" | comfort |
| elbow-deep in something I was making or fixing | **"What are you making or fixing right now? Walk me through where it's at."** | admiration |
| out with people until late | "Tell me about the last night out you're still glad you said yes to." | i_sharing |
| working, and not entirely mad about it | "What's the part of your work you'd still do on a Saturday?" | admiration |

### Q10 · The thing in your place a guest always asks about:
| option | prompt | tier |
|---|---|---|
| the art | "Tell me about one thing on your walls. Where did it come from?" | i_sharing |
| a chair I overpaid for but I love | "Tell me about the thing you overpaid for and would do it again." | i_sharing |
| the gear — bike, skis, clubs | "Tell me about the gear. What's the best day you've ever had on it?" | self_expansion |
| an instrument | "What do you play when nobody's around?" | i_sharing |
| something I made | "Tell me about the thing you made. How long did it take, and what went wrong?" | admiration |
| nothing — I just haven't got round to it | **"Forget the place then — where do you actually spend your time?"** | comfort |

### Q11 · It's their birthday. Your gift:
| option | prompt | tier |
|---|---|---|
| something that makes them laugh out loud | "Tell me about the gift that got the biggest laugh. What was it?" | fun |
| something I made | "Tell me about something you made for someone. How did it turn out?" | admiration |
| the thing they mentioned once, months ago | "Tell me about the best gift you ever gave. What did it take to pull off?" | admiration |
| a day out, not an object | "Tell me about a day you planned for someone else." | admiration |
| I'm not a gift person — I'll be there, though | **"Tell me about a time you showed up for someone when it was genuinely inconvenient."** | comfort |

---

## 5. Tier coverage of the map

| tier | fished prompts available |
|---|---|
| self_expansion | 12 |
| i_sharing | 7 |
| admiration | 17 |
| comfort | 9 |
| fun | 3 |

Every user's answers make at least one prompt available in **three of the four** angles regardless of what they picked (verified by walking the extremes: the all-first-option and all-last-option users both reach self_expansion, admiration and comfort). `i_sharing` is the thinnest and is the tier the bank must most often backfill — expected, since i_sharing is fed by humour and aesthetic resonance, which come from *how* someone talks, not from what they picked.

---

## 6. Tests (add to test-plan §2.4)

- **U23**: every `(itemId, optionIndex)` pair for the 11 seeding items resolves to exactly one `FISHED_PROMPTS` entry — no gaps, no duplicate ids. Table-driven off the battery spec.
- **U24**: selection returns exactly 6 prompts, ≤3 fished, no duplicate ids, no two fished prompts seeded from the same block.
- **U25**: all four non-`fun` tiers covered whenever the bank has an unused prompt in that tier.
- **U26**: empty `reader_traits` → output is identical in distribution to today's `getOnboardingPrompts(6)` (no-quiz path unchanged).
- **U27**: Q19 templating — text under 120 chars used verbatim; over-length transcript truncated at a sentence boundary, else 80 chars on a word boundary, never mid-word; null → `rabbit_hole`.
- **U28**: a skipped fished prompt is replaced by the next fished prompt by coverage, and never re-offered.
