import Anthropic from '@anthropic-ai/sdk'
import type {
  CompositeProfile,
  CriticScore,
  NarrativeDraft,
  NarrativeStrategy,
} from './types'

const anthropic = new Anthropic()

// Dimension weights — max total = (5*3 + 5*2 + 5*2 + 5*1 + 5*2) = 50
const WEIGHTS = {
  specificity: 3,
  emotional_arc: 2,
  authenticity: 2,
  brevity: 1,
  connection: 2,
} as const

const REGENERATE_THRESHOLD = 30

/**
 * Score narrative drafts using Claude Sonnet as a critic.
 * Returns scores for each draft, the index of the best one,
 * and a flag indicating whether all drafts should be regenerated.
 */
export async function scoreDrafts(
  drafts: NarrativeDraft[],
  recipient: CompositeProfile,
  subject: CompositeProfile,
  strategy: NarrativeStrategy,
): Promise<{
  scores: CriticScore[]
  winnerIndex: number
  shouldRegenerate: boolean
}> {
  // Score all drafts in parallel
  const scores = await Promise.all(
    drafts.map((draft, i) =>
      scoreSingleDraft(draft, i, drafts.length, recipient, subject, strategy),
    ),
  )

  // Find the winner
  let winnerIndex = 0
  let bestTotal = -1
  for (let i = 0; i < scores.length; i++) {
    if (scores[i].total > bestTotal) {
      bestTotal = scores[i].total
      winnerIndex = i
    }
  }

  const shouldRegenerate = bestTotal < REGENERATE_THRESHOLD

  return { scores, winnerIndex, shouldRegenerate }
}

async function scoreSingleDraft(
  draft: NarrativeDraft,
  draftIndex: number,
  totalDrafts: number,
  recipient: CompositeProfile,
  subject: CompositeProfile,
  strategy: NarrativeStrategy,
): Promise<CriticScore> {
  const prompt = `You are a narrative quality critic for a dating app. Score this match narrative draft on 5 dimensions.

## Context
- Strategy used: ${strategy.type} (${strategy.tier})
- Strategy rationale: ${strategy.rationale}
- Draft emphasis: ${draft.styleEmphasis}
- Recipient interests: ${recipient.interest_tags.slice(0, 8).join(', ') || 'unknown'}
- Recipient excitement type: ${recipient.excitement_type || 'unknown'}
- Subject interests: ${subject.interest_tags.slice(0, 8).join(', ') || 'unknown'}
- Subject notable quotes: ${subject.notable_quotes.slice(0, 3).map((q) => `"${q}"`).join(' | ') || 'none'}
- Subject values-in-action: ${(subject.values_in_action ?? []).slice(0, 2).join('; ') || 'none'}

## Draft to score (${draftIndex + 1} of ${totalDrafts}):
"${draft.text}"

## Scoring dimensions (each 1-5):

1. **Specificity** (weight 3x): Does it use concrete, specific details from the subject's actual profile? Named interests, real quotes, particular stories? Or is it generic and could apply to anyone?
   - 1 = completely generic, no specific details
   - 5 = every sentence contains profile-specific detail

2. **Emotional Arc** (weight 2x): Does it build from intrigue to genuine excitement? Does it make the reader feel something real, not just process information?
   - 1 = flat, informational listing
   - 5 = genuinely compelling arc that builds desire to meet this person

3. **Authenticity** (weight 2x): Does it sound like a perceptive friend, not a marketing bot? Would a real person actually say this?
   - 1 = corporate/marketing speak, try-hard
   - 5 = sounds exactly like a sharp friend pulling you aside

4. **Brevity** (weight 1x): Is every word earning its place? No filler, no redundancy?
   - 1 = bloated, repetitive, way too long
   - 5 = impossibly tight, not a word wasted

5. **Connection** (weight 2x): Does it connect the subject's traits to what THIS specific recipient would care about? Does it answer "why should I be excited?"
   - 1 = no connection to recipient's profile/type
   - 5 = perfectly tailored to what this recipient finds exciting

Respond with ONLY valid JSON in this exact format:
{
  "specificity": <1-5>,
  "emotional_arc": <1-5>,
  "authenticity": <1-5>,
  "brevity": <1-5>,
  "connection": <1-5>,
  "feedback": "<one sentence of constructive feedback>"
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}'

  try {
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')

    const parsed = JSON.parse(jsonMatch[0]) as {
      specificity: number
      emotional_arc: number
      authenticity: number
      brevity: number
      connection: number
      feedback: string
    }

    // Clamp all values to 1-5
    const clamp = (v: number) => Math.max(1, Math.min(5, Math.round(v)))

    const specificity = clamp(parsed.specificity)
    const emotional_arc = clamp(parsed.emotional_arc)
    const authenticity = clamp(parsed.authenticity)
    const brevity = clamp(parsed.brevity)
    const connection = clamp(parsed.connection)

    const total =
      specificity * WEIGHTS.specificity +
      emotional_arc * WEIGHTS.emotional_arc +
      authenticity * WEIGHTS.authenticity +
      brevity * WEIGHTS.brevity +
      connection * WEIGHTS.connection

    return {
      specificity,
      emotional_arc,
      authenticity,
      brevity,
      connection,
      total,
      feedback: parsed.feedback || 'No feedback provided',
    }
  } catch {
    // If parsing fails, return a conservative middle score
    console.error(`Failed to parse critic response for draft ${draftIndex}:`, responseText)
    return {
      specificity: 3,
      emotional_arc: 3,
      authenticity: 3,
      brevity: 3,
      connection: 3,
      total: 3 * WEIGHTS.specificity + 3 * WEIGHTS.emotional_arc + 3 * WEIGHTS.authenticity + 3 * WEIGHTS.brevity + 3 * WEIGHTS.connection,
      feedback: 'Critic scoring failed — defaulted to neutral scores',
    }
  }
}
