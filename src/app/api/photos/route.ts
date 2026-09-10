import { NextRequest, NextResponse } from 'next/server'
import { authenticatedProfileOwner } from '@/lib/model-data/auth'
import { createServerClient } from '@/lib/supabase'
import { signPhotoUrl } from '@/lib/photos'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId || !await authenticatedProfileOwner(req.headers, userId)) return NextResponse.json({error:'Authentication required'}, {status:401})
  const {data,error} = await createServerClient().from('photos').select('id,storage_path,sort_order').eq('user_id',userId).order('sort_order')
  if(error) return NextResponse.json({error:'Could not load photos'}, {status:500})
  const photos = await Promise.all((data ?? []).map(async p => ({id:p.id,sortOrder:p.sort_order,url:await signPhotoUrl(p.storage_path)})))
  return NextResponse.json({photos}, {headers:{'Cache-Control':'private, no-store'}})
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const {userId,photoId} = body ?? {}
  if(typeof userId !== 'string' || !await authenticatedProfileOwner(req.headers,userId)) return NextResponse.json({error:'Authentication required'}, {status:401})
  if(typeof photoId !== 'string') return NextResponse.json({error:'Photo ID required'}, {status:400})
  const db = createServerClient()
  const {data:photo,error} = await db.from('photos').select('storage_path').eq('id',photoId).eq('user_id',userId).maybeSingle()
  if(error) return NextResponse.json({error:'Could not find photo'}, {status:500})
  if(!photo) return NextResponse.json({ok:true}) // An already-completed removal can be retried.
  const {error:storageError} = await db.storage.from('photos').remove([photo.storage_path])
  if(storageError) return NextResponse.json({error:'Could not remove photo. Please retry.'}, {status:500})
  const {error:deleteError} = await db.from('photos').delete().eq('id',photoId).eq('user_id',userId)
  if(deleteError) return NextResponse.json({error:'Could not finish removing photo. Please retry.'}, {status:500})
  return NextResponse.json({ok:true})
}
