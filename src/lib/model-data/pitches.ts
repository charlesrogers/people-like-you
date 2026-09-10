import { snapshotTranscript, type SourceMemo } from './sources'
import { randomUUID } from 'node:crypto'
import type { User,CompositeProfile } from '../types'
import type { DailyIntro } from '../db'
import { createServerClient } from '../supabase'
import { captureStore } from './store'
import { CaptureError,checkPitchQuotes,hash, type Source } from './core'
import { withModelContext, type ModelContext } from './provider'

export interface PitchCapture { packetId:string; context:ModelContext; sources:Source[] }
export async function beginPitch(reader:User,subject:User,readerProfile:CompositeProfile,subjectProfile:CompositeProfile,engine:string):Promise<PitchCapture|null> {
 const store=captureStore();if(!await store.enabled())return null
 const db=createServerClient()
 const {data:memos,error}=await db.from('voice_memos').select('*').in('user_id',[reader.id,subject.id]).neq('processing_status','replaced')
 if(error)throw new CaptureError()
 const parents:string[]=[];const sources:Source[]=[]
 for(const memo of (memos??[]) as SourceMemo[]) {
  if(!memo.transcript_record_id && memo.transcript) {
   memo.transcript_record_id=await snapshotTranscript(memo,memo.transcript)
   const {error:saveError}=await db.from('voice_memos').update({transcript_record_id:memo.transcript_record_id}).eq('id',memo.id)
   if(saveError)throw new CaptureError()
  }
  if(memo.analysis_record_id)parents.push(memo.analysis_record_id)
  if(memo.transcript_record_id) {
   parents.push(memo.transcript_record_id)
   const snapshot=await store.get(memo.transcript_record_id)
   if(memo.user_id===subject.id)sources.push({id:snapshot.id,personId:subject.id,text:String(snapshot.payload.text)})
  }
 }
 for(const p of [readerProfile,subjectProfile]) {
  const id=(p as CompositeProfile & {synthesis_record_id?:string}).synthesis_record_id
  if(id) {
   if(await store.isStale(id))throw new CaptureError('Profile evidence changed; reprocess answers before pitching')
   parents.push(id)
  }
 }
 const packetId=await store.append('pitch_packet',`packet:${randomUUID()}`,{
  subjectId:subject.id,readerId:reader.id,
  subject:{firstName:subject.first_name,profile:subjectProfile},reader:{firstName:reader.first_name,profile:readerProfile},
  engine,sources,sourceCompleteness:sources.length?'snapshots_available':'legacy_profile_only',
  disclosurePolicy:{version:'existing-product-profile-use-v1',trainingAllowed:false,claimLevelReview:'not_performed'},
  origin:'product_generation',
 },[reader.id,subject.id],parents)
 return {packetId,sources,context:{people:[reader.id,subject.id],parents:[packetId],outputs:[]}}
}
export async function captureCandidate(capture:PitchCapture|null,text:string,slot:string,outputs:string[],extra:unknown=null) {
 if(!capture)return null
 return captureStore().append('pitch_candidate',hash({packet:capture.packetId,slot,outputs,text}),{
  packetId:capture.packetId,text,slot,extra,quoteChecks:checkPitchQuotes(text,capture.sources),
  factualStatus:'requires_evidence_critic',disclosureStatus:'unreviewed',
 },capture.context.people,[capture.packetId,...outputs])
}
export async function captureRevision(capture:PitchCapture|null,text:string,candidateIds:string[],selectedId:string|null,source='model') {
 if(!capture)return null
 return captureStore().append('pitch_revision',hash({packet:capture.packetId,text,candidateIds,selectedId,source}),{
  packetId:capture.packetId,text,selectedId,revisionSource:source,readerId:capture.context.people[0],subjectId:capture.context.people[1],
  quoteChecks:checkPitchQuotes(text,capture.sources),reviewStatus:'unreviewed',disclosureStatus:'unreviewed',
 },capture.context.people,[capture.packetId,...candidateIds,...capture.context.outputs])
}
export async function recordDelivery(intro:Omit<DailyIntro,'id'|'created_at'>) {
 const store=captureStore();if(!await store.enabled())return intro
 let revisionId=intro.pitch_revision_id
 if(!revisionId) {
  revisionId=await store.append('pitch_revision',`fallback:${randomUUID()}`,{
   text:intro.narrative,revisionSource:'fallback_or_unlinked_legacy',subjectId:intro.matched_user_id,readerId:intro.user_id,
   reviewStatus:'unreviewed',sourceCompleteness:'no_generation_lineage',
  },[intro.user_id,intro.matched_user_id],[])
 }
 if(await store.isStale(revisionId))throw new CaptureError('Pitch sources changed; regenerate before delivery')
 const revision=await store.get(revisionId)
 if(revision.kind!=='pitch_revision' || revision.payload.text!==intro.narrative || revision.payload.readerId!==intro.user_id || revision.payload.subjectId!==intro.matched_user_id || ![intro.user_id,intro.matched_user_id].every(id=>revision.person_ids.includes(id)))throw new CaptureError('Pitch revision mismatch')
 return {...intro,pitch_revision_id:revisionId}
}
export async function recordExposure(intro:DailyIntro,channel:string) {
 const store=captureStore();if(!await store.enabled() || !intro.pitch_revision_id)return
 if(await store.isStale(intro.pitch_revision_id))throw new CaptureError('Pitch evidence changed')
 await store.append('exposure',hash({intro:intro.id,revision:intro.pitch_revision_id,channel}),{
  introId:intro.id,revisionId:intro.pitch_revision_id,channel,kind:'server_returned_not_client_impression',
 },[intro.user_id,intro.matched_user_id],[intro.pitch_revision_id])
}
export async function recordProductFeedback(intro:DailyIntro,actor:string,revisionId:string|undefined,values:unknown,key:string) {
 const store=captureStore();if(!await store.enabled())return
 if(intro.user_id!==actor || (revisionId && revisionId!==intro.pitch_revision_id))throw new CaptureError('Feedback actor or revision mismatch')
 await store.append('feedback',`feedback:${actor}:${key}`,{
  introId:intro.id,revisionId:revisionId??null,linkStatus:revisionId?'explicit_revision':'unlinked_legacy',
  eventClass:'product_outcome',values,
 },[intro.user_id,intro.matched_user_id],revisionId?[revisionId]:[])
}
export async function withinPitch<T>(capture:PitchCapture|null,fn:()=>Promise<T>) {
 return capture?withModelContext(capture.context,fn):fn()
}
