import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { savePhoto } from '@/lib/db'

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

    // Get public URL
    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)

    // Save photo record
    const record = await savePhoto({
      user_id: userId,
      storage_path: fileName,
      public_url: urlData.publicUrl,
      sort_order: sortOrder,
    })

    return NextResponse.json({ id: record.id, url: record.public_url })
  } catch (err) {
    console.error('Route error:', err)
    const message = err instanceof Error ? err.message :
      (typeof err === 'object' && err !== null && 'message' in err) ? String((err as Record<string, unknown>).message) :
      JSON.stringify(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
