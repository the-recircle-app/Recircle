/**
 * Daily Action Limit Utilities
 * 
 * This module provides functions for tracking and limiting the number of
 * rewarded actions a user can perform per day.
 */

import { Transaction } from '@shared/schema';

// Maximum number of rewarded actions per day (consistent across the app)
export const MAX_DAILY_ACTIONS = 3;

// Types of transactions that count against daily limit
const DAILY_LIMITED_ACTIONS = ['receipt_verification', 'store_addition'];

/**
 * Check if a user has reached their daily action limit
 * 
 * @param transactions All user transactions
 * @returns Object with count of today's actions and whether limit is reached
 */
export function checkDailyActionLimit(transactions: Transaction[]) {
  if (!transactions || transactions.length === 0) {
    return { 
      actionCount: 0, 
      limitReached: false 
    };
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Count actions created today that count against the limit
  const todayActions = transactions.filter(tx => {
    // Check if the transaction type counts against daily limit
    if (!DAILY_LIMITED_ACTIONS.includes(tx.type)) {
      return false;
    }
    
    // Check if the transaction occurred today
    // Ensure createdAt exists and is not null before creating a Date
    if (!tx.createdAt) return false;
    
    const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
    return txDate === today;
  });
  
  // Calculate if limit is reached
  const todayActionCount = todayActions.length;
  const isLimitReached = todayActionCount >= MAX_DAILY_ACTIONS;
  
  return {
    actionCount: todayActionCount,
    limitReached: isLimitReached,
    remainingActions: Math.max(0, MAX_DAILY_ACTIONS - todayActionCount)
  };
}

/**
 * Get user-friendly message about daily action limit
 */
export function getDailyLimitMessage(actionCount: number) {
  return `You've used ${actionCount}/${MAX_DAILY_ACTIONS} of your daily actions. This limit helps maintain the quality and authenticity of our rewards program.`;
}