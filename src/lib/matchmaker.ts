import Anthropic from '@anthropic-ai/sdk'
import type { CompositeProfile, User } from './types'

const anthropic = new Anthropic()

// Excitement type determines how the angle is written
const ANGLE_STYLES: Record<string, string> = {
  explorer: 'Lead with the most unexpected, novel detail. Emphasize new worlds they could discover together. Frame them as someone who will expand their horizons in ways they never expected.',
  nester: 'Lead with character, warmth, and values alignment. Emphasize reliability, shared rhythms, and how this person treats the people around them. Frame them as someone who feels like home.',
  intellectual: 'Lead with what this person is passionate or deeply skilled at. Emphasize depth, curiosity, and unique perspectives. Frame them as someone who will make them think in new ways.',
  spark: 'Lead with personality, humor, and energy. Pull their funniest or most magnetic quote. Frame them as someone who lights up every room they walk into.',
}

export async function generateMatchAngle(
  userA: User,
  userB: User,
  compositeA: CompositeProfile,
  compositeB: CompositeProfile,
): Promise<{ narrativeForA: string; narrativeForB: string }> {
  // Generate both angles in parallel
  const [forA, forB] = await Promise.all([
    writeAngle(userA, userB, compositeA, compositeB),
    writeAngle(userB, userA, compositeB, compositeA),
  ])

  return { narrativeForA: forA, narrativeForB: forB }
}

async function writeAngle(
  recipient: User,
  subject: User,
  recipientProfile: CompositeProfile,
  subjectProfile: CompositeProfile,
): Promise<string> {
  const excitementType = recipientProfile.excitement_type || 'explorer'
  const angleStyle = ANGLE_STYLES[excitementType] || ANGLE_STYLES.explorer

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are the world's best matchmaker — the friend who just GETS it. You're writing a pitch TO ${recipient.first_name} about why they should be genuinely excited to meet ${subject.first_name}.

## ${recipient.first_name} (who you're writing TO):
- Excitement type: ${excitementType}
- Values: ${recipientProfile.values.join(', ') || 'unknown'}
- Interests: ${recipientProfile.interest_tags.join(', ') || 'unknown'}
- Passions: ${recipientProfile.passion_indicators.join(', ') || 'unknown'}
- What they find remarkable: ${recipientProfile.goals.join(', ') || 'unknown'}
- Communication: warmth ${recipientProfile.communication_warmth}, directness ${recipientProfile.communication_directness}

## ${subject.first_name} (who you're writing ABOUT):
- Passions: ${subjectProfile.passion_indicators.join(', ') || 'unknown'}
- Values: ${subjectProfile.values.join(', ') || 'unknown'}
- Interests: ${subjectProfile.interest_tags.join(', ') || 'unknown'}
- Kindness markers: ${subjectProfile.kindness_markers.join(', ') || 'unknown'}
- Humor style: ${subjectProfile.humor_style || 'unknown'}
- Storytelling ability: ${subjectProfile.storytelling_ability}/1.0
- Vulnerability/authenticity: ${subjectProfile.vulnerability_authenticity}/1.0
- Growth direction: ${subjectProfile.goals.join(', ') || 'unknown'}
- Their own words: ${subjectProfile.notable_quotes.slice(0, 3).map(q => `"${q}"`).join(' | ') || 'none available'}

## Your angle style for ${recipient.first_name}:
${angleStyle}

## Rules:
- Write 3-4 sentences MAX. Every word earns its place.
- Pick ONE specific, compelling detail from ${subject.first_name}'s profile and connect it to something ${recipient.first_name} would care about.
- Use ${subject.first_name}'s actual quotes when possible — specificity is everything.
- Feel like a friend pulling them aside at a party: "Okay, you need to meet someone."
- NO physical appearance. NO generic compatibility phrases. NO "you both enjoy..."
- The reader should finish and secretly hope this person says yes to them.
- Write in second person ("you").`,
      },
    ],
  })

  return message.content[0].type === 'text'
    ? message.content[0].text
    : 'There\'s someone here you need to meet. Trust us on this one.'
}

// Score compatibility between two composite profiles (0-1)
export function scoreCompatibility(a: CompositeProfile, b: CompositeProfile): number {
  let score = 0
  let factors = 0

  // 1. Values overlap (shared values are strong signal)
  if (a.values.length && b.values.length) {
    const shared = a.values.filter(v => b.values.includes(v)).length
    const total = new Set([...a.values, ...b.values]).size
    score += (shared / total) * 1.5 // weighted higher
    factors += 1.5
  }

  // 2. Complementary Big Five (some distance = self-expansion, but not too much)
  const a5 = a.big_five_proxy as Record<string, number>
  const b5 = b.big_five_proxy as Record<string, number>
  if (a5.openness !== undefined && b5.openness !== undefined) {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
    let traitScore = 0
    for (const t of traits) {
      const diff = Math.abs((a5[t] || 0.5) - (b5[t] || 0.5))
      // Sweet spot: 0.1-0.3 difference is ideal for self-expansion
      if (diff >= 0.1 && diff <= 0.3) traitScore += 1
      else if (diff < 0.1) traitScore += 0.7 // very similar, still okay
      else if (diff <= 0.5) traitScore += 0.4 // moderate difference
      else traitScore += 0.1 // too different
    }
    score += (traitScore / traits.length)
    factors += 1
  }

  // 3. Interest intersection (novel overlap > obvious overlap)
  if (a.interest_tags.length && b.interest_tags.length) {
    const shared = a.interest_tags.filter(t => b.interest_tags.includes(t)).length
    const novelForA = b.interest_tags.filter(t => !a.interest_tags.includes(t)).length
    // Value both overlap AND novel expansion
    const interestScore = (shared * 0.3 + novelForA * 0.7) / Math.max(b.interest_tags.length, 1)
    score += Math.min(interestScore, 1)
    factors += 1
  }

  // 4. Communication style compatibility
  if (a.communication_warmth !== null && b.communication_warmth !== null) {
    const warmthDiff = Math.abs(a.communication_warmth - b.communication_warmth)
    score += (1 - warmthDiff) * 0.5
    factors += 0.5
  }

  return factors > 0 ? Math.round((score / factors) * 100) / 100 : 0.5
}
