"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

interface SeedProfile {
  name: string;
  age: number;
  pitch: string;
  photoUrl: string;
  eloScore: number;
  gender: string;
}

const SEED_WOMEN: SeedProfile[] = [
  { name: "Maya", age: 27, pitch: "Architect who builds treehouses on weekends and debates philosophy over campfires.", photoUrl: "https://i.pravatar.cc/400?img=5", eloScore: 900, gender: "Woman" },
  { name: "Priya", age: 29, pitch: "ER doctor who writes poetry between shifts and can't resist a good farmers market.", photoUrl: "https://i.pravatar.cc/400?img=9", eloScore: 950, gender: "Woman" },
  { name: "Sophie", age: 25, pitch: "Wildlife photographer who once followed wolves across Yellowstone for three weeks.", photoUrl: "https://i.pravatar.cc/400?img=10", eloScore: 1000, gender: "Woman" },
  { name: "Elena", age: 31, pitch: "Runs a ceramics studio, makes a killer risotto, and always has a book recommendation.", photoUrl: "https://i.pravatar.cc/400?img=16", eloScore: 1050, gender: "Woman" },
  { name: "Jordan", age: 26, pitch: "Startup founder by day, standup comedy open mic-er by night.", photoUrl: "https://i.pravatar.cc/400?img=20", eloScore: 1100, gender: "Woman" },
  { name: "Ava", age: 28, pitch: "Marine biologist who surfs before dawn and cooks Thai food from scratch.", photoUrl: "https://i.pravatar.cc/400?img=23", eloScore: 1150, gender: "Woman" },
  { name: "Lily", age: 30, pitch: "Music teacher who plays in a jazz trio and hosts legendary dinner parties.", photoUrl: "https://i.pravatar.cc/400?img=25", eloScore: 1200, gender: "Woman" },
  { name: "Nina", age: 27, pitch: "Data scientist with a vinyl collection and a passion for teaching kids to code.", photoUrl: "https://i.pravatar.cc/400?img=26", eloScore: 1250, gender: "Woman" },
  { name: "Carmen", age: 32, pitch: "Immigration lawyer who salsa dances and volunteers at the animal shelter every Saturday.", photoUrl: "https://i.pravatar.cc/400?img=29", eloScore: 1300, gender: "Woman" },
  { name: "Zara", age: 24, pitch: "Fashion designer who thrifts everything and just got back from a solo trip to Japan.", photoUrl: "https://i.pravatar.cc/400?img=32", eloScore: 1300, gender: "Woman" },
  { name: "Iris", age: 29, pitch: "Neuroscience PhD candidate who rock climbs and makes her own hot sauce.", photoUrl: "https://i.pravatar.cc/400?img=34", eloScore: 1350, gender: "Woman" },
  { name: "Hana", age: 26, pitch: "Pastry chef who runs ultramarathons and has strong opinions about coffee.", photoUrl: "https://i.pravatar.cc/400?img=38", eloScore: 1350, gender: "Woman" },
  { name: "Olivia", age: 33, pitch: "Venture capitalist who mentors first-gen college students and collects rare teas.", photoUrl: "https://i.pravatar.cc/400?img=44", eloScore: 1400, gender: "Woman" },
  { name: "Stella", age: 28, pitch: "Theater director who backpacked through South America and speaks four languages.", photoUrl: "https://i.pravatar.cc/400?img=47", eloScore: 1450, gender: "Woman" },
  { name: "Vivian", age: 30, pitch: "Olympic-track fencer turned tech exec who still paints watercolors every Sunday.", photoUrl: "https://i.pravatar.cc/400?img=49", eloScore: 1500, gender: "Woman" },
];

const SEED_MEN: SeedProfile[] = [
  { name: "Marcus", age: 28, pitch: "High school teacher who restores vintage motorcycles and coaches debate team.", photoUrl: "https://i.pravatar.cc/400?img=3", eloScore: 900, gender: "Man" },
  { name: "Raj", age: 30, pitch: "Cardiologist who plays classical guitar and makes the best biryani you'll ever taste.", photoUrl: "https://i.pravatar.cc/400?img=7", eloScore: 950, gender: "Man" },
  { name: "Leo", age: 26, pitch: "Documentary filmmaker who hitchhiked across Europe and volunteers at a literacy nonprofit.", photoUrl: "https://i.pravatar.cc/400?img=8", eloScore: 1000, gender: "Man" },
  { name: "Daniel", age: 32, pitch: "Architect who designs tiny homes and spends every free weekend hiking with his dog.", photoUrl: "https://i.pravatar.cc/400?img=11", eloScore: 1050, gender: "Man" },
  { name: "Kai", age: 27, pitch: "Marine engineer who surfs competitively and is writing his first novel.", photoUrl: "https://i.pravatar.cc/400?img=12", eloScore: 1100, gender: "Man" },
  { name: "Oliver", age: 29, pitch: "Sommelier turned winery owner who runs a book club out of his tasting room.", photoUrl: "https://i.pravatar.cc/400?img=13", eloScore: 1150, gender: "Man" },
  { name: "Ethan", age: 31, pitch: "Civil rights attorney who plays pickup basketball and cooks Sunday dinners for friends.", photoUrl: "https://i.pravatar.cc/400?img=14", eloScore: 1200, gender: "Man" },
  { name: "Sam", age: 25, pitch: "Software engineer who builds open-source tools and hosts board game nights.", photoUrl: "https://i.pravatar.cc/400?img=15", eloScore: 1250, gender: "Man" },
  { name: "Diego", age: 33, pitch: "Chef who forages his own ingredients and teaches kids cooking classes on Saturdays.", photoUrl: "https://i.pravatar.cc/400?img=52", eloScore: 1300, gender: "Man" },
  { name: "Nate", age: 28, pitch: "Firefighter paramedic who plays piano and is training for an Ironman.", photoUrl: "https://i.pravatar.cc/400?img=53", eloScore: 1300, gender: "Man" },
  { name: "Theo", age: 30, pitch: "Astrophysicist who brews his own beer and tells the worst puns with the best delivery.", photoUrl: "https://i.pravatar.cc/400?img=55", eloScore: 1350, gender: "Man" },
  { name: "Liam", age: 27, pitch: "Wilderness guide who photographs the northern lights and builds furniture by hand.", photoUrl: "https://i.pravatar.cc/400?img=57", eloScore: 1350, gender: "Man" },
  { name: "Adrian", age: 34, pitch: "Neurosurgeon who plays in a blues band and mentors underserved med students.", photoUrl: "https://i.pravatar.cc/400?img=59", eloScore: 1400, gender: "Man" },
  { name: "Felix", age: 29, pitch: "Startup founder who sold his first company at 25 and now angel invests in social enterprises.", photoUrl: "https://i.pravatar.cc/400?img=60", eloScore: 1450, gender: "Man" },
  { name: "Alex", age: 31, pitch: "Olympic rower turned venture partner who still wakes at 4am and reads philosophy before dawn.", photoUrl: "https://i.pravatar.cc/400?img=61", eloScore: 1500, gender: "Man" },
];

export default function Calibrate() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userElo, setUserElo] = useState(1200);
  const [interactions, setInteractions] = useState(0);
  const [seeds, setSeeds] = useState<SeedProfile[]>([]);
  const [seedElos, setSeedElos] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);
  const [gender, setGender] = useState<string | null>(null);

  useEffect(() => {
    const profileId = localStorage.getItem("ply_profile_id");
    if (!profileId) {
      router.push("/onboarding");
      return;
    }

    // Fetch gender to show appropriate seed profiles
    async function loadProfile() {
      try {
        const res = await fetch(`/api/profile?id=${profileId}`);
        const data = await res.json();
        if (data.profile) {
          setGender(data.profile.gender);
          const seedList =
            data.profile.gender === "Man" ? SEED_WOMEN : SEED_MEN;
          setSeeds(seedList);
          setSeedElos(seedList.map((s) => s.eloScore));
        }
      } catch {
        router.push("/onboarding");
      }
    }

    loadProfile();
    posthog.capture('calibration_started')
  }, [router]);

  async function handleVote(outcome: 0 | 1) {
    if (animating || seeds.length === 0) return;
    posthog.capture('calibration_vote')
    setAnimating(true);

    const seedElo = seedElos[currentIndex];
    const k = interactions < 20 ? 32 : 16;

    // Calculate expected scores
    const expectedUser = 1 / (1 + Math.pow(10, (seedElo - userElo) / 400));

    // Update user Elo
    const newUserElo = Math.round(userElo + k * (outcome - expectedUser));
    const newSeedElo = Math.round(
      seedElo + 16 * ((1 - outcome) - (1 - expectedUser))
    );

    setUserElo(newUserElo);
    setInteractions(interactions + 1);

    // Update seed Elo in local state (ephemeral)
    const newSeedElos = [...seedElos];
    newSeedElos[currentIndex] = newSeedElo;
    setSeedElos(newSeedElos);

    // Persist Elo to server
    const profileId = localStorage.getItem("ply_profile_id");
    try {
      await fetch("/api/calibrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          newElo: newUserElo,
          interactions: interactions + 1,
        }),
      });
    } catch {
      // Non-critical — local state is sufficient for MVP
    }

    setTimeout(() => {
      if (currentIndex + 1 >= seeds.length) {
        posthog.capture('calibration_completed')
        router.push("/dashboard");
      } else {
        setCurrentIndex(currentIndex + 1);
        setAnimating(false);
      }
    }, 300);
  }

  if (!gender || seeds.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="text-stone-400">Loading calibration...</p>
      </div>
    );
  }

  const seed = seeds[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-100">
        <div
          className="h-full bg-stone-900 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / seeds.length) * 100}%` }}
        />
      </div>

      <div className="mx-auto max-w-md px-6 pb-24 pt-16">
        <div className="text-center">
          <p className="text-sm font-medium text-stone-400">
            {currentIndex + 1} of {seeds.length}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            Calibrate your taste
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Would you want to meet this person?
          </p>
        </div>

        <div
          className={`mt-8 overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 ${
            animating ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={seed.photoUrl}
            alt={seed.name}
            className="h-80 w-full object-cover"
          />
          <div className="p-6">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-semibold text-stone-900">
                {seed.name}
              </h2>
              <span className="text-sm text-stone-400">{seed.age}</span>
            </div>
            <p className="mt-2 leading-relaxed text-stone-600">{seed.pitch}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => handleVote(0)}
            disabled={animating}
            className="flex-1 rounded-xl border border-stone-200 py-3.5 text-lg font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-30"
          >
            Not for me
          </button>
          <button
            onClick={() => handleVote(1)}
            disabled={animating}
            className="flex-1 rounded-xl bg-stone-900 py-3.5 text-lg font-medium text-white transition hover:bg-stone-800 disabled:opacity-30"
          >
            Yes, I'd meet them
          </button>
        </div>
      </div>
    </div>
  );
}
