/**
 * Variable reward schedule for voice-to-unlock intro loop.
 *
 * Each cycle costs between 1 and 7 prompts to unlock the next intro.
 * Uses deterministic seeded randomness so the same user gets a consistent
 * but unpredictable pattern within a session.
 *
 * Psychology: intermittent reinforcement is the most powerful reward
 * schedule — uncertainty about when the next reward arrives drives
 * sustained engagement. Each recording genuinely improves the profile
 * (real value, not just gamification).
 */

const MAX_PROMPTS_PER_DAY = 20

/**
 * Simple deterministic hash for seeding.
 */
function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/**
 * Seeded pseudo-random number generator (mulberry32).
 */
function seededRandom(seed: number): () => number {
  let t = seed + 0x6D2B79F5
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Get the number of prompts needed to unlock the next intro.
 * Returns 1-7 based on user + current cycle number.
 */
export function getNextUnlockThreshold(userId: string, cycleNumber: number): number {
  const seed = hashString(userId + ':cycle:' + cycleNumber)
  const rng = seededRandom(seed)
  return 1 + Math.floor(rng() * 7) // 1-7
}

/**
 * Generate the full unlock schedule for a user's session.
 * Returns an array of cumulative prompt counts where intros unlock.
 *
 * Example: [3, 8, 11, 17] means intros unlock after prompts 3, 8, 11, 17
 */
export function generateSessionSchedule(userId: string, dateStr: string): number[] {
  const baseSeed = hashString(userId + ':' + dateStr)
  const rng = seededRandom(baseSeed)

  const thresholds: number[] = []
  let total = 0
  let cycle = 0

  while (total < MAX_PROMPTS_PER_DAY) {
    const increment = 1 + Math.floor(rng() * 7) // 1-7 prompts per cycle
    total += increment
    if (total <= MAX_PROMPTS_PER_DAY) {
      thresholds.push(total)
    }
    cycle++
    if (cycle > 20) break // safety
  }

  return thresholds
}

/**
 * Check if the user has earned an intro at this prompt count.
 */
export function shouldUnlockIntro(
  userId: string,
  dateStr: string,
  promptsAnsweredToday: number
): boolean {
  const schedule = generateSessionSchedule(userId, dateStr)
  return schedule.includes(promptsAnsweredToday)
}

/**
 * Get progress info for the UI — how many more prompts until next unlock.
 */
export function getProgressInfo(
  userId: string,
  dateStr: string,
  promptsAnsweredToday: number
): {
  promptsUntilNext: number
  nextUnlockAt: number
  totalUnlocksEarned: number
  maxPrompts: number
  isMaxed: boolean
} {
  const schedule = generateSessionSchedule(userId, dateStr)
  const unlocksEarned = schedule.filter(t => t <= promptsAnsweredToday).length
  const nextThreshold = schedule.find(t => t > promptsAnsweredToday)

  return {
    promptsUntilNext: nextThreshold ? nextThreshold - promptsAnsweredToday : 0,
    nextUnlockAt: nextThreshold ?? MAX_PROMPTS_PER_DAY + 1,
    totalUnlocksEarned: unlocksEarned,
    maxPrompts: MAX_PROMPTS_PER_DAY,
    isMaxed: promptsAnsweredToday >= MAX_PROMPTS_PER_DAY || !nextThreshold,
  }
}
