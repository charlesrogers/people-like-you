/**
 * Intro Engine v2: "The Trailer"
 *
 * Each intro is a movie trailer, not a blurb.
 * HOOK → BRIDGE → DEPTH → QUESTION
 * 5-8 sentences. Personalized to the reader. Ends with mystery.
 *
 * Replaces the old strategy/tier system with a single prompt that
 * finds the most compelling connection between two people.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { CompositeProfile, User } from './types'

const anthropic = new Anthropic()

export const INTRO_ENGINE_CONFIG = {
  version: 'v2.0',
  model: 'claude-sonnet-4-6' as const,
  maxTokens: 1024,
  draftsPerIntro: 3,
  criticModel: 'claude-sonnet-4-6' as const,
  criticMaxTokens: 512,
  minCriticScore: 30,
}

// ─── Generate intro "trailer" ───

export async function generateTrailer(
  reader: User,
  subject: User,
  readerProfile: CompositeProfile,
  subjectProfile: CompositeProfile,
): Promise<{
  narrative: string
  criticScore: number | null
  version: string
}> {
  const prompt = buildTrailerPrompt(reader, subject, readerProfile, subjectProfile)

  // Generate 3 drafts in parallel with different temperature hints
  const emphases = [
    'Focus on the HOOK. The first sentence should be so unexpected it stops them mid-scroll.',
    'Focus on the BRIDGE. Make the connection to the reader feel uncanny — like you read their mind.',
    'Focus on THE QUESTION. The ending should haunt them. They should be thinking about it an hour later.',
  ]

  const drafts = await Promise.all(
    emphases.map(emphasis =>
      anthropic.messages.create({
        model: INTRO_ENGINE_CONFIG.model,
        max_tokens: INTRO_ENGINE_CONFIG.maxTokens,
        messages: [{ role: 'user', content: `${prompt}\n\nEMPHASIS FOR THIS DRAFT: ${emphasis}` }],
      }).then(msg => {
        const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
        return text.trim()
      })
    )
  )

  // Score all drafts
  const scored = await scoreDrafts(drafts, reader, subject, readerProfile)

  // Pick the best
  const best = scored.reduce((a, b) => a.score > b.score ? a : b)

  // If best is below threshold, regenerate with feedback
  if (best.score < INTRO_ENGINE_CONFIG.minCriticScore) {
    const regen = await anthropic.messages.create({
      model: INTRO_ENGINE_CONFIG.model,
      max_tokens: INTRO_ENGINE_CONFIG.maxTokens,
      messages: [{
        role: 'user',
        content: `${prompt}\n\nA previous draft scored poorly. The critic said: "${best.feedback}"\n\nFix these issues. Write a better version that specifically addresses the feedback.`,
      }],
    })
    const regenText = regen.content[0].type === 'text' ? regen.content[0].text.trim() : best.text
    const regenScored = await scoreDrafts([regenText], reader, subject, readerProfile)
    if (regenScored[0].score > best.score) {
      return {
        narrative: regenScored[0].text,
        criticScore: regenScored[0].score,
        version: INTRO_ENGINE_CONFIG.version,
      }
    }
  }

  return {
    narrative: best.text,
    criticScore: best.score,
    version: INTRO_ENGINE_CONFIG.version,
  }
}

// ─── Build the trailer prompt ───

function buildTrailerPrompt(
  reader: User,
  subject: User,
  readerProfile: CompositeProfile,
  subjectProfile: CompositeProfile,
): string {
  // Gather reader data
  const readerInterests = readerProfile.interest_tags?.join(', ') || 'unknown'
  const readerValues = readerProfile.values?.join(', ') || 'unknown'
  const readerQuotes = readerProfile.notable_quotes?.slice(0, 3).map(q => `"${q}"`).join(' | ') || 'none'
  const readerPassions = readerProfile.passion_indicators?.join(', ') || 'unknown'

  // Gather subject data
  const subjectPassions = subjectProfile.passion_indicators?.join(', ') || 'unknown'
  const subjectValues = subjectProfile.values?.join(', ') || 'unknown'
  const subjectInterests = subjectProfile.interest_tags?.join(', ') || 'unknown'
  const subjectQuotes = subjectProfile.notable_quotes?.slice(0, 4).map(q => `"${q}"`).join('\n  ') || 'none'
  const subjectHumor = subjectProfile.humor_signature?.humor_examples?.join(', ')
    || subjectProfile.humor_style || 'unknown'
  const subjectKindness = subjectProfile.kindness_markers?.join(', ') || 'unknown'
  const subjectVIA = (subjectProfile.values_in_action ?? []).slice(0, 2).join('; ') || 'none'
  const subjectVouches = (subjectProfile.friend_vouch_quotes ?? []).slice(0, 2).map(q => `"${q}"`).join(' | ') || 'none'

  // Try to extract v2 profile data if available
  const profileAny = subjectProfile as unknown as Record<string, unknown>
  const primaryEnergy = (profileAny.primary_energy as string) || ''
  const hiddenDepth = (profileAny.hidden_depth as string) || ''

  return `You are writing an introduction that makes ${subject.first_name} sound like the most fascinating person someone hasn't met yet. This is a trailer, not a profile summary. Your job is to make ${subject.first_name} irresistible.

YOUR GOAL: The reader should finish this and think "I need to know more about this person." They should feel like they've been let in on a secret about someone remarkable.

EVERYTHING YOU KNOW ABOUT ${subject.first_name}:
- Passions: ${subjectPassions}
- Values: ${subjectValues}
- Interests: ${subjectInterests}
- Their own words:
  ${subjectQuotes}
- Humor: ${subjectHumor}
- How they treat people: ${subjectKindness}
- Things they've actually DONE (not just said): ${subjectVIA}
- What friends say about them: ${subjectVouches}
${primaryEnergy ? `- Vibe: ${primaryEnergy}` : ''}
${hiddenDepth ? `- What would surprise you: ${hiddenDepth}` : ''}

CONTEXT (use subtly — the reader knows what THEY like, don't tell them):
The reader is into: ${readerPassions}. They value: ${readerValues}.
Use this ONLY to choose which of ${subject.first_name}'s qualities to lead with. Do NOT reference the reader directly.

STRUCTURE:
1. HOOK (1 sentence): The most unexpected, vivid thing about ${subject.first_name}. A quote, a moment, a fact. Something that makes someone stop scrolling.
2. SELL (2-3 sentences): What makes ${subject.first_name} genuinely remarkable. Use specific stories, actions, quotes — not adjectives. Show, don't tell. Layer multiple facets of who they are.
3. THE TWIST (1 sentence): The thing that doesn't fit the pattern. The hidden depth. The contradiction that makes them three-dimensional instead of a caricature.
4. THE QUESTION (1 sentence): Something unresolved about ${subject.first_name} that only meeting them would answer.

RULES:
- 5-8 sentences. Give it room to breathe.
- This is about ${subject.first_name}, not the reader. Do NOT say "you both" or "you'd love" or "based on your interests." The reader can decide for themselves what excites them.
- NEVER describe physical appearance.
- NEVER use: "compatible personalities," "you might click," "shared interests," "you'd get along," "you both enjoy."
- Use ${subject.first_name}'s ACTUAL WORDS. Quotes are the most powerful tool you have.
- Write like a friend telling you about someone incredible they just met. Not a sales pitch.
- Do NOT start with "Meet ${subject.first_name}" or "Imagine someone who..." — start with the hook.
- Do NOT mention the reader's name.`
}

// ─── Critic scoring ───

interface ScoredDraft {
  text: string
  score: number
  feedback: string
  hookPower: number
  personalization: number
  specificity: number
  mystery: number
}

async function scoreDrafts(
  drafts: string[],
  reader: User,
  subject: User,
  readerProfile: CompositeProfile,
): Promise<ScoredDraft[]> {
  const results = await Promise.all(
    drafts.map(async (draft) => {
      const msg = await anthropic.messages.create({
        model: INTRO_ENGINE_CONFIG.criticModel,
        max_tokens: INTRO_ENGINE_CONFIG.criticMaxTokens,
        messages: [{
          role: 'user',
          content: `Score this dating app intro on 4 dimensions (1-5 each). The intro is about ${subject.first_name}.

INTRO:
"${draft}"

Score and return ONLY a JSON object:
{
  "hook_power": 1-5 (Did the first sentence stop you? Is it specific and vivid, or generic?),
  "intrigue": 1-5 (Does ${subject.first_name} sound like someone you NEED to meet? Or just someone who exists?),
  "specificity": 1-5 (Concrete details, quotes, stories — or vague adjectives like 'passionate' and 'driven'?),
  "mystery": 1-5 (Does it leave you wanting more? Is there an unresolved question or tension?),
  "feedback": "1 sentence on the biggest weakness"
}`,
        }],
      })

      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return { text: draft, score: 0, feedback: 'Critic failed', hookPower: 0, personalization: 0, specificity: 0, mystery: 0 }
      }

      const parsed = JSON.parse(jsonMatch[0])
      const score = (parsed.hook_power * 3) + (parsed.intrigue * 3) + (parsed.specificity * 2) + (parsed.mystery * 2)

      return {
        text: draft,
        score,
        feedback: parsed.feedback || '',
        hookPower: parsed.hook_power,
        personalization: parsed.intrigue,
        specificity: parsed.specificity,
        mystery: parsed.mystery,
      }
    })
  )

  return results
}
