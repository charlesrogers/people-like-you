import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUser, getUserByEmail, saveHardPreferences, saveSoftPreferences, updateUser } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { basics, hardPreferences, softPreferences } = body

  if (!basics?.email || !basics?.first_name || !basics?.gender) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check for existing user
  const existing = await getUserByEmail(basics.email)
  if (existing) {
    return NextResponse.json({ id: existing.id, existing: true })
  }

  // Create user
  const user = await createUser({
    email: basics.email,
    first_name: basics.first_name,
    last_name: basics.last_name || null,
    gender: basics.gender,
    seeking: basics.gender === 'Man' ? 'Women' : 'Men',
    birth_year: basics.birth_year ? parseInt(basics.birth_year) : null,
    state: basics.state || null,
    height: null,
    education: null,
    community: basics.community || 'general',
  })

  // Save hard preferences
  if (hardPreferences) {
    await saveHardPreferences({
      user_id: user.id,
      age_range_min: hardPreferences.age_range_min || null,
      age_range_max: hardPreferences.age_range_max || null,
      distance_radius: hardPreferences.distance_radius || null,
      faith_importance: hardPreferences.faith_importance || null,
      kids: hardPreferences.kids || null,
      marital_history: hardPreferences.marital_history || null,
      smoking: hardPreferences.smoking || null,
      community_fields: hardPreferences.community_fields || {},
    })
  }

  // Save soft preferences
  if (softPreferences) {
    await saveSoftPreferences({
      user_id: user.id,
      humor_style: softPreferences.humor_style || [],
      energy_level: softPreferences.energy_level || null,
      communication_style: softPreferences.communication_style || null,
      life_stage_priority: softPreferences.life_stage_priority || null,
      date_activity_prefs: softPreferences.date_activity_prefs || [],
    })
  }

  // Update onboarding stage
  await updateUser(user.id, { onboarding_stage: 'day0_complete' })

  return NextResponse.json({ id: user.id })
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const user = await getUser(id)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ profile: user })
}
