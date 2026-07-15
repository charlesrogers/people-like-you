import { createServerClient } from './supabase'

// Signed-URL access for the private `photos` bucket (T4).
// The bucket is private, so photos are never world-readable; every surface that
// shows a photo mints a short-lived signed URL from the storage_path at serve time.
// Uses the service-role server client, which can sign regardless of bucket policy.
// Returns null on missing path or error — all callers already treat photoUrl as nullable.
export async function signPhotoUrl(
  storagePath: string | null | undefined,
  ttlSeconds = 3600,
): Promise<string | null> {
  if (!storagePath) return null
  const supabase = createServerClient()
  const { data, error } = await supabase.storage.from('photos').createSignedUrl(storagePath, ttlSeconds)
  if (error || !data) return null
  return data.signedUrl
}
