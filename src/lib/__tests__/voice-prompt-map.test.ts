import { describe, it, expect } from 'vitest'
import {
  FISHED_PROMPTS, fishedCandidates, selectVoicePrompts, replaceSelectedPrompt,
  NERD_OUT, NEUTRAL_HELP, MAX_FISHED, ANGLES,
  type QuizAnswers, type SelectedPrompt,
} from '../voice-prompt-map'
import { QUESTION_BANK } from '../prompts'
import { SEEDING_ITEMS, getItem, NERD_OUT_PROMPT } from '../quiz-battery'

const answersAll: QuizAnswers = Object.fromEntries(SEEDING_ITEMS.map(id => [id, 0]))

describe('U23 — the map is total over the seeding items', () => {
  it('every (itemId, optionIndex) pair resolves to exactly one entry', () => {
    for (const id of SEEDING_ITEMS) {
      const item = getItem(id)!
      for (let i = 0; i < item.options.length; i++) {
        expect(FISHED_PROMPTS[`${id}:${i}`], `${id}:${i}`).toBeDefined()
      }
    }
  })

  it('has no entries outside the seeding items and no duplicate ids', () => {
    for (const k of Object.keys(FISHED_PROMPTS)) expect(SEEDING_ITEMS).toContain(k.split(':')[0])
    const ids = Object.values(FISHED_PROMPTS).map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('no fished prompt carries an exampleAnswer, and all carry the help line', () => {
    for (const p of Object.values(FISHED_PROMPTS)) {
      expect((p as { exampleAnswer?: unknown }).exampleAnswer).toBeUndefined()
      expect(p.helpText).toBe(NEUTRAL_HELP)
    }
  })

  it('unanswered and skipped items unlock nothing', () => {
    expect(fishedCandidates({})).toHaveLength(0)
    expect(fishedCandidates({ Q9: null, Q1: undefined })).toHaveLength(0)
  })
})

describe('rc8 — the nerd-out is the first prompt for everyone', () => {
  it('leads every set, quiz answered or not', () => {
    for (const answers of [answersAll, {} as QuizAnswers, { Q9: 3 }]) {
      const set = selectVoicePrompts(answers)
      expect(set[0].id).toBe(NERD_OUT.id)
      expect(set[0].text).toBe(NERD_OUT_PROMPT.text)
    }
  })

  it('the old quote-back template is gone entirely', async () => {
    const mod = await import('../voice-prompt-map') as Record<string, unknown>
    expect(mod.q19Prompt).toBeUndefined()
    expect(mod.truncateM9).toBeUndefined()
    expect(mod.Q19_PROMPT_ID).toBeUndefined()
  })

  it('every prompt in a set carries the single help line (UX spec §8)', () => {
    for (const p of selectVoicePrompts(answersAll)) expect(p.helpText).toBe(NEUTRAL_HELP)
  })
})

describe('U24 — selection shape', () => {
  const runs = Array.from({ length: 300 }, () => selectVoicePrompts(answersAll))

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
      const blocks = set.filter(p => p.source === 'fished').map(p => getItem(p.seed!.itemId)!.block)
      expect(new Set(blocks).size).toBe(blocks.length)
    }
  })

  it('picks the spec-bolded high-yield prompt when one is available', () => {
    // rc10: the clock item is Q7.
    const set = selectVoicePrompts({ Q7: 3, Q1: 0 })
    expect(set.map(p => p.text)).toContain('Okay. Tell me the story.')
  })
})

describe('U25 — angle coverage', () => {
  it('covers all four angles for every single-item answer set', () => {
    for (const id of SEEDING_ITEMS) {
      const item = getItem(id)!
      for (let i = 0; i < item.options.length; i++) {
        const set = selectVoicePrompts({ [id]: i })
        for (const angle of ANGLES) {
          expect(set.some(p => p.tier === angle), `${id}:${i} missing ${angle}`).toBe(true)
        }
      }
    }
  })

  it('a fully answered quiz still covers all four angles', () => {
    for (let n = 0; n < 200; n++) {
      const set = selectVoicePrompts(answersAll)
      for (const angle of ANGLES) expect(set.some(p => p.tier === angle)).toBe(true)
    }
  })
})

describe('U26 — the no-quiz path still works', () => {
  it('an empty quiz yields the nerd-out plus 5 bank prompts', () => {
    for (let n = 0; n < 200; n++) {
      const set = selectVoicePrompts({})
      expect(set).toHaveLength(6)
      expect(set[0].id).toBe(NERD_OUT.id)
      expect(set.slice(1).every(p => QUESTION_BANK.some(b => b.id === p.id))).toBe(true)
      expect(set.every(p => p.source === 'bank')).toBe(true)
    }
  })
})

describe('U28 — skip and replace', () => {
  it('replaces a skipped fished prompt with another fished prompt, never re-offering it', () => {
    const set = selectVoicePrompts(answersAll)
    const fished = set.find(p => p.source === 'fished')!
    const replacement = replaceSelectedPrompt(set, fished.id, answersAll)!
    expect(replacement.source).toBe('fished')
    expect(replacement.id).not.toBe(fished.id)
    expect(set.map(p => p.id)).not.toContain(replacement.id)
  })

  it('respects the same-block rule when replacing', () => {
    const set = selectVoicePrompts(answersAll)
    const fished = set.find(p => p.source === 'fished')!
    const replacement = replaceSelectedPrompt(set, fished.id, answersAll)!
    if (replacement.source === 'fished') {
      const others = set.filter(p => p.id !== fished.id && p.source === 'fished')
        .map(p => getItem(p.seed!.itemId)!.block)
      expect(others).not.toContain(getItem(replacement.seed!.itemId)!.block)
    }
  })

  it('falls back to the bank once fished candidates are exhausted', () => {
    const answers: QuizAnswers = { Q7: 3 }
    const set = selectVoicePrompts(answers)
    const fished = set.find(p => p.source === 'fished')!
    expect(replaceSelectedPrompt(set, fished.id, answers)!.source).toBe('bank')
  })

  it('never re-offers anything already skipped', () => {
    let set = selectVoicePrompts(answersAll)
    const skipped: string[] = []
    for (let i = 0; i < 4; i++) {
      const target = set[1]
      const replacement = replaceSelectedPrompt(set, target.id, answersAll, skipped)
      if (!replacement) break
      skipped.push(target.id)
      expect(skipped).not.toContain(replacement.id)
      set = set.map(p => (p.id === target.id ? replacement : p)) as SelectedPrompt[]
    }
    expect(skipped.length).toBeGreaterThan(0)
  })
})

describe('resolvePromptText — every prompt id a memo can carry resolves to its question', () => {
  it('resolves the nerd-out, a fished prompt, a bank prompt and a retired prompt', async () => {
    const { resolvePromptText, NERD_OUT, FISHED_PROMPTS } = await import('../voice-prompt-map')
    const { QUESTION_BANK, RETIRED_PROMPT_TEXT } = await import('../prompts')
    expect(resolvePromptText(NERD_OUT.id)).toBe(NERD_OUT.text)
    const fished = Object.values(FISHED_PROMPTS)[0]
    expect(resolvePromptText(fished.id)).toBe(fished.text)
    expect(resolvePromptText(QUESTION_BANK[0].id)).toBe(QUESTION_BANK[0].text)
    const [retiredId, retiredText] = Object.entries(RETIRED_PROMPT_TEXT)[0]
    expect(resolvePromptText(retiredId)).toBe(retiredText)
    expect(resolvePromptText('no_such_prompt')).toBeUndefined()
  })
})
