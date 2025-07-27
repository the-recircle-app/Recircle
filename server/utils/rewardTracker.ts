/**
 * RewardTracker Module
 * 
 * Tracks awarded achievements to prevent double-rewarding users
 * for the same achievement (especially for auto-awarded ones)
 * 
 * IMPORTANT: This module now uses the database transaction history as the
 * source of truth to check if achievements have been awarded, rather than
 * in-memory tracking which would reset on server restart.
 */

import { storage } from "../storage";

// We still keep in-memory tracking for the current session
// This helps reduce database queries during the same server session
const awardedAchievements: Map<number, Set<string>> = new Map();

/**
 * Record that an achievement was awarded to a user
 * @param userId The user ID
 * @param achievementType The type of achievement
 * @param reward Optional reward amount for logging purposes
 */
export function trackAwardedAchievement(userId: number, achievementType: string, reward?: number): void {
  if (!awardedAchievements.has(userId)) {
    awardedAchievements.set(userId, new Set());
  }
  
  awardedAchievements.get(userId)?.add(achievementType);
  
  // Log the achievement if a reward amount was provided
  if (reward !== undefined) {
    console.log(`Achievement ${achievementType} tracked for user ${userId} with reward ${reward} B3TR`);
  }
}

/**
 * Check if an achievement was already awarded to a user
 * Uses both in-memory cache and database transaction history
 * 
 * UPDATED: Now supports test mode to force-enable achievements after user account resets
 * 
 * @param userId The user ID
 * @param achievementType The type of achievement
 * @param forceCheckDB Optional - if true, always check DB even if in-memory cache says it's awarded
 * @returns Promise<boolean> true if the achievement was already awarded
 */
export async function wasAchievementAwarded(
  userId: number, 
  achievementType: string, 
  forceCheckDB: boolean = false
): Promise<boolean> {
  // First check in-memory cache for quick response (skip if forceCheckDB is true)
  if (!forceCheckDB) {
    const userAchievements = awardedAchievements.get(userId);
    if (userAchievements && userAchievements.has(achievementType)) {
      console.log(`Found achievement ${achievementType} for user ${userId} in memory cache`);
      return true;
    }
  }
  
  // Check the database transaction history
  try {
    // Get user transactions from storage
    const transactions = await storage.getUserTransactions(userId);
    
    console.log(`Checking ${transactions.length} transactions for achievement ${achievementType}`);
    
    // Look for achievement transactions with this type
    const achievementTxs = transactions.filter(t => 
      t.type === 'achievement_reward' && 
      t.description?.includes(achievementType)
    );
    
    const hasAchievement = achievementTxs.length > 0;
    
    // Debug info
    if (hasAchievement) {
      console.log(`Found ${achievementTxs.length} existing achievement transactions for ${achievementType}`);
      console.log(`Most recent: ${JSON.stringify(achievementTxs[0])}`);
      // Add to in-memory cache for future queries
      trackAwardedAchievement(userId, achievementType);
    } else {
      console.log(`No existing achievement transactions found for ${achievementType}`);
    }
    
    return hasAchievement;
  } catch (error) {
    console.error(`Error checking achievement history for user ${userId}:`, error);
    // In case of error, default to false to avoid missing rewards
    return false;
  }
}