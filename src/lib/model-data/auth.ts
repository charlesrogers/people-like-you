import { createServerClient } from '../supabase'
import { captureStore } from './store'

export async function authenticatedProfileOwner(headers:Headers,personId:string) {
 const token=headers.get('authorization')?.replace(/^Bearer /,'')
 if(!token)return false
 const db=createServerClient()
 const {data,error}=await db.auth.getUser(token)
 if(error || !data.user)return false
 if(data.user.id===personId)return true
 // The existing login route returns the profile found by email. Older profiles
 // can predate their auth UUID. Require a confirmed auth email for that bridge.
 if(!data.user.email || !data.user.email_confirmed_at)return false
 const {data:profile,error:profileError}=await db.from('users').select('email').eq('id',personId).maybeSingle()
 return !profileError && typeof profile?.email==='string' && profile.email.trim().toLowerCase()===data.user.email.trim().toLowerCase()
}

export async function captureActorAllowed(headers:Headers,personId:string) {
 if(!await captureStore().enabled())return true
 return authenticatedProfileOwner(headers,personId)
}
