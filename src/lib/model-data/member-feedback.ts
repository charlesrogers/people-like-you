import { randomUUID } from 'node:crypto'
import { captureStore } from './store'
import { CaptureError } from './core'

export async function captureMemberFeedback(personId:string,kind:'profile_feedback'|'taste_feedback',values:unknown,revisionId?:string,eventId?:string) {
 const store=captureStore();if(!await store.enabled())return
 if(revisionId) {
  const record=await store.get(revisionId)
  if(record.kind!=='synthesis' || !record.person_ids.includes(personId))throw new CaptureError('Profile revision does not belong to member')
 }
 await store.append(kind,`${kind}:${personId}:${eventId??randomUUID()}`,{
  values,revisionId:revisionId??null,linkStatus:revisionId?'explicit_revision':'unlinked_legacy',
  labelClass:kind==='taste_feedback'?'synthetic_subject_interest_not_same_input_draft_preference':'member_profile_feedback_not_human_training_approval',
 },[personId],revisionId?[revisionId]:[])
}
