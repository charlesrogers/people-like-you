import Link from "next/link";

/* ---------- Hero illustration: two figures connected by flowing lines ---------- */

function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 280"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* gradient for connection lines */}
        <linearGradient id="flow" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#a8a29e" />
          <stop offset="35%" stopColor="#d6d3d1" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="65%" stopColor="#d6d3d1" />
          <stop offset="100%" stopColor="#a8a29e" />
        </linearGradient>
        <linearGradient id="flow2" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#a8a29e" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a8a29e" stopOpacity="0.5" />
        </linearGradient>
        {/* figure fills */}
        <linearGradient id="figL" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e7e5e4" />
          <stop offset="100%" stopColor="#d6d3d1" />
        </linearGradient>
        <linearGradient id="figR" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e7e5e4" />
          <stop offset="100%" stopColor="#d6d3d1" />
        </linearGradient>
        {/* glow at center */}
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        {/* glow on figures */}
        <radialGradient id="glowL" cx="80%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glowR" cx="20%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* center glow */}
      <ellipse cx="300" cy="140" rx="120" ry="100" fill="url(#glow)" />

      {/* left figure — abstract silhouette */}
      <g>
        <ellipse cx="115" cy="140" rx="70" ry="90" fill="url(#glowL)" />
        {/* head */}
        <circle cx="115" cy="90" r="28" fill="url(#figL)" stroke="#a8a29e" strokeWidth="1.5" />
        {/* body */}
        <path
          d="M85 120c0 0-15 20-18 50s2 45 10 55c10 12 26 18 38 18s28-6 38-18c8-10 13-25 10-55s-18-50-18-50"
          fill="url(#figL)"
          stroke="#a8a29e"
          strokeWidth="1.5"
        />
        {/* shoulder/arm reaching right */}
        <path
          d="M143 135c12-2 28 0 40 8"
          stroke="#a8a29e"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* right figure — abstract silhouette */}
      <g>
        <ellipse cx="485" cy="140" rx="70" ry="90" fill="url(#glowR)" />
        {/* head */}
        <circle cx="485" cy="90" r="28" fill="url(#figR)" stroke="#a8a29e" strokeWidth="1.5" />
        {/* body */}
        <path
          d="M455 120c0 0-15 20-18 50s2 45 10 55c10 12 26 18 38 18s28-6 38-18c8-10 13-25 10-55s-18-50-18-50"
          fill="url(#figR)"
          stroke="#a8a29e"
          strokeWidth="1.5"
        />
        {/* shoulder/arm reaching left */}
        <path
          d="M457 135c-12-2-28 0-40 8"
          stroke="#a8a29e"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* flowing connection lines between figures */}
      <path
        d="M183 130 C240 100, 280 170, 300 140 S360 100, 417 130"
        stroke="url(#flow)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M183 145 C230 175, 270 110, 300 145 S370 175, 417 145"
        stroke="url(#flow)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M183 160 C245 130, 275 185, 300 155 S355 130, 417 160"
        stroke="url(#flow2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* particles / dots along the lines */}
      <circle cx="220" cy="118" r="3" fill="#d6d3d1" />
      <circle cx="255" cy="152" r="2.5" fill="#d6d3d1" />
      <circle cx="280" cy="135" r="3.5" fill="#fbbf24" opacity="0.5" />
      <circle cx="300" cy="140" r="4" fill="#fbbf24" opacity="0.6" />
      <circle cx="320" cy="135" r="3.5" fill="#fbbf24" opacity="0.5" />
      <circle cx="345" cy="152" r="2.5" fill="#d6d3d1" />
      <circle cx="380" cy="118" r="3" fill="#d6d3d1" />

      {/* smaller accent dots */}
      <circle cx="240" cy="170" r="2" fill="#a8a29e" opacity="0.3" />
      <circle cx="300" cy="115" r="2" fill="#fbbf24" opacity="0.3" />
      <circle cx="360" cy="170" r="2" fill="#a8a29e" opacity="0.3" />
    </svg>
  );
}

/* ---------- Story illustration: open book with radiating lines ---------- */

function StoryIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bookGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#e7e5e4" />
          <stop offset="100%" stopColor="#d6d3d1" />
        </linearGradient>
        <linearGradient id="rayGrad" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* radiating glow */}
      <ellipse cx="100" cy="65" rx="80" ry="40" fill="url(#rayGrad)" />

      {/* rays */}
      <path d="M100 55 L70 20" stroke="#d6d3d1" strokeWidth="1" strokeLinecap="round" />
      <path d="M100 55 L85 15" stroke="#d6d3d1" strokeWidth="1" strokeLinecap="round" />
      <path d="M100 55 L100 10" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <path d="M100 55 L115 15" stroke="#d6d3d1" strokeWidth="1" strokeLinecap="round" />
      <path d="M100 55 L130 20" stroke="#d6d3d1" strokeWidth="1" strokeLinecap="round" />

      {/* dots at ray tips */}
      <circle cx="70" cy="20" r="2.5" fill="#d6d3d1" />
      <circle cx="85" cy="15" r="2" fill="#a8a29e" />
      <circle cx="100" cy="10" r="3" fill="#fbbf24" opacity="0.5" />
      <circle cx="115" cy="15" r="2" fill="#a8a29e" />
      <circle cx="130" cy="20" r="2.5" fill="#d6d3d1" />

      {/* open book — left page */}
      <path
        d="M100 60 C90 58, 55 55, 45 62 L45 85 C55 78, 90 80, 100 82Z"
        fill="url(#bookGrad)"
        stroke="#a8a29e"
        strokeWidth="1.2"
      />
      {/* open book — right page */}
      <path
        d="M100 60 C110 58, 145 55, 155 62 L155 85 C145 78, 110 80, 100 82Z"
        fill="url(#bookGrad)"
        stroke="#a8a29e"
        strokeWidth="1.2"
      />
      {/* spine */}
      <line x1="100" y1="60" x2="100" y2="82" stroke="#a8a29e" strokeWidth="1.2" />

      {/* text lines on left page */}
      <line x1="60" y1="70" x2="90" y2="68" stroke="#a8a29e" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
      <line x1="62" y1="75" x2="88" y2="73" stroke="#a8a29e" strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />

      {/* text lines on right page */}
      <line x1="110" y1="68" x2="140" y2="70" stroke="#a8a29e" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
      <line x1="112" y1="73" x2="138" y2="75" stroke="#a8a29e" strokeWidth="0.8" opacity="0.3" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* nav */}
      <nav className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-sm font-semibold tracking-tight text-stone-400">
          PLY
        </span>
        <Link
          href="/onboarding"
          className="text-sm font-medium text-stone-500 transition hover:text-stone-900"
        >
          Join / Login
        </Link>
      </nav>

      <div className="mx-auto max-w-2xl px-6 pb-24 pt-12 sm:pt-16">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          People <span className="italic">Like</span> You
        </h1>

        <p className="mt-6 text-lg leading-8 text-stone-500 font-medium">
          Your perfect matchmaker, finally possible.
        </p>

        <HeroIllustration className="mx-auto mt-12 w-full max-w-lg" />

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

        <StoryIllustration className="mx-auto my-10 w-44" />

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

        <div className="mt-16 space-y-4">
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
            Not sure yet? See the full process &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
