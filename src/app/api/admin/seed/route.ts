import { NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/db'

export async function GET() {
  const users = await getAllUsers()
  const men = users.filter(u => u.gender === 'Man')
  const women = users.filter(u => u.gender === 'Woman')

  const eloValues = users.map(u => u.elo_score).sort((a, b) => a - b)
  const eloMin = eloValues[0] ?? 0
  const eloMax = eloValues[eloValues.length - 1] ?? 0
  const eloAvg = eloValues.length
    ? Math.round(eloValues.reduce((a, b) => a + b, 0) / eloValues.length)
    : 0

  return NextResponse.json({
    total: users.length,
    men: men.length,
    women: women.length,
    elo: { min: eloMin, max: eloMax, avg: eloAvg },
  })
}
