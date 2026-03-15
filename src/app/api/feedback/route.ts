import { NextRequest, NextResponse } from "next/server";
import { getProfile, updateProfileElo } from "@/lib/profiles";
import { updateRatings } from "@/lib/elo";
import { ensureSeeded } from "@/lib/seed-profiles";

// In-memory feedback store for MVP
const feedbackStore: Array<{
  matchId: string;
  profileId: string;
  reason: string;
  details: string;
  timestamp: string;
}> = [];

export async function POST(req: NextRequest) {
  const { matchId, profileId, reason, details, timestamp } = await req.json();

  ensureSeeded();

  if (!matchId || !profileId || !reason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  feedbackStore.push({
    matchId,
    profileId,
    reason,
    details: details || "",
    timestamp: timestamp || new Date().toISOString(),
  });

  // If "Not physically attracted", adjust the rejected person's Elo down gently
  if (reason === "not_attracted") {
    const rejector = getProfile(profileId);
    const rejected = getProfile(matchId);

    if (rejector && rejected) {
      const { newRatingB } = updateRatings(
        rejector.eloScore,
        rejected.eloScore,
        0, // outcome = no
        rejector.eloInteractions,
        8 // gentle K-factor
      );
      updateProfileElo(matchId, newRatingB, false);
    }
  }

  return NextResponse.json({ ok: true });
}
