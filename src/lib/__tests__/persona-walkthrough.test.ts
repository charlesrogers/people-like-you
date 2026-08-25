import { describe, it, expect } from 'vitest'
import { personalisedPrompts, fishedCandidates, NERD_OUT, MAX_FISHED, type QuizAnswers } from '../voice-prompt-map'
import { scoreQuiz, type QuizResponse } from '../quiz-scoring'

// The two personas from `specs/farmout-v2-quiz-build.md` §6, re-indexed for
// battery rc10 (17 items, after the five cuts).

const toResponses = (a: QuizAnswers): QuizResponse[] =>
  Object.entries(a).map(([itemId, optionIndex]) => ({
    itemId, optionIndex: optionIndex ?? null, polarityFlipped: false,
  }))

/** The storyteller: reinvented himself, always has an excuse, always building something. */
const A: QuizAnswers = {
  Q1: 5, Q2: 2, Q3: 3, Q4: 2, Q5: 2, Q6: 3, Q7: 3, Q8: 0,
  Q9: 2, Q10: 4, Q11: 2, Q12: 0, Q13: 0, Q14: 2, Q15: 2, Q16: 3, Q17: 1,
}
/** The quiet one: skips Q1, keeps Friday empty, never got round to decorating. */
const B: QuizAnswers = {
  Q1: null, Q2: 0, Q3: 0, Q4: 1, Q5: 0, Q6: 0, Q7: 0, Q8: 3,
  Q9: 1, Q10: 5, Q11: 4, Q12: 4, Q13: 2, Q14: 1, Q15: 3, Q16: null, Q17: 2,
}

describe('Persona A — the storyteller', () => {
  it('unlocks the reinvention prompt and the story invitation', () => {
    const texts = fishedCandidates(A).map(p => p.text)
    expect(texts).toContain("You said you're a completely different person now. What changed — and when did you notice?")
    expect(texts).toContain('Okay. Tell me the story.')
  })

  it('leads the picker with the nerd-out, then at most 3 fished', () => {
    const set = personalisedPrompts(A)
    expect(set[0].id).toBe(NERD_OUT.id)
    expect(set.filter(p => p.source === 'fished').length).toBeLessThanOrEqual(MAX_FISHED)
    const candidateIds = new Set(fishedCandidates(A).map(p => p.id))
    for (const p of set.slice(1)) expect(candidateIds.has(p.id)).toBe(true)
  })

  it('scores the traits hand-computed on the walkthrough answers', () => {
    // O: Q3->4, Q4->3 = 3.5 · E: Q5->3, Q6->4 = 3.5
    // C: Q7 desc ->1 · A: Q8 ->1 · N cut entirely in rc10
    expect(scoreQuiz(toResponses(A)).big5).toEqual({ O: 3.5, E: 3.5, C: 1, A: 1, N: null })
  })

  it('is register playful and politics tier 2 (logged, never filters)', () => {
    const t = scoreQuiz(toResponses(A))
    expect(t.register).toBe('playful')
    expect(t.homogamy.politics_importance).toBe('prefer')
    expect(t.homogamy.politics_position).toBe(3)
  })
})

describe('Persona B — the quiet one', () => {
  it('routes the "never got round to it" option to the non-object prompt', () => {
    const texts = fishedCandidates(B).map(p => p.text)
    expect(texts).toContain('Forget the place then — where do you actually spend your time?')
    expect(personalisedPrompts(B).map(p => p.text).join(' ')).not.toMatch(/your place/i)
  })

  it('scores the traits hand-computed on the walkthrough answers', () => {
    // O: Q3->1, Q4->2 = 1.5 · E: Q5->1, Q6->1 = 1
    // C: Q7 desc ->4 · A: Q8 ->4
    expect(scoreQuiz(toResponses(B)).big5).toEqual({ O: 1.5, E: 1, C: 4, A: 4, N: null })
  })

  it('records politics importance strong with a null position, so nothing can filter', () => {
    const t = scoreQuiz(toResponses(B))
    expect(t.homogamy.politics_importance).toBe('strong')
    expect(t.homogamy.politics_position).toBeNull()
    expect(t.register).toBe('earnest')
  })
})
