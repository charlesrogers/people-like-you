import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — People Like You",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Link href="/" className="text-sm font-medium text-stone-400 transition hover:text-stone-600">
          &larr; Back
        </Link>

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-stone-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-stone-400">Last updated: March 2026</p>

        <div className="mt-10 space-y-8 text-base leading-7 text-stone-600">
          <section>
            <h2 className="text-lg font-semibold text-stone-900">What we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>Account info:</strong> Email address, name, gender, birth year, zip code, and optionally your phone number and religious background.</li>
              <li><strong>Voice recordings:</strong> Audio memos you record during onboarding and ongoing prompts. These are transcribed and analyzed to build your personality profile.</li>
              <li><strong>Photos:</strong> Profile photos you upload, stored securely.</li>
              <li><strong>Preferences:</strong> Your dealbreakers (age range, faith importance, kids, etc.).</li>
              <li><strong>Usage data:</strong> How you interact with matches (likes, passes, feedback), taste calibration votes, and session analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">How we use it</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>Matching:</strong> Your voice memos are transcribed and analyzed by AI to extract personality signals. These signals are used to write personalized match introductions and find compatible people.</li>
              <li><strong>Profile building:</strong> We use AI (Claude by Anthropic and OpenAI Whisper) to process your recordings. Transcripts and extracted personality data are stored in our database.</li>
              <li><strong>Improving the service:</strong> Aggregated, anonymized data helps us improve our matching algorithms and prompt quality.</li>
              <li><strong>Communications:</strong> We may send you emails about your matches, new prompts, or service updates. You can opt out anytime.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">AI processing</h2>
            <p className="mt-3">
              Your voice recordings are sent to OpenAI for transcription and to Anthropic (Claude) for personality extraction. These services process your data according to their own privacy policies. We do not sell your data to these or any other third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">Data storage and security</h2>
            <p className="mt-3">
              Your data is stored in Supabase (PostgreSQL database and file storage), hosted in secure data centers. Audio files and photos are stored in private/public buckets respectively. We use encryption in transit (HTTPS) and authentication tokens to protect your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">Your rights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>Access:</strong> You can view your profile data anytime in the app.</li>
              <li><strong>Correction:</strong> You can update your profile information through the app.</li>
              <li><strong>Deletion:</strong> You can delete your account and all associated data at any time from your account settings. This permanently removes your profile, voice recordings, photos, match history, and all other data.</li>
              <li><strong>Portability:</strong> Contact us to request a copy of your data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">Data sharing</h2>
            <p className="mt-3">
              We do not sell your personal data. We share data only with:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>AI processing providers (OpenAI, Anthropic) for transcription and personality analysis</li>
              <li>Infrastructure providers (Supabase, Hetzner) for hosting</li>
              <li>Analytics (PostHog) for anonymized usage metrics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-stone-900">Contact</h2>
            <p className="mt-3">
              Questions about your privacy? Email us at{" "}
              <a href="mailto:privacy@people-like-you.com" className="text-stone-900 underline">privacy@people-like-you.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
