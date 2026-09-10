'use client'

import { useState, useRef, useEffect } from 'react'
import { preparePhoto } from '@/lib/prepare-photo'

interface PhotoUploaderProps {
  onPhotosChange: (files: File[]) => void
  maxPhotos?: number
  minPhotos?: number
  onBusyChange?: (busy: boolean) => void
  disabled?: boolean
  initialFiles?: File[]
  onRemove?: (file: File) => Promise<void>
}

export default function PhotoUploader({
  onPhotosChange,
  maxPhotos = 3,
  minPhotos = 0,
  onBusyChange,
  disabled = false,
  initialFiles = [],
  onRemove,
}: PhotoUploaderProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>(() => initialFiles.map(file => ({file, url: URL.createObjectURL(file)})))
  const inputRef = useRef<HTMLInputElement>(null)
  const [preparing, setPreparing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const current = useRef(previews)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => {
    mounted.current = false
    current.current.forEach(p => URL.revokeObjectURL(p.url))
  } }, [])

  const handleFiles = async (files: FileList | null) => {
    if (!files || preparing || disabled) return
    const selected = Array.from(files).slice(0, maxPhotos - previews.length)
    setPreparing(true)
    setError(null)
    onBusyChange?.(true)
    try {
    const newFiles = await Promise.all(selected.map(preparePhoto))
    if (!mounted.current) return
    const newPreviews = newFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }))
    const updated = [...previews, ...newPreviews].slice(0, maxPhotos)
    setPreviews(updated)
    current.current = updated
    onPhotosChange(updated.map(p => p.file))
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : 'Could not prepare this photo.')
    } finally {
      if (mounted.current) setPreparing(false)
      onBusyChange?.(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removePhoto = async (index: number) => {
    setError(null)
    setPreparing(true)
    onBusyChange?.(true)
    try {
    await onRemove?.(previews[index].file)
    const updated = previews.filter((_, i) => i !== index)
    URL.revokeObjectURL(previews[index].url)
    setPreviews(updated)
    current.current = updated
    onPhotosChange(updated.map(p => p.file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove this photo. Try again.')
    } finally { setPreparing(false); onBusyChange?.(false) }
  }

  const canAddMore = previews.length < maxPhotos

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {previews.map((preview, i) => (
          <div key={i} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-stone-200">
            <img
              src={preview.url}
              alt={`Photo ${i + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label={`Remove photo ${i + 1}`}
              disabled={preparing || disabled}
              onClick={() => void removePhoto(i)}
              className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-xl text-white disabled:opacity-40"
            >
              &times;
            </button>
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
              {i + 1}
            </span>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            disabled={preparing || disabled}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 text-stone-400 transition hover:border-stone-400 hover:text-stone-500"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="mt-1 text-xs font-medium">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => { void handleFiles(e.target.files) }}
        className="hidden"
      />
      {preparing && <p role="status" className="mt-3 text-sm text-stone-500">Preparing your photo…</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}

      <p className="mt-3 text-xs text-stone-400">
        {previews.length} of {maxPhotos} photos
        {previews.length < minPhotos && (
          <span className="text-amber-500"> &middot; At least {minPhotos} required</span>
        )}
      </p>
    </div>
  )
}
