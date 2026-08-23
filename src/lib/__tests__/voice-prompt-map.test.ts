import { describe, it, expect } from 'vitest'
import {
  FISHED_PROMPTS, fishedCandidates, selectVoicePrompts, replaceSelectedPrompt,
  q19Prompt, truncateM9, MAX_FISHED, ANGLES, Q19_BANK_FALLBACK,
  type QuizAnswers, type SelectedPrompt,
} from '../voice-prompt-map'
import { QUESTION_BANK } from '../prompts'
import { SEEDING_ITEMS, getItem } from '../quiz-battery'

const TABLE_ITEMS = SEEDING_ITEMS.filter(id => id !== 'Q19')

/** Every seeding item answered with its first option. */
const answersAll: QuizAnswers = Object.fromEntries(TABLE_ITEMS.map(id => [id, 0]))

describe('U23 — the map is total over the seeding items', () => {
  it('every (itemId, optionIndex) pair resolves to exactly one entry', () => {
    for (const id of TABLE_ITEMS) {
      const item = getItem(id)!
      for (let i = 0; i < item.options.length; i++) {
        expect(FISHED_PROMPTS[`${id}:${i}`], `${id}:${i}`).toBeDefined()
      }
    }
  })

  it('has no entries outside the seeding items and no duplicate ids', () => {
    const keys = Object.keys(FISHED_PROMPTS)
    for (const k of keys) expect(TABLE_ITEMS).toContain(k.split(':')[0])
    const ids = Object.values(FISHED_PROMPTS).map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('no fished prompt carries an exampleAnswer', () => {
    for (const p of Object.values(FISHED_PROMPTS)) {
      expect((p as { exampleAnswer?: unknown }).exampleAnswer).toBeUndefined()
      expect(p.helpText).toBeTruthy()   // neutral line, not a blank block
    }
  })

  it('unanswered and skipped items unlock nothing', () => {
    expect(fishedCandidates({})).toHaveLength(0)
    expect(fishedCandidates({ Q9: null, Q1: undefined })).toHaveLength(0)
  })
})

describe('U24 — selection shape', () => {
  const runs = Array.from({ length: 300 }, () => selectVoicePrompts(answersAll, 'fonts'))

  it('returns exactly 6 prompts with no duplicates', () => {
    for (const set of runs) {
      expect(set).toHaveLength(6)
      expect(new Set(set.map(p => p.id)).size).toBe(6)
    }
  })

  it('never exceeds 3 fished prompts', () => {
    for (const set of runs) {
      expect(set.filter(p => p.source === 'fished').length).toBeLessThanOrEqual(MAX_FISHED)
    }
  })

  it('never puts two fished prompts from the same block in one set', () => {
    for (const set of runs) {
      const blocks = set.filter(p => p.source === 'fished')
        .map(p => getItem(p.seed!.itemId)?.block ?? 5)
      expect(new Set(blocks).size).toBe(blocks.length)
    }
  })

  it('slot 1 is the Q19 payoff when Q19 was answered', () => {
    for (const set of runs) {
      expect(set[0].source).toBe('fished')
      expect(set[0].seed?.itemId).toBe('Q19')
    }
  })

  it('falls back to the highest-yield fished prompt when Q19 is absent', () => {
    const set = selectVoicePrompts({ Q9: 3, Q1: 0 }, null)
    expect(set[0].source).toBe('fished')
    expect(set[0].text).toBe('Okay. Tell me the story.')   // spec-bolded, high yield
  })
})

describe('U25 — angle coverage', () => {
  it('covers all four angles for every single-item answer set', () => {
    for (const id of TABLE_ITEMS) {
      const item = getItem(id)!
      for (let i = 0; i < item.options.length; i++) {
        const set = selectVoicePrompts({ [id]: i }, null)
        for (const angle of ANGLES) {
          expect(set.some(p => p.tier === angle), `${id}:${i} missing ${angle}`).toBe(true)
        }
      }
    }
  })

  it('a fully answered quiz still covers all four angles', () => {
    for (let n = 0; n < 200; n++) {
      const set = selectVoicePrompts(answersAll, 'fonts')
      for (const angle of ANGLES) expect(set.some(p => p.tier === angle)).toBe(true)
    }
  })

  it('backfills self_expansion with rabbit_hole when there is no Q19 payoff', () => {
    const set = selectVoicePrompts({ Q10: 0 }, null)   // Q10 options are admiration/comfort only
    expect(set.some(p => p.id === Q19_BANK_FALLBACK)).toBe(true)
  })
})

describe('U26 — the no-quiz path is unchanged', () => {
  it('an empty quiz yields today\'s behaviour: 6 bank prompts', () => {
    for (let n = 0; n < 200; n++) {
      const set = selectVoicePrompts({}, null)
      expect(set).toHaveLength(6)
      expect(set.every(p => p.source === 'bank')).toBe(true)
      expect(set.every(p => QUESTION_BANK.some(b => b.id === p.id))).toBe(true)
      expect(set.every(p => p.exampleAnswer)).toBe(true)   // bank prompts keep theirs
    }
  })
})

describe('U27 — Q19 templating', () => {
  it('uses text under 120 chars verbatim', () => {
    const p = q19Prompt('sixteenth-century Flemish tapestry')!
    expect(p.text).toBe(
      'You said you nerd out on sixteenth-century Flemish tapestry. What pulled you in — and how deep does it go?')
  })

  it('truncates an over-length transcript at the first sentence boundary', () => {
    const t = 'I nerd out on trail running shoes. ' + 'x'.repeat(120)
    expect(truncateM9(t)).toBe('I nerd out on trail running shoes')
  })

  it('falls back to 80 chars on a word boundary, never mid-word, no ellipsis', () => {
    const t = Array.from({ length: 40 }, (_, i) => `word${i}`).join(' ')
    const out = truncateM9(t)
    expect(out.length).toBeLessThanOrEqual(80)
    expect(out).not.toContain('…')
    expect(out).not.toMatch(/\.\.\.$/)
    expect(t.startsWith(out)).toBe(true)
    expect(t[out.length]).toBe(' ')   // cut landed on a word boundary
  })

  it('uses the 80-char rule when the first sentence is itself over-length', () => {
    const t = 'a'.repeat(200) + '. tail'
    expect(truncateM9(t).length).toBeLessThanOrEqual(80)
  })

  it('null, empty and whitespace-only give no prompt', () => {
    expect(q19Prompt(null)).toBeNull()
    expect(q19Prompt('')).toBeNull()
    expect(q19Prompt('   ')).toBeNull()
  })

  it('a skipped Q19 yields no Q19 prompt, and self_expansion is still covered', () => {
    // With a fully answered quiz the fished prompts already cover self_expansion,
    // so the rabbit_hole backfill correctly does not fire — it is only the
    // fallback for an uncovered angle (asserted in U25).
    const set = selectVoicePrompts(answersAll, null)
    expect(set.some(p => p.seed?.itemId === 'Q19')).toBe(false)
    expect(set.some(p => p.tier === 'self_expansion')).toBe(true)
  })

  it('backfills rabbit_hole when Q19 is skipped and self_expansion is uncovered', () => {
    const set = selectVoicePrompts({ Q10: 0 }, null)
    expect(set.some(p => p.seed?.itemId === 'Q19')).toBe(false)
    expect(set.some(p => p.id === Q19_BANK_FALLBACK)).toBe(true)
  })
})

describe('U28 — skip and replace', () => {
  it('replaces a skipped fished prompt with another fished prompt, never re-offering it', () => {
    const set = selectVoicePrompts(answersAll, 'fonts')
    const fished = set.find(p => p.source === 'fished' && p.seed?.itemId !== 'Q19')!
    const replacement = replaceSelectedPrompt(set, fished.id, answersAll, 'fonts')!
    expect(replacement.source).toBe('fished')
    expect(replacement.id).not.toBe(fished.id)
    expect(set.map(p => p.id)).not.toContain(replacement.id)
  })

  it('respects the same-block rule when replacing', () => {
    const set = selectVoicePrompts(answersAll, 'fonts')
    const fished = set.find(p => p.source === 'fished' && p.seed?.itemId !== 'Q19')!
    const replacement = replaceSelectedPrompt(set, fished.id, answersAll, 'fonts')!
    const otherBlocks = set.filter(p => p.id !== fished.id && p.source === 'fished')
      .map(p => getItem(p.seed!.itemId)?.block ?? 5)
    if (replacement.source === 'fished') {
      expect(otherBlocks).not.toContain(getItem(replacement.seed!.itemId)!.block)
    }
  })

  it('falls back to the bank once fished candidates are exhausted', () => {
    const answers: QuizAnswers = { Q9: 3 }   // exactly one fished candidate
    const set = selectVoicePrompts(answers, null)
    const fished = set.find(p => p.source === 'fished')!
    const replacement = replaceSelectedPrompt(set, fished.id, answers, null)!
    expect(replacement.source).toBe('bank')
  })

  it('never re-offers anything already skipped', () => {
    let set = selectVoicePrompts(answersAll, 'fonts')
    const skipped: string[] = []
    for (let i = 0; i < 4; i++) {
      const target = set[0]
      const replacement = replaceSelectedPrompt(set, target.id, answersAll, 'fonts', skipped)
      if (!replacement) break
      skipped.push(target.id)
      expect(skipped).not.toContain(replacement.id)
      set = set.map(p => (p.id === target.id ? replacement : p)) as SelectedPrompt[]
    }
    expect(skipped.length).toBeGreaterThan(0)
  })
})
