"use client";

import { useCallback, useEffect, useState } from "react";

// Funnel dashboard (roadmap-2026-07 Phase 0).
// Organized by the five-bottleneck frame: every user's search breaks at exactly
// one stage — top-of-funnel / filtering / attractiveness / connection / retention.
// North star: median days signup → first completed date.

interface FunnelWeek {
  week: string;
  intros_delivered: number;
  interested: number;
  mutual_matches: number;
  chats_started: number;
  mutual_meet_yes: number;
  dates_scheduled: number;
  dates_confirmed: number;
  dates_completed: number;
  dates_verified: number;
  want_second_date: number;
  second_dates: number;
  relationships: number;
}

interface Velocity {
  cohort: string;
  cohortSize: number;
  medianDays: {
    signupToIntro: number | null;
    signupToMutual: number | null;
    mutualToDate: number | null;
    signupToDate: number | null;
  };
  counts: { withIntro: number; withMutual: number; withDate: number };
}

interface MetroRatio {
  metro_code: string;
  men: number;
  women: number;
  real_men: number;
  real_women: number;
}

interface PassReasons {
  totalPasses: number;
  notAttracted: number;
  byReason: Record<string, number>;
}

interface FunnelData {
  metrics: FunnelWeek[];
  velocity: Velocity | null;
  genderRatio: MetroRatio[];
  passReasons: PassReasons | null;
  error?: string;
}

// Bottleneck groups: column keys + which diagnostic stage they illuminate
const STAGE_GROUPS: { label: string; hint: string; cols: { key: keyof FunnelWeek; label: string }[] }[] = [
  {
    label: "Top of funnel",
    hint: "not meeting anyone",
    cols: [{ key: "intros_delivered", label: "Intros" }],
  },
  {
    label: "Filtering + attraction",
    hint: "meeting people they don't want / rejected by people they want",
    cols: [
      { key: "interested", label: "Liked" },
      { key: "mutual_matches", label: "Mutual" },
    ],
  },
  {
    label: "Connection",
    hint: "chats or plans go nowhere",
    cols: [
      { key: "chats_started", label: "Chats" },
      { key: "mutual_meet_yes", label: "Meet: both yes" },
      { key: "dates_scheduled", label: "Scheduled" },
      { key: "dates_confirmed", label: "Confirmed" },
    ],
  },
  {
    label: "Dates",
    hint: "V0 assumed vs V1 verified (both feedbacks)",
    cols: [
      { key: "dates_completed", label: "Completed" },
      { key: "dates_verified", label: "Verified" },
    ],
  },
  {
    label: "Retention",
    hint: "fizzles after the first date",
    cols: [
      { key: "want_second_date", label: "Want 2nd" },
      { key: "second_dates", label: "2nd dates" },
      { key: "relationships", label: "Relationships" },
    ],
  },
];

export default function FunnelDashboard() {
  const [secret, setSecret] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("ply_admin_secret");
    if (stored) setSecret(stored);
  }, []);

  const load = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/funnel", {
        headers: { "x-admin-secret": s },
      });
      if (res.status === 401) {
        sessionStorage.removeItem("ply_admin_secret");
        setSecret(null);
        setAuthError(true);
        return;
      }
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (secret) load(secret);
  }, [secret, load]);

  if (!secret) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="w-full max-w-sm space-y-4 rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">Admin Access</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sessionStorage.setItem("ply_admin_secret", password);
                setSecret(password);
                setAuthError(false);
              }
            }}
            className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-stone-400 focus:outline-none"
          />
          {authError && <p className="text-sm text-red-500">Invalid password</p>}
          <button
            onClick={() => {
              sessionStorage.setItem("ply_admin_secret", password);
              setSecret(password);
              setAuthError(false);
            }}
            className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  const velocity = data?.velocity;
  const weeks = data?.metrics ?? [];
  const ratios = (data?.genderRatio ?? []).filter((r) => r.men + r.women > 0);
  const pr = data?.passReasons;
  const notAttractedPct = pr && pr.totalPasses > 0 ? Math.round((pr.notAttracted / pr.totalPasses) * 100) : null;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-stone-400 hover:text-stone-600">← Admin</a>
            <h1 className="text-xl font-bold text-stone-900">Funnel</h1>
          </div>
          <button
            onClick={() => load(secret)}
            disabled={loading}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {data?.error && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {data.error}
          </p>
        )}

        {/* Velocity — north star */}
        <section>
          <h2 className="mb-1 text-sm font-semibold text-stone-900">
            Velocity{" "}
            {velocity && (
              <span className="font-normal text-stone-400">
                (median days, {velocity.cohort} cohort, n={velocity.cohortSize})
              </span>
            )}
          </h2>
          <p className="mb-3 text-xs text-stone-400">
            North star: signup → first completed date
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <VelocityTile
              label="Signup → first date"
              value={velocity?.medianDays.signupToDate ?? null}
              sub={`${velocity?.counts.withDate ?? 0} users dated`}
              highlight
            />
            <VelocityTile
              label="Signup → first intro"
              value={velocity?.medianDays.signupToIntro ?? null}
              sub={`${velocity?.counts.withIntro ?? 0} users`}
            />
            <VelocityTile
              label="Signup → first mutual"
              value={velocity?.medianDays.signupToMutual ?? null}
              sub={`${velocity?.counts.withMutual ?? 0} users`}
            />
            <VelocityTile
              label="Mutual → first date"
              value={velocity?.medianDays.mutualToDate ?? null}
              sub=""
            />
          </div>
        </section>

        {/* Attractiveness bottleneck signal (H2) */}
        <section>
          <h2 className="mb-1 text-sm font-semibold text-stone-900">Attractiveness signal</h2>
          <p className="mb-3 text-xs text-stone-400">
            Share of passes citing &ldquo;not attracted.&rdquo; If this dominates, physical attraction is the
            binding bottleneck (invest in the attraction layer). Watching, not acting, until it&rsquo;s clearly high.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div
              className={`rounded-xl border bg-white p-4 shadow-sm ${
                notAttractedPct !== null && notAttractedPct >= 40 ? "border-amber-400" : "border-stone-200"
              }`}
            >
              <p className="text-xs text-stone-500">&ldquo;Not attracted&rdquo; share</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-stone-900">
                {notAttractedPct === null ? "—" : `${notAttractedPct}%`}
              </p>
              <p className="mt-0.5 text-xs text-stone-400">
                {pr ? `${pr.notAttracted} of ${pr.totalPasses} passes` : "no pass data"}
              </p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-stone-500">Total passes</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-stone-700">{pr?.totalPasses ?? 0}</p>
              <p className="mt-0.5 text-xs text-stone-400">all pass reasons</p>
            </div>
          </div>
        </section>

        {/* Weekly funnel, bottleneck-framed */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-stone-900">
            Weekly funnel <span className="font-normal text-stone-400">(by intro week)</span>
          </h2>
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-[11px] uppercase tracking-wide text-stone-400">
                  <th className="px-3 py-2 text-left font-medium"></th>
                  {STAGE_GROUPS.map((g) => (
                    <th
                      key={g.label}
                      colSpan={g.cols.length}
                      title={g.hint}
                      className="border-l border-stone-100 px-3 py-2 text-left font-medium"
                    >
                      {g.label}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-stone-200 text-xs text-stone-500">
                  <th className="px-3 py-2 text-left font-medium">Week</th>
                  {STAGE_GROUPS.flatMap((g) =>
                    g.cols.map((c, i) => (
                      <th
                        key={c.key}
                        className={`px-3 py-2 text-right font-medium ${i === 0 ? "border-l border-stone-100" : ""}`}
                      >
                        {c.label}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {weeks.length === 0 && (
                  <tr>
                    <td colSpan={13} className="px-3 py-8 text-center text-stone-400">
                      No intro data yet
                    </td>
                  </tr>
                )}
                {weeks.map((w) => (
                  <tr key={w.week} className="border-b border-stone-100 last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 text-stone-600">
                      {w.week?.slice(0, 10)}
                    </td>
                    {STAGE_GROUPS.flatMap((g) =>
                      g.cols.map((c, i) => (
                        <td
                          key={c.key}
                          className={`px-3 py-2 text-right tabular-nums ${i === 0 ? "border-l border-stone-100" : ""} ${
                            (w[c.key] as number) > 0 ? "text-stone-900" : "text-stone-300"
                          }`}
                        >
                          {w[c.key] as number}
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Dates: Completed = assumed (cron flips 2.5h after scheduled time). Verified = both sides
            submitted post-date feedback.
          </p>
        </section>

        {/* Pool gender ratio per metro */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-stone-900">
            Pool gender ratio by metro{" "}
            <span className="font-normal text-stone-400">(active profiles)</span>
          </h2>
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs text-stone-500">
                  <th className="px-3 py-2 text-left font-medium">Metro</th>
                  <th className="px-3 py-2 text-right font-medium">Men</th>
                  <th className="px-3 py-2 text-right font-medium">Women</th>
                  <th className="px-3 py-2 text-right font-medium">M:W</th>
                  <th className="px-3 py-2 text-right font-medium">Real (M/W)</th>
                  <th className="px-3 py-2 text-left font-medium">Scarce side</th>
                </tr>
              </thead>
              <tbody>
                {ratios.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-stone-400">
                      No active profiles with metro data
                    </td>
                  </tr>
                )}
                {ratios.map((r) => {
                  const ratio = r.women > 0 ? (r.men / r.women).toFixed(2) : "∞";
                  const scarce =
                    r.men === r.women ? "balanced" : r.men < r.women ? "men" : "women";
                  return (
                    <tr key={r.metro_code} className="border-b border-stone-100 last:border-0">
                      <td className="px-3 py-2 text-stone-600">{r.metro_code}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.men}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.women}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{ratio}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-stone-500">
                        {r.real_men}/{r.real_women}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                            scarce === "balanced"
                              ? "bg-stone-100 text-stone-500"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {scarce === "balanced" ? "balanced" : `need ${scarce}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function VelocityTile({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number | null;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        highlight ? "border-stone-900" : "border-stone-200"
      }`}
    >
      <p className="text-xs text-stone-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${highlight ? "text-stone-900" : "text-stone-700"}`}>
        {value === null ? "—" : `${value}d`}
      </p>
      {sub && <p className="mt-0.5 text-xs text-stone-400">{sub}</p>}
    </div>
  );
}
