import { describe, it, expect } from 'vitest'
import { selectVoicePrompts, NERD_OUT, type QuizAnswers } from '../voice-prompt-map'
import { scoreQuiz, type QuizResponse } from '../quiz-scoring'

// The two personas from `specs/farmout-v2-quiz-build.md` §6, re-indexed for rc8
// (22 items; the nerd-out moved out of the quiz into the voice step).

const toResponses = (a: QuizAnswers): QuizResponse[] =>
  Object.entries(a).map(([itemId, optionIndex]) => ({
    itemId, optionIndex: optionIndex ?? null, polarityFlipped: false,
  }))

/** The storyteller: reinvented himself, always has a story, always making something. */
const A: QuizAnswers = {
  Q1: 5, Q2: 1, Q3: 2, Q4: 3, Q5: 3, Q6: 2, Q7: 2, Q8: 3, Q9: 3, Q10: 0, Q11: 1,
  Q12: 2, Q13: 2, Q14: 4, Q15: 2, Q16: 0, Q17: 0, Q18: 2, Q19: 2, Q20: 2, Q21: 3, Q22: 1,
}
/** The quiet one: skips Q1, left the party early, never thought about his place. */
const B: QuizAnswers = {
  Q1: null, Q2: 4, Q3: 0, Q4: 0, Q5: 0, Q6: 1, Q7: 0, Q8: 0, Q9: 0, Q10: 3, Q11: 0,
  Q12: 3, Q13: 1, Q14: 5, Q15: 4, Q16: 4, Q17: 2, Q18: 4, Q19: 1, Q20: 3, Q21: null, Q22: 2,
}

describe('Persona A — the storyteller', () => {
  const prompts = selectVoicePrompts(A)
  const texts = prompts.map(p => p.text)

  it('opens on the nerd-out, then reaches the reinvention and story prompts', () => {
    expect(prompts[0].id).toBe(NERD_OUT.id)
    expect(texts).toContain("You said you're a completely different person now. What changed — and when did you notice?")
    expect(texts).toContain('Okay. Tell me the story.')
  })

  it('scores the traits hand-computed on the walkthrough answers', () => {
    // O: Q4->4, Q5->4, Q6->3 = 3.67 · E: Q7->3, Q8->4 = 3.5
    // C: Q9 desc ->1 · A: Q10 ->1 · N: Q11->2, Q12 desc ->2 = 2
    expect(scoreQuiz(toResponses(A)).big5).toEqual({ O: 3.67, E: 3.5, C: 1, A: 1, N: 2 })
  })

  it('is register playful and politics tier 2 (logged, never filters)', () => {
    const t = scoreQuiz(toResponses(A))
    expect(t.register).toBe('playful')
    expect(t.homogamy.politics_importance).toBe('prefer')
    expect(t.homogamy.politics_position).toBe(3)
  })
})

describe('Persona B — the quiet one', () => {
  const texts = selectVoicePrompts(B).map(p => p.text)

  it('routes Q14 option 6 to the non-object prompt, never "tell us about your place"', () => {
    expect(texts).toContain('Forget the place then — where do you actually spend your time?')
    expect(texts.join(' ')).not.toMatch(/your place/i)
  })

  it('scores the traits hand-computed on the walkthrough answers', () => {
    // O: Q4->1, Q5->1, Q6->2 = 1.33 · E: Q7->1, Q8->1 = 1
    // C: Q9 desc ->4 · A: Q10 ->4 · N: Q11->1, Q12 desc ->1 = 1
    expect(scoreQuiz(toResponses(B)).big5).toEqual({ O: 1.33, E: 1, C: 4, A: 4, N: 1 })
  })

  it('records politics importance strong with a null position, so nothing can filter', () => {
    const t = scoreQuiz(toResponses(B))
    expect(t.homogamy.politics_importance).toBe('strong')
    expect(t.homogamy.politics_position).toBeNull()
    expect(t.register).toBe('earnest')
  })
})
