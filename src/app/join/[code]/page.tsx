import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'

export default async function JoinPage({ params, searchParams }: {
  params: Promise<{ code: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { code } = await params
  const search = await searchParams

  const db = createServerClient()

  // Look up the referrer
  const { data: referrer } = await db
    .from('users')
    .select('id, first_name')
    .eq('invite_code', code)
    .single()

  // Track page view
  if (referrer) {
    await db.from('invite_events').insert({
      invite_code: code,
      event_type: 'page_viewed',
      utm_source: search.utm_source || null,
      utm_medium: search.utm_medium || null,
      utm_campaign: search.utm_campaign || null,
      referrer_user_id: referrer.id,
    })
  }

  return (
    <div className="min-h-screen bg-[#e3ff44] flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        {referrer ? (
          <>
            <p className="text-lg font-medium text-[#1a1a1a]/60">
              {referrer.first_name} thinks you&rsquo;d be great on
            </p>
            <h1 className="mt-2 text-5xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-6xl">
              People <span className="italic">Like</span> You
            </h1>
          </>
        ) : (
          <h1 className="text-5xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-6xl">
            People <span className="italic">Like</span> You
          </h1>
        )}

        <p className="mt-6 text-lg text-[#1a1a1a]/50">
          The matchmaker that knows you better than your friends do. Never swipe again.
        </p>

        <div className="mt-10">
          <Link
            href={`/onboarding?ref=${code}&utm_source=${search.utm_source || ''}&utm_medium=${search.utm_medium || ''}&utm_campaign=${search.utm_campaign || ''}`}
            className="inline-block rounded-full bg-[#1a1a1a] px-10 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
          >
            Join now
          </Link>
        </div>

        <p className="mt-4 text-sm text-[#1a1a1a]/30">
          Free to join. Takes about 5 minutes.
        </p>
      </div>
    </div>
  )
}
