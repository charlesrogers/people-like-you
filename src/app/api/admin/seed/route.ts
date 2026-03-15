import { NextResponse } from "next/server";
import { seedDatabase, ensureSeeded } from "@/lib/seed-profiles";
import { getAllProfiles } from "@/lib/profiles";

export async function POST() {
  const result = seedDatabase();
  return NextResponse.json({
    ok: true,
    seeded: result,
  });
}

export async function GET() {
  ensureSeeded();
  const profiles = getAllProfiles();
  const men = profiles.filter((p) => p.gender === "Man");
  const women = profiles.filter((p) => p.gender === "Woman");

  const eloValues = profiles.map((p) => p.eloScore).sort((a, b) => a - b);
  const eloMin = eloValues[0] ?? 0;
  const eloMax = eloValues[eloValues.length - 1] ?? 0;
  const eloAvg = eloValues.length
    ? Math.round(eloValues.reduce((a, b) => a + b, 0) / eloValues.length)
    : 0;

  return NextResponse.json({
    total: profiles.length,
    men: men.length,
    women: women.length,
    elo: { min: eloMin, max: eloMax, avg: eloAvg },
  });
}
