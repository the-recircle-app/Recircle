// TypeScript type definitions for ReCircle Platform
// These types provide structure and type safety for the application

export interface User {
  id: string;
  walletAddress?: string;
  tokenBalance: number;
  receiptsSubmitted: number;
  currentStreak: number;
  dailyActions: number;
  totalImpact: number;
  createdAt: string;
  lastActivity?: string;
}

export interface Receipt {
  id: string;
  userId: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'manual_review';
  validationData: ReceiptValidation;
  submittedAt: string;
  processedAt?: string;
  rewardAmount?: number;
}

export interface ReceiptValidation {
  confidence: number;
  storeName: string;
  category: ReceiptCategory;
  estimatedReward: number;
  sustainabilityScore: number;
  validationDetails: {
    storeRecognized: boolean;
    itemsDetected: string[];
    priceValidation: boolean;
    dateValidation: boolean;
    sustainabilityFlags: string[];
  };
}

export type ReceiptCategory = 
  | 'secondhand_clothing'
  | 'thrift_store'
  | 'electronics_repair'
  | 'bike_maintenance'
  | 'ride_share'
  | 'electric_vehicle'
  | 'public_transit'
  | 'sustainable_food'
  | 'eco_products'
  | 'other';

export interface WalletConnection {
  address: string;
  isConnected: boolean;
  network: 'vechain_mainnet' | 'vechain_testnet';
  balance: string;
  lastActivity: string;
}

export interface TokenTransaction {
  id: string;
  type: 'reward' | 'transfer' | 'stake';
  amount: number;
  fromAddress?: string;
  toAddress: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
  blockNumber?: number;
  timestamp: string;
  gasUsed?: string;
}

export interface SustainabilityImpact {
  co2Saved: number; // kg
  wasteReduced: number; // kg
  circularTransactions: number;
  sustainabilityScore: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
  lastUpdated?: string;
}