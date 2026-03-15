"use client";

import { useState, useEffect } from "react";

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  state: string;
  height: string;
  education: string;
  exercise: string;
  birthYear: string;
  interests: string[];
  topCharacteristics: string[];
  socialLink: string;
  eloScore: number;
  eloInteractions: number;
  answers: Record<string, string | string[]>;
  vectors: {
    selfExpansion: string[];
    admirationSignals: string[];
    humorSignature: string;
    growthTrajectory: string;
    iSharingMarkers: string[];
  };
}

interface Stats {
  total: number;
  men: number;
  women: number;
  elo: { min: number; max: number; avg: number };
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [view, setView] = useState<"profiles" | "matrix">("profiles");

  async function loadData() {
    setLoading(true);
    try {
      const [statsRes, profilesRes] = await Promise.all([
        fetch("/api/admin/seed"),
        fetch("/api/admin/profiles"),
      ]);
      const statsData = await statsRes.json();
      const profilesData = await profilesRes.json();
      setStats(statsData);
      setProfiles(profilesData.profiles || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSeed() {
    setSeeding(true);
    try {
      await fetch("/api/admin/seed", { method: "POST" });
      await loadData();
    } catch {
      // silent
    } finally {
      setSeeding(false);
    }
  }

  function handleExperienceAs(profile: ProfileData) {
    localStorage.setItem("ply_profile_id", profile.id);
    window.location.href = "/dashboard";
  }

  function getAge(birthYear: string): number {
    return new Date().getFullYear() - parseInt(birthYear);
  }

  const men = profiles.filter((p) => p.gender === "Man");
  const women = profiles.filter((p) => p.gender === "Woman");

  function eloColor(eloA: number, eloB: number): string {
    const diff = Math.abs(eloA - eloB);
    if (diff <= 150) return "bg-green-200 text-green-900";
    if (diff <= 300) return "bg-yellow-200 text-yellow-900";
    return "bg-red-200 text-red-900";
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                Admin Dashboard
              </h1>
              {stats && (
                <p className="mt-1 text-sm text-stone-500">
                  {stats.total} profiles ({stats.men} men, {stats.women} women)
                  {stats.total > 0 && (
                    <span>
                      {" "}
                      &middot; Elo: {stats.elo.min}&#8211;{stats.elo.max} (avg{" "}
                      {stats.elo.avg})
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg border border-stone-200 bg-stone-100 p-0.5">
                <button
                  onClick={() => setView("profiles")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    view === "profiles"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  Profiles
                </button>
                <button
                  onClick={() => setView("matrix")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    view === "matrix"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  Match Matrix
                </button>
              </div>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
              >
                {seeding ? "Seeding..." : "Seed Database"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading && profiles.length === 0 && (
          <p className="text-center text-stone-400">Loading...</p>
        )}

        {!loading && profiles.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-stone-200 p-12 text-center">
            <p className="text-lg text-stone-500">No profiles in database.</p>
            <p className="mt-2 text-sm text-stone-400">
              Click &quot;Seed Database&quot; to load 30 fake profiles.
            </p>
          </div>
        )}

        {/* Profiles View */}
        {view === "profiles" && profiles.length > 0 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Men column */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-stone-900">
                Men ({men.length})
              </h2>
              <div className="space-y-3">
                {men
                  .sort((a, b) => b.eloScore - a.eloScore)
                  .map((p) => (
                    <ProfileCard
                      key={p.id}
                      profile={p}
                      age={getAge(p.birthYear)}
                      expanded={expandedId === p.id}
                      onToggle={() =>
                        setExpandedId(expandedId === p.id ? null : p.id)
                      }
                      onExperience={() => handleExperienceAs(p)}
                    />
                  ))}
              </div>
            </div>

            {/* Women column */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-stone-900">
                Women ({women.length})
              </h2>
              <div className="space-y-3">
                {women
                  .sort((a, b) => b.eloScore - a.eloScore)
                  .map((p) => (
                    <ProfileCard
                      key={p.id}
                      profile={p}
                      age={getAge(p.birthYear)}
                      expanded={expandedId === p.id}
                      onToggle={() =>
                        setExpandedId(expandedId === p.id ? null : p.id)
                      }
                      onExperience={() => handleExperienceAs(p)}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Match Matrix View */}
        {view === "matrix" && profiles.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-4">
              <h2 className="text-lg font-semibold text-stone-900">
                Elo Match Matrix
              </h2>
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded bg-green-200" />
                  Within 150
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded bg-yellow-200" />
                  Within 300
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded bg-red-200" />
                  Too far
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 border-b border-r border-stone-200 bg-stone-50 px-3 py-2 text-left font-medium text-stone-500">
                      Men \ Women
                    </th>
                    {women
                      .sort((a, b) => b.eloScore - a.eloScore)
                      .map((w) => (
                        <th
                          key={w.id}
                          className="border-b border-stone-200 px-2 py-2 text-center font-medium text-stone-700"
                        >
                          <div>{w.firstName}</div>
                          <div className="font-normal text-stone-400">
                            {w.eloScore}
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {men
                    .sort((a, b) => b.eloScore - a.eloScore)
                    .map((m) => (
                      <tr key={m.id}>
                        <td className="sticky left-0 z-10 border-r border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-700">
                          <div>{m.firstName}</div>
                          <div className="font-normal text-stone-400">
                            {m.eloScore}
                          </div>
                        </td>
                        {women
                          .sort((a, b) => b.eloScore - a.eloScore)
                          .map((w) => {
                            const diff = Math.abs(m.eloScore - w.eloScore);
                            return (
                              <td
                                key={w.id}
                                className={`border-stone-100 px-2 py-2 text-center ${eloColor(
                                  m.eloScore,
                                  w.eloScore
                                )}`}
                              >
                                {diff}
                              </td>
                            );
                          })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Profile Card Component ----
function ProfileCard({
  profile,
  age,
  expanded,
  onToggle,
  onExperience,
}: {
  profile: ProfileData;
  age: number;
  expanded: boolean;
  onToggle: () => void;
  onExperience: () => void;
}) {
  const answerLabels: Record<string, string> = {
    unconventional_path: "Bet on themselves",
    fascination: "Could talk for hours about",
    humor: "Laughed until they couldn't breathe",
    admired_quality: "What they admire",
    growth_edge: "Growing toward",
    friend_pitch: "Friend's pitch",
    prompt_ted_talk: "TED talk topic",
    prompt_controversial: "Controversial opinion",
    prompt_secret_talent: "Secret talent",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white transition">
      {/* Card header - always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-stone-50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.socialLink}
          alt={profile.firstName}
          className="h-14 w-14 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-stone-900">
              {profile.firstName} {profile.lastName}
            </span>
            <span className="text-sm text-stone-400">{age}</span>
          </div>
          <div className="mt-0.5 text-sm text-stone-500">
            {profile.state} &middot; {profile.education}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 3).map((i) => (
              <span
                key={i}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-stone-900">
            {profile.eloScore}
          </div>
          <div className="text-xs text-stone-400">Elo</div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-stone-100 px-4 pb-4 pt-3">
          {/* Experience as button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExperience();
            }}
            className="mb-4 w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Experience as {profile.firstName}
          </button>

          {/* Characteristics */}
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Top Characteristics
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {profile.topCharacteristics.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-stone-200 px-2.5 py-0.5 text-xs text-stone-600"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* All interests */}
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              All Interests
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {profile.interests.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600"
                >
                  {i}
                </span>
              ))}
            </div>
          </div>

          {/* Vectors */}
          <div className="mb-3 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Matching Vectors
            </p>
            {profile.vectors.selfExpansion?.length > 0 && (
              <div>
                <span className="text-xs font-medium text-stone-500">
                  Self-expansion:{" "}
                </span>
                <span className="text-xs text-stone-600">
                  {profile.vectors.selfExpansion.join(" / ")}
                </span>
              </div>
            )}
            {profile.vectors.admirationSignals?.length > 0 && (
              <div>
                <span className="text-xs font-medium text-stone-500">
                  Admiration:{" "}
                </span>
                <span className="text-xs text-stone-600">
                  {profile.vectors.admirationSignals.join(" / ")}
                </span>
              </div>
            )}
            {profile.vectors.humorSignature && (
              <div>
                <span className="text-xs font-medium text-stone-500">
                  Humor:{" "}
                </span>
                <span className="text-xs text-stone-600">
                  {profile.vectors.humorSignature}
                </span>
              </div>
            )}
            {profile.vectors.growthTrajectory && (
              <div>
                <span className="text-xs font-medium text-stone-500">
                  Growth:{" "}
                </span>
                <span className="text-xs text-stone-600">
                  {profile.vectors.growthTrajectory}
                </span>
              </div>
            )}
            {profile.vectors.iSharingMarkers?.length > 0 && (
              <div>
                <span className="text-xs font-medium text-stone-500">
                  i-sharing:{" "}
                </span>
                <span className="text-xs text-stone-600">
                  {profile.vectors.iSharingMarkers.join(" / ")}
                </span>
              </div>
            )}
          </div>

          {/* Answers */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Profile Answers
            </p>
            {Object.entries(answerLabels).map(([key, label]) => {
              const val = profile.answers[key];
              if (!val || (typeof val === "string" && !val.trim())) return null;
              return (
                <div key={key}>
                  <p className="text-xs font-medium text-stone-500">{label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
                    {typeof val === "string" ? val : val.join(", ")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Meta */}
          <div className="mt-3 border-t border-stone-100 pt-2 text-xs text-stone-400">
            ID: {profile.id} &middot; {profile.height} &middot;{" "}
            {profile.exercise} exercise &middot; {profile.eloInteractions}{" "}
            interactions
          </div>
        </div>
      )}
    </div>
  );
}
