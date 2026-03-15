import { NextRequest, NextResponse } from "next/server";
import { saveProfile, getProfile, type Profile } from "@/lib/profiles";
import { analyzeProfile } from "@/lib/matchmaker";
import { ensureSeeded } from "@/lib/seed-profiles";

export async function POST(req: NextRequest) {
  const answers = await req.json();

  const id = `ply_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Analyze profile with LLM to extract matching vectors
  let vectors: Profile["vectors"];
  try {
    vectors = await analyzeProfile(answers);
  } catch {
    vectors = {
      selfExpansion: [],
      admirationSignals: [],
      humorSignature: "",
      growthTrajectory: String(answers.growth_edge || ""),
      iSharingMarkers: [],
    };
  }

  const profile: Profile = {
    id,
    firstName: String(answers.first_name || ""),
    lastName: String(answers.last_name || ""),
    email: String(answers.email || ""),
    gender: String(answers.gender || ""),
    seeking: String(answers.seeking || ""),
    birthYear: String(answers.birth_year || ""),
    state: String(answers.state || ""),
    height: String(answers.height || ""),
    education: String(answers.education || ""),
    exercise: String(answers.exercise || ""),
    interests: Array.isArray(answers.interests) ? answers.interests : [],
    topCharacteristics: Array.isArray(answers.top_characteristics) ? answers.top_characteristics : [],
    socialLink: String(answers.social_link || ""),
    answers,
    vectors,
    eloScore: 1200,
    eloInteractions: 0,
    createdAt: new Date().toISOString(),
  };

  saveProfile(profile);

  return NextResponse.json({ id: profile.id });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  ensureSeeded();

  const profile = getProfile(id);
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
