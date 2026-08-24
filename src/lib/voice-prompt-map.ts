// AUTO-DERIVED FROM `specs/matching-v2-voice-prompt-map.md`, filtered to the 8
// items rc8 still seeds. PROMPT COPY IS FROZEN; the copy-freeze suite asserts
// every string against the spec file.
//
// rc8: the nerd-out moved out of the quiz and is now the FIRST voice prompt,
// recorded. The old `q19Prompt()` quote-back template and its lead-in-stripping
// fix are gone entirely — the answer is a story now, not a string to quote back.

import { QUESTION_BANK, getOnboardingPrompts, type PromptDef } from './prompts'
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
  'Q1:0': { id: 'fished_Q1_0', short: "A night on stage that still lands", text: "Tell me about a night on stage that still lands when you think about it. What went right — or what went wrong?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 0 }, highYield: false },
  'Q1:1': { id: 'fished_Q1_1', short: "The thing you were actually good at", text: "Tell me about a team you were on and the thing you were actually good at.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 1 }, highYield: false },
  'Q1:2': { id: 'fished_Q1_2', short: "What you were grinding for at seventeen", text: "What were you grinding for at seventeen? Tell me whether it turned out to be worth it.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 2 }, highYield: false },
  'Q1:3': { id: 'fished_Q1_3', short: "Something you organised at seventeen", text: "Tell me about something you organised at seventeen that actually happened. How many people, and what went wrong?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 3 }, highYield: false },
  'Q1:4': { id: 'fished_Q1_4', short: "What you did instead of the school thing", text: "What were you doing at seventeen while everyone else was doing the school thing?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 4 }, highYield: false },
  'Q1:5': { id: 'fished_Q1_5', short: "What changed, and when you noticed", text: "You said you're a completely different person now. What changed — and when did you notice?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 5 }, highYield: true },
  // Q3
  'Q3:0': { id: 'fished_Q3_0', short: "The party you left early and were glad", text: "Tell me about the last party you left early and were glad about. Where'd you go instead?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q3', optionIndex: 0 }, highYield: false },
  'Q3:1': { id: 'fished_Q3_1', short: "A conversation you're still thinking about", text: "Tell me about a conversation at a party you're still thinking about. What was it about?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q3', optionIndex: 1 }, highYield: false },
  'Q3:2': { id: 'fished_Q3_2', short: "Something you ended up running", text: "Tell me about the last thing you ended up running that you never signed up to run.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q3', optionIndex: 2 }, highYield: false },
  'Q3:3': { id: 'fished_Q3_3', short: "The last night you closed down", text: "Tell me about the last night you closed down. Who else was still there at the end?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q3', optionIndex: 3 }, highYield: false },
  // Q6
  'Q6:0': { id: 'fished_Q6_0', short: "A must-see worth it, and one that wasn't", text: "What's one must-see that was genuinely worth it, and one that absolutely wasn't?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q6', optionIndex: 0 }, highYield: false },
  'Q6:1': { id: 'fished_Q6_1', short: "The trip's best part, three blocks away", text: "Tell me about a trip where the best part happened within three blocks of where you were staying.", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q6', optionIndex: 1 }, highYield: false },
  'Q6:2': { id: 'fished_Q6_2', short: "A walk that turned into something", text: "Tell me about a walk that turned into something. Where were you?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q6', optionIndex: 2 }, highYield: false },
  'Q6:3': { id: 'fished_Q6_3', short: "The best thing a local sent you to", text: "Tell me about the best thing a local ever sent you to. Did you actually find it?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q6', optionIndex: 3 }, highYield: false },
  // Q9
  'Q9:0': { id: 'fished_Q9_0', short: "The ten minutes when you're early", text: "What do you do with the ten minutes when you get somewhere early?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 0 }, highYield: false },
  'Q9:1': { id: 'fished_Q9_1', short: "Who taught you to be on time", text: "Who taught you to be on time?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 1 }, highYield: false },
  'Q9:2': { id: 'fished_Q9_2', short: "What always makes you five minutes late", text: "What's the thing that always makes you five minutes late?", helpText: NEUTRAL_HELP, tier: 'fun', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 2 }, highYield: false },
  'Q9:3': { id: 'fished_Q9_3', short: "The story you said you have", text: "Okay. Tell me the story.", helpText: NEUTRAL_HELP, tier: 'fun', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 3 }, highYield: true },
  // Q10
  'Q10:0': { id: 'fished_Q10_0', short: "Saying the hard thing to someone you love", text: "Tell me about a time you said the hard thing to someone you love. How did it land?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 0 }, highYield: false },
  'Q10:1': { id: 'fished_Q10_1', short: "Saying your piece, then showing up anyway", text: "Tell me about a time you said your piece once and then showed up anyway.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 1 }, highYield: false },
  'Q10:2': { id: 'fished_Q10_2', short: "Getting someone to figure it out themselves", text: "Tell me about a time you got someone to figure something out for themselves.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 2 }, highYield: false },
  'Q10:3': { id: 'fished_Q10_3', short: "Staying close through a disagreement", text: "Tell me about a time you stayed close to someone through something you didn't agree with.", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 3 }, highYield: false },
  // Q13
  'Q13:0': { id: 'fished_Q13_0', short: "A morning outside that went exactly right", text: "Tell me about a morning outside that went exactly right. Where were you, and what time did you start?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q13', optionIndex: 0 }, highYield: false },
  'Q13:1': { id: 'fished_Q13_1', short: "Your best empty Saturday", text: "Walk me through your best empty Saturday. What actually ended up happening?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q13', optionIndex: 1 }, highYield: false },
  'Q13:2': { id: 'fished_Q13_2', short: "What you're making or fixing right now", text: "What are you making or fixing right now? Walk me through where it's at.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q13', optionIndex: 2 }, highYield: true },
  'Q13:3': { id: 'fished_Q13_3', short: "Whose kitchen table you're at", text: "Whose kitchen table, and what keeps you there?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q13', optionIndex: 3 }, highYield: false },
  'Q13:4': { id: 'fished_Q13_4', short: "The part of work you'd do Saturday", text: "What's the part of your work you'd still do on a Saturday?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q13', optionIndex: 4 }, highYield: false },
  // Q14
  'Q14:0': { id: 'fished_Q14_0', short: "One thing on your walls", text: "Tell me about one thing on your walls. Where did it come from?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 0 }, highYield: false },
  'Q14:1': { id: 'fished_Q14_1', short: "The thing you overpaid for", text: "Tell me about the thing you overpaid for and would do it again.", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 1 }, highYield: false },
  'Q14:2': { id: 'fished_Q14_2', short: "The best day you've had on your gear", text: "Tell me about the gear. What's the best day you've ever had on it?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 2 }, highYield: false },
  'Q14:3': { id: 'fished_Q14_3', short: "What you play when nobody's around", text: "What do you play when nobody's around?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 3 }, highYield: false },
  'Q14:4': { id: 'fished_Q14_4', short: "The thing you made", text: "Tell me about the thing you made. How long did it take, and what went wrong?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 4 }, highYield: false },
  'Q14:5': { id: 'fished_Q14_5', short: "Where you actually spend your time", text: "Forget the place then — where do you actually spend your time?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 5 }, highYield: true },
  // Q15
  'Q15:0': { id: 'fished_Q15_0', short: "The gift that got the biggest laugh", text: "Tell me about the gift that got the biggest laugh. What was it?", helpText: NEUTRAL_HELP, tier: 'fun', category: 'fished', source: 'fished', seed: { itemId: 'Q15', optionIndex: 0 }, highYield: false },
  'Q15:1': { id: 'fished_Q15_1', short: "Something you made for someone", text: "Tell me about something you made for someone. How did it turn out?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q15', optionIndex: 1 }, highYield: false },
  'Q15:2': { id: 'fished_Q15_2', short: "The best gift you ever gave", text: "Tell me about the best gift you ever gave. What did it take to pull off?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q15', optionIndex: 2 }, highYield: false },
  'Q15:3': { id: 'fished_Q15_3', short: "A day you planned for someone else", text: "Tell me about a day you planned for someone else.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q15', optionIndex: 3 }, highYield: false },
  'Q15:4': { id: 'fished_Q15_4', short: "Showing up when it was inconvenient", text: "Tell me about a time you showed up for someone when it was genuinely inconvenient.", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q15', optionIndex: 4 }, highYield: true },
}

const YIELD_ORDER: string[] = ['Q1', 'Q3', 'Q6', 'Q9', 'Q10', 'Q13', 'Q14', 'Q15']

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
