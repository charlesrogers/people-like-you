// AUTO-DERIVED FROM `specs/matching-v2-voice-prompt-map.md` (D-QD4).
//
// 46 table prompts + the Q19 template = the 47 in the spec. PROMPT COPY IS FROZEN;
// `src/lib/__tests__/quiz-copy-freeze.test.ts` asserts every string against the
// spec file. Selection logic below implements spec section 3.

import { QUESTION_BANK, getOnboardingPrompts, type PromptDef } from './prompts'
import { getItem } from './quiz-battery'

export type Tier = PromptDef['tier']

/**
 * Fished prompts carry no `exampleAnswer` (spec section 1): a worked example under a
 * prompt written about this person's own answer steers them away from their
 * actual story. The renderer degrades to this neutral reassurance line instead.
 */
export const NEUTRAL_HELP = '30 seconds is plenty'

/** The four angles the generator writes to. `fun` is a wildcard, not an angle. */
export const ANGLES: Tier[] = ['self_expansion', 'i_sharing', 'admiration', 'comfort']

/** Max fished prompts in a set of 6 (spec section 3): all-fished reads as interrogation. */
export const MAX_FISHED = 3

export interface FishedPrompt extends Omit<PromptDef, 'exampleAnswer'> {
  exampleAnswer?: never
  source: 'fished'
  seed: { itemId: string; optionIndex: number }
  /** Bolded in the spec as a strongest-in-set prompt. Ranked first for the payoff slot. */
  highYield: boolean
}

export interface SelectedPrompt extends Omit<PromptDef, 'exampleAnswer'> {
  /** Absent on fished prompts by design (spec section 1); present on bank prompts. */
  exampleAnswer?: string
  source: 'bank' | 'fished'
  seed?: { itemId: string; optionIndex: number }
}

/** itemId -> chosen optionIndex. Missing or null = unanswered/skipped. */
export type QuizAnswers = Record<string, number | null | undefined>

export const FISHED_PROMPTS: Record<string, FishedPrompt> = {
  // Q1
  'Q1:0': { id: 'fished_Q1_0', text: "Tell me about a night on stage that still lands when you think about it. What went right — or what went wrong?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 0 }, highYield: false },
  'Q1:1': { id: 'fished_Q1_1', text: "Tell me about a team you were on and the thing you were actually good at.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 1 }, highYield: false },
  'Q1:2': { id: 'fished_Q1_2', text: "What were you grinding for at seventeen? Tell me whether it turned out to be worth it.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 2 }, highYield: false },
  'Q1:3': { id: 'fished_Q1_3', text: "Tell me about something you organised at seventeen that actually happened. How many people, and what went wrong?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 3 }, highYield: false },
  'Q1:4': { id: 'fished_Q1_4', text: "What were you doing at seventeen while everyone else was doing the school thing?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 4 }, highYield: false },
  'Q1:5': { id: 'fished_Q1_5', text: "You said you're a completely different person now. What changed — and when did you notice?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q1', optionIndex: 5 }, highYield: true },
  // Q3
  'Q3:0': { id: 'fished_Q3_0', text: "Tell me about the last party you left early and were glad about. Where'd you go instead?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q3', optionIndex: 0 }, highYield: false },
  'Q3:1': { id: 'fished_Q3_1', text: "Tell me about a conversation at a party you're still thinking about. What was it about?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q3', optionIndex: 1 }, highYield: false },
  'Q3:2': { id: 'fished_Q3_2', text: "Tell me about the last thing you ended up running that you never signed up to run.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q3', optionIndex: 2 }, highYield: false },
  'Q3:3': { id: 'fished_Q3_3', text: "Tell me about the last night you closed down. Who else was still there at the end?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q3', optionIndex: 3 }, highYield: false },
  // Q5
  'Q5:0': { id: 'fished_Q5_0', text: "What did you say yes to this month? Start at the moment you said yes.", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q5', optionIndex: 0 }, highYield: false },
  'Q5:1': { id: 'fished_Q5_1', text: "What did you say yes to this year with no idea what you were doing? Start at the yes.", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q5', optionIndex: 1 }, highYield: false },
  'Q5:2': { id: 'fished_Q5_2', text: "Tell me about the thing you said yes to unqualified. How badly did it go?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q5', optionIndex: 2 }, highYield: false },
  'Q5:3': { id: 'fished_Q5_3', text: "What's the thing you know cold — where you're the one people come and ask?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q5', optionIndex: 3 }, highYield: true },
  // Q6
  'Q6:0': { id: 'fished_Q6_0', text: "What's one must-see that was genuinely worth it, and one that absolutely wasn't?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q6', optionIndex: 0 }, highYield: false },
  'Q6:1': { id: 'fished_Q6_1', text: "Tell me about a trip where the best part happened within three blocks of where you were staying.", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q6', optionIndex: 1 }, highYield: false },
  'Q6:2': { id: 'fished_Q6_2', text: "Tell me about a walk that turned into something. Where were you?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q6', optionIndex: 2 }, highYield: false },
  'Q6:3': { id: 'fished_Q6_3', text: "Tell me about the best thing a local ever sent you to. Did you actually find it?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q6', optionIndex: 3 }, highYield: false },
  // Q9
  'Q9:0': { id: 'fished_Q9_0', text: "What do you do with the ten minutes when you get somewhere early?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 0 }, highYield: false },
  'Q9:1': { id: 'fished_Q9_1', text: "Who taught you to be on time?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 1 }, highYield: false },
  'Q9:2': { id: 'fished_Q9_2', text: "What's the thing that always makes you five minutes late?", helpText: NEUTRAL_HELP, tier: 'fun', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 2 }, highYield: false },
  'Q9:3': { id: 'fished_Q9_3', text: "Okay. Tell me the story.", helpText: NEUTRAL_HELP, tier: 'fun', category: 'fished', source: 'fished', seed: { itemId: 'Q9', optionIndex: 3 }, highYield: true },
  // Q10
  'Q10:0': { id: 'fished_Q10_0', text: "Tell me about a time you said the hard thing to someone you love. How did it land?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 0 }, highYield: false },
  'Q10:1': { id: 'fished_Q10_1', text: "Tell me about a time you said your piece once and then showed up anyway.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 1 }, highYield: false },
  'Q10:2': { id: 'fished_Q10_2', text: "Tell me about a time you got someone to figure something out for themselves.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 2 }, highYield: false },
  'Q10:3': { id: 'fished_Q10_3', text: "Tell me about a time you stayed close to someone through something you didn't agree with.", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q10', optionIndex: 3 }, highYield: false },
  // Q13
  'Q13:0': { id: 'fished_Q13_0', text: "Tell me about a morning outside that went exactly right. Where were you, and what time did you start?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q13', optionIndex: 0 }, highYield: false },
  'Q13:1': { id: 'fished_Q13_1', text: "Walk me through your best empty Saturday. What actually ended up happening?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q13', optionIndex: 1 }, highYield: false },
  'Q13:2': { id: 'fished_Q13_2', text: "What are you making or fixing right now? Walk me through where it's at.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q13', optionIndex: 2 }, highYield: true },
  'Q13:3': { id: 'fished_Q13_3', text: "Whose kitchen table, and what keeps you there?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q13', optionIndex: 3 }, highYield: false },
  'Q13:4': { id: 'fished_Q13_4', text: "What's the part of your work you'd still do on a Saturday?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q13', optionIndex: 4 }, highYield: false },
  // Q14
  'Q14:0': { id: 'fished_Q14_0', text: "Tell me about one thing on your walls. Where did it come from?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 0 }, highYield: false },
  'Q14:1': { id: 'fished_Q14_1', text: "Tell me about the thing you overpaid for and would do it again.", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 1 }, highYield: false },
  'Q14:2': { id: 'fished_Q14_2', text: "Tell me about the gear. What's the best day you've ever had on it?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 2 }, highYield: false },
  'Q14:3': { id: 'fished_Q14_3', text: "What do you play when nobody's around?", helpText: NEUTRAL_HELP, tier: 'i_sharing', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 3 }, highYield: false },
  'Q14:4': { id: 'fished_Q14_4', text: "Tell me about the thing you made. How long did it take, and what went wrong?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 4 }, highYield: false },
  'Q14:5': { id: 'fished_Q14_5', text: "Forget the place then — where do you actually spend your time?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q14', optionIndex: 5 }, highYield: true },
  // Q15
  'Q15:0': { id: 'fished_Q15_0', text: "Tell me about the gift that got the biggest laugh. What was it?", helpText: NEUTRAL_HELP, tier: 'fun', category: 'fished', source: 'fished', seed: { itemId: 'Q15', optionIndex: 0 }, highYield: false },
  'Q15:1': { id: 'fished_Q15_1', text: "Tell me about something you made for someone. How did it turn out?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q15', optionIndex: 1 }, highYield: false },
  'Q15:2': { id: 'fished_Q15_2', text: "Tell me about the best gift you ever gave. What did it take to pull off?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q15', optionIndex: 2 }, highYield: false },
  'Q15:3': { id: 'fished_Q15_3', text: "Tell me about a day you planned for someone else.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q15', optionIndex: 3 }, highYield: false },
  'Q15:4': { id: 'fished_Q15_4', text: "Tell me about a time you showed up for someone when it was genuinely inconvenient.", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q15', optionIndex: 4 }, highYield: true },
  // Q21
  'Q21:0': { id: 'fished_Q21_0', text: "What are you building at work that you'd be annoyed to leave unfinished?", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q21', optionIndex: 0 }, highYield: false },
  'Q21:1': { id: 'fished_Q21_1', text: "What does 'full' actually look like on a Tuesday five years from now?", helpText: NEUTRAL_HELP, tier: 'comfort', category: 'fished', source: 'fished', seed: { itemId: 'Q21', optionIndex: 1 }, highYield: false },
  'Q21:2': { id: 'fished_Q21_2', text: "How are you actually planning to do both? Asking sincerely.", helpText: NEUTRAL_HELP, tier: 'admiration', category: 'fished', source: 'fished', seed: { itemId: 'Q21', optionIndex: 2 }, highYield: false },
  'Q21:3': { id: 'fished_Q21_3', text: "What made you stop making plans — and what are you doing instead?", helpText: NEUTRAL_HELP, tier: 'self_expansion', category: 'fished', source: 'fished', seed: { itemId: 'Q21', optionIndex: 3 }, highYield: true },
}

/** Yield ranking: spec-bolded prompts first, then battery item order. */
const YIELD_ORDER: string[] = ['Q1', 'Q3', 'Q5', 'Q6', 'Q9', 'Q10', 'Q13', 'Q14', 'Q15', 'Q21']

function itemBlock(itemId: string): number {
  return getItem(itemId)?.block ?? 0
}

// ─── Q19 ───────────────────────────────────────────────────────────────────

export const Q19_PROMPT_ID = 'fished_Q19'

/**
 * Spec section 4, Q19: a transcript over 120 chars is cut at the first sentence
 * boundary, else at 80 chars on a word boundary. No ellipsis either way.
 * A first sentence that is itself over 120 chars falls through to the 80-char
 * rule — otherwise the sentence branch would defeat the length cap it exists for.
 */
export function truncateM9(raw: string): string {
  const text = raw.trim().replace(/\s+/g, ' ')
  if (text.length <= 120) return stripTrailingPunctuation(text)

  const boundary = text.search(/[.!?](\s|$)/)
  if (boundary !== -1 && boundary + 1 <= 120) {
    return stripTrailingPunctuation(text.slice(0, boundary + 1))
  }

  const cut = text.slice(0, 80)
  const lastSpace = cut.lastIndexOf(' ')
  return stripTrailingPunctuation(lastSpace > 0 ? cut.slice(0, lastSpace) : cut)
}

function stripTrailingPunctuation(s: string): string {
  return s.replace(/[\s.,;:!?]+$/, '')
}

/** The payoff prompt. Null when Q19 was skipped or the transcript has not landed. */
export function q19Prompt(m9Text: string | null | undefined): FishedPrompt | null {
  if (!m9Text || !m9Text.trim()) return null
  const m9 = truncateM9(m9Text)
  if (!m9) return null
  return {
    id: Q19_PROMPT_ID,
    text: `You said you nerd out on ${m9}. What pulled you in \u2014 and how deep does it go?`,
    helpText: NEUTRAL_HELP,
    tier: 'self_expansion',
    category: 'fished',
    source: 'fished',
    seed: { itemId: 'Q19', optionIndex: -1 },
    highYield: true,
  }
}

// ─── Candidates ────────────────────────────────────────────────────────────

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

// ─── Selection (spec section 3) ────────────────────────────────────────────

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
  // Greedy angle coverage: prefer a prompt whose tier is not yet covered.
  return eligible.find(c => !st.coveredTiers.has(c.tier)) ?? eligible[0] ?? null
}

function nextBank(st: PickState, exclude: Set<string>, tier?: Tier, preferId?: string): PromptDef | null {
  const pool = QUESTION_BANK.filter(p =>
    !st.usedIds.has(p.id) && !exclude.has(p.id) && (tier ? p.tier === tier : true))
  if (pool.length === 0) return null
  const preferred = preferId ? pool.find(p => p.id === preferId) : undefined
  return preferred ?? pool[Math.floor(Math.random() * pool.length)]
}

/** Spec section 4, Q19: with no Q19 answer or no transcript yet, the bank backfills with this. */
export const Q19_BANK_FALLBACK = 'rabbit_hole'

/**
 * 6 prompts, at most 3 fished (spec section 3).
 *   slot 1   payoff: the Q19 prompt, else the highest-yield fished prompt
 *   slots 2-3 greedy angle coverage over the rest, never two from the same block
 *   slots 4-6 bank, filling angles still uncovered, then anything
 *
 * A user with no quiz answers at all gets today's behaviour, bit for bit.
 */
export function selectVoicePrompts(
  answers: QuizAnswers,
  m9Text: string | null | undefined,
  count = 6,
  excludeIds: string[] = [],
): SelectedPrompt[] {
  const exclude = new Set(excludeIds)
  const candidates = fishedCandidates(answers)
  const q19 = q19Prompt(m9Text)

  if (candidates.length === 0 && !q19) {
    return getOnboardingPrompts(count).map(p => ({ ...p, source: 'bank' as const }))
  }

  const st: PickState = {
    selected: [], usedIds: new Set(), usedBlocks: new Set(), coveredTiers: new Set(), fishedCount: 0,
  }

  // Slot 1 — the payoff moment.
  if (q19 && !exclude.has(q19.id)) {
    push(st, q19, itemBlock('Q19'))
  } else {
    const first = nextFished(st, candidates, exclude)
    if (first) push(st, first, itemBlock(first.seed.itemId))
  }

  // Slots 2-3 — coverage.
  while (st.fishedCount < MAX_FISHED && st.selected.length < count) {
    const p = nextFished(st, candidates, exclude)
    if (!p) break
    push(st, p, itemBlock(p.seed.itemId))
  }

  // Slots 4-6 — bank, uncovered angles first.
  for (const tier of ANGLES) {
    if (st.selected.length >= count) break
    if (st.coveredTiers.has(tier)) continue
    // No Q19 payoff (skipped, or the transcript has not landed) -> `rabbit_hole`
    // backfills self_expansion, per spec section 4.
    const prefer = !q19 && tier === 'self_expansion' ? Q19_BANK_FALLBACK : undefined
    const p = nextBank(st, exclude, tier, prefer)
    if (p) push(st, { ...p, source: 'bank' })
  }
  while (st.selected.length < count) {
    const p = nextBank(st, exclude, 'fun') ?? nextBank(st, exclude)
    if (!p) break
    push(st, { ...p, source: 'bank' })
  }

  return st.selected
}

/**
 * Skip-and-replace (spec section 3). A skipped fished prompt is replaced by the next
 * fished prompt by coverage and only falls back to the bank once fished
 * candidates are exhausted. Skipped prompts are never re-offered.
 */
export function replaceSelectedPrompt(
  selected: SelectedPrompt[],
  skippedId: string,
  answers: QuizAnswers,
  m9Text: string | null | undefined,
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
    if (p) return p
  }

  // Fallback ladder: bank prompt in the angle still uncovered, then any unused bank prompt.
  const uncovered = ANGLES.find(t => !st.coveredTiers.has(t))
  const bank = (uncovered ? nextBank(st, exclude, uncovered) : null) ?? nextBank(st, exclude)
  return bank ? { ...bank, source: 'bank' } : null
}

/** Total prompts in the map: 46 table entries + the Q19 template. */
export const MAP_PROMPT_COUNT = Object.keys(FISHED_PROMPTS).length + 1
