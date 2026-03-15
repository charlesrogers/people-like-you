import { NextRequest, NextResponse } from "next/server";
import { getProfile, getCompatibleProfiles } from "@/lib/profiles";
import { generateMatchNarrative } from "@/lib/matchmaker";
import { ensureSeeded } from "@/lib/seed-profiles";

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profileId");
  if (!profileId) {
    return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
  }

  ensureSeeded();

  const profile = getProfile(profileId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const candidates = getCompatibleProfiles(profile);

  // Generate LLM-powered match narratives for each candidate
  const matches = await Promise.all(
    candidates.slice(0, 5).map(async (candidate) => {
      let narrative: string;
      try {
        narrative = await generateMatchNarrative(profile, candidate);
      } catch {
        narrative =
          "We think there's something interesting here. Want to find out?";
      }

      // Identify expansion points — where their worlds diverge interestingly
      const expansionPoints = candidate.vectors.selfExpansion.filter(
        (world) =>
          !profile.vectors.selfExpansion.some(
            (pw) => pw.toLowerCase() === world.toLowerCase()
          )
      );

      return {
        id: candidate.id,
        name: candidate.firstName,
        narrative,
        expansionPoints,
        socialLink: candidate.socialLink,
      };
    })
  );

  return NextResponse.json({ matches });
}
