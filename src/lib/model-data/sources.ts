import { randomUUID } from 'node:crypto'
import { captureStore } from './store'
import { hash,textHash,quoteSpan } from './core'
import { QUESTION_BANK } from '../prompts'
import { FISHED_PROMPTS, NERD_OUT } from '../voice-prompt-map'

export async function captureQuestion(userId: string,promptId: string,displayed?: unknown,context: unknown = null,stableKey?:string) {
 const store=captureStore();if(!await store.enabled())return null
 const prompt=[...QUESTION_BANK,...Object.values(FISHED_PROMPTS),NERD_OUT].find(p=>p.id===promptId)
 const supplied=displayed && typeof displayed==='object' ? displayed as Record<string,unknown> : null
 const snapshot=supplied && typeof supplied.text==='string' && supplied.text.length<=10000 ? Object.fromEntries(['text','helpText','exampleAnswer','client','promptVersion'].filter(k=>typeof supplied[k]==='string' || supplied[k]===null).map(k=>[k,typeof supplied[k]==='string'?(supplied[k] as string).slice(0,10000):null])) : null
 return store.append('question',stableKey ?? `question:${randomUUID()}`,{
  promptId,displayed:snapshot ?? prompt ?? {text:promptId},context,
  provenance:snapshot?'client_display_snapshot':'legacy_server_reconstruction',
  questionVersion:hash(snapshot ?? prompt ?? {text:promptId}),
 },[userId],[])
}
export interface SourceMemo {
 id:string;user_id:string;prompt_id:string;transcript:string|null;processing_status?:string;
 question_record_id?:string|null;transcript_record_id?:string|null;analysis_record_id?:string|null;
 prompt_source?:string|null;prompt_seed?:unknown;duration_seconds?:number|null
}
export async function snapshotTranscript(memo: SourceMemo,text: string,parents: string[] = []) {
 const store=captureStore();if(!await store.enabled())return null
 if(memo.transcript===text && memo.transcript_record_id)return memo.transcript_record_id
 const questionId=memo.question_record_id ?? await captureQuestion(memo.user_id,memo.prompt_id,undefined,{source:memo.prompt_source,seed:memo.prompt_seed},`legacy-question:${memo.id}`)
 return store.append('transcript',hash({memo:memo.id,text,questionId,supersedes:memo.transcript_record_id,parents}),{
  memoId:memo.id,personId:memo.user_id,text,textSha256:textHash(text),
  questionId,supersedesSnapshotId:memo.transcript_record_id ?? null,
  durationSeconds:memo.duration_seconds,provenance:parents.length?'captured_transcription':'existing_or_corrected_text',
 },[memo.user_id],[...(questionId?[questionId]:[]),...parents])
}
export async function captureAnalysis(personId:string,sourceId:string,text:string,analysis:Record<string,unknown>,outputs:string[]) {
 const store=captureStore()
 const claims=Array.isArray(analysis.claims)?analysis.claims as Record<string,unknown>[]:[]
 const validated=claims.map(c=>{
  const source=typeof c.source_text==='string'?c.source_text:''
  const span=quoteSpan(text,source)
  const status=['observed','interpreted','unknown','contradicted'].includes(String(c.epistemic_status))?c.epistemic_status:'unknown'
  return {...c,personId:c.person==='speaker'?personId:null,personLabel:c.person??'unknown',sourceId,sourceSpan:span,epistemic_status:span?status:'unknown',
   quote_kind:c.quote_kind==='exact_quote'&&span&&c.claim_text===source?'exact_quote':c.quote_kind==='none'?'none':'paraphrase',
   quoteValidation:c.quote_kind==='exact_quote'?!!span && c.claim_text===source:null,
   disclosure_scope:'unreviewed',confidence:span && typeof c.confidence==='number'?Math.max(0,Math.min(1,c.confidence)):null}
 })
 const quoteChecks=(Array.isArray(analysis.quote_candidates)?analysis.quote_candidates:Array.isArray(analysis.notable_quotes)?analysis.notable_quotes:[]).map(q=>({text:q,span:typeof q==='string'?quoteSpan(text,q):null}))
 return store.append('analysis',hash({sourceId,outputs,analysis}),{completeCoding:analysis,claims:validated,quoteChecks,analysisOrigin:outputs.length?'model':'heuristic_short_answer',reviewStatus:'unreviewed'},[personId],[sourceId,...outputs])
}
