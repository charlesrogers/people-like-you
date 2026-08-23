import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { QUIZ_ITEMS, QUIZ_BLOCKS, FRAMING, SEEDING_ITEMS } from '../quiz-battery'
import { FISHED_PROMPTS, MAP_PROMPT_COUNT } from '../voice-prompt-map'

const battery = readFileSync('specs/matching-v2-questionnaire-battery-v1.md', 'utf-8')
const voiceMap = readFileSync('specs/matching-v2-voice-prompt-map.md', 'utf-8')

// The copy is frozen: six review passes with Charles produced it. These tests fail
// the build if any shipped string drifts from the spec by a single byte.
describe('copy freeze — battery', () => {
  it('ships exactly 23 items', () => {
    expect(QUIZ_ITEMS).toHaveLength(23)
    expect(QUIZ_ITEMS.map(i => i.id)).toEqual(
      Array.from({ length: 23 }, (_, i) => `Q${i + 1}`))
  })

  it.each(QUIZ_ITEMS.map(i => [i.id, i] as const))('%s stem and options are byte-identical', (_id, item) => {
    expect(battery).toContain(item.stem)
    for (const opt of item.options) expect(battery).toContain(opt)
  })

  it('framing copy is byte-identical', () => {
    for (const value of Object.values(FRAMING)) expect(battery).toContain(value)
  })

  it('block cards are byte-identical and blocks are in spec order', () => {
    expect(QUIZ_BLOCKS.map(b => b.block)).toEqual([1, 2, 3, 4, 5, 6])
    expect(QUIZ_BLOCKS.find(b => b.block === 5)!.card).toBeNull()
    for (const b of QUIZ_BLOCKS) if (b.card) expect(battery).toContain(b.card)
  })

  it('skippable items are exactly Q1, Q19, Q22', () => {
    expect(QUIZ_ITEMS.filter(i => i.skippable).map(i => i.id)).toEqual(['Q1', 'Q19', 'Q22'])
  })

  it('polarity randomisation covers Q4-Q12 except Q9', () => {
    expect(QUIZ_ITEMS.filter(i => i.polarityRandomised).map(i => i.id))
      .toEqual(['Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q10', 'Q11', 'Q12'])
  })
})

describe('copy freeze — voice prompt map', () => {
  it('ships 47 prompts: 46 table entries + the Q19 template', () => {
    expect(Object.keys(FISHED_PROMPTS)).toHaveLength(46)
    expect(MAP_PROMPT_COUNT).toBe(47)
  })

  it.each(Object.entries(FISHED_PROMPTS))('%s prompt text is byte-identical', (_key, prompt) => {
    expect(voiceMap).toContain(prompt.text)
  })

  it('11 items seed a prompt', () => {
    expect(SEEDING_ITEMS).toHaveLength(11)
  })
})
