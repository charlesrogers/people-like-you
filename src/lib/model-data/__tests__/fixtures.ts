import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import type { CaptureStore, CapturedRecord, Attempt } from '../store'
export const SUBJECT='00000000-0000-4000-8000-000000000001'
export const READER='00000000-0000-4000-8000-000000000002'
export const MEMO='00000000-0000-4000-8000-000000000003'
export async function fixture() {
 const db=new PGlite()
 await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 CREATE TABLE users(id uuid PRIMARY KEY);
 CREATE TABLE voice_memos(id uuid PRIMARY KEY,user_id uuid REFERENCES users(id) ON DELETE CASCADE,transcript text,processing_status text,extraction jsonb,processing_error text);
 CREATE TABLE composite_profiles(user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE);
 CREATE TABLE daily_intros(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES users(id) ON DELETE CASCADE,matched_user_id uuid REFERENCES users(id) ON DELETE CASCADE,narrative text);
 INSERT INTO users VALUES('${SUBJECT}'),('${READER}');
 INSERT INTO voice_memos(id,user_id,transcript,processing_status) VALUES('${MEMO}','${SUBJECT}',NULL,'pending');`)
 const migration=await readFile('migrations/025_model_data_capture.sql','utf8')
 await db.exec(migration)
 await db.exec(migration) // deploy retry must be safe
 const erasure=await readFile('migrations/026_model_data_source_erasure.sql','utf8')
 await db.exec(erasure)
 await db.exec(erasure)
 const store:CaptureStore={
  enabled:async()=>true,
  async append(kind,key,payload,people,parents) {
   const result=await db.query<{id:string}>('SELECT model_data_append($1,$2,$3,$4,$5) id',[kind,key,JSON.stringify(payload),people,parents])
   return result.rows[0].id
  },
  async start(job) {return (await db.query<Attempt>('SELECT * FROM model_data_start_attempt($1)',[job])).rows[0]},
  async finish(id,values) {
   const keys=Object.keys(values)
   if(keys.some(k=>!['status','response','parsed_output','request_id','usage','latency_ms','error_code'].includes(k)))throw Error('Invalid fixture column')
   const args=keys.map(k=>['response','parsed_output','usage'].includes(k) && values[k]!=null?JSON.stringify(values[k]):values[k])
   await db.query(`UPDATE model_data_attempts SET ${keys.map((k,i)=>`${k}=$${i+1}`).join(',')},finished_at=now() WHERE id=$${keys.length+1}`,[...args,id])
  },
  async get(id) {const result=await db.query<CapturedRecord>('SELECT * FROM model_data_records WHERE id=$1',[id]);if(!result.rows[0])throw Error('Missing record');return result.rows[0]},
  async stale(ids,reason) {await db.query('SELECT model_data_stale($1,$2)',[ids,reason])},
  async isStale(id) {return (await db.query('SELECT 1 FROM model_data_invalidations WHERE record_id=$1',[id])).rows.length>0},
 }
 return {db,store}
}
