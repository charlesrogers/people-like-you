import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { savePhoto } from '@/lib/db'
import { signPhotoUrl } from '@/lib/photos'
import { moderateImageDataUrl, screenAndLog } from '@/lib/moderation'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    const userId = formData.get('userId') as string | null
    const sortOrder = parseInt(formData.get('sortOrder') as string || '1', 10)

    if (!photo || !userId) {
      return NextResponse.json({ error: 'Missing required fields: photo, userId' }, { status: 400 })
    }

    if (photo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Content moderation (Apple 1.2 filter pillar): screen the image BEFORE it is stored
    // or ever shown to another member. Rejected content never reaches the bucket.
    const buf = Buffer.from(await photo.arrayBuffer())
    const dataUrl = `data:${photo.type || 'image/jpeg'};base64,${buf.toString('base64')}`
    const mod = await screenAndLog(userId, 'photo', `${userId}/${sortOrder}`, await moderateImageDataUrl(dataUrl))
    if (mod.rejected) {
      return NextResponse.json(
        { error: 'This photo doesn\'t meet our community standards. Please choose another.' },
        { status: 422 },
      )
    }

    const supabase = createServerClient()

    // Upload to Supabase Storage
    const ext = photo.name.split('.').pop() || 'jpg'
    const fileName = `${userId}/${sortOrder}_${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, photo, { contentType: photo.type })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload photo: ' + uploadError.message }, { status: 500 })
    }

    // Bucket is private (T4). Keep getPublicUrl only as a stable storage-path
    // reference in the column; real access is via short-lived signed URLs.
    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)

    // Save photo record
    const record = await savePhoto({
      user_id: userId,
      storage_path: fileName,
      public_url: urlData.publicUrl,
      sort_order: sortOrder,
    })

    // Return a signed URL for immediate use (clients that render the response)
    const signedUrl = await signPhotoUrl(record.storage_path)
    return NextResponse.json({ id: record.id, url: signedUrl })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
