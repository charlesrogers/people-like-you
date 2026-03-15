import { NextResponse } from "next/server";
import { getAllProfiles } from "@/lib/profiles";
import { ensureSeeded } from "@/lib/seed-profiles";

export async function GET() {
  ensureSeeded();
  const profiles = getAllProfiles();
  return NextResponse.json({ profiles });
}
