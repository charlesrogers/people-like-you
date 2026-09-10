import { NextRequest,NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { createServerClient } from '@/lib/supabase'

export async function GET(req:NextRequest) {
 const expected=process.env.ADMIN_SECRET
 const provided=req.headers.get('x-admin-secret')??''
 if(!expected || Buffer.byteLength(expected)!==Buffer.byteLength(provided) || !timingSafeEqual(Buffer.from(expected),Buffer.from(provided)))return NextResponse.json({error:'Unauthorized'},{status:401})
 const {data,error}=await createServerClient().rpc('model_data_status')
 if(error)return NextResponse.json({error:'Capture status unavailable'},{status:503})
 return NextResponse.json({version:'capture-v1',...data},{headers:{'Cache-Control':'no-store'}})
}
