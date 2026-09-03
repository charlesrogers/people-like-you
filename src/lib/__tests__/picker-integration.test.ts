import { describe, it, expect } from 'vitest'
import { getPromptChoices, getProfileCompletion, getNextAngle, QUESTION_BANK, ANGLE_TIERS } from '../prompts'
import { personalisedPrompts, NERD_OUT, type QuizAnswers } from '../voice-prompt-map'
import { SEEDING_ITEMS } from '../quiz-battery'

// V2-T4 reconciled onto the prompt picker: fished prompts feed getPromptChoices
// instead of the old fixed carousel.

const answers: QuizAnswers = Object.fromEntries(SEEDING_ITEMS.map(id => [id, 0]))
const fished = () => personalisedPrompts(answers)

describe('fished prompts lead the picker', () => {
  it('every fished prompt carries a scannable short label', () => {
    for (const p of fished()) {
      expect(p.short, p.id).toBeTruthy()
      expect(p.short.split(' ').length, `${p.id}: "${p.short}"`).toBeLessThanOrEqual(8)
    }
  })

  it('leads with exactly one personalised prompt, not the whole set', () => {
    const personalised = fished()
    for (let n = 0; n < 100; n++) {
      const choices = getPromptChoices([], 5, [], personalised)
      expect(choices).toHaveLength(5)
      expect(choices[0].id).toBe(personalised[0].id)
      // Leading with all of them made the next round look identical after a
      // recording — three of five rows unchanged and in the same order.
      const personalisedIds = new Set(personalised.map(p => p.id))
      expect(choices.filter(c => personalisedIds.has(c.id))).toHaveLength(1)
    }
  })

  it('the round after a recording is visibly a different list', () => {
    const personalised = fished()
    const first = getPromptChoices([], 5, [], personalised)
    const answered = [first[0].id]
    const second = getPromptChoices(answered, 5, [], personalised)
    expect(second.map(p => p.id)).not.toContain(first[0].id)
    expect(second[0].id).toBe(personalised[1].id)   // next personalised leads
  })

  it('the nerd-out is the first thing a quiz-completer is offered', () => {
    expect(getPromptChoices([], 5, [], fished())[0].id).toBe(NERD_OUT.id)
  })

  it('a reader with no quiz answers gets the unchanged bank picker', () => {
    for (let n = 0; n < 50; n++) {
      const choices = getPromptChoices([], 5, [], [])
      expect(choices).toHaveLength(5)
      expect(choices.every(c => QUESTION_BANK.some(b => b.id === c.id))).toBe(true)
    }
  })

  it('never re-offers an answered or passed prompt, fished included', () => {
    const personalised = fished()
    const answered = [personalised[0].id]
    const passed = [personalised[1].id]
    const ids = getPromptChoices(answered, 5, passed, personalised).map(p => p.id)
    expect(ids).not.toContain(personalised[0].id)
    expect(ids).not.toContain(personalised[1].id)
  })
})

describe('angle coverage counts fished prompts', () => {
  it('a recorded fished prompt advances the profile', () => {
    const personalised = fished()
    const p = personalised.find(x => (ANGLE_TIERS as readonly string[]).includes(x.tier))!
    // Without the extra lookup its tier is invisible, and the profile never completes.
    expect(getProfileCompletion([p.id]).covered).toEqual([])
    expect(getProfileCompletion([p.id], personalised).covered).toContain(p.tier)
  })

  it('answering every angle once completes the profile', () => {
    const personalised = fished()
    const perAngle = ANGLE_TIERS.map(t =>
      personalised.find(p => p.tier === t)?.id ?? QUESTION_BANK.find(b => b.tier === t)!.id)
    expect(getProfileCompletion(perAngle, personalised).isComplete).toBe(true)
  })
})

describe('rounds are one bucket each (Charles, 2026-08-25)', () => {
  it('every option in a round belongs to that round\'s angle', () => {
    const personalised = fished()
    for (const angle of ANGLE_TIERS) {
      const choices = getPromptChoices([], 5, [], personalised, angle)
      expect(choices.length).toBeGreaterThan(0)
      for (const c of choices) expect(c.tier, `${angle}: ${c.id}`).toBe(angle)
    }
  })

  it('the next round targets an angle with no story behind it', () => {
    const personalised = fished()
    const first = getNextAngle([], personalised)!
    expect(ANGLE_TIERS).toContain(first)
    // Record something in that angle; the next round must move on.
    const inFirst = getPromptChoices([], 5, [], personalised, first)[0]
    const second = getNextAngle([inFirst.id], personalised)
    expect(second).not.toBe(first)
  })

  it('three recordings driven by the rounds cover three distinct angles', () => {
    const personalised = fished()
    const answered: string[] = []
    const angles: string[] = []
    for (let round = 0; round < 3; round++) {
      const a = getNextAngle(answered, personalised)!
      angles.push(a)
      answered.push(getPromptChoices(answered, 5, [], personalised, a)[0].id)
    }
    expect(new Set(angles).size).toBe(3)
  })

  it('returns null once every angle is covered, so the flow can stop asking', () => {
    const personalised = fished()
    const answered: string[] = []
    for (let i = 0; i < 4; i++) {
      const a = getNextAngle(answered, personalised)
      if (!a) break
      answered.push(getPromptChoices(answered, 5, [], personalised, a)[0].id)
    }
    expect(getNextAngle(answered, personalised)).toBeNull()
  })
})
