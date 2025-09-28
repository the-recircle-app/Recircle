/**
 * Token Reward Utilities
 * 
 * This module provides functions for calculating token rewards based on
 * various user activities such as receipt verification, store additions,
 * achievements, and streaks.
 * 
 * Additionally, this module includes logic for ecosystem sustainability rewards
 * which help fund ecological initiatives and platform development.
 */

import { Receipt, Store, Transaction } from '@shared/schema';
import { isVeChainVisaCard } from './receiptUtils';

/**
 * Ecosystem multipliers - used internally to calculate sustainability rewards
 * These values are not displayed directly to users
 * 
 * These multipliers are applied to:
 * 1. Base receipt rewards
 * 2. Streak-multiplied receipt rewards
 * 3. Achievement bonus rewards
 * 4. Store addition rewards
 * 
 * NEW DISTRIBUTION MODEL (September 2025):
 * The user receives 66.67% of the total minted tokens (2:1 ratio), while 33.33% goes to 
 * the app fund for operational expenses, growth, and team compensation.
 * This matches VeBetterDAO treasury's enforced 2:1 distribution and eliminates decimal issues.
 */
export const ECOSYSTEM_MULTIPLIERS = {
  // User gets 66.67% of total rewards (2:1 ratio matching VeBetterDAO)
  USER_MULTIPLIER: 2/3,
  
  // App fund gets 33.33% of total rewards (2:1 ratio matching VeBetterDAO)
  APP_MULTIPLIER: 1/3,
  
  // Legacy creator fund removed in 2:1 model
  CREATOR_MULTIPLIER: 0.0,
  
  // Internal reference: combined multiplier is 100% (USER + APP = 1.0)
};

/**
 * Payment method bonus constants
 */
export const PAYMENT_BONUSES = {
  // Base bonus for any digital payment (non-cash)
  DIGITAL_PAYMENT_BONUS: 0.3,
  
  // Additional bonus for using VeChain Visa specifically
  VECHAIN_VISA_BONUS: 1.0
};

type StreakInfo = {
  weeklyStreak: number;  // Number of consecutive weeks with activity
  monthlyStreak: boolean; // Whether the user has a full month streak
};

/**
 * Calculate the base token reward for a receipt verification
 * Fixed base reward of 8 B3TR plus bonuses based on receipt amount
 */
export function calculateReceiptReward(receipt: Partial<Receipt>): number {
  // Fixed base reward of 8 B3TR
  const baseReward = 8;
  
  // Bonus based on purchase amount (0.1 token per $10 spent)
  let amountBonus = 0;
  if (receipt.amount) {
    // Calculate the exact bonus (0.1 per $10)
    amountBonus = (receipt.amount / 10) * 0.1;
  }
  
  // Total reward with cap at 15 tokens as per requirements
  const totalReward = Math.min(15, baseReward + amountBonus);
  
  // Log the reward calculation for debugging
  console.log(`Token reward breakdown:
    - Receipt amount: $${receipt.amount?.toFixed(2) || 0}
    - Base reward: ${baseReward} B3TR
    - Amount bonus: ${amountBonus.toFixed(2)} B3TR (${receipt.amount ? (receipt.amount / 10).toFixed(1) : 0} x 0.1)
    - Total before cap: ${(baseReward + amountBonus).toFixed(2)} B3TR
    - Final reward after cap: ${Math.min(15, baseReward + amountBonus).toFixed(1)} B3TR`);
  
  return Math.round(totalReward * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate the distribution of rewards between user, creator fund and app
 * based on a total reward amount. This function applies to ALL token rewards:
 * - Receipt verification rewards (including streak multipliers)
 * - Achievement bonus rewards
 * - Store addition rewards
 * 
 * UPDATED (May 2025): New 70/30 distribution model.
 * Instead of minting additional tokens for sustainability (old model),
 * we now divide the total reward with 70% going to the user and 30% to sustainability
 * (split evenly between creator and app funds).
 * 
 * @param totalRewardAmount The total amount of tokens to be distributed
 * @returns Object containing user, creator and app reward amounts
 */
export function calculateSustainabilityRewards(totalRewardAmount: number): {
  userReward: number;
  appReward: number;
  totalSustainabilityReward: number;
} {
  // Calculate user's 66.67% share of total reward (2:1 ratio)
  const userReward = Math.round(totalRewardAmount * ECOSYSTEM_MULTIPLIERS.USER_MULTIPLIER * 10) / 10;
  
  // Calculate app reward (33.33% of total reward - combined operational fund)
  const appReward = Math.round(totalRewardAmount * ECOSYSTEM_MULTIPLIERS.APP_MULTIPLIER * 10) / 10;
  
  // Total sustainability reward (33.33% of total goes to app fund)
  const totalSustainabilityReward = appReward;
  
  console.log(`Reward distribution (2:1 split):
    - Total reward: ${totalRewardAmount} B3TR
    - User portion: ${userReward} B3TR (66.67% of total)
    - App fund: ${appReward} B3TR (33.33% of total)
    - Total operational: ${totalSustainabilityReward} B3TR (${Math.round(ECOSYSTEM_MULTIPLIERS.APP_MULTIPLIER * 100 * 100) / 100}% of total)`);
  
  return {
    userReward,
    appReward,
    totalSustainabilityReward
  };
}

/**
 * Calculate token reward for adding a new thrift store
 */
export function calculateStoreAdditionReward(): number {
  return 10; // Fixed 10 tokens for adding a verified store
}

/**
 * Calculate token reward for updating store information
 */
export function calculateStoreUpdateReward(): number {
  return 1; // Fixed 1 token for updating store information
}

/**
 * Apply streak multiplier to a base token amount
 * 
 * The streak multiplier applies to the raw reward amount before the 70/30 distribution.
 * 
 * UPDATED (May 2025): New 70/30 distribution model.
 * Example: User earns 10 tokens with a 1.2x streak multiplier = 12 tokens raw reward
 * - User portion: 12 x 0.7 = 8.4 tokens (70% of total)
 * - App wallet: 12 x 0.30 = 3.6 tokens (30% of total)
 * - Total: 12 tokens (8.4 + 3.6)
 */
export function applyStreakMultiplier(baseAmount: number, streakInfo: StreakInfo): number {
  const isTestMode = process.env.NODE_ENV === 'development';
  
  if (isTestMode) {
    // In test mode, don't apply a streak multiplier for the first receipt
    // This resolves the issue of first receipt rewards being too high
    if (streakInfo.weeklyStreak === 0) {
      console.log(`Test mode - first receipt, not applying streak multiplier to ${baseAmount} tokens`);
      return Math.round(baseAmount * 10) / 10; // Just return the base amount rounded to 1 decimal
    } else {
      // For subsequent receipts in test mode, apply a minimal streak multiplier
      const testMultiplier = 1.1; // Low test multiplier
      console.log(`Test mode - applied streak multiplier: ${testMultiplier}x to ${baseAmount} tokens = ${baseAmount * testMultiplier} tokens`);
      return Math.round(baseAmount * testMultiplier * 10) / 10;
    }
  }
  
  // Production mode: Weekly streak multiplier (capped at 1.5x)
  // 1 week = 1.1x, 2 weeks = 1.2x, etc., up to 1.5x max
  const weeklyMultiplier = Math.min(1.5, 1 + (streakInfo.weeklyStreak * 0.1));
  
  // Apply multiplier
  let amount = baseAmount * weeklyMultiplier;
  
  // Add monthly streak bonus if applicable (full month of activity)
  if (streakInfo.monthlyStreak) {
    amount += 10; // 10 bonus tokens for monthly streak
  }
  
  console.log(`Applied streak multiplier: ${weeklyMultiplier}x to ${baseAmount} tokens = ${amount} tokens`);
  console.log(`Note: This raw amount will be distributed according to the 2:1 model (user: ${amount * ECOSYSTEM_MULTIPLIERS.USER_MULTIPLIER}, app fund: ${amount * ECOSYSTEM_MULTIPLIERS.APP_MULTIPLIER})`);
  
  return Math.round(amount * 10) / 10; // Round to 1 decimal place
}

/**
 * Apply payment method bonuses to reward amount
 * @param baseAmount Base token reward amount
 * @param paymentMethod Payment method (CASH, VISA, etc.)
 * @param cardLastFour Last 4 digits of card if available
 * @returns Enhanced reward amount with payment bonuses
 */
export function applyPaymentMethodBonuses(
  baseAmount: number,
  paymentMethod: string | undefined,
  cardLastFour?: string
): { 
  amount: number; 
  digitalBonus: number;
  veChainBonus: number;
  totalBonus: number;
} {
  let amount = baseAmount;
  let digitalBonus = 0;
  let veChainBonus = 0;
  
  // Add digital payment bonus (any non-cash payment)
  if (paymentMethod && paymentMethod !== 'CASH' && paymentMethod !== 'UNKNOWN') {
    digitalBonus = PAYMENT_BONUSES.DIGITAL_PAYMENT_BONUS;
    amount += digitalBonus;
    console.log(`Applied digital payment bonus: +${digitalBonus} B3TR for using ${paymentMethod}`);
  }
  
  // Add VeChain Visa bonus if detected
  if ((paymentMethod === 'VISA' || paymentMethod === 'VECHAIN VISA') && 
      cardLastFour && 
      isVeChainVisaCard(cardLastFour)) {
    veChainBonus = PAYMENT_BONUSES.VECHAIN_VISA_BONUS;
    amount += veChainBonus;
    console.log(`Applied VeChain Visa bonus: +${veChainBonus} B3TR for using VeChain Visa card`);
  }
  
  const totalBonus = digitalBonus + veChainBonus;
  
  return {
    amount: Math.round(amount * 10) / 10, // Round to 1 decimal place
    digitalBonus,
    veChainBonus,
    totalBonus
  };
}

/**
 * Calculate achievement bonus tokens
 * 
 * UPDATED (May 2025): Achievement rewards also use the new 70/30 distribution model.
 * The returned base value will be distributed according to the 70/30 split.
 * 
 * Example: User earns base 10 tokens for a first_receipt achievement:
 * - User portion: 10 x 0.7 = 7 tokens (70% of total)
 * - App wallet: 10 x 0.30 = 3.0 tokens (30% of total)
 * - Total: 10 tokens (7 + 3.0)
 */
export function calculateAchievementReward(achievementType: string): number {
  switch (achievementType) {
    case 'first_receipt':
      return 10; // Award 10 tokens for the first receipt achievement
    case 'five_receipts':
      return 10; 
    case 'ten_receipts':
      return 15; 
    case 'monthly_record':
      return 10; 
    case 'first_store':
      return 8;  // Updated to 8 tokens for first store achievement
    case 'community_mapper':
      return 15; // Award 15 tokens for submitting 3+ stores
    case 'token_milestone':
      return 10; 
    default:
      return 0;
  }
}

/**
 * Calculate a user's streak information based on transaction history
 */
export function calculateUserStreakInfo(transactions: Transaction[]): StreakInfo {
  // Sort transactions by date, newest first
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
    return dateB.getTime() - dateA.getTime();
  });
  
  // Default values
  const streakInfo: StreakInfo = {
    weeklyStreak: 0,
    monthlyStreak: false
  };
  
  if (sortedTransactions.length === 0) {
    return streakInfo;
  }
  
  // Calculate weekly streak
  const now = new Date();
  let weeklyStreak = 0;
  
  // Track weeks with activity
  const weeksWithActivity = new Set<string>();
  
  // Check for activity in recent weeks
  sortedTransactions.forEach(tx => {
    if (tx.createdAt) {
      const txDate = new Date(tx.createdAt);
      const weekKey = `${txDate.getFullYear()}-${Math.floor(txDate.getDate() / 7)}`;
      weeksWithActivity.add(weekKey);
    }
  });
  
  // Check consecutive weeks backward from current week
  const currentWeekKey = `${now.getFullYear()}-${Math.floor(now.getDate() / 7)}`;
  let weekToCheck = currentWeekKey;
  let checkDate = new Date(now);
  
  while (weeksWithActivity.has(weekToCheck)) {
    weeklyStreak++;
    
    // Move back one week
    checkDate.setDate(checkDate.getDate() - 7);
    weekToCheck = `${checkDate.getFullYear()}-${Math.floor(checkDate.getDate() / 7)}`;
    
    // Limit to reasonable streak length
    if (weeklyStreak >= 4) break;
  }
  
  // Calculate monthly streak (activity every week in a month)
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  let hasActivityAllWeeks = true;
  
  // Check each week of the current month
  for (let week = 0; week < 4; week++) {
    const weekInMonthKey = `${currentYear}-${currentMonth}-${week}`;
    if (!weeksWithActivity.has(weekInMonthKey)) {
      hasActivityAllWeeks = false;
      break;
    }
  }
  
  streakInfo.weeklyStreak = weeklyStreak;
  streakInfo.monthlyStreak = hasActivityAllWeeks;
  
  return streakInfo;
}