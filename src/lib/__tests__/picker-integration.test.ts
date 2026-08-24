import { describe, it, expect } from 'vitest'
import { getPromptChoices, getProfileCompletion, QUESTION_BANK, ANGLE_TIERS } from '../prompts'
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

  it('personalised prompts occupy the top of the list, in order', () => {
    const personalised = fished()
    for (let n = 0; n < 100; n++) {
      const choices = getPromptChoices([], 5, [], personalised)
      expect(choices).toHaveLength(5)
      const lead = choices.slice(0, Math.min(5, personalised.length))
      expect(lead.map(p => p.id)).toEqual(personalised.slice(0, 5).map(p => p.id))
    }
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
