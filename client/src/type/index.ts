export interface User {
  id: number;
  username: string;
  walletAddress: string | null;
  tokenBalance: number;
  currentStreak: number;
  lastActivityDate: Date | null;
  referralCode: string | null;
  referredBy: number | null;
  isAdmin: boolean;
}

export interface TransportationStore {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  storeType: string;
  category: 'transportation' | 'rideshare' | 'public_transit' | 'ev_rental';
  verified: boolean;
  addedBy: number;
  createdAt: Date;
}

export interface Receipt {
  id: number;
  storeId: number;
  userId: number;
  amount: number;
  purchaseDate: Date;
  category: 'transportation' | 'rideshare' | 'public_transit' | 'ev_rental';
  verified: boolean;
  tokenReward: number;
  needsManualReview: boolean;
  hasImage: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: number;
  userId: number;
  type: 'receipt_verification' | 'store_addition' | 'token_redemption' | 'referral_reward';
  amount: number;
  description: string;
  txHash: string | null;
  referenceId: number | null;
  createdAt: Date;
}

export interface ReceiptScanResult {
  isValid: boolean;
  transportationType: 'rideshare' | 'ev_rental' | 'public_transit' | 'unknown';
  amount: number;
  vendor: string;
  estimatedReward: number;
  confidence: number;
  needsManualReview?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}