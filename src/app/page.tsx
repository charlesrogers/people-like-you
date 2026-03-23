import Link from "next/link";

/* ─── Logo SVG (reusable) ─── */

function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  const fill = light ? "#fafaf9" : "#1c1917";
  const accent = "#f59e0b";
  return (
    <svg viewBox="0 0 120 32" className={className} aria-label="People Like You">
      <text x="0" y="24" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="24" fill={fill}>
        P
        <tspan fill={accent} fontStyle="italic">L</tspan>
        Y
      </text>
    </svg>
  );
}

/* ─── Hero background particles ─── */

function HeroParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-400/5 blur-3xl animate-float-slower" />

      {/* Floating dots */}
      <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-amber-400/20 animate-float" />
      <div className="absolute top-[30%] right-[20%] w-1.5 h-1.5 rounded-full bg-amber-400/15 animate-float-slow" />
      <div className="absolute top-[60%] left-[30%] w-1 h-1 rounded-full bg-stone-400/20 animate-float-slower" />
      <div className="absolute top-[50%] right-[35%] w-2.5 h-2.5 rounded-full bg-amber-400/10 animate-float" />
      <div className="absolute top-[70%] left-[60%] w-1.5 h-1.5 rounded-full bg-stone-500/15 animate-float-slow" />
      <div className="absolute top-[15%] right-[40%] w-1 h-1 rounded-full bg-amber-300/20 animate-float-slower" />

      {/* Connection lines (very faint) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1200 800">
        <path d="M200 400 C400 200, 600 600, 800 300 S1000 500, 1100 400" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
        <path d="M100 500 C300 300, 500 700, 700 400 S900 600, 1100 500" stroke="#a8a29e" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}

/* ─── Step illustration icons ─── */

function VoiceIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className}>
      <circle cx="40" cy="40" r="38" stroke="#d6d3d1" strokeWidth="1.5" />
      <rect x="32" y="20" width="16" height="28" rx="8" fill="#f59e0b" opacity="0.8" />
      <path d="M26 42c0 8 6 14 14 14s14-6 14-14" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="56" x2="40" y2="64" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="64" x2="46" y2="64" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MatchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className}>
      <circle cx="40" cy="40" r="38" stroke="#d6d3d1" strokeWidth="1.5" />
      <circle cx="28" cy="34" r="10" fill="#f59e0b" opacity="0.6" />
      <circle cx="52" cy="34" r="10" fill="#f59e0b" opacity="0.6" />
      <path d="M28 50c0-4 4-8 12-8s12 4 12 8" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 28l8 8-8 8" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

function NarrativeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className}>
      <circle cx="40" cy="40" r="38" stroke="#d6d3d1" strokeWidth="1.5" />
      <rect x="22" y="20" width="36" height="44" rx="4" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="28" y1="30" x2="52" y2="30" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="28" y1="37" x2="48" y2="37" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="28" y1="44" x2="44" y2="44" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M36 52l4 4 8-10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={className}>
      <circle cx="40" cy="40" r="38" stroke="#d6d3d1" strokeWidth="1.5" />
      <path d="M40 18l3 12 12-3-9 9 9 9-12-3-3 12-3-12-12 3 9-9-9-9 12 3z" fill="#f59e0b" opacity="0.7" />
      <circle cx="40" cy="40" r="6" fill="#fbbf24" />
    </svg>
  );
}

/* ─── Main Page ─── */

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* ────── HERO: Dark section ────── */}
      <section className="relative min-h-screen bg-stone-950 bg-grain flex flex-col">
        <HeroParticles />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12">
          <Logo light className="h-8 w-auto" />
          <Link
            href="/onboarding"
            className="text-sm font-medium text-stone-400 transition hover:text-white"
          >
            Join / Login
          </Link>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
          <h1 className="animate-fade-in-up text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
            People{" "}
            <span className="italic text-gradient">Like</span>{" "}
            You
          </h1>

          <p className="animate-fade-in-up delay-100 mt-6 max-w-xl text-lg text-stone-400 sm:text-xl">
            Your perfect matchmaker, finally possible.
          </p>

          <p className="animate-fade-in-up delay-200 mt-4 max-w-lg text-sm text-stone-500 leading-relaxed">
            We learn who you are through your stories — then introduce you to
            compatible people in a way that sparks real chemistry. No swiping. No
            small talk with strangers.
          </p>

          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/onboarding"
              className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-stone-500 transition hover:text-stone-300"
            >
              I already have an account &rarr;
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 pb-8 text-center">
          <div className="mx-auto h-10 w-[1px] bg-gradient-to-b from-transparent to-stone-700" />
        </div>
      </section>

      {/* ────── THE PITCH: 3 columns ────── */}
      <section className="bg-white px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            A matchmaker that actually <span className="text-gradient">knows</span> you
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-stone-500">
            Not your filters. Not your checklist. You.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <PitchCard
              icon={<VoiceIcon className="h-16 w-16" />}
              title="We know you"
              body="You tell us your stories — through voice, not checkboxes. Our AI extracts the real you: your humor, what makes you light up, where you're growing."
            />
            <PitchCard
              icon={<MatchIcon className="h-16 w-16" />}
              title="We know them"
              body="Every person on PLY goes through the same deep process. So we don't just know you — we know everyone you'd want to meet."
            />
            <PitchCard
              icon={<NarrativeIcon className="h-16 w-16" />}
              title="We write the intro"
              body="When we match you, you don't get a name and a photo. You get a personalized story about why this person might change your world."
            />
          </div>
        </div>
      </section>

      {/* ────── HOW IT WORKS: Alternating ────── */}
      <section className="bg-stone-50 px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            How it works
          </h2>

          <div className="mt-20 space-y-24 sm:space-y-32">
            <StepRow
              number="01"
              title="Tell us your stories"
              body="Answer voice prompts that reveal who you really are — your rabbit holes, unpopular opinions, proudest moments, and guilty pleasures. 55 questions across 5 dimensions of personality."
              icon={<VoiceIcon className="h-24 w-24 sm:h-32 sm:w-32" />}
              reverse={false}
            />
            <StepRow
              number="02"
              title="We find your people"
              body="Our AI builds your personality composite and finds people you're genuinely compatible with — based on values, humor, growth, and the things that actually predict chemistry."
              icon={<MatchIcon className="h-24 w-24 sm:h-32 sm:w-32" />}
              reverse={true}
            />
            <StepRow
              number="03"
              title="Read your introduction"
              body="Each match comes with a narrative written specifically for you about why this person matters. Their best qualities, told as a story. The photo comes after — so the feeling lands first."
              icon={<NarrativeIcon className="h-24 w-24 sm:h-32 sm:w-32" />}
              reverse={false}
            />
            <StepRow
              number="04"
              title="Meet with a spark"
              body="Both people walk into the first conversation already feeling something. Already curious. Already a little invested. That's the difference between a match and a connection."
              icon={<SparkIcon className="h-24 w-24 sm:h-32 sm:w-32" />}
              reverse={true}
            />
          </div>
        </div>
      </section>

      {/* ────── THESIS TEASER: Dark section ────── */}
      <section className="relative bg-stone-950 bg-grain px-6 py-28 sm:py-36">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <blockquote className="text-xl font-medium leading-relaxed text-stone-300 sm:text-2xl">
            &ldquo;Imagine a matchmaker who knows you better than your best
            friend does. Not just your type — your humor, what makes you light
            up, the kind of person you&rsquo;d talk to until 3am without
            noticing. Now imagine they know every person you&rsquo;d want to
            date just as well.&rdquo;
          </blockquote>
          <div className="mt-8">
            <Link
              href="/thesis"
              className="text-sm font-medium text-amber-500 transition hover:text-amber-400"
            >
              Not sure yet? Read the full thesis &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ────── FINAL CTA ────── */}
      <section className="bg-white px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Ready to meet someone who gets it?
          </h2>
          <p className="mt-4 text-base text-stone-500">
            No swiping. No small talk with strangers. Just two people who
            already have a reason to be excited about each other.
          </p>
          <div className="mt-10">
            <Link
              href="/onboarding"
              className="inline-block rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* ────── FOOTER ────── */}
      <footer className="border-t border-stone-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo className="h-6 w-auto" />
          <div className="flex items-center gap-6 text-sm text-stone-400">
            <Link href="/thesis" className="hover:text-stone-600 transition">
              Thesis
            </Link>
            <Link href="/onboarding" className="hover:text-stone-600 transition">
              Join
            </Link>
            <Link href="/dashboard" className="hover:text-stone-600 transition">
              Dashboard
            </Link>
          </div>
          <p className="text-xs text-stone-400">
            &copy; 2026 People Like You
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Pitch card component ─── */

function PitchCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
      <div className="mb-5">{icon}</div>
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-500">{body}</p>
    </div>
  );
}

/* ─── Step row component (alternating layout) ─── */

function StepRow({
  number,
  title,
  body,
  icon,
  reverse,
}: {
  number: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  reverse: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-10 sm:flex-row sm:gap-16 ${
        reverse ? "sm:flex-row-reverse" : ""
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className={reverse ? "sm:text-right" : ""}>
        <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">
          Step {number}
        </span>
        <h3 className="mt-2 text-2xl font-bold text-stone-900">{title}</h3>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-stone-500">
          {body}
        </p>
      </div>
    </div>
  );
}
