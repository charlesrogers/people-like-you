import { AsyncLocalStorage } from 'node:async_hooks'
import { createServerClient } from '../supabase'
import { CaptureError } from './core'

export interface CapturedRecord {
 id: string; kind: string; payload: Record<string, unknown>; person_ids: string[]
}
export interface Attempt { id: string; attempt_number: number }
export interface CaptureStore {
 enabled(): Promise<boolean>
 append(kind: string,key: string,payload: unknown,people: string[],parents: string[]): Promise<string>
 start(job: string): Promise<Attempt>
 finish(attempt: string,values: Record<string,unknown>): Promise<void>
 get(id: string): Promise<CapturedRecord>
 stale(ids: string[],reason: string): Promise<void>
 isStale(id:string): Promise<boolean>
}
const fixtureStore = new AsyncLocalStorage<CaptureStore>()
export const withCaptureStore = <T>(store: CaptureStore, fn: () => Promise<T>) => {
 if (process.env.NODE_ENV !== 'test') throw new Error('Fixture store is test-only')
 return fixtureStore.run(store,fn)
}
const prod: CaptureStore = {
 async enabled() {
  if (process.env.MODEL_DATA_CAPTURE_ENABLED === 'false') return false
  if (process.env.NODE_ENV === 'test') return false
  const {data,error} = await createServerClient().from('model_data_settings').select('capture_enabled').eq('id',true).single()
  if(error) throw new CaptureError()
  return process.env.MODEL_DATA_CAPTURE_ENABLED === 'true' || data.capture_enabled === true
 },
 async append(kind,key,payload,people,parents) {
  const {data,error} = await createServerClient().rpc('model_data_append',{p_kind:kind,p_key:key,p_payload:payload,p_people:[...new Set(people)].sort(),p_parents:[...new Set(parents)].sort()})
  if(error || !data) throw new CaptureError()
  return data as string
 },
 async start(job) {
  const {data,error} = await createServerClient().rpc('model_data_start_attempt',{p_job:job})
  if(error || !data?.[0]) throw new CaptureError()
  return data[0] as Attempt
 },
 async finish(id,values) {
  const {data,error}=await createServerClient().from('model_data_attempts').update({...values,finished_at:new Date().toISOString()}).eq('id',id).eq('status','started').select('id').single()
  if(error || !data) throw new CaptureError()
 },
 async get(id) {
  const {data,error}=await createServerClient().from('model_data_records').select('*').eq('id',id).single()
  if(error || !data) throw new CaptureError()
  return data as CapturedRecord
 },
 async isStale(id) {
  const {data,error}=await createServerClient().from('model_data_invalidations').select('record_id').eq('record_id',id).maybeSingle()
  if(error)throw new CaptureError()
  return !!data
 },
 async stale(ids,reason) {
  if(!ids.length)return
  const {error}=await createServerClient().rpc('model_data_stale',{p_roots:ids,p_reason:reason})
  if(error)throw new CaptureError()
 },
}
export const captureStore = () => fixtureStore.getStore() ?? prod
