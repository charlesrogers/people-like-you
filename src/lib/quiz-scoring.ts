// V2-T2 quiz scoring. Pure functions only — no I/O, no dates, no randomness.
// Spec: `specs/farmout-v2-quiz-build.md` section 3.2 + the battery's construct-budget table.

import {
  QUIZ_ITEMS, getItem, INSTRUMENT_VERSION,
  POLITICS_POSITION, POLITICS_IMPORTANCE,
  type Trait, type Register, type PoliticsImportance, type QuizOption,
} from './quiz-battery'

export interface QuizResponse {
  itemId: string
  /** Index into the options AS DISPLAYED. Null = skipped. Scoring un-flips. */
  optionIndex: number | null
  polarityFlipped: boolean
  responseMs?: number | null
}

export type Big5 = Record<Trait, number | null>

export interface Categorical { index: number; label: string }

export interface ReaderTraits {
  big5: Big5
  milieu: Record<string, Categorical | string | null>
  homogamy: {
    education: Categorical | null
    politics_position: number | null
    politics_importance: PoliticsImportance | null
    five_year: Categorical | null
  }
  convo: Record<string, Categorical | null>
  register: Register
  instrument_version: string
}

// ─── Polarity ──────────────────────────────────────────────────────────────

/**
 * Straightline protection: for a random half of users the option order of a
 * trait item is reversed. Seeded on the user id so Back does not reshuffle,
 * and stored per response so scoring can un-flip it.
 */
export function isPolarityFlipped(userId: string, itemId: string): boolean {
  const item = getItem(itemId)
  if (!item?.polarityRandomised) return false
  let h = 2166136261
  const key = `${userId}:${itemId}`
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) & 1) === 1
}

/** The option list as the user sees it. */
export function displayOptions(itemId: string, flipped: boolean): QuizOption[] {
  const item = getItem(itemId)
  if (!item) return []
  return flipped ? [...item.options].reverse() : item.options
}

/** Displayed index -> index into the canonical (spec-order) option list. */
export function canonicalIndex(itemId: string, displayedIndex: number, flipped: boolean): number {
  const item = getItem(itemId)
  if (!item || !flipped) return displayedIndex
  return item.options.length - 1 - displayedIndex
}

// ─── Scoring ───────────────────────────────────────────────────────────────

const TRAITS: Trait[] = ['O', 'E', 'C', 'A', 'N']

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function categorical(itemId: string, r: QuizResponse | undefined): Categorical | null {
  if (!r || r.optionIndex == null) return null
  const item = getItem(itemId)
  if (!item) return null
  const idx = canonicalIndex(itemId, r.optionIndex, r.polarityFlipped)
  const option = item.options[idx]
  if (option == null) return null
  return { index: idx, label: option.label }
}

/**
 * Trait score = mean of that trait's items on the 1-4 scale, after un-flipping
 * polarity, to 2dp. No item for a trait -> null. Missing data is never imputed
 * and never defaults to a midpoint.
 */
export function scoreBig5(responses: QuizResponse[]): Big5 {
  const byId = new Map(responses.map(r => [r.itemId, r]))
  const acc: Record<Trait, number[]> = { O: [], E: [], C: [], A: [], N: [] }

  for (const item of QUIZ_ITEMS) {
    if (item.scoring.length === 0) continue
    const r = byId.get(item.id)
    if (!r || r.optionIndex == null) continue
    const idx = canonicalIndex(item.id, r.optionIndex, r.polarityFlipped)
    for (const s of item.scoring) {
      const v = s.values[idx]
      if (typeof v === 'number') acc[s.trait].push(v)
    }
  }

  const out = {} as Big5
  for (const t of TRAITS) out[t] = acc[t].length ? round2(acc[t].reduce((a, b) => a + b, 0) / acc[t].length) : null
  return out
}

/**
 * Register from two independent indicators (Q16 + Q17), majority wins,
 * tie -> `earnest` (SV), both missing -> `earnest`. Replaces the brief's
 * section 6.4 "M5 with CS1 tiebreak".
 */
export function deriveRegister(responses: QuizResponse[]): Register {
  const byId = new Map(responses.map(r => [r.itemId, r]))
  const votes: Register[] = []

  for (const id of ['Q16', 'Q17']) {
    const item = getItem(id)
    const r = byId.get(id)
    if (!item?.register || !r || r.optionIndex == null) continue
    const idx = canonicalIndex(id, r.optionIndex, r.polarityFlipped)
    const v = item.register[idx]
    if (v) votes.push(v)
  }

  const playful = votes.filter(v => v === 'playful').length
  const earnest = votes.length - playful
  return playful > earnest ? 'playful' : 'earnest'
}

export function scoreQuiz(responses: QuizResponse[]): ReaderTraits {
  const byId = new Map(responses.map(r => [r.itemId, r]))
  const cat = (id: string) => categorical(id, byId.get(id))

  const politicsCat = cat('Q21')
  const importanceCat = cat('Q22')

  return {
    big5: scoreBig5(responses),
    milieu: {
      M1: cat('Q1'),
      M2: cat('Q2'),
      M3: cat('Q3'),
      M4: cat('Q13'),
      M7: cat('Q14'),
      M8: cat('Q15'),
      Q6: cat('Q6'),
    },
    homogamy: {
      education: cat('Q19'),
      politics_position: politicsCat ? POLITICS_POSITION[politicsCat.index] ?? null : null,
      politics_importance: importanceCat ? POLITICS_IMPORTANCE[importanceCat.index] ?? null : null,
      five_year: cat('Q20'),
    },
    convo: {
      M5: cat('Q16'),
      CS1: cat('Q17'),
      CS2: cat('Q18'),
    },
    register: deriveRegister(responses),
    instrument_version: INSTRUMENT_VERSION,
  }
}

/** itemId -> canonical option index, for the voice-prompt map. */
export function answersFromResponses(responses: QuizResponse[]): Record<string, number | null> {
  const out: Record<string, number | null> = {}
  for (const r of responses) {
    out[r.itemId] = r.optionIndex == null ? null : canonicalIndex(r.itemId, r.optionIndex, r.polarityFlipped)
  }
  return out
}
