import { createServerClient } from '../supabase'
import { captureStore } from './store'

/** Old clients remain readable before rollout; capture requires the actual member identity. */
export async function captureActorAllowed(headers:Headers,personId:string) {
 if(!await captureStore().enabled())return true
 const token=headers.get('authorization')?.replace(/^Bearer /,'')
 if(!token)return false
 const {data,error}=await createServerClient().auth.getUser(token)
 return !error && data.user?.id===personId
}
