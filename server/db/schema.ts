/**
 * Database Schema - Public Structure Demo
 * Demonstrates PostgreSQL schema for ReCircle platform
 * Sensitive credentials redacted for privacy – available in private repo
 */

export interface User {
  id: number;
  username: string;
  walletAddress: string;
  tokenBalance: number;
  currentStreak: number;
  dailyActions: number;
  createdAt: Date;
}

export interface Receipt {
  id: number;
  userId: number;
  storeId: number;
  storeName: string;
  amount: number;
  purchaseDate: Date;
  category: string;
  imageUrl: string;
  rewardAmount: number;
  isApproved: boolean;
  confidenceScore: number;
}

export interface Store {
  id: number;
  name: string;
  category: string;
  isApproved: boolean;
  isSustainable: boolean;
}

export interface Transaction {
  id: number;
  userId: number;
  type: 'receipt_reward' | 'streak_bonus' | 'achievement';
  amount: number;
  description: string;
  txHash?: string; // VeChain transaction hash
  createdAt: Date;
}

// Internal database connection logic redacted for privacy
// Production version includes secure PostgreSQL configuration