'use client'

import { useState, useRef } from 'react'

interface PhotoUploaderProps {
  onPhotosChange: (files: File[]) => void
  maxPhotos?: number
  minPhotos?: number
}

export default function PhotoUploader({
  onPhotosChange,
  maxPhotos = 3,
  minPhotos = 1,
}: PhotoUploaderProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files).slice(0, maxPhotos - previews.length)
    const newPreviews = newFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }))
    const updated = [...previews, ...newPreviews].slice(0, maxPhotos)
    setPreviews(updated)
    onPhotosChange(updated.map(p => p.file))
  }

  const removePhoto = (index: number) => {
    const updated = previews.filter((_, i) => i !== index)
    URL.revokeObjectURL(previews[index].url)
    setPreviews(updated)
    onPhotosChange(updated.map(p => p.file))
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
              onClick={() => removePhoto(i)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
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
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <p className="mt-3 text-xs text-stone-400">
        {previews.length} of {maxPhotos} photos
        {previews.length < minPhotos && (
          <span className="text-amber-500"> &middot; At least {minPhotos} required</span>
        )}
      </p>
    </div>
  )
}
