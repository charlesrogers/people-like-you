import Link from "next/link";

/* ─────────────────────────────────────────────────────────
   PEOPLE LIKE YOU — Homepage
   Bumble-inspired. Neon yellow. Futura vibes. Whimsy.
   ───────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-[var(--cream)]">
      {/* ══════ NAV ══════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 sm:px-10 backdrop-blur-md bg-[var(--cream)]/80">
        <span className="text-xl font-bold tracking-tight">
          P<span className="italic text-[var(--neon-dim)]">L</span>Y
        </span>
        <Link
          href="/onboarding"
          className="rounded-full bg-[var(--dark)] px-5 py-2 text-sm font-semibold text-white transition hover:scale-105 active:scale-95"
        >
          Join now
        </Link>
      </nav>

      {/* ══════ HERO ══════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Decorative blobs — darker on neon bg */}
        <div className="absolute top-16 -left-20 w-72 h-72 bg-[var(--dark)] blob opacity-[0.04] blur-3xl animate-float-gentle" />
        <div className="absolute bottom-24 -right-16 w-96 h-96 bg-[var(--dark)] blob-2 opacity-[0.03] blur-3xl animate-wiggle" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white blob-3 opacity-20 blur-2xl animate-bounce-soft" />

        {/* Floating emoji/icons for whimsy */}
        <div className="absolute top-[18%] left-[12%] text-4xl animate-wiggle" aria-hidden="true">💛</div>
        <div className="absolute top-[25%] right-[15%] text-3xl animate-float-gentle" aria-hidden="true">✨</div>
        <div className="absolute bottom-[30%] left-[20%] text-3xl animate-bounce-soft" aria-hidden="true">🎙️</div>
        <div className="absolute bottom-[22%] right-[12%] text-4xl animate-wiggle" style={{ animationDelay: "2s" }} aria-hidden="true">💌</div>
        <div className="absolute top-[55%] left-[8%] text-2xl animate-float-gentle" style={{ animationDelay: "1s" }} aria-hidden="true">🔮</div>

        {/* Hero text */}
        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="animate-fade-in-up text-6xl font-extrabold tracking-tight text-[var(--dark)] sm:text-8xl lg:text-9xl leading-[0.9]">
            People<br />
            <span className="italic text-neon-gradient">Like</span>{" "}
            You
          </h1>

          <p className="animate-fade-in-up delay-100 mt-8 text-xl font-medium text-[var(--dark)]/60 sm:text-2xl max-w-lg mx-auto leading-snug">
            The matchmaker that knows you better than your friends do.
            <br />
            <span className="font-extrabold">Never swipe again.</span>
          </p>

          <div className="animate-fade-in-up delay-200 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="rounded-full bg-[var(--dark)] px-10 py-4 text-lg font-bold text-white shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95"
            >
              Get started — it&rsquo;s free
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-[var(--dark)]/40 underline decoration-dotted underline-offset-4 transition hover:text-[var(--dark)]/70"
            >
              I already have an account
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="w-6 h-10 rounded-full border-2 border-[var(--dark)]/20 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-[var(--dark)]/30" />
          </div>
        </div>
      </section>

      {/* ══════ THE MATCHMAKER PITCH ══════ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl rounded-bumble-lg bg-white p-10 sm:p-16 relative overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.06)]">
          {/* Decorative */}
          <div className="absolute top-6 right-6 text-8xl opacity-20 rotate-12" aria-hidden="true">💛</div>
          <div className="absolute bottom-6 left-6 text-7xl opacity-20 -rotate-12" aria-hidden="true">✨</div>

          <div className="relative z-10">
            <p className="text-4xl font-extrabold tracking-tight text-[var(--dark)] sm:text-5xl">
              Imagine a matchmaker who knows you better than your best friend.
            </p>
            <p className="mt-4 text-4xl font-normal tracking-tight text-[var(--dark)]/30 italic sm:text-5xl">
              Not just your type — your humor, what makes you light up,
              the kind of person you&rsquo;d talk to until 3am without noticing.
            </p>
            <p className="mt-6 text-4xl font-extrabold tracking-tight text-[var(--dark)] sm:text-5xl">
              And they <span className="underline decoration-[3px] underline-offset-6">know every person</span> you&rsquo;d want to date just as well.
            </p>
            <p className="mt-2 text-5xl font-extrabold tracking-tight text-[var(--dark)] sm:text-6xl">
              That&rsquo;s us.
            </p>
            <div className="mt-8 flex items-center gap-5">
              <Link
                href="/onboarding"
                className="inline-block rounded-full bg-[var(--dark)] px-8 py-3 text-base font-bold text-[var(--neon)] transition hover:scale-105 active:scale-95"
              >
                Start matching
              </Link>
              <Link
                href="/thesis"
                className="text-sm font-semibold text-[var(--dark)]/40 underline decoration-dotted underline-offset-4 transition hover:text-[var(--dark)]/70"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ WHAT WE DO (3 cards) ══════ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
            Dating apps broke the vibe.<br />
            <span className="text-neon-gradient">We&rsquo;re fixing it.</span>
          </h2>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            <WhimsyCard
              emoji="🎙️"
              bg="bg-white"
              title="Tell us about yourself"
              body="Forget checkboxes. Answer voice prompts about your rabbit holes, guilty pleasures, and proudest moments. Your matchmaker extracts the real you."
            />
            <WhimsyCard
              emoji="🧠"
              bg="bg-[var(--dark)] text-white"
              title="We find your people"
              body="We build your taste map across 5 dimensions and analyze your best potential matches. Then find people who'll actually make you feel something."
              light
            />
            <WhimsyCard
              emoji="💌"
              bg="bg-white"
              title="Get introduced!"
              body="No more spray-and-pray swiping. You get a personalized story about why this person could change your world."
            />
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS (visual steps) ══════ */}
      <section className="bg-[var(--dark)] text-white px-6 py-24 sm:py-32 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--neon)] blob opacity-5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--neon)] blob-2 opacity-5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl">
          <h2 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
            How it <span className="italic text-[var(--neon)]">actually</span> works
          </h2>

          <div className="mt-20 space-y-16 sm:space-y-20">
            <Step
              num="01"
              title="Tell us about yourself"
              body="We ask questions like 'What's a rabbit hole you can't stop thinking about?' and 'Tell us about a time you bet on yourself.' You talk. We listen."
            />
            <Step
              num="02"
              title="We build your taste map"
              body="Your matchmaker extracts your humor style, values, passions, growth edges, and what makes you genuinely admirable. Across 5 dimensions."
            />
            <Step
              num="03"
              title="Introductions, not profiles"
              body="No deck to swipe through. You get a carefully written introduction about someone — a story tailored to what makes you light up."
            />
            <Step
              num="04"
              title="Both people show up excited"
              body="We write a different intro for them about you. When two people meet after being genuinely primed to see each other's best — the conversation is different."
            />
          </div>
        </div>
      </section>

      {/* ══════ WHAT MAKES US DIFFERENT ══════ */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl mb-14">
            Not another swipe-fest.
          </h2>

          <div className="rounded-2xl bg-white shadow-[0_4px_40px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-[var(--dark)]/10">
              <div className="px-7 py-5" />
              <div className="px-7 py-5 border-l border-[var(--dark)]/10">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--dark)]/40">
                  Everyone else
                </p>
              </div>
              <div className="px-7 py-5 bg-[#f0f5ff] border-l border-[#d4e0ff]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#3b5ccc]">
                  People Like You
                </p>
              </div>
            </div>

            {/* Rows */}
            {[
              ["Finding cool people", "Swipe through hundreds", "Picks tailored to your tastes"],
              ["Figuring out if you\u2019d vibe", "Judge by photos first", "Get to know who they really are"],
              ["Messaging", "Generic \u2018hey\u2019 messages", "Matchmaker-written intros about why you\u2019d click"],
              ["Matching", "Compatibility scores", "Chemistry + compatibility"],
              ["TLDR", "Endless browsing", "Curated intros so you jump right into connecting"],
            ].map(([category, them, us], i, arr) => (
              <div key={i} className={`grid grid-cols-[1.2fr_1fr_1fr] ${i < arr.length - 1 ? "border-b border-[var(--dark)]/[0.06]" : ""}`}>
                <div className="px-7 py-5">
                  <p className="text-sm font-bold text-[var(--dark)]">{category}</p>
                </div>
                <div className="px-7 py-5 border-l border-[var(--dark)]/10">
                  <p className="text-sm text-[var(--dark)]/60 leading-relaxed">{them}</p>
                </div>
                <div className="px-7 py-5 bg-[#f0f5ff] border-l border-[#d4e0ff]">
                  <p className="text-sm font-medium text-[var(--dark)] leading-relaxed">{us}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Ready to meet someone who{" "}
            <span className="italic text-neon-gradient">actually</span>{" "}
            gets it?
          </p>
          <div className="mt-10">
            <Link
              href="/onboarding"
              className="inline-block rounded-full bg-[var(--dark)] px-12 py-5 text-xl font-bold text-white shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-105 active:scale-95"
            >
              Get started free
            </Link>
          </div>
          <p className="mt-4 text-sm text-[var(--dark)]/40">
            No credit card. No swiping. Just better dating.
          </p>
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="border-t border-[var(--dark)]/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-lg font-bold tracking-tight">
            P<span className="italic text-[var(--neon-dim)]">L</span>Y
          </span>
          <div className="flex items-center gap-6 text-sm text-[var(--dark)]/40 font-medium">
            <Link href="/thesis" className="hover:text-[var(--dark)] transition">
              Thesis
            </Link>
            <Link href="/onboarding" className="hover:text-[var(--dark)] transition">
              Join
            </Link>
            <Link href="/dashboard" className="hover:text-[var(--dark)] transition">
              Dashboard
            </Link>
          </div>
          <p className="text-xs text-[var(--dark)]/30">
            &copy; 2026 People Like You &middot; Built by{" "}
            <a href="https://imprevista.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--dark)]/60 transition">
              Imprevista
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Whimsy Card ─── */

function WhimsyCard({
  emoji,
  bg,
  title,
  body,
  light = false,
}: {
  emoji: string;
  bg: string;
  title: string;
  body: string;
  light?: boolean;
}) {
  return (
    <div className={`${bg} rounded-bumble p-8 sm:p-10 transition hover:scale-[1.02] hover:rotate-[0.5deg]`}>
      <div className="text-5xl mb-5">{emoji}</div>
      <h3 className={`text-xl font-bold ${light ? "text-white" : "text-[var(--dark)]"}`}>
        {title}
      </h3>
      <p className={`mt-3 text-base leading-relaxed ${light ? "text-white/70" : "text-[var(--dark)]/60"}`}>
        {body}
      </p>
    </div>
  );
}

/* ─── Step ─── */

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="flex gap-6 sm:gap-10 items-start">
      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--neon)] flex items-center justify-center text-[var(--dark)] font-extrabold text-lg">
        {num}
      </div>
      <div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="mt-2 text-lg text-white/60 leading-relaxed max-w-xl">{body}</p>
      </div>
    </div>
  );
}

