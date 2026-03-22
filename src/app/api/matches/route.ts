import { NextRequest, NextResponse } from 'next/server'
import { getUser, getCompatibleUsers, getCompositeProfile, getUserPhotos } from '@/lib/db'
import { generateMatchAngle, scoreCompatibility } from '@/lib/matchmaker'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const user = await getUser(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const userComposite = await getCompositeProfile(userId)
  const candidates = await getCompatibleUsers(user)

  // Score and rank candidates by compatibility
  const scored = await Promise.all(
    candidates.map(async (candidate) => {
      const candidateComposite = await getCompositeProfile(candidate.id)
      const photos = await getUserPhotos(candidate.id)
      const score = candidateComposite && userComposite
        ? scoreCompatibility(userComposite, candidateComposite)
        : 0.5
      return { candidate, candidateComposite, photos, score }
    })
  )

  // Sort by score, take top 5
  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 5)

  // Generate angle narratives for top matches
  const matches = await Promise.all(
    top.map(async ({ candidate, candidateComposite, photos, score }) => {
      let narrative = "There's someone here you should meet. Trust us on this one."

      if (userComposite && candidateComposite) {
        try {
          const angles = await generateMatchAngle(user, candidate, userComposite, candidateComposite)
          narrative = angles.narrativeForA
        } catch (err) {
          console.error('Failed to generate angle for', candidate.id, err)
        }
      }

      // Expansion points: interests they have that user doesn't
      const expansionPoints = candidateComposite?.interest_tags.filter(
        tag => !userComposite?.interest_tags.includes(tag)
      )?.slice(0, 5) || []

      return {
        id: candidate.id,
        name: candidate.first_name,
        narrative,
        expansionPoints,
        photoUrl: photos[0]?.public_url || null,
        compatibilityScore: score,
      }
    })
  )

  return NextResponse.json({ matches })
}
