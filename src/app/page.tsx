import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          People Like You
        </h1>
        <p className="mt-6 text-lg leading-8 text-stone-600">
          Dating apps are broken. They optimize for sorting, but the job you're
          hiring for is <em>falling for someone</em>. We don't match you on
          traits — we create the conditions where chemistry can emerge.
        </p>

        <div className="mt-12 space-y-4">
          <Link
            href="/onboarding"
            className="block rounded-xl bg-stone-900 px-6 py-4 text-center text-lg font-medium text-white transition hover:bg-stone-800"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="block rounded-xl border border-stone-200 px-6 py-4 text-center text-lg font-medium text-stone-700 transition hover:bg-stone-50"
          >
            I already have an account
          </Link>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-stone-900">Discovery</h3>
            <p className="mt-2 text-sm text-stone-500">
              We surface how someone could expand your world — not just who
              looks like your type.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Investment</h3>
            <p className="mt-2 text-sm text-stone-500">
              Structured, escalating connection — not mindless swiping. Every
              lead is precious.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Chemistry</h3>
            <p className="mt-2 text-sm text-stone-500">
              We help you see each other's unique genius before snap judgments
              take over.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
