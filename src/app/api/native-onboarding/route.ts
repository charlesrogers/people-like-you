import { NextRequest, NextResponse } from 'next/server'
import { authenticatedProfileOwner } from '@/lib/model-data/auth'
import { createServerClient } from '@/lib/supabase'
import { resolveUserLocation } from '@/lib/geo'

/** Owned, partial updates for the native forms; never creates a second account. */
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (typeof body?.userId !== 'string' || !await authenticatedProfileOwner(req.headers, body.userId)) {
    return NextResponse.json({error:'Authentication required'}, {status:401})
  }
  const db = createServerClient()
  const {data:user,error:readError} = await db.from('users').select('id,email,phone_number').eq('id',body.userId).maybeSingle()
  if (readError || !user) return NextResponse.json({error:'Could not load your account'}, {status:404})
  const updates: Record<string, unknown> = {}
  if (body.section === 'basics') {
    const b = body.basics
    if (!b || typeof b.first_name !== 'string' || !b.first_name.trim() || b.first_name.length > 100 || !['Man','Woman'].includes(b.gender) || !Number.isInteger(b.birth_year) || b.birth_year < 1900 || b.birth_year > new Date().getFullYear()-18 || typeof b.zipcode !== 'string' || !/^\d{5}$/.test(b.zipcode)) {
      return NextResponse.json({error:'Enter your name, gender, birth year (18+), and five-digit ZIP code.'}, {status:400})
    }
    Object.assign(updates,{first_name:b.first_name.trim(),last_name:typeof b.last_name==='string'?b.last_name.trim().slice(0,100):null,gender:b.gender,seeking:b.gender==='Man'?'Women':'Men',birth_year:b.birth_year,zipcode:b.zipcode,onboarding_stage:'voice'})
    const location = await resolveUserLocation(b.zipcode)
    Object.assign(updates, location ?? {latitude:null,longitude:null,metro_code:null})
    if (!user.email && user.phone_number && typeof b.email === 'string' && b.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim())) return NextResponse.json({error:'Enter a valid email or leave it blank.'},{status:400})
      updates.email=b.email.trim()
    }
  } else if (body.section === 'preferences') {
    const p = body.preferences
    if (!p || !Number.isInteger(p.age_range_min) || !Number.isInteger(p.age_range_max) || p.age_range_min < 18 || p.age_range_max > 100 || p.age_range_min > p.age_range_max || !['essential','important','nice_to_have','doesnt_matter'].includes(p.faith_importance) || !['has','wants','open','doesnt_want'].includes(p.kids) || !['same_metro','few_hours','anywhere'].includes(p.distance_radius)) {
      return NextResponse.json({error:'Choose your age range, shared-faith preference, and preference about kids.'}, {status:400})
    }
    const {error} = await db.from('hard_preferences').upsert({user_id:user.id,age_range_min:p.age_range_min,age_range_max:p.age_range_max,distance_radius:p.distance_radius,faith_importance:p.faith_importance,kids:p.kids,marital_history:typeof p.marital_history==='string'?p.marital_history.slice(0,40):null,observance_match:typeof p.observance_match==='string'?p.observance_match.slice(0,40):null},{onConflict:'user_id'})
    if(error) return NextResponse.json({error:'Could not save preferences. Please retry.'},{status:500})
    if(typeof body.religion==='string') updates.religion=body.religion.slice(0,60)
    if(typeof body.observanceLevel==='string') updates.observance_level=body.observanceLevel.slice(0,40)
    updates.onboarding_stage='photos'
  } else {
    return NextResponse.json({error:'Unknown onboarding section'}, {status:400})
  }
  const {error} = await db.from('users').update(updates).eq('id',user.id)
  if(error) return NextResponse.json({error:'Could not save your details. Please retry.'},{status:500})
  return NextResponse.json({ok:true})
}
