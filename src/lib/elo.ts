// Elo Rating Engine for People Like You
// Standard Elo formula with K-factor adjustment for new users

export function calculateExpected(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Update Elo ratings after an interaction.
 * @param ratingA - Current rating of the evaluator
 * @param ratingB - Current rating of the person being evaluated
 * @param outcome - 1 if "yes" (would want to meet), 0 if "no"
 * @param interactionsA - Number of prior interactions for user A (determines K-factor)
 * @param kOverride - Optional K-factor override (e.g., K=8 for gentle feedback adjustments)
 * @returns { newRatingA, newRatingB } - Updated ratings for both parties
 */
export function updateRatings(
  ratingA: number,
  ratingB: number,
  outcome: 0 | 1,
  interactionsA: number = 0,
  kOverride?: number
): { newRatingA: number; newRatingB: number } {
  const kA = kOverride ?? (interactionsA < 20 ? 32 : 16);
  const kB = kOverride ?? 16; // Seed/opponent always uses standard K

  const expectedA = calculateExpected(ratingA, ratingB);
  const expectedB = 1 - expectedA;

  const actualA = outcome; // 1 = yes, 0 = no
  const actualB = 1 - outcome;

  const newRatingA = Math.round(ratingA + kA * (actualA - expectedA));
  const newRatingB = Math.round(ratingB + kB * (actualB - expectedB));

  return { newRatingA, newRatingB };
}
