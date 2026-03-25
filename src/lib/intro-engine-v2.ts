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

// ─── The 3 Hook Types ───

export const HOOK_TYPES = [
  {
    id: 'quote' as const,
    label: 'The Quote',
    instruction: 'Lead with their most striking actual words — a direct quote that reveals who they are. Let the quote do the work. The first thing the reader sees should be this person\'s own voice.',
  },
  {
    id: 'contradiction' as const,
    label: 'The Contradiction',
    instruction: 'Open with two things about them that seem like they shouldn\'t go together — but do. Show the tension between two sides of who they are. This creates depth and complexity in a single sentence.',
  },
  {
    id: 'scene' as const,
    label: 'The Scene',
    instruction: 'Paint what being around them is like — a specific moment, a specific place, a specific situation. Make the reader feel like they\'re already there. Don\'t describe the person; describe the experience of them.',
  },
] as const

export type HookType = typeof HOOK_TYPES[number]['id']

// ─── Generate intro "trailer" ───

export async function generateTrailer(
  reader: User,
  subject: User,
  readerProfile: CompositeProfile,
  subjectProfile: CompositeProfile,
  hookType?: HookType,
): Promise<{
  narrative: string
  criticScore: number | null
  hookType: HookType
  version: string
}> {
  const prompt = buildTrailerPrompt(reader, subject, readerProfile, subjectProfile)

  // If specific hook type requested, generate 3 drafts with that hook
  // Otherwise, generate 1 draft per hook type (for Daily Three)
  const hook = hookType
    ? HOOK_TYPES.find(h => h.id === hookType)!
    : HOOK_TYPES[Math.floor(Math.random() * HOOK_TYPES.length)]

  const hookInstruction = `\n\nHOOK TYPE: ${hook.label}\n${hook.instruction}`

  // Generate 3 drafts with the same hook type but different creative approaches
  const variations = [
    'Approach A: Lead with the single most vivid detail you can find.',
    'Approach B: Build momentum — each sentence should raise the stakes.',
    'Approach C: Surprise the reader — subvert their expectation in the first two sentences.',
  ]

  const drafts = await Promise.all(
    variations.map(variation =>
      anthropic.messages.create({
        model: INTRO_ENGINE_CONFIG.model,
        max_tokens: INTRO_ENGINE_CONFIG.maxTokens,
        messages: [{ role: 'user', content: `${prompt}${hookInstruction}\n\n${variation}` }],
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
        hookType: hook.id,
        version: INTRO_ENGINE_CONFIG.version,
      }
    }
  }

  return {
    narrative: best.text,
    criticScore: best.score,
    hookType: hook.id,
    version: INTRO_ENGINE_CONFIG.version,
  }
}

// ─── Generate Daily Three (one intro per candidate, different hook types) ───

export async function generateDailyThree(
  reader: User,
  candidates: User[],
  readerProfile: CompositeProfile,
  candidateProfiles: CompositeProfile[],
): Promise<Array<{
  candidateId: string
  narrative: string
  criticScore: number | null
  hookType: HookType
}>> {
  // Assign each candidate a different hook type
  const shuffledHooks = [...HOOK_TYPES].sort(() => Math.random() - 0.5)

  const results = await Promise.all(
    candidates.slice(0, 3).map(async (candidate, i) => {
      const profile = candidateProfiles[i]
      const hookType = shuffledHooks[i % shuffledHooks.length].id
      const result = await generateTrailer(reader, candidate, readerProfile, profile, hookType)
      return {
        candidateId: candidate.id,
        narrative: result.narrative,
        criticScore: result.criticScore,
        hookType: result.hookType,
      }
    })
  )

  return results
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
1. HOOK (1 sentence): (see HOOK TYPE instruction below for specific approach)
2. STORY (2-3 sentences): A specific anecdote or set of facts that shows ${subject.first_name}'s character through ACTION. Not adjectives — the actual thing they did. Use their words. Connect actions to HOW THEY THINK, not just what they did.
3. PROOF (1 sentence): A concrete accomplishment, thing they built, or how others experience them.
4. CLOSE (1 sentence): End with a vivid image, a joke, or a specific detail that stays with you. NOT a rhetorical question. NOT sentiment.

TONE RULES (violating these makes the intro trash):
1. NEVER BRAGGY. If a story makes ${subject.first_name} sound like they're announcing their own virtue, you've failed. Show actions, don't celebrate them.
2. NEVER PERSONIFY THE APP. Do NOT say "you need to meet" or "okay so there's this person." No narrator voice.
3. CONTRADICTION > SINGLE NOTE. Tension between two sides of someone is always more interesting.
4. CLOSE WITH VIVID IMAGE OR JOKE, NEVER SENTIMENT. If the last sentence could go on a Hallmark card, delete it.
5. DON'T EXPLAIN THE MEANING. Show behavior, stop. Don't add "and that tells you everything about who they are."
6. FRAME ACCOMPLISHMENTS AS CREATION, NOT EGO. "Built something that didn't exist before" >> "is really good at building things."
7. SPECIFICS > PATTERNS. "Tim Ho Wan and then four more Chinese restaurants" >> "loves food."
8. NO RHETORICAL QUESTIONS as endings. End with a statement or image.
9. NO SUPERLATIVES. Not "the greatest" or "the most amazing" — just show it.

FORMAT:
- 5-7 sentences total.
- This is about ${subject.first_name}, not the reader.
- Do NOT say "you both" or "you'd love" or reference the reader.
- NEVER describe physical appearance.
- Use ${subject.first_name}'s ACTUAL WORDS when possible.
- Do NOT start with "Meet" or "Imagine someone."
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
