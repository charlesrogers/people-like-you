import { NextRequest,NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { captureStore } from '@/lib/model-data/store'

export async function POST(req:NextRequest) {
 const db=createServerClient()
 const token=req.headers.get('authorization')?.replace(/^Bearer /,'')
 const auth=token?await db.auth.getUser(token):null
 if(!auth?.data.user)return NextResponse.json({error:'Authentication required'},{status:401})
 const body=await req.json()
 if(!['viewed','expanded','photo_revealed','saved'].includes(body.event) || typeof body.eventId!=='string' || body.eventId.length>128 || typeof body.introId!=='string' || typeof body.pitchRevisionId!=='string')return NextResponse.json({error:'Exact revision and event ID required'},{status:400})
 const {data:intro,error}=await db.from('daily_intros').select('*').eq('id',body.introId).eq('user_id',auth.data.user.id).single()
 if(error || !intro)return NextResponse.json({error:'Introduction not found'},{status:404})
 if(intro.pitch_revision_id!==body.pitchRevisionId)return NextResponse.json({error:'Revision mismatch'},{status:409})
 const store=captureStore()
 if(await store.enabled())await store.append('interaction',`interaction:${auth.data.user.id}:${body.eventId}`,{
  introId:intro.id,revisionId:body.pitchRevisionId,event:body.event,eventClass:'product_exposure',
  presentation:'card_may_be_collapsed',client:'member_client',
 },[intro.user_id,intro.matched_user_id],[body.pitchRevisionId])
 return NextResponse.json({ok:true})
}
