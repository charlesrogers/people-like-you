'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api-client'
import PhotoUploader from './PhotoUploader'

type SavedPhoto = {id:string;url:string|null;sortOrder:number}

export default function ProfilePhotos({userId}: {userId:string}) {
  const [photos,setPhotos] = useState<SavedPhoto[]>([])
  const [files,setFiles] = useState<File[]>([])
  const [busy,setBusy] = useState(false)
  const [preparing,setPreparing] = useState(false)
  const [loaded,setLoaded] = useState(false)
  const [error,setError] = useState<string|null>(null)
  const [version,setVersion] = useState(0)
  useEffect(() => {
    let cancelled=false
    apiFetch(`/api/photos?userId=${userId}`).then(async r => {
      if(!r.ok) throw new Error('Could not load photos. Refresh to try again.')
      const data=await r.json()
      if(!cancelled) {setPhotos(data.photos);setLoaded(true)}
    }).catch(e => {if(!cancelled) setError(e.message)})
    return () => {cancelled=true}
  },[userId])

  async function remove(id:string) {
    setBusy(true);setError(null)
    try {
      const r=await apiFetch('/api/photos',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,photoId:id})})
      if(!r.ok) throw new Error('Could not remove photo. Please retry.')
      setPhotos(prev=>prev.filter(p=>p.id!==id))
    } catch(e) {setError(e instanceof Error ? e.message : 'Could not remove photo.')}
    finally {setBusy(false)}
  }
  async function save() {
    setBusy(true);setError(null)
    let completed=0
    try {
      for(const [index,file] of files.entries()) {
        const body=new FormData()
        body.append('userId',userId);body.append('photo',file)
        const order=Math.max(0,...photos.map(p=>p.sortOrder))+index+1
        body.append('sortOrder',String(order))
        const r=await apiFetch('/api/upload-photo',{method:'POST',body})
        const data=await r.json().catch(()=>null)
        if(!r.ok) throw new Error(data?.error || 'Could not upload photo. Please retry.')
        setPhotos(prev=>[...prev,{id:data.id,url:data.url,sortOrder:order}]);completed++
      }
    } catch(e) {setError(e instanceof Error ? e.message : 'Could not upload photo.')}
    finally {
      setFiles(prev=>prev.slice(completed));setVersion(v=>v+1);setBusy(false)
    }
  }
  return <section className="rounded-xl border border-stone-200 bg-white p-5">
    <h3 className="text-sm font-semibold text-stone-900">Your photos</h3>
    <p className="mt-1 text-sm text-stone-500">Add photos whenever you’re ready. Tap × to remove one.</p>
    {!loaded && !error && <p className="mt-3 text-sm text-stone-500">Loading photos…</p>}
    <div className="mt-4 grid grid-cols-3 gap-3">
      {photos.map((p,i)=><div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-stone-100">
        {p.url && <img src={p.url} alt={`Your photo ${i+1}`} className="h-full w-full object-cover"/>}
        <button type="button" aria-label={`Remove saved photo ${i+1}`} disabled={busy || preparing} onClick={()=>void remove(p.id)} className="absolute right-1 top-1 h-11 w-11 rounded-full bg-black/70 text-xl text-white disabled:opacity-40">×</button>
      </div>)}
    </div>
    {loaded && photos.length<3 && <div className="mt-4"><PhotoUploader key={version} initialFiles={files} maxPhotos={3-photos.length} onPhotosChange={setFiles} onBusyChange={setPreparing} disabled={busy}/></div>}
    {files.length>0 && <button type="button" disabled={busy || preparing} onClick={()=>void save()} className="mt-3 rounded-xl bg-stone-900 px-4 py-3 text-sm text-white disabled:opacity-40">{busy?'Saving…':'Save photos'}</button>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </section>
}
