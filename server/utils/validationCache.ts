import NodeCache from 'node-cache';
import { randomUUID } from 'crypto';

// Cache with 10-minute TTL for validation results
const validationCache = new NodeCache({
  stdTTL: 600, // 10 minutes
  checkperiod: 120, // Check for expired entries every 2 minutes
  useClones: false // Don't clone objects for performance
});

export interface CachedValidationResult {
  validationToken: string;
  userId: number;
  storeName: string | null;
  storeId: number | null;
  totalAmount: number;
  estimatedReward: number;
  purchaseDate: string;
  category: string;
  containsPreOwnedItems: boolean;
  paymentMethod?: any;
  cardLastFour?: string;
  isAcceptable: boolean;
  needsManualReview: boolean;
  reasons: string[];
  confidenceScore: number;
  timestamp: number;
}

/**
 * Save a validation result and return a unique token
 */
export function saveValidationResult(
  userId: number,
  analysisResult: {
    storeName: string | null;
    storeId: number | null;
    totalAmount: number;
    estimatedReward: number;
    purchaseDate: string;
    category: string;
    containsPreOwnedItems: boolean;
    paymentMethod?: any;
    cardLastFour?: string;
    isAcceptable: boolean;
    needsManualReview: boolean;
    reasons: string[];
    confidenceScore: number;
  }
): string {
  const validationToken = randomUUID();
  
  const cachedData: CachedValidationResult = {
    validationToken,
    userId,
    storeName: analysisResult.storeName,
    storeId: analysisResult.storeId,
    totalAmount: analysisResult.totalAmount,
    estimatedReward: analysisResult.estimatedReward,
    purchaseDate: analysisResult.purchaseDate,
    category: analysisResult.category,
    containsPreOwnedItems: analysisResult.containsPreOwnedItems,
    paymentMethod: analysisResult.paymentMethod,
    cardLastFour: analysisResult.cardLastFour,
    isAcceptable: analysisResult.isAcceptable,
    needsManualReview: analysisResult.needsManualReview,
    reasons: analysisResult.reasons,
    confidenceScore: analysisResult.confidenceScore,
    timestamp: Date.now()
  };
  
  const success = validationCache.set(validationToken, cachedData);
  
  if (success) {
    console.log(`[VALIDATION-CACHE] Saved validation token ${validationToken} for user ${userId}, totalAmount: $${analysisResult.totalAmount}`);
  } else {
    console.error(`[VALIDATION-CACHE] Failed to save validation token ${validationToken}`);
  }
  
  return validationToken;
}

/**
 * Retrieve and delete a validation result by token
 * Returns null if token is invalid, expired, or userId doesn't match
 */
export function getAndDeleteValidationResult(
  validationToken: string,
  userId: number
): CachedValidationResult | null {
  const cachedData = validationCache.get<CachedValidationResult>(validationToken);
  
  if (!cachedData) {
    console.log(`[VALIDATION-CACHE] Token ${validationToken} not found (expired or invalid)`);
    return null;
  }
  
  // Security check: ensure the userId matches
  if (cachedData.userId !== userId) {
    console.warn(`[VALIDATION-CACHE] User ID mismatch for token ${validationToken}: expected ${cachedData.userId}, got ${userId}`);
    return null;
  }
  
  // Delete the token after retrieval (one-time use)
  validationCache.del(validationToken);
  
  console.log(`[VALIDATION-CACHE] Retrieved and deleted token ${validationToken} for user ${userId}, totalAmount: $${cachedData.totalAmount}`);
  
  return cachedData;
}

/**
 * Get the most recent validation result for a user (fallback when token is missing)
 * Returns null if no recent validation found (within 5 minutes)
 */
export function getRecentValidationByUserId(userId: number): CachedValidationResult | null {
  const allKeys = validationCache.keys();
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000); // 5 minutes
  
  let mostRecentValidation: CachedValidationResult | null = null;
  let mostRecentTimestamp = 0;
  
  // Search through all cached validations for this user
  for (const key of allKeys) {
    const cached = validationCache.get<CachedValidationResult>(key);
    
    if (cached && 
        cached.userId === userId && 
        cached.timestamp > fiveMinutesAgo &&
        cached.timestamp > mostRecentTimestamp) {
      mostRecentValidation = cached;
      mostRecentTimestamp = cached.timestamp;
    }
  }
  
  if (mostRecentValidation) {
    console.log(`[VALIDATION-CACHE] 🔄 Found recent validation for user ${userId} (${Math.round((Date.now() - mostRecentTimestamp) / 1000)}s ago), totalAmount: $${mostRecentValidation.totalAmount}`);
    // Don't delete it - let it expire naturally in case of retries
    return mostRecentValidation;
  } else {
    console.log(`[VALIDATION-CACHE] ℹ️ No recent validation found for user ${userId} within 5 minutes`);
    return null;
  }
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  return {
    keys: validationCache.keys().length,
    stats: validationCache.getStats()
  };
}
