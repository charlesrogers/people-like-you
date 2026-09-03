import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { QUIZ_ITEMS, QUIZ_BLOCKS, FRAMING, SEEDING_ITEMS, NERD_OUT_PROMPT } from '../quiz-battery'
import { FISHED_PROMPTS, MAP_PROMPT_COUNT } from '../voice-prompt-map'
import { QUESTION_BANK } from '../prompts'

const battery = readFileSync('specs/matching-v2-questionnaire-battery-v1.md', 'utf-8')
// v4 (2026-09-02): the copy for every voice prompt, bank and fished, lives in one file.
const promptSet = readFileSync('specs/prompt-set-v4.md', 'utf-8')

// The copy is frozen: six review passes with Charles produced it. These tests fail
// the build if any shipped string drifts from the spec by a single byte.
describe('copy freeze — battery', () => {
  it('ships exactly 17 items after the rc10 cuts', () => {
    expect(QUIZ_ITEMS).toHaveLength(17)
    expect(QUIZ_ITEMS.map(i => i.id)).toEqual(
      Array.from({ length: 17 }, (_, i) => `Q${i + 1}`))
  })

  it('carries no alcohol, coffee or tobacco emoji', () => {
    const banned = ['\u{1F377}', '\u{1F37A}', '\u{1F378}', '\u{1F942}', '\u2615', '\u{1F375}', '\u{1F6AC}']
    for (const item of QUIZ_ITEMS) {
      for (const opt of item.options) {
        if (opt.emoji) expect(banned, `${item.id} ${opt.label}`).not.toContain(opt.emoji)
      }
    }
  })

  it.each(QUIZ_ITEMS.map(i => [i.id, i] as const))('%s stem, labels and emoji are byte-identical', (_id, item) => {
    expect(battery).toContain(item.stem)
    for (const opt of item.options) {
      expect(battery).toContain(opt.label)
      if (opt.emoji) expect(battery).toContain(`${opt.emoji} ${opt.label}`)
    }
  })

  it('every option carries one emoji, except the two politics items by design', () => {
    for (const item of QUIZ_ITEMS) {
      const expected = item.id === 'Q16' || item.id === 'Q17' ? null : 'string'
      for (const opt of item.options) {
        if (expected === null) expect(opt.emoji).toBeNull()
        else expect(typeof opt.emoji).toBe('string')
      }
    }
  })

  it('the nerd-out copy is byte-identical and lives outside the quiz', () => {
    expect(battery).toContain(NERD_OUT_PROMPT.text)
    expect(battery).toContain(NERD_OUT_PROMPT.help)
    expect(QUIZ_ITEMS.map(i => i.stem)).not.toContain(NERD_OUT_PROMPT.text)
  })

  it('framing copy is byte-identical', () => {
    for (const value of Object.values(FRAMING)) expect(battery).toContain(value)
  })

  it('has five blocks and no interstitial cards (removed in rc8)', () => {
    expect(QUIZ_BLOCKS.map(b => b.block)).toEqual([1, 2, 3, 4, 5])
    expect(QUIZ_BLOCKS.flatMap(b => b.items)).toHaveLength(17)
    // Facts is the home stretch: plain background, no tint.
    expect(QUIZ_BLOCKS.find(b => b.block === 5)!.tint).toBeNull()
  })

  it('skippable items are exactly Q1 and Q16', () => {
    expect(QUIZ_ITEMS.filter(i => i.skippable).map(i => i.id)).toEqual(['Q1', 'Q16'])
  })

  it('polarity randomisation covers the trait items except the clock item Q7', () => {
    expect(QUIZ_ITEMS.filter(i => i.polarityRandomised).map(i => i.id))
      .toEqual(['Q3', 'Q4', 'Q5', 'Q6', 'Q8'])
  })
})

describe('copy freeze — voice prompt map', () => {
  it('ships 38 fished prompts across the 8 seeding items, plus the nerd-out', () => {
    expect(Object.keys(FISHED_PROMPTS)).toHaveLength(38)
    expect(MAP_PROMPT_COUNT).toBe(39)
  })

  it.each(Object.entries(FISHED_PROMPTS))('%s prompt text and label are byte-identical', (_key, prompt) => {
    expect(promptSet).toContain(`**Text:** ${prompt.text}`)
    expect(promptSet).toContain(`**Short:** ${prompt.short}`)
  })

  it('8 items seed a prompt', () => {
    expect(SEEDING_ITEMS).toHaveLength(8)
  })
})

describe('copy freeze — voice prompt bank (v4)', () => {
  it('ships 60 bank prompts: 13 / 13 / 13 / 11 / 10', () => {
    const count = (tier: string) => QUESTION_BANK.filter(p => p.tier === tier).length
    expect(QUESTION_BANK).toHaveLength(60)
    expect([count('self_expansion'), count('i_sharing'), count('admiration'), count('comfort'), count('fun')])
      .toEqual([13, 13, 13, 11, 10])
  })

  it.each(QUESTION_BANK.map(p => [p.id, p] as const))('%s text, label and example are byte-identical', (_id, prompt) => {
    expect(promptSet).toContain(`**Text:** ${prompt.text}`)
    expect(promptSet).toContain(`**Short:** ${prompt.short}`)
    expect(promptSet).toContain(`**Example:** ${prompt.exampleAnswer}`)
  })

  it('no bank or fished prompt carries a superlative or asks for a feeling', () => {
    const banned = /\b(best|worst|biggest|most (?!people)|favou?rite|farthest|hardest|funniest|feel|feels|feeling|ritual)\b/i
    for (const p of QUESTION_BANK) expect(p.text, p.id).not.toMatch(banned)
    for (const p of Object.values(FISHED_PROMPTS)) expect(p.text, p.id).not.toMatch(banned)
  })
})
