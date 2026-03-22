import Link from "next/link";

/* ---------- inline SVG illustrations ---------- */

function SparkSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 4v8M16 20v8M4 16h8M20 16h8M7.5 7.5l5.5 5.5M19 19l5.5 5.5M24.5 7.5L19 13M13 19l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ConversationSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* left bubble */}
      <rect
        x="4"
        y="6"
        width="52"
        height="28"
        rx="14"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M20 34l-6 8 2-8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* right bubble */}
      <rect
        x="64"
        y="10"
        width="52"
        height="28"
        rx="14"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M100 38l6 8-2-8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* dots in left bubble */}
      <circle cx="22" cy="20" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="30" cy="20" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="38" cy="20" r="2" fill="currentColor" opacity="0.4" />
      {/* dots in right bubble */}
      <circle cx="82" cy="24" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="90" cy="24" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="98" cy="24" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 6c20-8 40 8 60 0s40-8 60 0 40 8 60 0 40-8 60 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          People Like You
        </h1>

        <p className="mt-6 text-lg leading-8 text-stone-500 font-medium">
          Your perfect matchmaker, finally possible.
        </p>

        <ConversationSvg className="mt-12 w-40 text-stone-300 mx-auto" />

        <div className="mt-12 space-y-5 text-base leading-7 text-stone-600">
          <p>
            Imagine a matchmaker who knows you better than your best friend
            does. Not just your type — your humor, what makes you light up,
            the kind of person you&rsquo;d talk to until 3am without noticing.
          </p>
          <p>
            Now imagine they know every person you&rsquo;d want to date just
            as well.
          </p>
        </div>

        <SparkSvg className="my-8 w-8 text-stone-300 mx-auto" />

        <div className="space-y-5 text-base leading-7 text-stone-600">
          <p>
            That&rsquo;s People Like You. We find people you&rsquo;re genuinely
            compatible with — then introduce you to each other in the way most
            likely to spark something real. Your best qualities, told as a story
            written for the specific person reading it. Their best qualities,
            told as a story written for you.
          </p>
          <p>
            You get pitched to your dream matches in the best possible light.
            And the people you see? They&rsquo;re not profiles — they&rsquo;re
            introductions that make you feel something before you&rsquo;ve even
            met.
          </p>
          <p className="font-medium text-stone-800">
            No swiping. No small talk with strangers. Just two people who
            already have a reason to be excited about each other.
          </p>
        </div>

        <WaveDivider className="mt-16 w-48 text-stone-300 mx-auto" />

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

        <div className="mt-10 text-center">
          <Link
            href="/thesis"
            className="text-sm font-medium text-stone-400 transition hover:text-stone-600"
          >
            Read the full thesis &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
