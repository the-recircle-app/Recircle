export interface User {
  id: number;
  username: string;
  walletAddress?: string;
  tokenBalance: number;
}

export interface ThriftStore {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  storeType: string;
  verified: boolean;
  addedBy: number | null;
  createdAt: string;
}

export interface Receipt {
  id: number;
  storeId: number;
  userId: number;
  amount: number;
  purchaseDate: string;
  imageUrl?: string;
  verified: boolean;
  tokenReward: number;
  createdAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  type: "receipt_verification" | "store_addition" | "token_redemption" | "token_claim" | "achievement_reward" | "sustainability_creator" | "sustainability_app" | "admin_action";
  amount: number;
  description: string;
  txHash?: string;
  referenceId?: number;
  createdAt: string;
}

export interface WalletInfo {
  address: string;
  balance: number;
  isConnected: boolean;
}

export interface Stats {
  totalRewards: number;
  receiptsCount: number;
}

export interface ActivityItem {
  id: number;
  type: "receipt_verification" | "store_addition" | "token_redemption" | "token_claim" | "achievement_reward" | "sustainability_creator" | "sustainability_app" | "admin_action";
  title: string;
  description: string;
  amount: number;
  timestamp: string;
  icon: string;
}
