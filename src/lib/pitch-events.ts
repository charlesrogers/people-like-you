'use client'
import { useEffect,useRef } from 'react'
import { apiFetch } from './api-client'

export function emitPitchEvent(introId:string,revisionId:string|undefined|null,event:'viewed'|'expanded'|'photo_revealed'|'saved') {
 if(!revisionId)return
 const body=JSON.stringify({introId,pitchRevisionId:revisionId,event,eventId:crypto.randomUUID()})
 // Reuse the event ID on a transient retry; this is an exposure, never a writing-quality label.
 void (async()=>{
  for(let attempt=0;attempt<2;attempt++) {
   try {
    const response=await apiFetch('/api/intros/event',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true})
    if(response.ok || response.status<500)return
   } catch { /* retry once */ }
  }
 })()
}
export function usePitchViews(cards:{id:string;pitchRevisionId?:string|null}[]) {
 const sent=useRef(new Set<string>())
 const key=cards.map(c=>`${c.id}:${c.pitchRevisionId??''}`).join('|')
 useEffect(()=>{
  if(typeof IntersectionObserver==='undefined')return
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries) {
    if(!entry.isIntersecting)continue
    const node=entry.target as HTMLElement
    const id=node.dataset.introId,revision=node.dataset.pitchRevision
    if(!id || !revision || sent.current.has(`${id}:${revision}`))continue
    sent.current.add(`${id}:${revision}`)
    emitPitchEvent(id,revision,'viewed')
   }
  },{threshold:0.1})
  document.querySelectorAll('[data-pitch-revision]').forEach(node=>observer.observe(node))
  return ()=>observer.disconnect()
 },[key])
}
