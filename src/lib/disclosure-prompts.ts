import Anthropic from '@anthropic-ai/sdk'
import type { CompositeProfile } from './types'

const anthropic = new Anthropic()

/**
 * Generate a personalized disclosure exchange prompt for a mutual match.
 * Rounds escalate from low-stakes shared ground to higher-stakes vulnerability.
 *
 * Research basis: Aron et al. (1997) 36 Questions — structured, escalating,
 * reciprocal self-disclosure produces closeness between strangers.
 */
export async function generateDisclosurePrompt(
  round: number,
  profileA: CompositeProfile,
  profileB: CompositeProfile,
  previousResponses?: { round: number; responseA: string; responseB: string }[]
): Promise<string> {
  const previousContext = previousResponses?.length
    ? `Previous exchange rounds:\n${previousResponses.map(r =>
        `Round ${r.round}:\n  Person A said: "${r.responseA}"\n  Person B said: "${r.responseB}"`
      ).join('\n')}`
    : 'No previous exchanges yet.'

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `You are designing a structured disclosure prompt for two people who mutually matched on a dating app. They will BOTH answer the same question, then read each other's answers. The goal is graduated vulnerability — building closeness through shared self-disclosure.

## Round ${round} of 3

Round 1 = Low stakes, find shared ground
Round 2 = Medium stakes, genuine curiosity about each other
Round 3 = Higher stakes, real vulnerability

## Person A's profile signals:
- Values: ${profileA.values.join(', ') || 'unknown'}
- Interests: ${profileA.interest_tags.join(', ') || 'unknown'}
- Passions: ${profileA.passion_indicators.join(', ') || 'unknown'}

## Person B's profile signals:
- Values: ${profileB.values.join(', ') || 'unknown'}
- Interests: ${profileB.interest_tags.join(', ') || 'unknown'}
- Passions: ${profileB.passion_indicators.join(', ') || 'unknown'}

## ${previousContext}

## Rules:
- Write ONE question that both people will answer
- The question should be PERSONALIZED to what these two specific people have in common or would find interesting — not generic
- It should invite a story or reflection, not a yes/no or list answer
- It should feel like something a thoughtful friend would ask at dinner, not a job interview
- It should be answerable in 60-90 seconds of speaking
- For Round 1: find the overlap or shared experience between them and build the question around it
- For Round 2: use what you know about both people (and their Round 1 answers if available) to ask something that reveals who they really are
- For Round 3: ask something that requires genuine vulnerability — something they'd only share with someone they were starting to trust

Output ONLY the question text. No preamble, no explanation.`
    }]
  })

  return message.content[0].type === 'text'
    ? message.content[0].text
    : getFallbackPrompt(round)
}

function getFallbackPrompt(round: number): string {
  const fallbacks: Record<number, string> = {
    1: "What's something you did recently that made you feel more like yourself than usual?",
    2: "What's something you've changed your mind about in the last year — and what changed it?",
    3: "What's something you're still figuring out about yourself?",
  }
  return fallbacks[round] || fallbacks[1]
}
