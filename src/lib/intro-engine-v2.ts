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
import type {
  CompositeProfile, User,
  PitchClaim, PitchProvenance, PitchRationaleSelfReport,
} from './types'

const anthropic = new Anthropic()

export const INTRO_ENGINE_CONFIG = {
  version: 'v2.0',
  model: 'claude-sonnet-4-6' as const,
  // 2048, not 1024: the same call now returns the pitch AND its rationale +
  // per-claim source map (specs/pitch-rationales.md). Roughly doubles output.
  maxTokens: 2048,
  draftsPerIntro: 3,
  criticModel: 'claude-sonnet-4-6' as const,
  criticMaxTokens: 512,
  minCriticScore: 30,
}

/**
 * What the pitch prompt is NOT given. Hard-coded truth, updated whenever
 * buildTrailerPrompt's input set changes — this is the bias-audit anchor: it
 * records what the model could not possibly have used. See specs/pitch-rationales.md.
 */
export const INPUTS_OMITTED = [
  'personality_quiz',
  'physical_attributes',
  'photos',
  'reader_identity_beyond_taste_bias',
] as const

const RATIONALE_DELIMITER = '---RATIONALE---'

const VALID_SOURCE_TYPES: PitchClaim['source_type'][] = [
  'quote', 'memo', 'vouch', 'profile_field', 'inference', 'none',
]

/**
 * Appended last to every generation call. The rationale is written in the SAME
 * call as the pitch — a post-hoc "explain this intro" call would confabulate a
 * reasoning it never had.
 */
const RATIONALE_OUTPUT_INSTRUCTION = `

OUTPUT FORMAT — two parts, in this order:

PART 1: the intro itself, plain text, nothing else. No preamble, no title, no surrounding quotation marks.

PART 2: on its own line, the delimiter ${RATIONALE_DELIMITER}, then one JSON object (no code fence, no commentary after it):

{
  "rationale": {
    "why_this_hook": "why you opened the way you did",
    "why_this_lead": "why you led with this quality of theirs rather than another",
    "tone_choices": "the deliberate tone and word choices you made, and why"
  },
  "claims": [
    {
      "sentence": "the sentence from the intro, verbatim",
      "claim": "the factual assertion that sentence makes",
      "source_type": "quote | memo | vouch | profile_field | inference | none",
      "source_ref": "which input it came from, e.g. 'their own words #2' or 'Values'",
      "source_excerpt": "the verbatim text from the input above that supports it"
    }
  ]
}

RULES FOR claims (this is an audit record, not marketing — accuracy over flattery):
- One entry per factual sentence in the intro. A sentence asserting nothing factual can be skipped.
- "source_excerpt" MUST be copied verbatim from the input given above — character for character, including its original capitalization. Do not paraphrase it, do not tidy it up, do not re-punctuate it, do not capitalize a lowercase first letter.
- If you cannot copy an exact excerpt, then it is not a sourced claim: use "inference" (you connected dots the inputs support but do not state — name what you inferred from) or "none" (you have no source).
- Marking a claim "none" is honest and useful. Dressing an unsourced claim up as "profile_field" is not.
- Writing this JSON must not change the intro. Write the best intro you can, then report on it truthfully.`

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
  criticSubscores: { hookPower: number; intrigue: number; specificity: number; mystery: number } | null
  hookType: HookType
  generationAttempts: number
  quoteUsed: boolean
  version: string
  provenance: PitchProvenance
}> {
  const { prompt, inputs } = buildTrailerPrompt(reader, subject, readerProfile, subjectProfile)

  // If specific hook type requested, generate 3 drafts with that hook
  // Otherwise, generate 1 draft per hook type (for Daily Three)
  const hook = hookType
    ? HOOK_TYPES.find(h => h.id === hookType)!
    : HOOK_TYPES[Math.floor(Math.random() * HOOK_TYPES.length)]

  const hookInstruction = `\n\nHOOK TYPE: ${hook.label}\n${hook.instruction}`

  // Generate 3 drafts with the same hook type but different creative approaches
  const variations = [
    { id: 'A', instruction: 'Approach A: Lead with the single most vivid detail you can find.' },
    { id: 'B', instruction: 'Approach B: Build momentum — each sentence should raise the stakes.' },
    { id: 'C', instruction: 'Approach C: Surprise the reader — subvert their expectation in the first two sentences.' },
  ]

  const generated = await Promise.all(
    variations.map(variation => {
      const promptText = `${prompt}${hookInstruction}\n\n${variation.instruction}${RATIONALE_OUTPUT_INSTRUCTION}`
      return anthropic.messages.create({
        model: INTRO_ENGINE_CONFIG.model,
        max_tokens: INTRO_ENGINE_CONFIG.maxTokens,
        messages: [{ role: 'user', content: promptText }],
      }).then(msg => {
        const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
        return { approach: variation.id, promptText, ...splitTrailerResponse(raw) }
      })
    })
  )

  // Score all drafts (on the pitch text only — the rationale block is stripped first)
  const scored = await scoreDrafts(generated.map(g => g.text), reader, subject, readerProfile)
  const candidates = generated.map((g, i) => ({ ...g, ...scored[i] }))

  // Pick the best
  let best = candidates.reduce((a, b) => a.score > b.score ? a : b)
  let generationAttempts = 1

  // If best is below threshold, regenerate with feedback
  if (best.score < INTRO_ENGINE_CONFIG.minCriticScore) {
    generationAttempts = 2
    const regenPrompt = `${prompt}\n\nA previous draft scored poorly. The critic said: "${best.feedback}"\n\nFix these issues. Write a better version that specifically addresses the feedback.${RATIONALE_OUTPUT_INSTRUCTION}`
    const regen = await anthropic.messages.create({
      model: INTRO_ENGINE_CONFIG.model,
      max_tokens: INTRO_ENGINE_CONFIG.maxTokens,
      messages: [{ role: 'user', content: regenPrompt }],
    })
    const regenRaw = regen.content[0].type === 'text' ? regen.content[0].text : ''
    const regenParsed = splitTrailerResponse(regenRaw)
    const regenText = regenParsed.text || best.text
    const regenScored = await scoreDrafts([regenText], reader, subject, readerProfile)
    const regenCandidate = {
      approach: 'regen',
      promptText: regenPrompt,
      rationale: regenParsed.rationale,
      claims: regenParsed.claims,
      // scoreDrafts echoes the text it scored, so this carries regenText
      ...regenScored[0],
    }
    candidates.push(regenCandidate)
    if (regenCandidate.score > best.score) {
      best = regenCandidate
    }
  }

  // Check if a quote was used in the final narrative
  const subjectQuotes = subjectProfile.notable_quotes ?? []
  const quoteUsed = subjectQuotes.some(q => q.length > 10 && best.text.includes(q))

  const provenance: PitchProvenance = {
    kind: 'generated',
    sample_ref: null,
    subject_user_id: subject.id,
    reader_user_id: reader.id,
    engine_version: INTRO_ENGINE_CONFIG.version,
    model: INTRO_ENGINE_CONFIG.model,
    prompt_text: best.promptText,
    hook_type: hook.id,
    approach_variant: best.approach,
    quote_used: quoteUsed,
    generation_attempts: generationAttempts,
    inputs,
    inputs_omitted: [...INPUTS_OMITTED],
    // Every draft, winner and losers. Losers keep text + critic scores only —
    // their rationale/claims are discarded (cost control, spec §Implementation).
    drafts: candidates.map(c => ({
      approach: c.approach,
      text: c.text,
      critic_score: c.score,
      critic_subscores: {
        hookPower: c.hookPower,
        intrigue: c.personalization,
        specificity: c.specificity,
        mystery: c.mystery,
      },
      critic_feedback: c.feedback || null,
      selected: c === best,
    })),
    critic_feedback: best.feedback || null,
    rationale: best.rationale,
    claims: best.claims,
  }

  return {
    narrative: best.text,
    criticScore: best.score,
    criticSubscores: {
      hookPower: best.hookPower,
      intrigue: best.personalization,
      specificity: best.specificity,
      mystery: best.mystery,
    },
    hookType: hook.id,
    generationAttempts,
    quoteUsed,
    version: INTRO_ENGINE_CONFIG.version,
    provenance,
  }
}

// ─── Same-call rationale parsing ───

/**
 * Splits a generation response into the pitch and its self-reported rationale.
 * A malformed or missing rationale block must never cost us the pitch — the
 * text is returned regardless and the rationale comes back empty.
 */
export function splitTrailerResponse(raw: string): {
  text: string
  rationale: PitchRationaleSelfReport | null
  claims: PitchClaim[]
} {
  const idx = raw.indexOf(RATIONALE_DELIMITER)
  if (idx === -1) return { text: raw.trim(), rationale: null, claims: [] }

  const text = raw.slice(0, idx).trim()
  const tail = raw.slice(idx + RATIONALE_DELIMITER.length)
  const jsonMatch = tail.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return { text, rationale: null, claims: [] }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      rationale?: Partial<PitchRationaleSelfReport>
      claims?: Array<Record<string, unknown>>
    }
    const rationale: PitchRationaleSelfReport | null = parsed.rationale
      ? {
          why_this_hook: parsed.rationale.why_this_hook ?? null,
          why_this_lead: parsed.rationale.why_this_lead ?? null,
          tone_choices: parsed.rationale.tone_choices ?? null,
        }
      : null

    const claims: PitchClaim[] = (parsed.claims ?? []).map((c) => {
      const rawType = String(c.source_type ?? '').trim() as PitchClaim['source_type']
      return {
        sentence: String(c.sentence ?? ''),
        claim: String(c.claim ?? ''),
        // An unrecognised source_type is treated as unsourced: over-flagging is
        // the safe direction for an audit log.
        source_type: VALID_SOURCE_TYPES.includes(rawType) ? rawType : 'none',
        source_ref: c.source_ref != null ? String(c.source_ref) : null,
        source_excerpt: c.source_excerpt != null ? String(c.source_excerpt) : null,
        verdict: null,
        verifier_note: null,
      }
    })

    return { text, rationale, claims }
  } catch {
    return { text, rationale: null, claims: [] }
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
  criticSubscores: { hookPower: number; intrigue: number; specificity: number; mystery: number } | null
  hookType: HookType
  generationAttempts: number
  quoteUsed: boolean
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
        criticSubscores: result.criticSubscores,
        hookType: result.hookType,
        generationAttempts: result.generationAttempts,
        quoteUsed: result.quoteUsed,
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
): { prompt: string; inputs: Record<string, unknown> } {
  // Gather reader data
  const readerInterests = readerProfile.interest_tags?.join(', ') || 'unknown'
  const readerValues = readerProfile.values?.join(', ') || 'unknown'
  const readerQuotes = readerProfile.notable_quotes?.slice(0, 3).map(q => `"${q}"`).join(' | ') || 'none'
  const readerPassions = readerProfile.passion_indicators?.join(', ') || 'unknown'

  // Gather subject data
  const subjectPassions = subjectProfile.passion_indicators?.join(', ') || 'unknown'
  const subjectValues = subjectProfile.values?.join(', ') || 'unknown'
  const subjectInterests = subjectProfile.interest_tags?.join(', ') || 'unknown'
  const subjectQuoteList = subjectProfile.notable_quotes?.slice(0, 4) ?? []
  const subjectQuotes = subjectQuoteList.map(q => `"${q}"`).join('\n  ') || 'none'
  const subjectHumor = subjectProfile.humor_signature?.humor_examples?.join(', ')
    || subjectProfile.humor_style || 'unknown'
  const subjectKindness = subjectProfile.kindness_markers?.join(', ') || 'unknown'
  const subjectVIAList = (subjectProfile.values_in_action ?? []).slice(0, 2)
  const subjectVIA = subjectVIAList.join('; ') || 'none'
  const subjectVouchList = (subjectProfile.friend_vouch_quotes ?? []).slice(0, 2)
  const subjectVouches = subjectVouchList.map(q => `"${q}"`).join(' | ') || 'none'

  // Try to extract v2 profile data if available
  const profileAny = subjectProfile as unknown as Record<string, unknown>
  const primaryEnergy = (profileAny.primary_energy as string) || ''
  const hiddenDepth = (profileAny.hidden_depth as string) || ''

  // The provenance record of what actually went into the prompt — same fields,
  // same truncation. Claims are audited against this, so it must not be a
  // superset of what the model saw. Note `readerInterests` / `readerQuotes` are
  // computed above but never reach the prompt, so they are not inputs.
  const inputs: Record<string, unknown> = {
    subject: {
      first_name: subject.first_name,
      passion_indicators: subjectProfile.passion_indicators ?? [],
      values: subjectProfile.values ?? [],
      interest_tags: subjectProfile.interest_tags ?? [],
      notable_quotes: subjectQuoteList,
      humor: subjectHumor,
      kindness_markers: subjectProfile.kindness_markers ?? [],
      values_in_action: subjectVIAList,
      friend_vouch_quotes: subjectVouchList,
      primary_energy: primaryEnergy || null,
      hidden_depth: hiddenDepth || null,
    },
    reader: {
      passion_indicators: readerProfile.passion_indicators ?? [],
      values: readerProfile.values ?? [],
    },
    // The same content AS RENDERED into the prompt. Required for the verbatim
    // claim audit: the model sees `values.join(', ')` as one line and quotes
    // spans that cross array elements, which no single element contains.
    rendered: {
      passions: subjectPassions,
      values: subjectValues,
      interests: subjectInterests,
      notable_quotes: subjectQuotes,
      humor: subjectHumor,
      kindness_markers: subjectKindness,
      values_in_action: subjectVIA,
      friend_vouch_quotes: subjectVouches,
      primary_energy: primaryEnergy,
      hidden_depth: hiddenDepth,
      reader_passions: readerPassions,
      reader_values: readerValues,
    },
  }

  const prompt = `You are writing an introduction that makes ${subject.first_name} sound like the most fascinating person someone hasn't met yet. This is a trailer, not a profile summary. Your job is to make ${subject.first_name} irresistible.

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

  return { prompt, inputs }
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
