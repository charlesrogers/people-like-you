"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ───

interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  gender: string;
  seeking: string;
  birth_year: number | null;
  state: string | null;
  onboarding_stage: string;
  elo_score: number;
  elo_interactions: number;
  is_seed: boolean;
  created_at: string;
  voice_memo_count: number;
  photo_count: number;
  composite: { excitement_type: string | null; memo_count: number } | null;
}

interface StatsData {
  users: {
    total: number;
    real: number;
    seed: number;
    men: number;
    women: number;
    signupsToday: number;
    signupsThisWeek: number;
    signupsByDay: Record<string, number>;
  };
  funnel: Record<string, number>;
  elo: {
    min: number;
    max: number;
    avg: number;
    buckets: Record<string, number>;
  };
  matches: {
    total: number;
    feedbackTotal: number;
    interested: number;
    passed: number;
    photoRevealed: number;
    responseRate: number;
    interestRate: number;
    passReasons: Record<string, number>;
  };
}

interface AdminMatch {
  id: string;
  user_a_id: string;
  user_b_id: string;
  user_a_name: string;
  user_b_name: string;
  angle_narrative: string | null;
  angle_style: string | null;
  expansion_points: string[];
  created_at: string;
  feedback: Array<{
    action: string;
    reason: string | null;
    photo_revealed_before_decision: boolean;
    user_id: string;
  }>;
}

interface TestsData {
  lifeStage: {
    totalProfiles: number;
    hasLifeStage: number;
    scoreable: number;
    chapters: Record<string, number>;
    funnel: {
      scored: { intros: number; likeRate: number; mutualMatches: number };
      skipped: { intros: number; likeRate: number; mutualMatches: number };
    };
  };
  hookType: {
    totalIntros: number;
    byType: Array<{
      hookType: string;
      total: number;
      liked: number;
      passed: number;
      expired: number;
      pending: number;
      likeRate: number;
      passRate: number;
    }>;
    populated: boolean;
  };
  userCount: number;
}

type Tab = "overview" | "users" | "matches" | "matrix" | "tests" | "pool-health";

interface PoolHealthData {
  totalUsers: number;
  totalEmptyPool: number;
  emptyPoolAlerts: number;
  segments: Array<{
    segment: string;
    total: number;
    empty_pool: number;
    paused: number;
    users: string[];
  }>;
  recentAlerts: Array<{
    user_id: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }>;
}

// ─── Auth gate ───

function useAdminAuth() {
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("ply_admin_secret");
    if (stored) setSecret(stored);
  }, []);

  function login(pwd: string) {
    sessionStorage.setItem("ply_admin_secret", pwd);
    setSecret(pwd);
  }

  return { secret, login };
}

function adminFetch(url: string, secret: string, opts?: RequestInit) {
  return fetch(url, {
    ...opts,
    headers: {
      ...opts?.headers,
      "x-admin-secret": secret,
      "Content-Type": "application/json",
    },
  });
}

// ─── Main page ───

export default function AdminDashboard() {
  const { secret, login } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);

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
                login(password);
                setAuthError(false);
              }
            }}
            className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-stone-400 focus:outline-none"
          />
          {authError && (
            <p className="text-sm text-red-500">Invalid password</p>
          )}
          <button
            onClick={() => {
              login(password);
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

  return <AdminPanel secret={secret} onAuthError={() => {
    sessionStorage.removeItem("ply_admin_secret");
    setAuthError(true);
    window.location.reload();
  }} />;
}

function AdminPanel({ secret, onAuthError }: { secret: string; onAuthError: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [profiles, setProfiles] = useState<AdminUser[]>([]);
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [testsData, setTestsData] = useState<TestsData | null>(null);
  const [poolHealth, setPoolHealth] = useState<PoolHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, profilesRes] = await Promise.all([
        adminFetch("/api/admin/stats", secret),
        adminFetch("/api/admin/profiles", secret),
      ]);
      if (statsRes.status === 401 || profilesRes.status === 401) {
        onAuthError();
        return;
      }
      setStats(await statsRes.json());
      const pData = await profilesRes.json();
      setProfiles(pData.profiles || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [secret, onAuthError]);

  useEffect(() => { load(); }, [load]);

  // Lazy-load matches when tab selected
  useEffect(() => {
    if (tab === "matches" && matches.length === 0) {
      adminFetch("/api/admin/matches", secret).then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setMatches(data.matches || []);
        }
      });
    }
  }, [tab, matches.length, secret]);

  // Lazy-load tests data
  useEffect(() => {
    if (tab === "tests" && !testsData) {
      adminFetch("/api/admin/tests", secret).then(async (r) => {
        if (r.ok) setTestsData(await r.json());
      });
    }
  }, [tab, testsData, secret]);

  // Lazy-load pool health data
  useEffect(() => {
    if (tab === "pool-health" && !poolHealth) {
      adminFetch("/api/admin/pool-health", secret).then(async (r) => {
        if (r.ok) setPoolHealth(await r.json());
      });
    }
  }, [tab, poolHealth, secret]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "matches", label: "Matches" },
    { id: "matrix", label: "Matrix" },
    { id: "tests", label: "Tests" },
    { id: "pool-health", label: "Pool Health" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">PLY Admin</h1>
          <div className="flex items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-stone-900 text-white"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                }`}
              >
                {t.label}
              </button>
            ))}
            <button
              onClick={load}
              disabled={loading}
              className="ml-4 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-50 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {tab === "overview" && stats && <OverviewTab stats={stats} />}
        {tab === "users" && (
          <UsersTab profiles={profiles} secret={secret} onRefresh={load} />
        )}
        {tab === "matches" && <MatchesTab matches={matches} stats={stats} />}
        {tab === "matrix" && <MatrixTab profiles={profiles} />}
        {tab === "tests" && <TestsTab data={testsData} />}
        {tab === "pool-health" && <PoolHealthTab data={poolHealth} />}
        {loading && !stats && (
          <p className="text-center text-stone-400 py-12">Loading...</p>
        )}
      </div>
    </div>
  );
}

// ─── Overview Tab ───

function OverviewTab({ stats }: { stats: StatsData }) {
  const funnelStages = [
    { key: "basics", label: "Basics" },
    { key: "voice", label: "Voice" },
    { key: "preferences", label: "Preferences" },
    { key: "photos", label: "Photos" },
    { key: "calibrate", label: "Calibrate" },
    { key: "complete", label: "Complete" },
  ];
  const maxFunnel = Math.max(...Object.values(stats.funnel), 1);

  const signupDays = Object.entries(stats.users.signupsByDay).sort(
    ([a], [b]) => a.localeCompare(b)
  );
  const maxSignups = Math.max(...signupDays.map(([, v]) => v), 1);

  return (
    <div className="space-y-8">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Total Users" value={stats.users.total} sub={`${stats.users.real} real · ${stats.users.seed} seed`} />
        <MetricCard label="Signups Today" value={stats.users.signupsToday} />
        <MetricCard label="Signups This Week" value={stats.users.signupsThisWeek} />
        <MetricCard label="Gender Split" value={`${stats.users.men}M / ${stats.users.women}W`} />
      </div>

      {/* Match stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Total Matches" value={stats.matches.total} />
        <MetricCard label="Response Rate" value={`${stats.matches.responseRate}%`} sub={`${stats.matches.feedbackTotal} responses`} />
        <MetricCard label="Interest Rate" value={`${stats.matches.interestRate}%`} sub={`${stats.matches.interested} interested`} />
        <MetricCard label="Photo Reveals" value={stats.matches.photoRevealed} sub="before decision" />
      </div>

      {/* Elo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricCard label="Elo Min" value={stats.elo.min} />
        <MetricCard label="Elo Max" value={stats.elo.max} />
        <MetricCard label="Elo Avg" value={stats.elo.avg} />
      </div>

      {/* Funnel */}
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">
          Onboarding Funnel (real users)
        </h2>
        <div className="space-y-3">
          {funnelStages.map((s) => {
            const count = stats.funnel[s.key] || 0;
            const pct = stats.users.real ? Math.round((count / stats.users.real) * 100) : 0;
            return (
              <div key={s.key} className="flex items-center gap-3">
                <span className="w-24 text-xs font-medium text-stone-500 text-right">
                  {s.label}
                </span>
                <div className="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-700 rounded-full transition-all"
                    style={{ width: `${(count / maxFunnel) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-xs text-stone-500">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Signup trend */}
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-4">
          Signups (last 30 days)
        </h2>
        <div className="flex items-end gap-[2px] h-32">
          {signupDays.map(([day, count]) => (
            <div
              key={day}
              className="flex-1 bg-stone-300 hover:bg-stone-500 rounded-t transition-colors group relative"
              style={{ height: `${Math.max((count / maxSignups) * 100, 2)}%` }}
              title={`${day}: ${count}`}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-stone-500 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {count}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-stone-400">
          <span>{signupDays[0]?.[0]?.slice(5)}</span>
          <span>{signupDays[signupDays.length - 1]?.[0]?.slice(5)}</span>
        </div>
      </div>

      {/* Pass reasons */}
      {Object.keys(stats.matches.passReasons).length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">
            Pass Reasons
          </h2>
          <div className="space-y-2">
            {Object.entries(stats.matches.passReasons)
              .sort(([, a], [, b]) => b - a)
              .map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">{reason.replace(/_/g, " ")}</span>
                  <span className="font-medium text-stone-900">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* PostHog link */}
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
        <p className="text-sm text-stone-500">
          Detailed event analytics available in{" "}
          <a
            href="https://us.posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-stone-700 underline hover:text-stone-900"
          >
            PostHog Dashboard
          </a>
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-stone-400">{sub}</p>}
    </div>
  );
}

// ─── Users Tab ───

function UsersTab({
  profiles,
  secret,
  onRefresh,
}: {
  profiles: AdminUser[];
  secret: string;
  onRefresh: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "real" | "seed">("all");
  const [search, setSearch] = useState("");

  const filtered = profiles.filter((p) => {
    if (filter === "real" && p.is_seed) return false;
    if (filter === "seed" && !p.is_seed) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.first_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.id.includes(q)
      );
    }
    return true;
  });

  const men = filtered.filter((p) => p.gender === "Man");
  const women = filtered.filter((p) => p.gender === "Woman");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-stone-200 px-3 py-2 text-sm w-64 focus:border-stone-400 focus:outline-none"
        />
        <div className="flex rounded-lg border border-stone-200 bg-stone-100 p-0.5">
          {(["all", "real", "seed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                filter === f
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {f === "all" ? `All (${profiles.length})` : f === "real" ? `Real (${profiles.filter(p => !p.is_seed).length})` : `Seed (${profiles.filter(p => p.is_seed).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-stone-900">
            Men ({men.length})
          </h2>
          <div className="space-y-3">
            {men
              .sort((a, b) => b.elo_score - a.elo_score)
              .map((p) => (
                <UserCard
                  key={p.id}
                  user={p}
                  expanded={expandedId === p.id}
                  onToggle={() =>
                    setExpandedId(expandedId === p.id ? null : p.id)
                  }
                  secret={secret}
                  onRefresh={onRefresh}
                />
              ))}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold text-stone-900">
            Women ({women.length})
          </h2>
          <div className="space-y-3">
            {women
              .sort((a, b) => b.elo_score - a.elo_score)
              .map((p) => (
                <UserCard
                  key={p.id}
                  user={p}
                  expanded={expandedId === p.id}
                  onToggle={() =>
                    setExpandedId(expandedId === p.id ? null : p.id)
                  }
                  secret={secret}
                  onRefresh={onRefresh}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserCard({
  user,
  expanded,
  onToggle,
  secret,
  onRefresh,
}: {
  user: AdminUser;
  expanded: boolean;
  onToggle: () => void;
  secret: string;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [eloInput, setEloInput] = useState(String(user.elo_score));
  const [stageInput, setStageInput] = useState(user.onboarding_stage);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const age = user.birth_year
    ? new Date().getFullYear() - user.birth_year
    : "?";

  const stageBadgeColor: Record<string, string> = {
    basics: "bg-stone-100 text-stone-600",
    voice: "bg-blue-100 text-blue-700",
    preferences: "bg-purple-100 text-purple-700",
    photos: "bg-amber-100 text-amber-700",
    calibrate: "bg-cyan-100 text-cyan-700",
    complete: "bg-green-100 text-green-700",
  };

  async function handleSave() {
    setSaving(true);
    await adminFetch(`/api/admin/user/${user.id}`, secret, {
      method: "PATCH",
      body: JSON.stringify({
        elo_score: parseInt(eloInput) || user.elo_score,
        onboarding_stage: stageInput,
      }),
    });
    setSaving(false);
    setEditing(false);
    onRefresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete ${user.first_name} (${user.email})? This cannot be undone.`)) return;
    setDeleting(true);
    await adminFetch(`/api/admin/user/${user.id}`, secret, { method: "DELETE" });
    setDeleting(false);
    onRefresh();
  }

  async function handleToggleSeed() {
    await adminFetch(`/api/admin/user/${user.id}`, secret, {
      method: "PATCH",
      body: JSON.stringify({ is_seed: !user.is_seed }),
    });
    onRefresh();
  }

  function handleExperienceAs() {
    localStorage.setItem("ply_profile_id", user.id);
    window.location.href = "/dashboard";
  }

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-stone-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-500">
          {user.first_name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">
              {user.first_name} {user.last_name || ""}
            </span>
            <span className="text-sm text-stone-400">{age}</span>
            {user.is_seed && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                SEED
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                stageBadgeColor[user.onboarding_stage] || "bg-stone-100 text-stone-600"
              }`}
            >
              {user.onboarding_stage}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-stone-400">
            <span>{user.email}</span>
            <span>{user.voice_memo_count} memos</span>
            <span>{user.photo_count} photos</span>
            {user.composite && (
              <span className="text-emerald-600">
                {user.composite.excitement_type || "composite ready"}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-stone-900">{user.elo_score}</div>
          <div className="text-[10px] text-stone-400">
            Elo · {user.elo_interactions} votes
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-stone-100 px-4 pb-4 pt-3 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs text-stone-500">
            <span>ID: {user.id}</span>
            <span>·</span>
            <span>{user.state || "No state"}</span>
            <span>·</span>
            <span>Seeking: {user.seeking}</span>
            <span>·</span>
            <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
          </div>

          {editing ? (
            <div className="space-y-3 rounded-lg bg-stone-50 p-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-stone-500 w-20">Elo</label>
                <input
                  type="number"
                  value={eloInput}
                  onChange={(e) => setEloInput(e.target.value)}
                  className="rounded-md border border-stone-200 px-2 py-1 text-sm w-24"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-stone-500 w-20">Stage</label>
                <select
                  value={stageInput}
                  onChange={(e) => setStageInput(e.target.value)}
                  className="rounded-md border border-stone-200 px-2 py-1 text-sm"
                >
                  {["basics", "voice", "preferences", "photos", "calibrate", "complete"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
              >
                Edit
              </button>
              <button
                onClick={handleExperienceAs}
                className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
              >
                Experience as
              </button>
              <button
                onClick={handleToggleSeed}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-50"
              >
                {user.is_seed ? "Mark real" : "Mark seed"}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Matches Tab ───

function MatchesTab({ matches, stats }: { matches: AdminMatch[]; stats: StatsData | null }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "interested" | "passed" | "pending">("all");

  const filtered = matches.filter((m) => {
    if (filter === "all") return true;
    if (filter === "pending") return m.feedback.length === 0;
    return m.feedback.some((f) => f.action === (filter === "interested" ? "interested" : "not_interested"));
  });

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Matches" value={stats.matches.total} />
          <MetricCard label="Interest Rate" value={`${stats.matches.interestRate}%`} />
          <MetricCard label="Interested" value={stats.matches.interested} />
          <MetricCard label="Passed" value={stats.matches.passed} />
        </div>
      )}

      {/* Filters */}
      <div className="flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 w-fit">
        {(["all", "interested", "passed", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition capitalize ${
              filter === f
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Match list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="py-12 text-center text-stone-400">No matches found.</p>
        )}
        {filtered.map((m) => {
          const fb = m.feedback[0];
          const fbColor = fb
            ? fb.action === "interested"
              ? "text-green-600"
              : "text-red-500"
            : "text-stone-400";
          const fbLabel = fb
            ? fb.action === "interested"
              ? "Interested"
              : `Passed${fb.reason ? ` (${fb.reason.replace(/_/g, " ")})` : ""}`
            : "No response";

          return (
            <div
              key={m.id}
              className="rounded-xl border border-stone-200 bg-white overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === m.id ? null : m.id)
                }
                className="flex w-full items-center gap-4 p-4 text-left hover:bg-stone-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-stone-900">
                      {m.user_a_name}
                    </span>
                    <span className="text-stone-400">&rarr;</span>
                    <span className="font-medium text-stone-900">
                      {m.user_b_name}
                    </span>
                  </div>
                  {m.angle_narrative && (
                    <p className="mt-1 text-xs text-stone-500 truncate max-w-lg">
                      {m.angle_narrative}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-medium ${fbColor}`}>
                    {fbLabel}
                  </span>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
              {expandedId === m.id && (
                <div className="border-t border-stone-100 px-4 pb-4 pt-3 space-y-3">
                  {m.angle_narrative && (
                    <div>
                      <p className="text-xs font-medium text-stone-500 mb-1">
                        Narrative ({m.angle_style || "default"})
                      </p>
                      <p className="text-sm text-stone-700 leading-relaxed">
                        {m.angle_narrative}
                      </p>
                    </div>
                  )}
                  {m.expansion_points?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-stone-500 mb-1">
                        Expansion Points
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.expansion_points.map((ep) => (
                          <span
                            key={ep}
                            className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
                          >
                            {ep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {m.feedback.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-stone-500 mb-1">
                        Feedback
                      </p>
                      {m.feedback.map((f, i) => (
                        <div key={i} className="text-xs text-stone-600">
                          {f.action}
                          {f.reason && ` — ${f.reason.replace(/_/g, " ")}`}
                          {f.photo_revealed_before_decision && " (photo seen)"}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-stone-400">
                    Match ID: {m.id}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Matrix Tab ───

function MatrixTab({ profiles }: { profiles: AdminUser[] }) {
  const men = profiles.filter((p) => p.gender === "Man");
  const women = profiles.filter((p) => p.gender === "Woman");

  function eloColor(eloA: number, eloB: number): string {
    const diff = Math.abs(eloA - eloB);
    if (diff <= 150) return "bg-green-200 text-green-900";
    if (diff <= 300) return "bg-yellow-200 text-yellow-900";
    return "bg-red-200 text-red-900";
  }

  if (profiles.length === 0) {
    return <p className="py-12 text-center text-stone-400">No profiles loaded.</p>;
  }

  return (
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
                .sort((a, b) => b.elo_score - a.elo_score)
                .map((w) => (
                  <th
                    key={w.id}
                    className="border-b border-stone-200 px-2 py-2 text-center font-medium text-stone-700"
                  >
                    <div>{w.first_name}</div>
                    <div className="font-normal text-stone-400">
                      {w.elo_score}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {men
              .sort((a, b) => b.elo_score - a.elo_score)
              .map((m) => (
                <tr key={m.id}>
                  <td className="sticky left-0 z-10 border-r border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-700">
                    <div>{m.first_name}</div>
                    <div className="font-normal text-stone-400">
                      {m.elo_score}
                    </div>
                  </td>
                  {women
                    .sort((a, b) => b.elo_score - a.elo_score)
                    .map((w) => (
                      <td
                        key={w.id}
                        className={`border-stone-100 px-2 py-2 text-center ${eloColor(
                          m.elo_score,
                          w.elo_score
                        )}`}
                      >
                        {Math.abs(m.elo_score - w.elo_score)}
                      </td>
                    ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tests Tab ───

const POWER_TABLE = [
  { users: 10, learn: "Qualitative only — read every intro, collect feedback", days: "—" },
  { users: 30, learn: "Identify clearly worst hook type (if 0 likes in a week, kill it)", days: "7" },
  { users: 100, learn: "Reliable hook type ranking. Borderline per-archetype breakdown", days: "3–7" },
  { users: 300, learn: "Per-archetype x hook type matrix fills in. Start Thompson sampling", days: "3" },
  { users: 1000, learn: "Full optimization. A/B test new hook types. Per-user personalization", days: "1" },
];

function TestsTab({ data }: { data: TestsData | null }) {
  if (!data) {
    return <p className="text-center text-stone-400 py-12">Loading test data...</p>;
  }

  const currentTier = POWER_TABLE.findIndex((row, i) => {
    const next = POWER_TABLE[i + 1];
    return !next || data.userCount < next.users;
  });

  return (
    <div className="space-y-8">
      {/* Statistical Power Reference */}
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-stone-900 mb-1">Statistical Power Reference</h2>
        <p className="text-xs text-stone-500 mb-4">
          Current real users: <span className="font-semibold text-stone-700">{data.userCount}</span>
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="py-2 text-left font-medium text-stone-500 w-20">Users</th>
              <th className="py-2 text-left font-medium text-stone-500">What we can learn</th>
              <th className="py-2 text-right font-medium text-stone-500 w-16">Days</th>
            </tr>
          </thead>
          <tbody>
            {POWER_TABLE.map((row, i) => (
              <tr
                key={row.users}
                className={`border-b border-stone-100 ${i === currentTier ? "bg-amber-50" : ""}`}
              >
                <td className={`py-2 font-medium ${i === currentTier ? "text-amber-700" : "text-stone-700"}`}>
                  {row.users.toLocaleString()}
                </td>
                <td className={`py-2 ${i === currentTier ? "text-amber-800" : "text-stone-600"}`}>
                  {row.learn}
                </td>
                <td className={`py-2 text-right ${i === currentTier ? "text-amber-700" : "text-stone-500"}`}>
                  {row.days}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Test 1: Life-Stage Soft Scoring */}
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Test 1: Life-Stage Soft Scoring</h3>
            <p className="text-xs text-stone-500 mt-0.5">Started 2026-03-24 · Weight 0.35 (~8% of total score)</p>
          </div>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Active</span>
        </div>

        {/* Extraction Health */}
        <h4 className="text-xs font-semibold text-stone-700 mb-3">Extraction Health</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
          <MetricCard label="Total Profiles" value={data.lifeStage.totalProfiles} />
          <MetricCard label="Has Life Stage" value={data.lifeStage.hasLifeStage}
            sub={`${data.lifeStage.totalProfiles > 0 ? Math.round((data.lifeStage.hasLifeStage / data.lifeStage.totalProfiles) * 100) : 0}% coverage`} />
          <MetricCard label="Scoreable" value={data.lifeStage.scoreable}
            sub="confidence > 0.3" />
          <MetricCard label="Coverage"
            value={`${data.lifeStage.totalProfiles > 0 ? Math.round((data.lifeStage.scoreable / data.lifeStage.totalProfiles) * 100) : 0}%`}
            sub={data.lifeStage.totalProfiles > 0 && (data.lifeStage.scoreable / data.lifeStage.totalProfiles) < 0.3 ? "Below 30% threshold" : "OK"} />
        </div>

        {/* Chapter Distribution */}
        <h4 className="text-xs font-semibold text-stone-700 mb-3">Chapter Distribution</h4>
        <div className="space-y-2 mb-6">
          {Object.entries(data.lifeStage.chapters).map(([chapter, count]) => {
            const max = Math.max(...Object.values(data.lifeStage.chapters), 1);
            return (
              <div key={chapter} className="flex items-center gap-3">
                <span className="w-24 text-xs font-medium text-stone-500 text-right capitalize">{chapter}</span>
                <div className="flex-1 h-5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-600 rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
                </div>
                <span className="w-10 text-xs text-stone-500 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Funnel: Scored vs Skipped */}
        <h4 className="text-xs font-semibold text-stone-700 mb-3">Funnel: Life-Stage Scored vs Skipped</h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="py-2 text-left font-medium text-stone-500">Group</th>
                <th className="py-2 text-right font-medium text-stone-500">Intros</th>
                <th className="py-2 text-right font-medium text-stone-500">Like Rate</th>
                <th className="py-2 text-right font-medium text-stone-500">Mutual Matches</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Scored (both have life stage)", ...data.lifeStage.funnel.scored },
                { label: "Skipped (missing life stage)", ...data.lifeStage.funnel.skipped },
              ].map((row) => (
                <tr key={row.label} className="border-b border-stone-100">
                  <td className="py-2 font-medium text-stone-700">{row.label}</td>
                  <td className="py-2 text-right text-stone-600">{row.intros}</td>
                  <td className="py-2 text-right text-stone-600">{row.likeRate}%</td>
                  <td className="py-2 text-right text-stone-600">{row.mutualMatches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Decision Framework */}
        <h4 className="text-xs font-semibold text-stone-700 mb-3">Decision Framework</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="py-2 text-left font-medium text-stone-500">Signal</th>
                <th className="py-2 text-left font-medium text-stone-500">Action</th>
              </tr>
            </thead>
            <tbody className="text-stone-600">
              <tr className="border-b border-stone-100">
                <td className="py-2">Extraction &lt;30% coverage after 2 weeks</td>
                <td className="py-2">Add/modify onboarding questions to elicit life-stage talk</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2">&gt;20% age-chapter misclassification</td>
                <td className="py-2">Revise extraction prompt</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2">Chat engagement: A-high &gt; A-low by 15%+</td>
                <td className="py-2 text-green-700 font-medium">Strong signal — increase weight to 0.75</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2">No difference after 50+ matches per group</td>
                <td className="py-2 text-red-600 font-medium">Remove from scoring, keep for narrative use only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Test 2: Hook Type Performance */}
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Test 2: Hook Type A/B</h3>
            <p className="text-xs text-stone-500 mt-0.5">Started 2026-03-25 · quote / contradiction / scene</p>
          </div>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Active</span>
        </div>

        {!data.hookType.populated ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
            Hook types are not yet being recorded in daily_intros. Wire <code className="bg-amber-100 px-1 rounded">generateDailyThree()</code> into the delivery pipeline to start collecting data.
          </div>
        ) : (
          <>
            <h4 className="text-xs font-semibold text-stone-700 mb-3">Like Rate by Hook Type</h4>
            <div className="space-y-2 mb-6">
              {data.hookType.byType.map((ht) => (
                <div key={ht.hookType} className="flex items-center gap-3">
                  <span className="w-28 text-xs font-medium text-stone-500 text-right capitalize">{ht.hookType}</span>
                  <div className="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-700 rounded-full transition-all" style={{ width: `${ht.likeRate}%` }} />
                  </div>
                  <span className="w-24 text-xs text-stone-500">{ht.likeRate}% ({ht.liked}/{ht.total})</span>
                </div>
              ))}
            </div>

            <h4 className="text-xs font-semibold text-stone-700 mb-3">Breakdown</h4>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="py-2 text-left font-medium text-stone-500">Hook Type</th>
                    <th className="py-2 text-right font-medium text-stone-500">Total</th>
                    <th className="py-2 text-right font-medium text-stone-500">Liked</th>
                    <th className="py-2 text-right font-medium text-stone-500">Passed</th>
                    <th className="py-2 text-right font-medium text-stone-500">Expired</th>
                    <th className="py-2 text-right font-medium text-stone-500">Like Rate</th>
                    <th className="py-2 text-right font-medium text-stone-500">Pass Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.hookType.byType.map((ht) => (
                    <tr key={ht.hookType} className="border-b border-stone-100">
                      <td className="py-2 font-medium text-stone-700 capitalize">{ht.hookType}</td>
                      <td className="py-2 text-right text-stone-600">{ht.total}</td>
                      <td className="py-2 text-right text-stone-600">{ht.liked}</td>
                      <td className="py-2 text-right text-stone-600">{ht.passed}</td>
                      <td className="py-2 text-right text-stone-600">{ht.expired}</td>
                      <td className="py-2 text-right text-stone-600">{ht.likeRate}%</td>
                      <td className="py-2 text-right text-stone-600">{ht.passRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Decision Framework */}
        <h4 className="text-xs font-semibold text-stone-700 mb-3 mt-6">Decision Framework</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="py-2 text-left font-medium text-stone-500">Signal</th>
                <th className="py-2 text-left font-medium text-stone-500">Action</th>
              </tr>
            </thead>
            <tbody className="text-stone-600">
              <tr className="border-b border-stone-100">
                <td className="py-2">One type &lt;50% of best type&apos;s like rate at N=30</td>
                <td className="py-2 text-red-600 font-medium">Drop worst type</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2">Clear ranking at N=100</td>
                <td className="py-2">Weight generation toward top type</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2">Per-archetype signal at N=300</td>
                <td className="py-2 text-green-700 font-medium">Map archetype to preferred hook type</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-2">No difference at N=100</td>
                <td className="py-2">Merge types, test a new dimension</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Pool Health Tab ───

function PoolHealthTab({ data }: { data: PoolHealthData | null }) {
  if (!data) {
    return <p className="text-center text-stone-400 py-12">Loading pool health...</p>;
  }

  const emptyPct = data.totalUsers > 0
    ? ((data.totalEmptyPool / data.totalUsers) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Empty Pools"
          value={data.totalEmptyPool}
          sub={`${emptyPct}% of ${data.totalUsers} active users`}
        />
        <MetricCard label="Active Users" value={data.totalUsers} />
        <MetricCard label="Unresolved Alerts" value={data.emptyPoolAlerts} />
        <MetricCard
          label="Segments Affected"
          value={data.segments.filter(s => s.empty_pool > 0).length}
          sub={`of ${data.segments.length} total`}
        />
      </div>

      {/* Segment table */}
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-900">Segments by Empty Pool Count</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs font-medium text-stone-500">
                <th className="px-4 py-2">Segment</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Empty Pool</th>
                <th className="px-4 py-2 text-right">Paused</th>
                <th className="px-4 py-2 text-right">% Empty</th>
              </tr>
            </thead>
            <tbody>
              {data.segments
                .filter(s => s.empty_pool > 0 || s.paused > 0)
                .map((s) => {
                  const pctEmpty = s.total > 0 ? (s.empty_pool / s.total) * 100 : 0;
                  const isHigh = pctEmpty > 50;
                  return (
                    <tr
                      key={s.segment}
                      className={`border-b border-stone-100 ${isHigh ? "bg-red-50" : ""}`}
                    >
                      <td className="px-4 py-2 font-medium text-stone-700">{s.segment}</td>
                      <td className="px-4 py-2 text-right text-stone-600">{s.total}</td>
                      <td className={`px-4 py-2 text-right font-medium ${isHigh ? "text-red-600" : "text-stone-900"}`}>
                        {s.empty_pool}
                      </td>
                      <td className="px-4 py-2 text-right text-stone-500">{s.paused}</td>
                      <td className={`px-4 py-2 text-right font-medium ${isHigh ? "text-red-600" : "text-stone-600"}`}>
                        {pctEmpty.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-900">Recent Empty Pool Alerts (last 20)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs font-medium text-stone-500">
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.recentAlerts.map((alert, i) => (
                <tr key={i} className="border-b border-stone-100">
                  <td className="px-4 py-2 font-mono text-xs text-stone-600">
                    {alert.user_id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-2 text-stone-700">
                    {(alert.metadata as Record<string, unknown>)?.reason as string || "unknown"}
                  </td>
                  <td className="px-4 py-2 text-stone-500">
                    {new Date(alert.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {data.recentAlerts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-stone-400">
                    No unresolved empty pool alerts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
