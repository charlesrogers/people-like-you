import { NextRequest, NextResponse } from 'next/server'
import {
  getUpcomingDates,
  updateScheduledDate,
  getCompositeProfile,
  getMutualMatch,
} from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const upcoming = await getUpcomingDates(24)
  const needsNudge = upcoming.filter((d) => !d.pre_nudge_sent)
  console.log(`Pre-date nudge cron: ${needsNudge.length} dates need nudges`)

  const anthropic = new Anthropic()
  let nudged = 0

  for (const date of needsNudge) {
    try {
      const mutualMatch = await getMutualMatch(date.mutual_match_id)
      if (!mutualMatch) continue

      const compositeA = await getCompositeProfile(mutualMatch.user_a_id)
      const compositeB = await getCompositeProfile(mutualMatch.user_b_id)

      let conversationStarter = "Ask them about something they're passionate about — you'll know it when you hear it."

      if (compositeA && compositeB) {
        try {
          const message = await anthropic.messages.create({
            model: 'claude-haiku-4-20250414',
            max_tokens: 150,
            messages: [
              {
                role: 'user',
                content: `Generate a specific conversation starter for a first date between two people. Person A's interests: ${compositeA.interest_tags.join(', ')}. Person B's interests: ${compositeB.interest_tags.join(', ')}. Write one sentence that references something specific from Person B's profile that Person A should ask about. Be specific, not generic.`,
              },
            ],
          })

          const textBlock = message.content.find((b) => b.type === 'text')
          if (textBlock && textBlock.type === 'text') {
            conversationStarter = textBlock.text.trim()
          }
        } catch (err) {
          console.error(`Pre-date nudge: Claude error for date ${date.id}`, err)
        }
      }

      await updateScheduledDate(date.id, {
        conversation_starter: conversationStarter,
        pre_nudge_sent: true,
      })

      nudged++
      console.log(`Pre-date nudge: sent for date ${date.id}`)
    } catch (err) {
      console.error(`Pre-date nudge: error processing date ${date.id}`, err)
    }
  }

  return NextResponse.json({ ok: true, nudged })
}
