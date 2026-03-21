"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";

interface Match {
  id: string;
  name: string;
  narrative: string;
  expansionPoints: string[];
  socialLink?: string;
}

interface Profile {
  id: string;
  firstName: string;
  interests: string[];
  eloScore: number;
  eloInteractions: number;
  vectors: {
    selfExpansion: string[];
    admirationSignals: string[];
    humorSignature: string;
    growthTrajectory: string;
  };
}

type FeedbackReason =
  | "not_attracted"
  | "no_spark"
  | "dealbreaker"
  | "something_off"
  | "reconsider";

const FEEDBACK_OPTIONS: { value: FeedbackReason; label: string }[] = [
  { value: "not_attracted", label: "Not physically attracted" },
  { value: "no_spark", label: "No spark from the description" },
  { value: "dealbreaker", label: "Dealbreaker (kids, location, religion, etc.)" },
  { value: "something_off", label: "Something felt off" },
  { value: "reconsider", label: "Actually, I want to reconsider" },
];

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [photoRevealed, setPhotoRevealed] = useState(false);
  const [photoRevealedBeforeDecision, setPhotoRevealedBeforeDecision] =
    useState(false);

  // Feedback modal state
  const [feedbackMatch, setFeedbackMatch] = useState<Match | null>(null);
  const [feedbackReason, setFeedbackReason] = useState<FeedbackReason | null>(
    null
  );
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);

  useEffect(() => {
    const profileId = localStorage.getItem("ply_profile_id");
    if (!profileId) {
      window.location.href = "/onboarding";
      return;
    }

    async function load() {
      try {
        const [profileRes, matchesRes] = await Promise.all([
          fetch(`/api/profile?id=${profileId}`),
          fetch(`/api/matches?profileId=${profileId}`),
        ]);
        const profileData = await profileRes.json();
        const matchesData = await matchesRes.json();

        setProfile(profileData.profile);
        setMatches(matchesData.matches || []);
        posthog.capture('dashboard_loaded', { match_count: (matchesData.matches || []).length })
      } catch {
        // Profile not found
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function handleSelectMatch(match: Match) {
    posthog.capture('match_selected')
    setSelectedMatch(match);
    setPhotoRevealed(false);
    setPhotoRevealedBeforeDecision(false);
  }

  function handleRevealPhoto() {
    posthog.capture('photo_revealed')
    setPhotoRevealed(true);
    setPhotoRevealedBeforeDecision(true);
  }

  function handleNotRightNow() {
    if (selectedMatch) {
      setFeedbackMatch(selectedMatch);
      setSelectedMatch(null);
      setFeedbackReason(null);
      setFeedbackDetails("");
    }
  }

  async function handleSubmitFeedback() {
    if (!feedbackMatch || !feedbackReason || !profile) return;

    if (feedbackReason === "reconsider") {
      // Go back to match detail
      setSelectedMatch(feedbackMatch);
      setFeedbackMatch(null);
      return;
    }

    posthog.capture('feedback_submitted', { reason: feedbackReason })
    setFeedbackSending(true);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: feedbackMatch.id,
          profileId: profile.id,
          reason: feedbackReason,
          details: feedbackDetails,
          photoRevealed: photoRevealedBeforeDecision,
          timestamp: new Date().toISOString(),
        }),
      });

      // Remove the match from list
      setMatches((prev) => prev.filter((m) => m.id !== feedbackMatch.id));
    } catch {
      // Silent fail for MVP
    } finally {
      setFeedbackSending(false);
      setFeedbackMatch(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <p className="text-stone-500">Profile not found.</p>
          <Link href="/onboarding" className="mt-4 text-stone-900 underline">
            Create one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-900">
            People Like You
          </h1>
          <span className="text-sm text-stone-500">Hi, {profile.firstName}</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Profile summary */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Your Profile</h2>
          {profile.vectors && (
            <div className="mt-4 space-y-3">
              {profile.vectors.selfExpansion?.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    Your Worlds
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {profile.vectors.selfExpansion.join(" / ")}
                  </p>
                </div>
              )}
              {profile.vectors.admirationSignals?.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    What Makes You Remarkable
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {profile.vectors.admirationSignals.join(" / ")}
                  </p>
                </div>
              )}
              {profile.vectors.growthTrajectory && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    Where You're Growing
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {profile.vectors.growthTrajectory}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Matches */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-stone-900">
            Your Matches
          </h2>

          {matches.length === 0 ? (
            <div className="mt-4 rounded-xl border-2 border-dashed border-stone-200 p-8 text-center">
              <p className="text-stone-500">
                We're finding people whose worlds could expand yours. Check back
                soon.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => handleSelectMatch(match)}
                  className="w-full rounded-xl bg-white p-6 text-left shadow-sm transition hover:shadow-md"
                >
                  <p className="font-medium text-stone-900">
                    Someone we think you should meet
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600 line-clamp-3">
                    {match.narrative}
                  </p>
                  {match.expansionPoints?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {match.expansionPoints.map((point) => (
                        <span
                          key={point}
                          className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Match detail modal — narrative first, photo reveal */}
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8">
              <h3 className="text-xl font-semibold text-stone-900">
                Why you might click with {selectedMatch.name}
              </h3>
              <p className="mt-4 leading-relaxed text-stone-600">
                {selectedMatch.narrative}
              </p>

              {/* Photo reveal section */}
              <div className="mt-6">
                {!photoRevealed ? (
                  <button
                    onClick={handleRevealPhoto}
                    className="w-full rounded-xl border-2 border-dashed border-stone-200 py-4 text-sm font-medium text-stone-500 transition hover:border-stone-300 hover:text-stone-700"
                  >
                    See their photo
                  </button>
                ) : (
                  <div className="overflow-hidden rounded-xl">
                    {selectedMatch.socialLink ? (
                      <a
                        href={
                          selectedMatch.socialLink.startsWith("http")
                            ? selectedMatch.socialLink
                            : `https://${selectedMatch.socialLink}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-600 transition hover:bg-stone-50"
                      >
                        View their profile: {selectedMatch.socialLink}
                      </a>
                    ) : (
                      <p className="rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-400">
                        Photo not available yet
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 rounded-xl bg-stone-900 py-3 font-medium text-white transition hover:bg-stone-800">
                  I'm curious
                </button>
                <button
                  onClick={handleNotRightNow}
                  className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600 transition hover:bg-stone-50"
                >
                  Not right now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback modal */}
        {feedbackMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8">
              <h3 className="text-lg font-semibold text-stone-900">
                Why wasn't this a fit?
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                This helps us find better matches for you.
              </p>

              <div className="mt-6 space-y-2">
                {FEEDBACK_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFeedbackReason(option.value)}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
                      feedbackReason === option.value
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {feedbackReason && feedbackReason !== "reconsider" && (
                <div className="mt-4">
                  <textarea
                    value={feedbackDetails}
                    onChange={(e) => setFeedbackDetails(e.target.value)}
                    placeholder="Anything specific? (This helps us get better)"
                    rows={3}
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:border-stone-400 focus:outline-none"
                  />
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackReason || feedbackSending}
                  className="flex-1 rounded-xl bg-stone-900 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-30"
                >
                  {feedbackSending
                    ? "Sending..."
                    : feedbackReason === "reconsider"
                    ? "Go back"
                    : "Submit"}
                </button>
                <button
                  onClick={() => setFeedbackMatch(null)}
                  className="flex-1 rounded-xl border border-stone-200 py-3 font-medium text-stone-600 transition hover:bg-stone-50"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
