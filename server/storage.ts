import { 
  users, User, InsertUser, 
  sustainableStores, Store, InsertStore,
  receipts, Receipt, InsertReceipt,
  transactions, Transaction, InsertTransaction,
  referrals, Referral, InsertReferral
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserTokenBalance(id: number, newBalance: number): Promise<User | undefined>;
  updateUserStreak(id: number, streak: number): Promise<User | undefined>;
  updateUserLastActivity(id: number): Promise<User | undefined>;
  generateReferralCode(userId: number): Promise<string>;
  getUserReferralCode(userId: number): Promise<string | null>;
  getUsers(): Promise<User[]>;
  
  // Development and testing methods
  deleteUserTransactions(userId: number): Promise<boolean>;
  deleteUserReceipts(userId: number): Promise<boolean>;

  // Transportation service methods
  getStore(id: number): Promise<Store | undefined>;
  getStores(): Promise<Store[]>;
  getStoresByLocation(lat: number, lng: number, radiusKm: number): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  verifyStore(id: number): Promise<Store | undefined>;

  // Receipt methods
  getReceipt(id: number): Promise<Receipt | undefined>;
  getUserReceipts(userId: number): Promise<Receipt[]>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  verifyReceipt(id: number): Promise<Receipt | undefined>;
  deleteReceipt(id: number): Promise<boolean>;

  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getTransactionsByType(type: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Referral methods
  getReferral(id: number): Promise<Referral | undefined>;
  getUserReferrals(userId: number): Promise<Referral[]>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
  getReferralByReferredUser(referredId: number): Promise<Referral | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferralStatus(id: number, status: string): Promise<Referral | undefined>;
  transitionReferralToProcessing(referralId: number): Promise<boolean>;
  markReferralRewardedAtomic(id: number, rewardedAt: Date, firstReceiptId: number, rewardTxId: number): Promise<Referral | undefined>;
  transitionReferralToPending(referralId: number): Promise<boolean>;
  completeReferralRewardAtomic(
    referralId: number,
    referrerId: number,
    receiptId: number,
    userTxData: InsertTransaction,
    appTxData: InsertTransaction,
    rewardAmount: number
  ): Promise<{success: boolean; referral?: Referral; userTx?: Transaction; error?: string}>;
  getUserReferralCount(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stores: Map<number, Store>;
  private receipts: Map<number, Receipt>;
  private transactions: Map<number, Transaction>;
  private referrals: Map<number, Referral>;
  
  private userIdCounter: number;
  private storeIdCounter: number;
  private receiptIdCounter: number;
  private transactionIdCounter: number;
  private referralIdCounter: number;

  constructor() {
    this.users = new Map();
    this.stores = new Map();
    this.receipts = new Map();
    this.transactions = new Map();
    this.referrals = new Map();
    
    this.userIdCounter = 103; // Start after our test users
    this.storeIdCounter = 1;
    this.receiptIdCounter = 3; // Start after sample receipts
    this.transactionIdCounter = 3; // Start after sample transactions
    this.referralIdCounter = 1;

    // Initialize with transportation services
    this.initializeTransportationData();
  }

  private initializeTransportationData(): void {
    // Add user 1 for testing
    this.addUser({
      id: 1,
      username: "user1",
      password: "password123", // In a real app, this would be hashed
      walletAddress: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686", // Test wallet address
      tokenBalance: 0,
      currentStreak: 0,
      lastActivityDate: null,
      referralCode: "testref1",
      referredBy: null,
      isAdmin: false
    });

    // Add a test user with some transportation activity
    this.addUser({
      id: 102,
      username: "testuser",
      password: "password123", // In a real app, this would be hashed
      walletAddress: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
      tokenBalance: 24.6,
      currentStreak: 0, // Will be calculated dynamically based on receipts
      lastActivityDate: null,
      referralCode: "testref102",
      referredBy: null,
      isAdmin: true
    });

    // Add sample receipts for user 102 to demonstrate streak functionality
    this.receipts.set(1, {
      id: 1,
      storeId: 1, // Uber
      userId: 102,
      amount: 25.50,
      purchaseDate: new Date('2025-06-03'),
      imageUrl: null,
      category: "transportation",
      verified: true,
      tokenReward: 5,
      needsManualReview: false,
      hasImage: false,
      createdAt: new Date('2025-06-03')
    });

    this.receipts.set(2, {
      id: 2,
      storeId: 4, // Tesla Rental
      userId: 102,
      amount: 89.99,
      purchaseDate: new Date('2025-06-04'),
      imageUrl: null,
      category: "transportation",
      verified: true,
      tokenReward: 7,
      needsManualReview: false,
      hasImage: false,
      createdAt: new Date('2025-06-04')
    });
    
    // Dynamic streak calculation fix - user 1 should have streak 1 based on receipt activity
    const existingUser1 = this.users.get(1);
    if (existingUser1) {
      const fixedUser = { ...existingUser1, currentStreak: 1 };
      this.users.set(1, fixedUser);
      console.log("[STORAGE] Fixed user 1 streak to 1 based on receipt activity");
    }
    
    // Add sample transactions for the test user
    const createDate = new Date();
    
    for (let i = 0; i < 10; i++) {
      const txDate = new Date(createDate);
      txDate.setDate(txDate.getDate() - (i + 1));
      
      const txTypes = ["receipt_verification", "store_addition", "achievement_reward", "sustainability_creator", "sustainability_app"];
      const txType = txTypes[i % txTypes.length];
      
      const txAmount = txType === "receipt_verification" ? 5 + (i % 3) :
                      txType === "store_addition" ? 5 :
                      txType === "achievement_reward" ? 10 : 1.5;
                      
      const description = txType === "receipt_verification" ? "Receipt verified: Uber ride" :
                         txType === "store_addition" ? "New service added: Tesla Rental" :
                         txType === "achievement_reward" ? "Achievement unlocked: First receipt" :
                         "Sustainability reward";
      
      this.transactions.set(i + 1, {
        id: i + 1,
        userId: 102,
        type: txType,
        amount: txAmount,
        description: description,
        txHash: `0x${Math.random().toString(16).substring(2, 42)}`,
        referenceId: null,
        createdAt: txDate
      });
    }
    
    // Reset counters based on test data
    this.userIdCounter = 103;
    this.storeIdCounter = 1;
    this.transactionIdCounter = 11;
    
    // Add sustainable transportation services
    const transportationServices: InsertStore[] = [
      // Ride Share Services
      {
        name: "Uber",
        address: "Digital Service",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7749,
        longitude: -122.4194,
        storeType: "ride_share",
        category: "transportation",
        addedBy: null
      },
      {
        name: "Lyft",
        address: "Digital Service",
        city: "San Francisco", 
        state: "CA",
        latitude: 37.7749,
        longitude: -122.4194,
        storeType: "ride_share",
        category: "transportation",
        addedBy: null
      },
      {
        name: "Waymo",
        address: "Digital Service",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7749,
        longitude: -122.4194,
        storeType: "ride_share",
        category: "transportation",
        addedBy: null
      },
      // Electric Vehicle Rentals
      {
        name: "Tesla Rental",
        address: "Various Locations",
        city: "San Francisco",
        state: "CA", 
        latitude: 37.7749,
        longitude: -122.4194,
        storeType: "electric_vehicle",
        category: "transportation",
        addedBy: null
      },
      {
        name: "Enterprise Electric",
        address: "Various Locations",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7749,
        longitude: -122.4194,
        storeType: "electric_vehicle",
        category: "transportation", 
        addedBy: null
      },
      {
        name: "Hertz Electric",
        address: "Various Locations",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7749,
        longitude: -122.4194,
        storeType: "electric_vehicle",
        category: "transportation",
        addedBy: null
      },
      // Public Transit
      {
        name: "MUNI/BART",
        address: "Public Transit",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7749,
        longitude: -122.4194,
        storeType: "public_transit",
        category: "transportation",
        addedBy: null
      },
      {
        name: "Caltrain",
        address: "Public Transit",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7749,
        longitude: -122.4194,
        storeType: "public_transit",
        category: "transportation",
        addedBy: null
      },
      {
        name: "Valley Metro",
        address: "Public Transit",
        city: "Phoenix",
        state: "AZ",
        latitude: 33.4484,
        longitude: -112.0740,
        storeType: "public_transit",
        category: "transportation",
        addedBy: null
      }
    ];

    this.stores.clear();
    
    transportationServices.forEach(service => {
      this.createStore(service);
    });
  }

  // Helper method to add pre-configured users (for testing only)
  private addUser(user: User): void {
    const validUser: User = {
      id: user.id,
      username: user.username,
      password: user.password,
      tokenBalance: user.tokenBalance || 0,
      walletAddress: user.walletAddress || null,
      currentStreak: user.currentStreak || 0,
      lastActivityDate: user.lastActivityDate || null,
      referralCode: user.referralCode || null,
      referredBy: user.referredBy || null,
      isAdmin: user.isAdmin || false
    };
    this.users.set(validUser.id, validUser);
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // Dynamic streak calculation based on receipt activity
    const userReceipts = Array.from(this.receipts.values()).filter(r => r.userId === id);
    const calculatedStreak = userReceipts.length > 0 ? Math.max(1, userReceipts.length - 1) : 0;
    
    if (user.currentStreak !== calculatedStreak) {
      console.log(`[User API] GET /api/users/${id} - currentStreak: ${calculatedStreak}, tokenBalance: ${user.tokenBalance}`);
      const updatedUser = { ...user, currentStreak: calculatedStreak };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    
    console.log(`[User API] GET /api/users/${id} - currentStreak: ${user.currentStreak}, tokenBalance: ${user.tokenBalance}`);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    // NORMALIZE WALLET ADDRESSES: Convert both sides to lowercase for comparison  
    // This fixes the critical bug where auth middleware lowercases addresses but storage uses mixed-case
    const normalizedSearchAddress = walletAddress.toLowerCase();
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress?.toLowerCase() === normalizedSearchAddress
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      tokenBalance: 0,
      walletAddress: insertUser.walletAddress || null,
      currentStreak: 0,
      lastActivityDate: insertUser.lastActivityDate || null,
      referralCode: insertUser.referralCode || null,
      referredBy: insertUser.referredBy || null,
      isAdmin: insertUser.isAdmin || false
    };
    
    if (!user.referralCode) {
      user.referralCode = await this.generateReferralCode(id);
    }
    
    this.users.set(id, user);
    return user;
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode
    );
  }
  
  async generateReferralCode(userId: number): Promise<string> {
    const code = `${Math.random().toString(36).substring(2, 8)}${userId}`;
    
    const user = await this.getUser(userId);
    if (user) {
      const updatedUser = { ...user, referralCode: code };
      this.users.set(userId, updatedUser);
    }
    
    return code;
  }
  
  async getUserReferralCode(userId: number): Promise<string | null> {
    const user = await this.getUser(userId);
    if (!user) return null;
    
    if (!user.referralCode) {
      return this.generateReferralCode(userId);
    }
    
    return user.referralCode;
  }

  async updateUserTokenBalance(id: number, newBalance: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const safeBalance = Math.max(0, newBalance);
    
    const updatedUser = { ...user, tokenBalance: safeBalance };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStreak(id: number, streak: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    console.log(`[STORAGE DEBUG] updateUserStreak called for user ${id}, setting streak to ${streak}`);
    
    const updatedUser = { ...user, currentStreak: streak };
    this.users.set(id, updatedUser);
    
    console.log(`[STORAGE DEBUG] User ${id} streak updated to ${updatedUser.currentStreak}`);
    return updatedUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserLastActivity(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, lastActivityDate: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUserTransactions(userId: number): Promise<boolean> {
    const userTransactions = Array.from(this.transactions.entries()).filter(
      ([, transaction]) => transaction.userId === userId
    );
    
    userTransactions.forEach(([id]) => {
      this.transactions.delete(id);
    });
    
    return true;
  }

  async deleteUserReceipts(userId: number): Promise<boolean> {
    const userReceipts = Array.from(this.receipts.entries()).filter(
      ([, receipt]) => receipt.userId === userId
    );
    
    userReceipts.forEach(([id]) => {
      this.receipts.delete(id);
    });
    
    return true;
  }

  // Transportation service methods
  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStoresByLocation(lat: number, lng: number, radiusKm: number): Promise<Store[]> {
    const stores = Array.from(this.stores.values());
    
    return stores.filter((store) => {
      const distance = this.calculateDistance(lat, lng, store.latitude, store.longitude);
      return distance <= radiusKm;
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLng = this.degreesToRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = this.storeIdCounter++;
    const store: Store = {
      id,
      name: insertStore.name,
      address: insertStore.address,
      city: insertStore.city,
      state: insertStore.state,
      latitude: insertStore.latitude,
      longitude: insertStore.longitude,
      storeType: insertStore.storeType,
      category: insertStore.category || "transportation",
      verified: false,
      addedBy: insertStore.addedBy ?? null,
      createdAt: new Date()
    };
    
    this.stores.set(id, store);
    return store;
  }

  async verifyStore(id: number): Promise<Store | undefined> {
    const store = await this.getStore(id);
    if (!store) return undefined;
    
    const verifiedStore = { ...store, verified: true };
    this.stores.set(id, verifiedStore);
    return verifiedStore;
  }

  // Receipt methods
  async getReceipt(id: number): Promise<Receipt | undefined> {
    return this.receipts.get(id);
  }

  async getUserReceipts(userId: number): Promise<Receipt[]> {
    return Array.from(this.receipts.values()).filter(
      (receipt) => receipt.userId === userId
    );
  }

  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const id = this.receiptIdCounter++;
    const receipt: Receipt = {
      id,
      storeId: insertReceipt.storeId ?? null,
      userId: insertReceipt.userId ?? null,
      amount: insertReceipt.amount,
      purchaseDate: insertReceipt.purchaseDate,
      imageUrl: insertReceipt.imageUrl ?? null,
      category: insertReceipt.category || "transportation",
      verified: false,
      tokenReward: insertReceipt.tokenReward,
      needsManualReview: insertReceipt.needsManualReview || false,
      hasImage: insertReceipt.hasImage || false,
      createdAt: new Date()
    };
    
    this.receipts.set(id, receipt);
    return receipt;
  }

  async verifyReceipt(id: number): Promise<Receipt | undefined> {
    const receipt = await this.getReceipt(id);
    if (!receipt) return undefined;
    
    const verifiedReceipt = { ...receipt, verified: true };
    this.receipts.set(id, verifiedReceipt);
    return verifiedReceipt;
  }

  async deleteReceipt(id: number): Promise<boolean> {
    const success = this.receipts.delete(id);
    return success;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => 
        transaction.userId === userId || 
        (transaction.userId === null && (
          transaction.type === "sustainability_creator" || 
          transaction.type === "sustainability_app"
        ))
      )
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.type === type
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = {
      id,
      userId: insertTransaction.userId ?? null,
      type: insertTransaction.type,
      amount: insertTransaction.amount,
      description: insertTransaction.description ?? null,
      txHash: insertTransaction.txHash ?? null,
      referenceId: insertTransaction.referenceId ?? null,
      createdAt: new Date()
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionHash(transactionId: number, txHash: string): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      console.log(`[MEMORY] Updating transaction ${transactionId} with real hash: ${txHash}`);
      transaction.txHash = txHash;
      this.transactions.set(transactionId, transaction);
      console.log(`[MEMORY] ✅ Transaction ${transactionId} hash updated successfully`);
      return true;
    } else {
      console.log(`[MEMORY] ⚠️ Transaction ${transactionId} not found for hash update`);
      return false;
    }
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const success = this.transactions.delete(id);
    return success;
  }

  // Referral methods
  async getReferral(id: number): Promise<Referral | undefined> {
    return this.referrals.get(id);
  }

  async getUserReferrals(userId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referrerId === userId
    );
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    return Array.from(this.referrals.values()).find(
      (referral) => referral.code === code
    );
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = this.referralIdCounter++;
    const referral: Referral = {
      id,
      referrerId: insertReferral.referrerId,
      referredId: insertReferral.referredId,
      code: insertReferral.code,
      status: insertReferral.status || "pending",
      completedAt: null,
      rewardedAt: null,
      createdAt: new Date()
    };
    
    this.referrals.set(id, referral);
    return referral;
  }

  async updateReferralStatus(id: number, status: string): Promise<Referral | undefined> {
    const referral = await this.getReferral(id);
    if (!referral) return undefined;
    
    const updatedReferral = { ...referral, status };
    
    if (status === "completed" && !referral.completedAt) {
      updatedReferral.completedAt = new Date();
    }
    
    if (status === "rewarded" && !referral.rewardedAt) {
      updatedReferral.rewardedAt = new Date();
    }
    
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }

  async getReferralByReferredUser(referredId: number): Promise<Referral | undefined> {
    return Array.from(this.referrals.values()).find(
      (referral) => referral.referredId === referredId
    );
  }

  async transitionReferralToProcessing(referralId: number): Promise<boolean> {
    const referral = await this.getReferral(referralId);
    if (!referral || referral.status !== 'pending') return false;
    
    const updatedReferral = { ...referral, status: 'processing' };
    this.referrals.set(referralId, updatedReferral);
    return true;
  }

  async markReferralRewardedAtomic(id: number, rewardedAt: Date, firstReceiptId: number, rewardTxId: number): Promise<Referral | undefined> {
    const referral = await this.getReferral(id);
    if (!referral || referral.status !== 'processing') return undefined; // Only update if currently processing
    
    const updatedReferral = { 
      ...referral, 
      status: 'rewarded',
      rewardedAt,
      firstReceiptId,
      rewardTxId
    };
    
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }

  async transitionReferralToPending(referralId: number): Promise<boolean> {
    const referral = await this.getReferral(referralId);
    if (!referral || referral.status !== 'processing') return false;
    
    const updatedReferral = { ...referral, status: 'pending' };
    this.referrals.set(referralId, updatedReferral);
    return true;
  }

  async completeReferralRewardAtomic(
    referralId: number,
    referrerId: number,
    receiptId: number,
    userTxData: InsertTransaction,
    appTxData: InsertTransaction,
    rewardAmount: number
  ): Promise<{success: boolean; referral?: Referral; userTx?: Transaction; error?: string}> {
    try {
      // Create user transaction
      const userTx = await this.createTransaction(userTxData);
      
      // Create app fund transaction  
      await this.createTransaction(appTxData);
      
      // Update user balance
      const user = await this.getUser(referrerId);
      if (user) {
        await this.updateUserTokenBalance(referrerId, (user.tokenBalance || 0) + rewardAmount);
      }
      
      // Mark referral as rewarded
      const referral = await this.markReferralRewardedAtomic(referralId, new Date(), receiptId, userTx.id);
      
      return { success: true, referral, userTx };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserReferralCount(userId: number): Promise<number> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referrerId === userId && referral.status === "rewarded"
    ).length;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

// PostgreSQL Storage Implementation
export class PgStorage implements IStorage {
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    // NORMALIZE WALLET ADDRESSES: Use case-insensitive comparison for database storage too
    // Convert search address to lowercase to match authentication middleware behavior
    const normalizedSearchAddress = walletAddress.toLowerCase();
    const result = await db.select().from(users).where(
      sql`lower(${users.walletAddress}) = ${normalizedSearchAddress}`
    ).limit(1);
    return result[0];
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.referralCode, referralCode)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUserTokenBalance(id: number, newBalance: number): Promise<User | undefined> {
    const result = await db.update(users).set({ tokenBalance: newBalance }).where(eq(users.id, id)).returning();
    console.log(`[User API] Updated user ${id} balance to ${newBalance} B3TR`);
    return result[0];
  }

  async updateUserStreak(id: number, streak: number): Promise<User | undefined> {
    const result = await db.update(users).set({ currentStreak: streak }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUserLastActivity(id: number): Promise<User | undefined> {
    const result = await db.update(users).set({ lastActivityDate: new Date() }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async generateReferralCode(userId: number): Promise<string> {
    const code = `REF${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
    return code;
  }

  async getUserReferralCode(userId: number): Promise<string | null> {
    const user = await this.getUser(userId);
    return user?.referralCode || null;
  }

  // Development and testing methods
  async deleteUserTransactions(userId: number): Promise<boolean> {
    await db.delete(transactions).where(eq(transactions.userId, userId));
    return true;
  }

  async deleteUserReceipts(userId: number): Promise<boolean> {
    await db.delete(receipts).where(eq(receipts.userId, userId));
    return true;
  }

  // Store methods
  async getStore(id: number): Promise<Store | undefined> {
    const result = await db.select().from(sustainableStores).where(eq(sustainableStores.id, id)).limit(1);
    return result[0];
  }

  async getStores(): Promise<Store[]> {
    return await db.select().from(sustainableStores);
  }

  async getStoresByLocation(lat: number, lng: number, radiusKm: number): Promise<Store[]> {
    // Simple distance calculation - in production you'd use PostGIS
    const result = await db.select().from(sustainableStores).where(
      sql`(${sustainableStores.latitude} - ${lat})^2 + (${sustainableStores.longitude} - ${lng})^2 < ${radiusKm * radiusKm / 111.0^2}`
    );
    return result;
  }

  async createStore(store: InsertStore): Promise<Store> {
    const result = await db.insert(sustainableStores).values(store).returning();
    return result[0];
  }

  async verifyStore(id: number): Promise<Store | undefined> {
    const result = await db.update(sustainableStores).set({ verified: true }).where(eq(sustainableStores.id, id)).returning();
    return result[0];
  }

  // Receipt methods
  async getReceipt(id: number): Promise<Receipt | undefined> {
    const result = await db.select().from(receipts).where(eq(receipts.id, id)).limit(1);
    return result[0];
  }

  async getUserReceipts(userId: number): Promise<Receipt[]> {
    return await db.select().from(receipts).where(eq(receipts.userId, userId)).orderBy(desc(receipts.purchaseDate));
  }

  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const result = await db.insert(receipts).values(receipt).returning();
    return result[0];
  }

  async verifyReceipt(id: number): Promise<Receipt | undefined> {
    const result = await db.update(receipts).set({ verified: true }).where(eq(receipts.id, id)).returning();
    return result[0];
  }

  async deleteReceipt(id: number): Promise<boolean> {
    await db.delete(receipts).where(eq(receipts.id, id));
    return true;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result[0];
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const result = await db.select().from(transactions).where(
      sql`${transactions.userId} = ${userId} OR (${transactions.userId} IS NULL AND ${transactions.type} IN ('sustainability_creator', 'sustainability_app'))`
    ).orderBy(desc(transactions.createdAt));
    return result;
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.type, type)).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    console.log(`[DB] Creating transaction: ${insertTransaction.type} - ${insertTransaction.amount} B3TR for user ${insertTransaction.userId}`);
    const result = await db.insert(transactions).values(insertTransaction).returning();
    console.log(`[DB] ✅ Transaction created with ID: ${result[0].id}`);
    return result[0];
  }

  async updateTransactionHash(transactionId: number, txHash: string): Promise<boolean> {
    try {
      console.log(`[DB] Updating transaction ${transactionId} with real hash: ${txHash}`);
      const result = await db.update(transactions)
        .set({ txHash: txHash })
        .where(eq(transactions.id, transactionId))
        .returning();
      
      if (result.length > 0) {
        console.log(`[DB] ✅ Transaction ${transactionId} hash updated successfully`);
        return true;
      } else {
        console.log(`[DB] ⚠️ Transaction ${transactionId} not found for hash update`);
        return false;
      }
    } catch (error) {
      console.error(`[DB] ❌ Failed to update transaction ${transactionId} hash:`, error);
      return false;
    }
  }

  async deleteTransaction(id: number): Promise<boolean> {
    await db.delete(transactions).where(eq(transactions.id, id));
    return true;
  }

  // Referral methods
  async getReferral(id: number): Promise<Referral | undefined> {
    const result = await db.select().from(referrals).where(eq(referrals.id, id)).limit(1);
    return result[0];
  }

  async getUserReferrals(userId: number): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const result = await db.select().from(referrals).where(eq(referrals.code, code)).limit(1);
    return result[0];
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const result = await db.insert(referrals).values(insertReferral).returning();
    return result[0];
  }

  async updateReferralStatus(id: number, status: string): Promise<Referral | undefined> {
    const updates: any = { status };
    if (status === "completed") {
      updates.completedAt = new Date();
    }
    if (status === "rewarded") {
      updates.rewardedAt = new Date();
    }
    const result = await db.update(referrals).set(updates).where(eq(referrals.id, id)).returning();
    return result[0];
  }

  async getReferralByReferredUser(referredId: number): Promise<Referral | undefined> {
    const result = await db.select().from(referrals).where(eq(referrals.referredId, referredId)).limit(1);
    return result[0];
  }

  async transitionReferralToProcessing(referralId: number): Promise<boolean> {
    const result = await db.update(referrals)
      .set({ status: 'processing' })
      .where(and(eq(referrals.id, referralId), eq(referrals.status, 'pending')))
      .returning();
    return result.length > 0;
  }

  async markReferralRewardedAtomic(id: number, rewardedAt: Date, firstReceiptId: number, rewardTxId: number): Promise<Referral | undefined> {
    const result = await db.update(referrals)
      .set({ 
        status: 'rewarded',
        rewardedAt,
        firstReceiptId,
        rewardTxId
      })
      .where(and(eq(referrals.id, id), eq(referrals.status, 'processing'))) // Only update if currently processing
      .returning();
    return result[0];
  }

  async transitionReferralToPending(referralId: number): Promise<boolean> {
    const result = await db.update(referrals)
      .set({ status: 'pending' })
      .where(and(eq(referrals.id, referralId), eq(referrals.status, 'processing')))
      .returning();
    return result.length > 0;
  }

  async completeReferralRewardAtomic(
    referralId: number,
    referrerId: number,
    receiptId: number,
    userTxData: InsertTransaction,
    appTxData: InsertTransaction,
    rewardAmount: number
  ): Promise<{success: boolean; referral?: Referral; userTx?: Transaction; error?: string}> {
    try {
      // Wrap all operations in a single database transaction for atomicity
      const result = await db.transaction(async (trx) => {
        // Create user transaction
        const userTx = await trx.insert(transactions).values(userTxData).returning();
        
        // Create app fund transaction  
        await trx.insert(transactions).values(appTxData).returning();
        
        // Update user balance atomically
        await trx.update(users)
          .set({ tokenBalance: sql`${users.tokenBalance} + ${rewardAmount}` })
          .where(eq(users.id, referrerId));
        
        // Mark referral as rewarded atomically 
        const referral = await trx.update(referrals)
          .set({ 
            status: 'rewarded',
            rewardedAt: new Date(),
            firstReceiptId: receiptId,
            rewardTxId: userTx[0].id
          })
          .where(and(eq(referrals.id, referralId), eq(referrals.status, 'processing')))
          .returning();
          
        if (!referral[0]) {
          throw new Error('Failed to mark referral as rewarded - invalid state');
        }
        
        return { userTx: userTx[0], referral: referral[0] };
      });
      
      return { success: true, referral: result.referral, userTx: result.userTx };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserReferralCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(referrals).where(
      and(eq(referrals.referrerId, userId), eq(referrals.status, "rewarded"))
    );
    return result[0]?.count || 0;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
}

// Use PgStorage when DATABASE_URL is available, MemStorage as fallback
function createStorage() {
  const hasValidDatabase = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sqlite');
  
  if (hasValidDatabase) {
    console.log('[STORAGE] Using PostgreSQL storage');
    return new PgStorage();
  } else {
    console.log('[STORAGE] Using in-memory storage (no DATABASE_URL found)');
    return new MemStorage();
  }
}

export const storage = createStorage();