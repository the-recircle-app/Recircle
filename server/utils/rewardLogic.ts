/**
 * Reward Calculation Logic - Public Interface Demo
 * Demonstrates B3TR token reward calculations
 * Internal blockchain integration redacted for privacy – available in private repo
 */

export interface RewardCalculation {
  baseReward: number;
  streakMultiplier: number;
  finalReward: number;
  userPortion: number;
  creatorPortion: number;
  appPortion: number;
}

/**
 * Calculates B3TR token rewards based on purchase category and user streak
 * Production implementation includes VeBetterDAO 70/30 distribution model
 */
export function calculateReward(
  purchaseAmount: number,
  category: string,
  userStreak: number
): RewardCalculation {
  // Base reward rates by category (for demonstration)
  const baseRates: Record<string, number> = {
    transportation: 8.0,
    pre_owned: 8.0,
    ride_share: 5.0,
    electric_vehicle: 6.0,
    public_transit: 4.0
  };

  const baseReward = baseRates[category] || 3.0;
  const streakMultiplier = Math.min(1 + (userStreak * 0.1), 2.0); // Max 2x multiplier
  const finalReward = baseReward * streakMultiplier;

  // VeBetterDAO 70/30 distribution model
  const userPortion = finalReward * 0.7;
  // Legacy creator fund removed - now using 70/30 model
  const creatorPortion = 0;
  const appPortion = finalReward * 0.3;

  return {
    baseReward,
    streakMultiplier,
    finalReward,
    userPortion,
    creatorPortion,
    appPortion
  };
}

/**
 * Validates if a receipt qualifies for rewards
 * Internal validation logic redacted for privacy
 */
export function isEligibleForReward(
  confidence: number,
  isSustainableStore: boolean,
  category: string
): boolean {
  // Simplified eligibility check for demonstration
  return confidence >= 0.7 && isSustainableStore && category !== null;
}