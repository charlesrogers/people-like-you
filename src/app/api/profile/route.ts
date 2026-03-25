import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUser, getUserByEmail, saveHardPreferences, saveSoftPreferences, updateUser } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { basics, hardPreferences, softPreferences } = body

    if (!basics?.email || !basics?.first_name || !basics?.gender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for existing user — update fields if provided
    const existing = await getUserByEmail(basics.email)
    if (existing) {
      // Update user fields that may have changed
      const updates: Partial<Parameters<typeof updateUser>[1]> = {}
      if (basics.first_name) updates.first_name = basics.first_name
      if (basics.last_name !== undefined) updates.last_name = basics.last_name
      if (basics.birth_year) updates.birth_year = parseInt(basics.birth_year)
      if (basics.state) updates.state = basics.state
      if (basics.zipcode) updates.zipcode = basics.zipcode
      if (basics.religion !== undefined) updates.religion = basics.religion
      if (basics.observance_level !== undefined) updates.observance_level = basics.observance_level

      if (Object.keys(updates).length > 0) {
        await updateUser(existing.id, updates)
      }

      // Save hard preferences if provided
      if (hardPreferences) {
        await saveHardPreferences({
          user_id: existing.id,
          age_range_min: hardPreferences.age_range_min || null,
          age_range_max: hardPreferences.age_range_max || null,
          distance_radius: hardPreferences.distance_radius || null,
          faith_importance: hardPreferences.faith_importance || null,
          kids: hardPreferences.kids || null,
          marital_history: hardPreferences.marital_history || null,
          smoking: hardPreferences.smoking || null,
          observance_match: hardPreferences.observance_match || null,
          community_fields: hardPreferences.community_fields || {},
        })
      }

      // Save soft preferences if provided
      if (softPreferences) {
        await saveSoftPreferences({
          user_id: existing.id,
          humor_style: softPreferences.humor_style || [],
          energy_level: softPreferences.energy_level || null,
          communication_style: softPreferences.communication_style || null,
          life_stage_priority: softPreferences.life_stage_priority || null,
          date_activity_prefs: softPreferences.date_activity_prefs || [],
        })
      }

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
      zipcode: basics.zipcode || null,
      height: null,
      education: null,
      community: basics.community || 'general',
      religion: basics.religion || null,
      observance_level: basics.observance_level || null,
    } as Parameters<typeof createUser>[0])

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
        observance_match: hardPreferences.observance_match || null,
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
  } catch (err) {
    console.error('Profile creation error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
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
