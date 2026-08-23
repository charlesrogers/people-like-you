import { describe, it, expect } from 'vitest'
import { selectVoicePrompts, q19Prompt, type QuizAnswers } from '../voice-prompt-map'
import { scoreQuiz, type QuizResponse } from '../quiz-scoring'

// The two persona walkthroughs from `specs/farmout-v2-quiz-build.md` §6, locked in
// as regression tests. Answers are canonical option indices, taken from the actual
// staging walkthrough on 2026-08-23.

const toResponses = (a: QuizAnswers): QuizResponse[] =>
  Object.entries(a).map(([itemId, optionIndex]) => ({
    itemId, optionIndex: optionIndex ?? null, polarityFlipped: false,
  }))

const A: QuizAnswers = {
  Q1: 5, Q2: 1, Q3: 2, Q4: 3, Q5: 0, Q6: 2, Q7: 2, Q8: 3, Q9: 3, Q10: 0, Q11: 1,
  Q12: 2, Q13: 2, Q14: 4, Q15: 2, Q16: 0, Q17: 0, Q18: 2, Q20: 2, Q21: 2, Q22: 3, Q23: 1,
}
const B: QuizAnswers = {
  Q1: null, Q2: 4, Q3: 0, Q4: 0, Q5: 3, Q6: 1, Q7: 0, Q8: 0, Q9: 0, Q10: 3, Q11: 0,
  Q12: 3, Q13: 1, Q14: 5, Q15: 4, Q16: 3, Q17: 2, Q18: 4, Q20: 1, Q21: 3, Q22: null, Q23: 2,
}

describe('Persona A — the storyteller', () => {
  const prompts = selectVoicePrompts(A, 'restoring pre-war Gibson archtops')

  it('gets the Q19 payoff, the reinvention prompt and the Q9 story invitation', () => {
    const texts = prompts.map(p => p.text)
    expect(texts[0]).toBe(
      'You said you nerd out on restoring pre-war Gibson archtops. What pulled you in — and how deep does it go?')
    expect(texts).toContain("You said you're a completely different person now. What changed — and when did you notice?")
    expect(texts).toContain('Okay. Tell me the story.')
  })

  it('scores the traits hand-computed on the walkthrough answers', () => {
    expect(scoreQuiz(toResponses(A)).big5).toEqual({ O: 3.67, E: 3.25, C: 2, A: 2.5, N: 2 })
  })

  it('is register playful and politics tier 2 (logged, never filters)', () => {
    const t = scoreQuiz(toResponses(A))
    expect(t.register).toBe('playful')
    expect(t.homogamy.politics_importance).toBe('prefer')
    expect(t.homogamy.politics_position).toBe(3)
  })
})

describe('Persona B — the quiet one', () => {
  it('routes Q14 option 6 to the non-object prompt, never "tell us about your place"', () => {
    const texts = selectVoicePrompts(B, null).map(p => p.text)
    expect(texts).toContain('Forget the place then — where do you actually spend your time?')
    expect(texts.join(' ')).not.toMatch(/your place/i)
  })

  it('scores the traits hand-computed on the walkthrough answers', () => {
    expect(scoreQuiz(toResponses(B)).big5).toEqual({ O: 1.33, E: 1, C: 2.5, A: 3, N: 1 })
  })

  it('records politics importance strong with a null position, so nothing can filter', () => {
    const t = scoreQuiz(toResponses(B))
    expect(t.homogamy.politics_importance).toBe('strong')
    expect(t.homogamy.politics_position).toBeNull()
    expect(t.register).toBe('earnest')
  })

  it('templates the real transcript from the staging /api/transcribe call', () => {
    // Verbatim output of the live endpoint for the recorded clip.
    const transcript = 'I nerd out on vintage bicycle restoration.'
    const p = q19Prompt(transcript)!
    // KNOWN ROUGH EDGE, raised with Charles: spoken answers naturally repeat the
    // stem, so the frozen template doubles it. Asserted as-is because the copy is
    // frozen — do not "fix" this without his call.
    expect(p.text).toBe(
      'You said you nerd out on I nerd out on vintage bicycle restoration. What pulled you in — and how deep does it go?')
  })
})
