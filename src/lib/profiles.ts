// In-memory store for MVP. Replace with PostgreSQL later.
export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  seeking: string;
  birthYear: string;
  state: string;
  height: string;
  education: string;
  exercise: string;
  interests: string[];
  topCharacteristics: string[];
  socialLink: string;
  answers: Record<string, string | string[]>;
  vectors: {
    selfExpansion: string[];
    admirationSignals: string[];
    humorSignature: string;
    growthTrajectory: string;
    iSharingMarkers: string[];
  };
  eloScore: number;
  eloInteractions: number;
  createdAt: string;
}

// Simple in-memory store (resets on redeploy — fine for MVP)
const profiles = new Map<string, Profile>();

export function saveProfile(profile: Profile) {
  profiles.set(profile.id, profile);
}

export function getProfile(id: string): Profile | undefined {
  return profiles.get(id);
}

export function getAllProfiles(): Profile[] {
  return Array.from(profiles.values());
}

export function getCompatibleProfiles(profile: Profile): Profile[] {
  const genderMatch = getAllProfiles().filter((p) => {
    if (p.id === profile.id) return false;
    return (
      (profile.gender === "Man" && p.gender === "Woman") ||
      (profile.gender === "Woman" && p.gender === "Man")
    );
  });

  // Filter by Elo proximity: within 150 points first, widen to 300 if needed
  const narrow = genderMatch.filter(
    (p) => Math.abs(p.eloScore - profile.eloScore) <= 150
  );
  if (narrow.length >= 3) return narrow;

  const wide = genderMatch.filter(
    (p) => Math.abs(p.eloScore - profile.eloScore) <= 300
  );
  if (wide.length >= 1) return wide;

  // Fallback: return all gender-compatible matches
  return genderMatch;
}

export function updateProfileElo(
  id: string,
  newElo: number,
  incrementInteractions: boolean = true
) {
  const profile = profiles.get(id);
  if (profile) {
    profile.eloScore = newElo;
    if (incrementInteractions) {
      profile.eloInteractions += 1;
    }
    profiles.set(id, profile);
  }
}
