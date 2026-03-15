import { NextRequest, NextResponse } from "next/server";
import { updateProfileElo } from "@/lib/profiles";
import { ensureSeeded } from "@/lib/seed-profiles";

export async function POST(req: NextRequest) {
  ensureSeeded();
  const { profileId, newElo, interactions } = await req.json();

  if (!profileId || newElo === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  updateProfileElo(profileId, newElo, false);

  // Also update interactions count directly
  const { getProfile } = await import("@/lib/profiles");
  const profile = getProfile(profileId);
  if (profile) {
    profile.eloInteractions = interactions;
  }

  return NextResponse.json({ ok: true, newElo });
}
