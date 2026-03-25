/**
 * Extraction v2: Two-Pass System
 *
 * Pass 1 (Haiku): Extract STORY facts from each memo — what happened, concrete details, quotes
 * Pass 2 (Sonnet): Read ALL story extractions together, build personality profile by cross-referencing patterns
 *
 * Prompts are versioned and externalized so we can iterate, A/B test, and backtest.
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

// ─── Prompt versioning ───
// Every extraction prompt is versioned. When we change a prompt, bump the version.
// This lets us track which version produced which profile and re-run old transcripts
// against new prompts to compare.

export const EXTRACTION_CONFIG = {
  pass1: {
    version: 'v2.0',
    model: 'claude-haiku-4-5-20251001' as const,
    maxTokens: 1024,
  },
  pass2: {
    version: 'v2.0',
    model: 'claude-sonnet-4-6' as const,
    maxTokens: 2048,
  },
}

// ─── Types ───

export interface StoryExtraction {
  prompt_id: string
  prompt_text: string
  story_summary: string
  concrete_details: string[]
  people_mentioned: string[]
  emotions_expressed: string[]
  notable_quotes: string[]
  response_depth: 'shallow' | 'medium' | 'deep'
  word_count: number
  extraction_version: string
}

export interface PersonalityProfile {
  // Per-dimension data points (specific, concrete, not abstract)
  explorer: {
    data_points: string[]
    confidence: number
    best_quote: string | null
  }
  connector: {
    data_points: string[]
    confidence: number
    best_quote: string | null
  }
  builder: {
    data_points: string[]
    confidence: number
    best_quote: string | null
  }
  nurturer: {
    data_points: string[]
    confidence: number
    best_quote: string | null
  }
  wildcard: {
    data_points: string[]
    confidence: number
    best_quote: string | null
  }

  // Cross-cutting signals
  primary_energy: string
  hidden_depth: string
  humor_signature: string | null
  conversation_fuel: string[]

  // All notable quotes across stories
  all_quotes: string[]

  // Life stage signals
  life_stage?: {
    rootedness: number
    life_pace: number
    life_chapter: 'launching' | 'building' | 'established' | 'reinventing' | null
    trajectory_momentum: number
    trajectory_directions: string[]
    confidence: number
  } | null

  // Versioning
  pass1_version: string
  pass2_version: string
  generated_at: string
}

// ─── Pass 1: Story Extraction (Haiku — cheap, per-memo) ───

export async function extractStory(
  transcript: string,
  promptId: string,
  promptText: string,
): Promise<StoryExtraction> {
  const wordCount = transcript.split(/\s+/).filter(Boolean).length

  // If transcript is too short, return shallow extraction without API call
  if (wordCount < 5) {
    return {
      prompt_id: promptId,
      prompt_text: promptText,
      story_summary: 'Response too short to extract.',
      concrete_details: [],
      people_mentioned: [],
      emotions_expressed: [],
      notable_quotes: [],
      response_depth: 'shallow',
      word_count: wordCount,
      extraction_version: EXTRACTION_CONFIG.pass1.version,
    }
  }

  const message = await anthropic.messages.create({
    model: EXTRACTION_CONFIG.pass1.model,
    max_tokens: EXTRACTION_CONFIG.pass1.maxTokens,
    messages: [
      {
        role: 'user',
        content: `You are extracting structured data from a dating app voice memo transcript.

The person answered this prompt: "${promptText}"

Transcript:
"${transcript}"

Extract and return ONLY a JSON object:
{
  "story_summary": "1-2 sentence summary of what they actually talked about",
  "concrete_details": ["specific names, places, numbers, objects, activities mentioned"],
  "people_mentioned": ["who they talked about and their relationship — e.g. 'sister', 'college roommate Jake', 'their dog Max'"],
  "emotions_expressed": ["feelings that came through — not stated, DEMONSTRATED through tone and word choice"],
  "notable_quotes": ["2-3 most vivid, specific phrases — direct quotes or close paraphrases that reveal personality"],
  "response_depth": "shallow | medium | deep"
}

Rules:
- Only extract what was ACTUALLY SAID. Do not infer topics not discussed.
- Notable quotes must be specific and vivid. "I like hiking" is NOT notable. "I named my sourdough starter Gerald" IS notable.
- concrete_details: real specifics only. Names, places, dollar amounts, time frames, objects.
- emotions_expressed: what you can HEAR in how they talk, not what they claim to feel.
- response_depth: "shallow" = generic, could be anyone. "medium" = some specifics. "deep" = unique, vivid, personal story.
- If the response is shallow/generic, say so honestly. Don't inflate.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return {
      prompt_id: promptId,
      prompt_text: promptText,
      story_summary: 'Extraction failed.',
      concrete_details: [],
      people_mentioned: [],
      emotions_expressed: [],
      notable_quotes: [],
      response_depth: 'shallow',
      word_count: wordCount,
      extraction_version: EXTRACTION_CONFIG.pass1.version,
    }
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    prompt_id: promptId,
    prompt_text: promptText,
    ...parsed,
    word_count: wordCount,
    extraction_version: EXTRACTION_CONFIG.pass1.version,
  }
}

// ─── Pass 2: Personality Profile (Sonnet — expensive, runs once across ALL stories) ───

export async function buildPersonalityProfile(
  stories: StoryExtraction[],
): Promise<PersonalityProfile> {
  // Filter to stories with at least some content (5+ words)
  const validStories = stories.filter(s => s.word_count >= 5)

  if (validStories.length === 0) {
    return emptyProfile()
  }

  // Format stories for the prompt
  const storySummaries = validStories.map((s, i) =>
    `Story ${i + 1} (prompt: "${s.prompt_text}"):
  Summary: ${s.story_summary}
  Details: ${s.concrete_details.join(', ') || 'none'}
  People mentioned: ${s.people_mentioned.join(', ') || 'none'}
  Emotions: ${s.emotions_expressed.join(', ') || 'none'}
  Key quotes: ${s.notable_quotes.map(q => `"${q}"`).join(', ') || 'none'}
  Depth: ${s.response_depth} (${s.word_count} words)`
  ).join('\n\n')

  const message = await anthropic.messages.create({
    model: EXTRACTION_CONFIG.pass2.model,
    max_tokens: EXTRACTION_CONFIG.pass2.maxTokens,
    messages: [
      {
        role: 'user',
        content: `You are the world's best personality analyst for a dating matchmaker.

You have ${validStories.length} voice memo transcripts from the same person. Your job is to figure out who this person ACTUALLY IS — not what they said, but what their stories reveal about them.

Here are their story extractions:

${storySummaries}

From the RESEARCH on romantic chemistry, we know these 5 dimensions matter for matching:

1. EXPLORER (Self-Expansion): What new worlds could this person open for someone? What are they genuinely curious about? What would make someone think "I've never met anyone like this"?

2. CONNECTOR (I-Sharing): What makes this person laugh? What moves them? What would create a "click" moment with the right person? Look for: specific humor, aesthetic taste, emotional reactions to beauty/music/nature.

3. BUILDER (Admiration): What has this person DONE that demonstrates character? Not stated values — VALUES IN ACTION. Specific stories where they showed courage, competence, kindness, or growth. "She quit her job to..." not "she values courage."

4. NURTURER (Comfort): How does this person make others feel? Evidence of warmth, attentiveness, reliability. Look for how they talk ABOUT other people — that reveals more than how they talk about themselves.

5. WILDCARD: What's unexpected about this person? What doesn't fit the pattern? What would make someone go "wait, really?"

6. LIFE STAGE: Where is this person in their life — and where are they headed?
   - rootedness (0.0-1.0): Do they talk like someone planted (home, community, "my neighborhood") or in motion ("wherever I end up", recent moves)?
   - life_pace (0.0-1.0): Is their life fast/intense (packed schedule, multiple projects, ambitious goals) or slow/deliberate (slow mornings, "learned to say no")?
   - life_chapter: One of:
     * "launching" — early career, figuring things out, first apartment energy. ONLY for people who haven't had a prior established chapter.
     * "building" — actively constructing career/family/home, mid-climb
     * "established" — settled in career and life, depth over breadth
     * "reinventing" — post-major-transition: divorce, career change, kids left home, starting over AFTER a prior chapter. KEY: if someone talks about "new beginnings" but references a prior life (ex-spouse, previous career, grown kids), this is REINVENTING, not LAUNCHING.
   - trajectory_momentum (0.0-1.0): "I just started..." = high. "I've been doing this 15 years and love it" = low.
   - trajectory_directions: 0-3 specific directions from their stories (e.g., "pivoting to teaching", "trying to start a family", "building a business")
   - confidence (0.0-1.0): How much evidence exists? If their stories don't touch on life stage at all, confidence: 0.

For each dimension, return:
- data_points: 0-3 SPECIFIC, CONCRETE observations. NOT abstract traits.
  BAD: "Values authenticity" / "Is curious" / "Political philosophy and governance"
  GOOD: "Taught himself to code by building a budget tracker" / "Notices when someone's sitting alone at a party and goes over" / "Named his sourdough starter Gerald"
- confidence: 0.0-1.0 based on how much evidence exists. If only 1 weak signal, say 0.2. If multiple strong stories, say 0.8+.
- best_quote: the single most vivid quote that demonstrates this dimension. null if none.

Also extract:
- primary_energy: What is this person's dominant vibe in 1 specific sentence? Not "they're nice" — something like "They're the person who builds things with their hands and then teaches everyone how to do it."
- hidden_depth: What would surprise someone who just met them? 1 sentence.
- humor_signature: How are they funny? Give an actual example from their words. null if no humor evident.
- conversation_fuel: 3-5 specific topics that would make this person talk for 2 hours. Not categories — specifics. Not "technology" but "building apps to solve annoying daily problems."
- all_quotes: every notable quote across all stories, ranked by vividness

CRITICAL RULES:
- CROSS-REFERENCE stories. If 3 out of 4 stories involve teaching/explaining things to people, that's a pattern. Say so.
- If a topic was mentioned briefly once and isn't a pattern, DON'T elevate it to a data point.
- If you don't have evidence for a dimension, confidence: 0. Don't fabricate data points.
- "Charismatic" is not a data point. "Every story involves him drawing other people in — he talks about welcoming strangers, teaching friends, building things for his community" IS a data point.
- Be HONEST about gaps. A thin profile with honest confidence scores is more useful than a fabricated rich one.

Return ONLY a JSON object with this structure:
{
  "explorer": { "data_points": [...], "confidence": 0.0-1.0, "best_quote": "..." },
  "connector": { "data_points": [...], "confidence": 0.0-1.0, "best_quote": "..." },
  "builder": { "data_points": [...], "confidence": 0.0-1.0, "best_quote": "..." },
  "nurturer": { "data_points": [...], "confidence": 0.0-1.0, "best_quote": "..." },
  "wildcard": { "data_points": [...], "confidence": 0.0-1.0, "best_quote": "..." },
  "primary_energy": "...",
  "hidden_depth": "...",
  "humor_signature": "..." or null,
  "conversation_fuel": [...],
  "all_quotes": [...],
  "life_stage": {
    "rootedness": 0.0-1.0,
    "life_pace": 0.0-1.0,
    "life_chapter": "launching" | "building" | "established" | "reinventing" | null,
    "trajectory_momentum": 0.0-1.0,
    "trajectory_directions": ["specific directions from their stories"],
    "confidence": 0.0-1.0
  }
}`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('Pass 2 failed to produce JSON')
    return emptyProfile()
  }

  const parsed = JSON.parse(jsonMatch[0])
  return {
    ...parsed,
    pass1_version: EXTRACTION_CONFIG.pass1.version,
    pass2_version: EXTRACTION_CONFIG.pass2.version,
    generated_at: new Date().toISOString(),
  }
}

function emptyProfile(): PersonalityProfile {
  const emptyDim = { data_points: [], confidence: 0, best_quote: null }
  return {
    explorer: { ...emptyDim },
    connector: { ...emptyDim },
    builder: { ...emptyDim },
    nurturer: { ...emptyDim },
    wildcard: { ...emptyDim },
    primary_energy: 'Not enough data yet.',
    hidden_depth: 'Not enough data yet.',
    humor_signature: null,
    conversation_fuel: [],
    all_quotes: [],
    life_stage: null,
    pass1_version: EXTRACTION_CONFIG.pass1.version,
    pass2_version: EXTRACTION_CONFIG.pass2.version,
    generated_at: new Date().toISOString(),
  }
}

// ─── Backtest utility ───
// Re-run extraction on existing transcripts with current prompt versions.
// Returns both the old and new profiles for comparison.

export async function backtestUser(
  userId: string,
  memos: Array<{ prompt_id: string; transcript: string; duration_seconds: number | null }>,
  promptTextMap: Map<string, string>,
): Promise<{
  stories: StoryExtraction[]
  profile: PersonalityProfile
  config: typeof EXTRACTION_CONFIG
}> {
  const stories: StoryExtraction[] = []

  for (const memo of memos) {
    if (!memo.transcript || memo.transcript.trim().length === 0) continue
    const promptText = promptTextMap.get(memo.prompt_id) || memo.prompt_id
    const story = await extractStory(memo.transcript, memo.prompt_id, promptText)
    stories.push(story)
  }

  const profile = await buildPersonalityProfile(stories)

  return {
    stories,
    profile,
    config: { ...EXTRACTION_CONFIG },
  }
}
