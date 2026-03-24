/**
 * Narrative Engine Test Harness
 *
 * Tests whether the narrative engine can produce meaningfully different intros.
 *
 * Usage:
 *   npx tsx src/scripts/test-narratives.ts --list
 *   npx tsx src/scripts/test-narratives.ts --all
 *   npx tsx src/scripts/test-narratives.ts <candidate_id> <recipient_id>
 */

import { getUser, getCompositeProfile, getAllUsers } from '../lib/db'
import { scoreAllStrategies, applyExcitementModifiers } from '../lib/narrative-strategy'
import { generateNarrativeWithPipeline, computeCompatibilityBreakdown } from '../lib/matchmaker'
import type { User } from '../lib/types'

// ─── Helpers ───

function divider(title: string) {
  console.log('\n' + '═'.repeat(70))
  console.log(`  ${title}`)
  console.log('═'.repeat(70))
}

function subDivider(title: string) {
  console.log('\n' + '─'.repeat(50))
  console.log(`  ${title}`)
  console.log('─'.repeat(50))
}

// ─── List users with composites ───

async function listUsers() {
  const users = await getAllUsers()
  console.log('\nUsers with profiles:\n')

  for (const user of users) {
    const composite = await getCompositeProfile(user.id)
    const status = composite
      ? `✓ composite (${composite.memo_count} memos, type: ${composite.excitement_type || 'unknown'})`
      : '✗ no composite'
    console.log(`  ${user.first_name} ${user.last_name || ''} (${user.gender}) — ${status}`)
    console.log(`    ID: ${user.id}`)
    if (composite) {
      console.log(`    Values: ${composite.values?.slice(0, 5).join(', ') || 'none'}`)
      console.log(`    Interests: ${composite.interest_tags?.slice(0, 5).join(', ') || 'none'}`)
      console.log(`    Quotes: ${composite.notable_quotes?.slice(0, 2).join(' | ') || 'none'}`)
    }
    console.log()
  }
}

// ─── Test a specific pair ───

async function testPair(candidateId: string, recipientId: string) {
  const candidate = await getUser(candidateId)
  const recipient = await getUser(recipientId)
  if (!candidate || !recipient) {
    console.error('User not found. Run with --list to see available users.')
    return
  }

  const compositeCandidate = await getCompositeProfile(candidateId)
  const compositeRecipient = await getCompositeProfile(recipientId)
  if (!compositeCandidate || !compositeRecipient) {
    console.error('Composite profile not found. User needs to complete voice memos first.')
    console.error(`  Candidate composite: ${compositeCandidate ? 'yes' : 'MISSING'}`)
    console.error(`  Recipient composite: ${compositeRecipient ? 'yes' : 'MISSING'}`)
    return
  }

  divider(`Writing about ${candidate.first_name} FOR ${recipient.first_name}`)
  console.log(`  Candidate: ${candidate.first_name} (${candidate.gender}, excitement: ${compositeCandidate.excitement_type || 'unknown'})`)
  console.log(`    Values: ${compositeCandidate.values?.join(', ') || 'none'}`)
  console.log(`    Interests: ${compositeCandidate.interest_tags?.join(', ') || 'none'}`)
  console.log(`    Humor: ${compositeCandidate.humor_style || 'unknown'}`)
  console.log(`    Quotes: ${compositeCandidate.notable_quotes?.slice(0, 3).join(' | ') || 'none'}`)
  console.log()
  console.log(`  Recipient: ${recipient.first_name} (${recipient.gender}, excitement: ${compositeRecipient.excitement_type || 'unknown'})`)
  console.log(`    Values: ${compositeRecipient.values?.join(', ') || 'none'}`)
  console.log(`    Interests: ${compositeRecipient.interest_tags?.join(', ') || 'none'}`)

  // Score ALL strategies to see the landscape
  const breakdown = computeCompatibilityBreakdown(compositeCandidate, compositeRecipient)
  const allStrategies = scoreAllStrategies(compositeRecipient, compositeCandidate, breakdown)
  applyExcitementModifiers(allStrategies, compositeRecipient.excitement_type)
  allStrategies.sort((a: { score: number }, b: { score: number }) => b.score - a.score)

  subDivider('ALL 12 STRATEGY SCORES')
  const tierEmoji: Record<string, string> = {
    self_expansion: '🧭',
    i_sharing: '💜',
    admiration: '⭐',
    comfort: '🏠',
  }

  for (const s of allStrategies) {
    const emoji = tierEmoji[s.tier] || '?'
    const bar = '█'.repeat(Math.round(s.score * 20))
    console.log(`  ${emoji} ${s.tier.padEnd(16)} ${s.type.padEnd(28)} ${s.score.toFixed(3)} ${bar}`)
  }

  // Generate 3 narratives (the pipeline picks the strategy internally)
  // Each call may pick a different strategy due to the 10% randomization
  subDivider('GENERATING 3 NARRATIVES')

  for (let i = 0; i < 3; i++) {
    console.log(`\n  [Attempt ${i + 1}/3] Generating...`)
    try {
      const result = await generateNarrativeWithPipeline(
        recipient,
        candidate,
        compositeRecipient,
        compositeCandidate,
        breakdown,
      )

      console.log(`  Strategy: ${result.strategy?.tier || 'unknown'} / ${result.strategy?.type || 'unknown'}`)
      console.log(`  Critic score: ${result.criticScore ?? 'N/A'}/50`)
      console.log(`  Used quote: ${result.usedQuote ? 'yes' : 'no'}`)
      console.log()
      console.log(`  📝 NARRATIVE:`)
      console.log(`  ┌──────────────────────────────────────────────────────┐`)
      const narrative = result.narrative || '(empty)'
      for (const sentence of narrative.split(/(?<=\.) /)) {
        console.log(`  │ ${sentence.trim()}`)
      }
      console.log(`  └──────────────────────────────────────────────────────┘`)
    } catch (err) {
      console.error(`  ❌ Generation failed: ${err instanceof Error ? err.message : err}`)
    }
  }

  divider('END TEST')
}

// ─── Main ───

async function main() {
  const args = process.argv.slice(2)

  if (args[0] === '--list') {
    await listUsers()
  } else if (args[0] === '--all') {
    const users = await getAllUsers()
    const withComposites: User[] = []
    for (const u of users) {
      const c = await getCompositeProfile(u.id)
      if (c && c.memo_count > 0) withComposites.push(u)
    }

    console.log(`\nFound ${withComposites.length} users with composites.\n`)

    if (withComposites.length < 2) {
      console.error('Need at least 2 users with composites. Run --list to check.')
      return
    }

    let tested = 0
    for (let i = 0; i < withComposites.length && tested < 3; i++) {
      for (let j = i + 1; j < withComposites.length && tested < 3; j++) {
        await testPair(withComposites[i].id, withComposites[j].id)
        tested++
      }
    }
  } else if (args.length === 2) {
    await testPair(args[0], args[1])
  } else {
    console.log('Narrative Engine Test Harness')
    console.log()
    console.log('Usage:')
    console.log('  npx tsx src/scripts/test-narratives.ts --list              # list users with composites')
    console.log('  npx tsx src/scripts/test-narratives.ts --all               # test first 3 pairs')
    console.log('  npx tsx src/scripts/test-narratives.ts <cand_id> <recip_id> # test specific pair')
  }
}

main().catch(console.error)
