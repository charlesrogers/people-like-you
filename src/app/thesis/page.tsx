import Link from "next/link";

export const metadata = {
  title: "Our Thesis — People Like You",
  description:
    "Why dating apps fail at chemistry, and what we're doing about it.",
};

export default function ThesisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Link
          href="/"
          className="text-sm font-medium text-stone-400 transition hover:text-stone-600"
        >
          &larr; Back
        </Link>

        <h1 className="mt-8 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          The Thesis
        </h1>

        <p className="mt-4 text-lg font-medium text-stone-500">
          Why compatibility alone will never be enough — and what actually makes
          two people click.
        </p>

        {/* ---- The Problem ---- */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-stone-900">
            Dating apps have a chemistry problem
          </h2>
          <div className="mt-6 space-y-5 text-base leading-7 text-stone-600">
            <p>
              Every dating app on the market is solving the same problem: sort
              through people efficiently. Swipe right, swipe left. Filter by
              height, education, distance. Maybe answer some personality
              questions so an algorithm can find your &ldquo;match.&rdquo;
            </p>
            <p>
              But think about every person you&rsquo;ve ever fallen for. Were
              they the output of a filter? Did you fall for them because you
              both listed &ldquo;hiking&rdquo; as an interest?
            </p>
            <p>
              No. Something happened. A moment. A feeling. A spark you
              didn&rsquo;t expect and couldn&rsquo;t have predicted from a
              profile card. The job you&rsquo;re hiring a dating app to do
              isn&rsquo;t <em>sorting</em> — it&rsquo;s{" "}
              <strong>falling for someone</strong>.
            </p>
            <p>
              And falling for someone requires two things that no dating app
              currently delivers together: <strong>compatibility</strong> (the
              right person) and <strong>chemistry</strong> (the right feeling
              when you encounter them).
            </p>
          </div>
        </section>

        {/* ---- Compatibility is table stakes ---- */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-stone-900">
            Compatibility is table stakes
          </h2>
          <div className="mt-6 space-y-5 text-base leading-7 text-stone-600">
            <p>
              Compatibility matters. Shared values, aligned life goals,
              complementary temperaments — these are the foundation of any
              relationship that lasts. We take this seriously. We profile deeply:
              your personality dichotomies, your spectrum positions, what you
              value in a partner, your non-negotiables, how you handle conflict.
            </p>
            <p>
              But here&rsquo;s what every other app gets wrong: they stop there.
              They hand you a compatible person and say &ldquo;good luck.&rdquo;
              A name. A photo. A bio. And then they wonder why 90% of matches
              never become conversations, and 90% of conversations never become
              dates.
            </p>
            <p>
              Compatible people are everywhere. You probably walked past three of
              them today. Compatibility is necessary but not sufficient.
              What&rsquo;s missing is the <em>feeling</em>.
            </p>
          </div>
        </section>

        {/* ---- The psychology of spark ---- */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-stone-900">
            The psychology of the spark
          </h2>
          <div className="mt-6 space-y-5 text-base leading-7 text-stone-600">
            <p>
              Remember the night before your first high school dance? The
              butterflies walking into a college mixer where you didn&rsquo;t
              know anyone? The electric anticipation of a blind date set up by
              your most trusted friend?
            </p>
            <p>
              That feeling isn&rsquo;t random. It&rsquo;s the result of specific
              psychological conditions:
            </p>
            <ul className="ml-6 list-disc space-y-3 text-stone-600">
              <li>
                <strong>Anticipation without certainty.</strong> You know
                something is about to happen, but you don&rsquo;t know exactly
                what. The gap between expectation and unknown is where
                excitement lives.
              </li>
              <li>
                <strong>Earned investment.</strong> You&rsquo;ve put something
                in — time, vulnerability, hope — so the outcome matters to you.
                You&rsquo;re not browsing. You&rsquo;re <em>in it</em>.
              </li>
              <li>
                <strong>Self-expansion.</strong> The research is clear: we
                don&rsquo;t fall for people who are like us. We fall for people
                who expand our world. Who make us feel like a more interesting
                version of ourselves. Who open doors we didn&rsquo;t know
                existed.
              </li>
              <li>
                <strong>Narrative, not data.</strong> Nobody falls in love with a
                bullet-point list of attributes. We fall into{" "}
                <em>stories</em>. &ldquo;She quit her corporate job to open a
                ceramics studio and now teaches kids on weekends&rdquo; hits
                completely different than &ldquo;Creative, adventurous,
                good with kids.&rdquo;
              </li>
              <li>
                <strong>Reciprocal vulnerability.</strong> When you sense that
                someone has been genuinely honest about who they are — not
                performing, not posturing — it disarms you. It makes you want to
                be honest back. That mutual openness is the precursor to every
                real connection.
              </li>
            </ul>
          </div>
        </section>

        {/* ---- What we actually do ---- */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-stone-900">
            So here&rsquo;s what we do differently
          </h2>
          <div className="mt-6 space-y-5 text-base leading-7 text-stone-600">
            <p>
              We don&rsquo;t just find compatible people and introduce them. We{" "}
              <strong>engineer the conditions for chemistry</strong> between
              compatible people.
            </p>

            <p className="font-medium text-stone-800">
              1. We extract your unique genius.
            </p>
            <p>
              Our onboarding doesn&rsquo;t ask what you like. It asks who you{" "}
              <em>are</em> — through stories, not checkboxes. Tell us about the
              time you bet on yourself when everyone doubted you. What could you
              talk about for hours? What makes you think &ldquo;wow, this person
              is remarkable&rdquo;? We use AI to extract the vectors that
              actually predict chemistry: the worlds you could open for someone,
              what makes you genuinely admirable, your humor signature, where
              you&rsquo;re growing, and the moments that make you feel
              &ldquo;clicked.&rdquo;
            </p>

            <p className="font-medium text-stone-800">
              2. We write introductions that grip you.
            </p>
            <p>
              When we introduce you to someone, you don&rsquo;t see a name and a
              photo. You read a personalized narrative — written specifically for{" "}
              <em>you</em> — about why this person might change your world. Not
              generic compatibility talk. Specific: how their ceramics obsession
              connects to your love of learning new crafts. How their humor
              style is exactly the kind that makes you snort-laugh. How
              they&rsquo;re on a growth path that mirrors yours but from a
              completely different direction.
            </p>
            <p>
              By the time you finish reading, you should feel what you&rsquo;d
              feel walking into that school dance. Gripped. Curious. Secretly
              hoping they say yes to you.
            </p>

            <p className="font-medium text-stone-800">
              3. We do the same thing to them.
            </p>
            <p>
              Here&rsquo;s the part that changes everything: we&rsquo;re writing
              a different narrative for the other person too. Tailored to{" "}
              <em>their</em> psychology, <em>their</em> expansion points,{" "}
              <em>their</em> admiration patterns. When two people meet after
              both being genuinely primed to see each other&rsquo;s unique
              brilliance, the conversation that follows is fundamentally
              different from two strangers exchanging &ldquo;hey&rdquo; on
              Hinge.
            </p>

            <p className="font-medium text-stone-800">
              4. We reveal, not display.
            </p>
            <p>
              Photos come after the narrative, not before. Because once you see a
              photo, snap judgment takes over and everything you read gets
              filtered through it. We want the story to land first. We want you
              to feel something about who this person <em>is</em> before you see
              what they look like. The photo becomes confirmation, not the
              decision.
            </p>
          </div>
        </section>

        {/* ---- The dream ---- */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-stone-900">
            The dream
          </h2>
          <div className="mt-6 space-y-5 text-base leading-7 text-stone-600">
            <p>
              Every introduction should feel like your most insightful friend
              pulling you aside at a party and saying: &ldquo;Okay, I need you
              to meet someone. Trust me on this one.&rdquo;
            </p>
            <p>
              We want both people to walk into that first conversation already
              feeling something. Already curious. Already a little invested.
              Already hoping it works out — not because an algorithm told them
              they&rsquo;re a 94% match, but because a story made them{" "}
              <em>feel</em> it.
            </p>
            <p>
              Compatibility gets the right people in the room. Chemistry makes
              them want to stay. We&rsquo;re building both.
            </p>
          </div>
        </section>

        <div className="mt-20 border-t border-stone-200 pt-10">
          <Link
            href="/onboarding"
            className="block rounded-xl bg-stone-900 px-6 py-4 text-center text-lg font-medium text-white transition hover:bg-stone-800"
          >
            Experience it yourself
          </Link>
        </div>
      </div>
    </div>
  );
}
