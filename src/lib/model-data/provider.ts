import { AsyncLocalStorage } from 'node:async_hooks'
import Anthropic from '@anthropic-ai/sdk'
import { captureStore } from './store'
import { CaptureError,hash,safeError } from './core'

export interface ModelContext { people: string[]; parents: string[]; outputs: string[] }
const contexts = new AsyncLocalStorage<ModelContext>()
export const withModelContext = <T>(context: ModelContext, fn: () => Promise<T>) => contexts.run(context,fn)
export const currentModelContext = () => contexts.getStore()
export interface CallResult<T> { data: T; requestId?: string | null; usage?: unknown }
export async function captureCall<T>(
 kind: string, version: string, provider: string, model: string,
 input: unknown, call: () => Promise<CallResult<T>>, jsonOutput = false,
): Promise<T> {
 const store=captureStore()
 if(!await store.enabled())return (await call()).data
 const ctx=contexts.getStore()
 if(!ctx || !ctx.people.length)throw new CaptureError('Model call lacks a capture owner/context')
 const job=await store.append('model_job',hash({kind,version,provider,model,input,parents:ctx.parents}),{
  jobType:kind,promptVersion:version,schemaVersion:jsonOutput ? version : null,
  provider,requestedModelId:model,modelAlias:null,assembledInput:input,
  // Exact request retains omitted provider defaults rather than inventing their values.
  trainingStatus:'held_unreviewed_permission_and_teacher_clearance_pending',
 },ctx.people,ctx.parents)
 const limit=provider==='openai'?1:3
 for(let n=0;n<limit;n++) {
  const attempt=await store.start(job)
  const started=Date.now()
  let result: CallResult<T>
  try { result=await call() }
  catch(error) {
   await store.finish(attempt.id,{status:'provider_failed',latency_ms:Date.now()-started,error_code:safeError(error),request_id:typeof (error as {request_id?:unknown})?.request_id==='string'?String((error as {request_id:string}).request_id).slice(0,200):null})
   const status=(error as {status?:number})?.status
   if(n<limit-1 && (status===429 || (status && status>=500) || status===undefined)) {
    await new Promise(resolve=>setTimeout(resolve,250*(n+1)));continue
   }
   throw new Error('Model provider failed; captured attempt can be retried')
  }
  let parsed: unknown=null
  let parseFailed=false
  if(jsonOutput) {
   try {
    const text=(result.data as unknown as Anthropic.Message).content.filter(c=>c.type==='text').map(c=>c.text).join('\n')
    const match=text.match(/\{[\s\S]*\}/)
    if(!match)throw new Error('No JSON')
    parsed=JSON.parse(match[0])
   } catch {parseFailed=true}
  }
  await store.finish(attempt.id,{status:parseFailed?'parse_failed':'completed',response:result.data,
   parsed_output:parsed,usage:result.usage??null,request_id:result.requestId??null,
   latency_ms:Date.now()-started,error_code:parseFailed?'invalid_structured_json':null})
  const output=await store.append('model_output',`attempt:${attempt.id}`,{
   jobId:job,attemptId:attempt.id,jobType:kind,actualModelId:(result.data as {model?:string})?.model ?? null,requestedModelId:model,
   parsedOutput:parsed,parseFailed,
  },ctx.people,[job])
  ctx.outputs.push(output)
  if(parseFailed)throw new Error('Model returned invalid JSON; raw response retained')
  return result.data
 }
 throw new CaptureError()
}
const anthropic = new Anthropic({maxRetries:0})
export function capturedMessage(kind: string,version: string,input: Anthropic.MessageCreateParamsNonStreaming) {
 return captureCall(kind,version,'anthropic',input.model,input,async()=>{
  const {data,request_id}=await anthropic.messages.create(input).withResponse()
  return {data,requestId:request_id,usage:data.usage}
 },['answer_analysis','profile_synthesis','pitch_critique','vouch_analysis'].includes(kind))
}
