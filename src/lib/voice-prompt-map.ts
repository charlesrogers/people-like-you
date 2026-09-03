// Structure (keys, tiers, seeds, yield flags) from `specs/matching-v2-voice-prompt-map.md`,
// filtered to the 8 items rc8 still seeds. COPY (short + text) is v4, frozen against
// `specs/prompt-set-v4.md`; the copy-freeze suite asserts every string byte-for-byte.
//
// rc8: the nerd-out moved out of the quiz and is now the FIRST voice prompt,
// recorded. The old `q19Prompt()` quote-back template and its lead-in-stripping
// fix are gone entirely — the answer is a story now, not a string to quote back.

import { QUESTION_BANK, getOnboardingPrompts, getPromptText, type PromptDef } from './prompts'
import { getItem, NERD_OUT_PROMPT } from './quiz-battery'

export type Tier = PromptDef['tier']

/** Battery §2b / UX spec §8 — the help line under every prompt in the voice step. */
export const NEUTRAL_HELP = NERD_OUT_PROMPT.help

export const ANGLES: Tier[] = ['self_expansion', 'i_sharing', 'admiration', 'comfort']

/** Max prompts fished from quiz answers. All-fished reads as interrogation. */
export const MAX_FISHED = 3

export interface FishedPrompt extends Omit<PromptDef, 'exampleAnswer'> {
  /** Scannable label for the prompt picker. Authored here, not in the frozen map spec. */
  exampleAnswer?: never
  source: 'fished'
  seed: { itemId: string; optionIndex: number }
  highYield: boolean
}

export interface SelectedPrompt extends Omit<PromptDef, 'exampleAnswer'> {
  exampleAnswer?: string
  source: 'bank' | 'fished'
  seed?: { itemId: string; optionIndex: number }
}

/** itemId -> chosen optionIndex. Missing or null = unanswered/skipped. */
export type QuizAnswers = Record<string, number | null | undefined>

/**
 * The nerd-out. Asked of everyone, always first, recorded. Not fished from an
 * answer, so it is tagged `bank` — `prompt_source` only has the two values.
 */
export const NERD_OUT: SelectedPrompt = {
  id: NERD_OUT_PROMPT.id,
  short: 'What you nerd out on',
  text: NERD_OUT_PROMPT.text,
  helpText: NEUTRAL_HELP,
  tier: 'self_expansion',
  category: 'nerd_out',
  source: 'bank',
}

export const FISHED_PROMPTS: Record<string, FishedPrompt> = {
  // Q1
  'Q1:0': { id: 'fished_Q1_0', short: "Your on-stage disaster", text: "Every show has a disaster. What was yours?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 0 }, highYield: false },
  'Q1:1': { id: 'fished_Q1_1', short: "Your real job on the team", text: "What was your actual job on that team, the one nobody in the stands understood?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 1 }, highYield: false },
  'Q1:2': { id: 'fished_Q1_2', short: "What you were grinding for", text: "What were you grinding for? Where did all that energy go?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 2 }, highYield: false },
  'Q1:3': { id: 'fished_Q1_3', short: "What you pulled off", text: "What did you pull off? How many people, and what went wrong?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 3 }, highYield: false },
  'Q1:4': { id: 'fished_Q1_4', short: "What you were doing instead", text: "So what were you doing instead? Did anyone at school know?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 4 }, highYield: false },
  'Q1:5': { id: 'fished_Q1_5', short: "What changed, and when you noticed", text: "You said you're a completely different person now. What changed, and when did you notice?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 5 }, highYield: true },
  // Q2
  'Q2:0': { id: 'fished_Q2_0', short: "How you get out of a party", text: "How do you get out of a party? Tell me about the last time you pulled it off.", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q2', optionIndex: 0 }, highYield: false },
  'Q2:1': { id: 'fished_Q2_1', short: "The conversation, and your side of it", text: "What was the conversation, and what was your side of it? Did you follow up after?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q2', optionIndex: 1 }, highYield: false },
  'Q2:2': { id: 'fished_Q2_2', short: "What you ended up running", text: "What did you end up running that you never signed up for?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q2', optionIndex: 2 }, highYield: false },
  'Q2:3': { id: 'fished_Q2_3', short: "A night you closed down", text: "Tell me about a night you closed down. Who was still there at the end?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q2', optionIndex: 3 }, highYield: false },
  // Q4
  'Q4:0': { id: 'fished_Q4_0', short: "A must-see you got up early for", text: "Tell me about a must-see you got up early for. What was the verdict?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q4', optionIndex: 0 }, highYield: false },
  'Q4:1': { id: 'fished_Q4_1', short: "The place you kept going back to", text: "What's a place near where you were staying that you kept going back to? Who was with you?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q4', optionIndex: 1 }, highYield: false },
  'Q4:2': { id: 'fished_Q4_2', short: "A walk that turned into something", text: "Tell me about a walk that turned into something. Where were you?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q4', optionIndex: 2 }, highYield: false },
  'Q4:3': { id: 'fished_Q4_3', short: "A saved place you finally went to", text: "What's a place you'd had saved for months and finally went to? How did it compare to the picture?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q4', optionIndex: 3 }, highYield: false },
  // Q7
  'Q7:0': { id: 'fished_Q7_0', short: "What you do with the ten minutes", text: "Ten minutes early, every time. What do you do with them?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q7', optionIndex: 0 }, highYield: false },
  'Q7:1': { id: 'fished_Q7_1', short: "How you land exactly on time", text: "How do you land exactly on time? What's the system?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q7', optionIndex: 1 }, highYield: false },
  'Q7:2': { id: 'fished_Q7_2', short: "What always makes you late", text: "What's the thing that always makes you five minutes late?", helpText: NEUTRAL_HELP, tier: 'fun', category: 'fished', source: 'fished', seed: { itemId: 'Q7', optionIndex: 2 }, highYield: false },
  'Q7:3': { id: 'fished_Q7_3', short: "Okay, tell me the story", text: "Okay. Tell me the story.", helpText: NEUTRAL_HELP, tier: 'fun', category: 'fished', source: 'fished', seed: { itemId: 'Q7', optionIndex: 3 }, highYield: true },
  // Q8
  'Q8:0': { id: 'fished_Q8_0', short: "When honesty got you in trouble", text: "When did saying exactly what you think get you in trouble? It doesn't have to be serious.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q8', optionIndex: 0 }, highYield: false },
  'Q8:1': { id: 'fished_Q8_1', short: "Said your piece, showed up anyway", text: "Tell me about a time you said your piece once and then showed up anyway.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q8', optionIndex: 1 }, highYield: false },
  'Q8:2': { id: 'fished_Q8_2', short: "When that actually worked", text: "When did that actually work? How much of it was you?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q8', optionIndex: 2 }, highYield: false },
  'Q8:3': { id: 'fished_Q8_3', short: "What you went along with", text: "What did you end up going along with? How long did you keep quiet?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q8', optionIndex: 3 }, highYield: false },
  // Q9
  'Q9:0': { id: 'fished_Q9_0', short: "Which morning, and how early", text: "Which morning? What time was the alarm, and who else was up?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 0 }, highYield: false },
  'Q9:1': { id: 'fished_Q9_1', short: "What you did instead of nothing", text: "The last one. What did you end up doing instead of nothing?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 1 }, highYield: false },
  'Q9:2': { id: 'fished_Q9_2', short: "What you're making or fixing", text: "What are you making or fixing right now? What's the part that's fighting you?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 2 }, highYield: true },
  'Q9:3': { id: 'fished_Q9_3', short: "A night out you almost skipped", text: "Tell me about a night out you almost skipped and didn't. How did it go?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 3 }, highYield: false },
  'Q9:4': { id: 'fished_Q9_4', short: "The part of your job you'd do free", text: "What's a small part of your job you'd honestly do for free? What did it look like last week?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 4 }, highYield: false },
  // Q10
  'Q10:0': { id: 'fished_Q10_0', short: "Which piece, and how you got it", text: "Which piece, and how did you end up with it?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 0 }, highYield: false },
  'Q10:1': { id: 'fished_Q10_1', short: "How much, and what you gave up", text: "How much was it, and what did you give up to afford it?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 1 }, highYield: false },
  'Q10:2': { id: 'fished_Q10_2', short: "A ridiculous thing you did with the gear", text: "The gear. What's a ridiculous thing you've done with it?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 2 }, highYield: false },
  'Q10:3': { id: 'fished_Q10_3', short: "What you play when nobody's around", text: "What do you play when nobody's around?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 3 }, highYield: false },
  'Q10:4': { id: 'fished_Q10_4', short: "How long it took, what went wrong", text: "How long did it actually take, and what went wrong?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 4 }, highYield: false },
  'Q10:5': { id: 'fished_Q10_5', short: "Where you show up every week", text: "Forget the place. Where do you show up every week, and who's expecting you?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 5 }, highYield: true },
  // Q11
  'Q11:0': { id: 'fished_Q11_0', short: "A gift that got the laugh", text: "Tell me about a gift you gave that actually got the laugh.", helpText: NEUTRAL_HELP, tier: 'fun', category: 'fished', source: 'fished', seed: { itemId: 'Q11', optionIndex: 0 }, highYield: false },
  'Q11:1': { id: 'fished_Q11_1', short: "How it turned out", text: "How did it turn out? What's the flaw only you can see?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q11', optionIndex: 1 }, highYield: false },
  'Q11:2': { id: 'fished_Q11_2', short: "What they mentioned, how far you went", text: "What had they mentioned, and how far did you go to get it?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q11', optionIndex: 2 }, highYield: false },
  'Q11:3': { id: 'fished_Q11_3', short: "A day you planned for someone", text: "Tell me about a day you planned for someone. What was the gamble?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q11', optionIndex: 3 }, highYield: false },
  'Q11:4': { id: 'fished_Q11_4', short: "A time you showed up", text: "Tell me about a time you showed up for someone. What did it cost you?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q11', optionIndex: 4 }, highYield: true },
}

const YIELD_ORDER: string[] = ['Q1', 'Q2', 'Q4', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11']

function itemBlock(itemId: string): number {
  return getItem(itemId)?.block ?? 0
}

/** Every fished prompt this user's answers unlock, ordered by yield. */
export function fishedCandidates(answers: QuizAnswers): FishedPrompt[] {
  const out: FishedPrompt[] = []
  for (const itemId of YIELD_ORDER) {
    const idx = answers[itemId]
    if (idx == null || idx < 0) continue
    const p = FISHED_PROMPTS[`${itemId}:${idx}`]
    if (p) out.push(p)
  }
  return [...out].sort((a, b) => Number(b.highYield) - Number(a.highYield))
}

interface PickState {
  selected: SelectedPrompt[]
  usedIds: Set<string>
  usedBlocks: Set<number>
  coveredTiers: Set<Tier>
  fishedCount: number
}

function push(st: PickState, p: SelectedPrompt, block?: number) {
  st.selected.push(p)
  st.usedIds.add(p.id)
  st.coveredTiers.add(p.tier)
  if (p.source === 'fished') {
    st.fishedCount += 1
    if (block != null) st.usedBlocks.add(block)
  }
}

function nextFished(st: PickState, candidates: FishedPrompt[], exclude: Set<string>): FishedPrompt | null {
  const eligible = candidates.filter(c =>
    !st.usedIds.has(c.id) && !exclude.has(c.id) && !st.usedBlocks.has(itemBlock(c.seed.itemId)))
  return eligible.find(c => !st.coveredTiers.has(c.tier)) ?? eligible[0] ?? null
}

function nextBank(st: PickState, exclude: Set<string>, tier?: Tier): PromptDef | null {
  const pool = QUESTION_BANK.filter(p =>
    !st.usedIds.has(p.id) && !exclude.has(p.id) && (tier ? p.tier === tier : true))
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

/** UX spec §8: one help line under every prompt, fished or bank. */
function withHelp(p: SelectedPrompt): SelectedPrompt {
  return { ...p, helpText: NEUTRAL_HELP }
}

/**
 * 6 prompts.
 *   slot 1    the nerd-out, always, for everyone
 *   slots 2-4 up to 3 fished, greedy angle coverage, never two from one block
 *   slots 5-6 bank, filling angles still uncovered, then anything
 *
 * A user with no quiz answers gets the nerd-out plus today's bank behaviour.
 */
export function selectVoicePrompts(
  answers: QuizAnswers,
  count = 6,
  excludeIds: string[] = [],
): SelectedPrompt[] {
  const exclude = new Set(excludeIds)
  const candidates = fishedCandidates(answers)

  const st: PickState = {
    selected: [], usedIds: new Set(), usedBlocks: new Set(), coveredTiers: new Set(), fishedCount: 0,
  }

  if (!exclude.has(NERD_OUT.id)) push(st, NERD_OUT)

  while (st.fishedCount < MAX_FISHED && st.selected.length < count) {
    const p = nextFished(st, candidates, exclude)
    if (!p) break
    push(st, p, itemBlock(p.seed.itemId))
  }

  if (candidates.length === 0) {
    // No quiz answers at all: fall back to today's bank draw for the rest.
    for (const p of getOnboardingPrompts(count)) {
      if (st.selected.length >= count) break
      if (st.usedIds.has(p.id) || exclude.has(p.id)) continue
      push(st, { ...p, source: 'bank' })
    }
  }

  for (const tier of ANGLES) {
    if (st.selected.length >= count) break
    if (st.coveredTiers.has(tier)) continue
    const p = nextBank(st, exclude, tier)
    if (p) push(st, { ...p, source: 'bank' })
  }
  while (st.selected.length < count) {
    const p = nextBank(st, exclude, 'fun') ?? nextBank(st, exclude)
    if (!p) break
    push(st, { ...p, source: 'bank' })
  }

  return st.selected.map(withHelp)
}

/**
 * Skip-and-replace. A skipped fished prompt is replaced by the next fished
 * prompt by coverage and only falls back to the bank once fished candidates are
 * exhausted. Skipped prompts are never re-offered.
 */
export function replaceSelectedPrompt(
  selected: SelectedPrompt[],
  skippedId: string,
  answers: QuizAnswers,
  excludeIds: string[] = [],
): SelectedPrompt | null {
  const skipped = selected.find(p => p.id === skippedId)
  if (!skipped) return null

  const remaining = selected.filter(p => p.id !== skippedId)
  const exclude = new Set([...excludeIds, skippedId, ...remaining.map(p => p.id)])

  const st: PickState = {
    selected: [...remaining],
    usedIds: new Set(remaining.map(p => p.id)),
    usedBlocks: new Set(remaining.filter(p => p.source === 'fished' && p.seed)
      .map(p => itemBlock(p.seed!.itemId))),
    coveredTiers: new Set(remaining.map(p => p.tier)),
    fishedCount: remaining.filter(p => p.source === 'fished').length,
  }

  if (skipped.source === 'fished' && st.fishedCount < MAX_FISHED) {
    const p = nextFished(st, fishedCandidates(answers), exclude)
    if (p) return withHelp(p)
  }

  const uncovered = ANGLES.find(t => !st.coveredTiers.has(t))
  const bank = (uncovered ? nextBank(st, exclude, uncovered) : null) ?? nextBank(st, exclude)
  return bank ? withHelp({ ...bank, source: 'bank' }) : null
}

/**
 * The genuinely personalised prompts for this reader: the nerd-out plus up to
 * MAX_FISHED fished from their quiz answers. These lead the picker's list —
 * `selectVoicePrompts` also pads with bank prompts, which must NOT be pinned to
 * the top, so the picker takes this narrower set instead.
 */
export function personalisedPrompts(answers: QuizAnswers, excludeIds: string[] = []): SelectedPrompt[] {
  return selectVoicePrompts(answers, 6, excludeIds)
    .filter(p => p.source === 'fished' || p.id === NERD_OUT.id)
}

/** 38 fished prompts across the 8 seeding items, plus the nerd-out. */
export const MAP_PROMPT_COUNT = Object.keys(FISHED_PROMPTS).length + 1

const FISHED_TEXT_BY_ID = new Map(Object.values(FISHED_PROMPTS).map(p => [p.id, p.text]))

/**
 * Question text for ANY prompt id a voice memo can carry: the nerd-out, a fished
 * prompt, a bank prompt, or a retired one. `getPromptText` in prompts.ts cannot
 * see fished prompts (this module imports it, not the reverse), so anything that
 * reads memos by prompt_id must resolve through here — resolving from the bank
 * alone told the extractor the person had answered "fished_Q11_4".
 */
export function resolvePromptText(id: string): string | undefined {
  if (id === NERD_OUT.id) return NERD_OUT.text
  return FISHED_TEXT_BY_ID.get(id) ?? getPromptText(id)
}
