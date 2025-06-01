import { 
  users, User, InsertUser, 
  thriftStores, ThriftStore, InsertThriftStore,
  receipts, Receipt, InsertReceipt,
  transactions, Transaction, InsertTransaction,
  referrals, Referral, InsertReferral
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokenBalance(id: number, newBalance: number): Promise<User | undefined>;
  updateUserStreak(id: number, streak: number): Promise<User | undefined>;
  updateUserLastActivity(id: number): Promise<User | undefined>;
  generateReferralCode(userId: number): Promise<string>;
  getUserReferralCode(userId: number): Promise<string | null>;
  
  // Development and testing methods
  deleteUserTransactions(userId: number): Promise<boolean>;
  deleteUserReceipts(userId: number): Promise<boolean>;

  // Thrift store methods
  getThriftStore(id: number): Promise<ThriftStore | undefined>;
  getThriftStores(): Promise<ThriftStore[]>;
  getThriftStoresByLocation(lat: number, lng: number, radiusKm: number): Promise<ThriftStore[]>;
  createThriftStore(store: InsertThriftStore): Promise<ThriftStore>;
  verifyThriftStore(id: number): Promise<ThriftStore | undefined>;

  // Receipt methods
  getReceipt(id: number): Promise<Receipt | undefined>;
  getUserReceipts(userId: number): Promise<Receipt[]>;
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  verifyReceipt(id: number): Promise<Receipt | undefined>;

  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getTransactionsByType(type: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Referral methods
  getReferral(id: number): Promise<Referral | undefined>;
  getUserReferrals(userId: number): Promise<Referral[]>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferralStatus(id: number, status: string): Promise<Referral | undefined>;
  getUserReferralCount(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private thriftStores: Map<number, ThriftStore>;
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
    this.thriftStores = new Map();
    this.receipts = new Map();
    this.transactions = new Map();
    this.referrals = new Map();
    
    this.userIdCounter = 1;
    this.storeIdCounter = 1;
    this.receiptIdCounter = 1;
    this.transactionIdCounter = 1;
    this.referralIdCounter = 1;

    // Initialize with sample thrift stores
    this.initializeData();
  }

  private initializeData(): void {
    // Add a test user
    this.addUser({
      id: 102,
      username: "testuser",
      password: "password123", // In a real app, this would be hashed
      walletAddress: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
      tokenBalance: 15,
      currentStreak: 0, // Initialize streak at 0 until actual activity
      lastActivityDate: null,
      referralCode: "testref102", // Add a test referral code for the test user
      referredBy: null,
      isAdmin: true // Make the test user an admin for development
    });
    
    // Add sample transactions for the test user
    const createDate = new Date();
    
    // Add 10 sample transactions for testing pagination
    for (let i = 0; i < 10; i++) {
      const txDate = new Date(createDate);
      // Make all transactions at least 1 day old to avoid affecting daily action limit
      txDate.setDate(txDate.getDate() - (i + 1)); // Each transaction at least one day old
      
      const txTypes = ["receipt_verification", "store_addition", "achievement_reward", "sustainability_creator", "sustainability_app"];
      const txType = txTypes[i % txTypes.length];
      
      const txAmount = txType === "receipt_verification" ? 5 + (i % 3) :
                      txType === "store_addition" ? 5 :
                      txType === "achievement_reward" ? 10 : 1.5;
                      
      const description = txType === "receipt_verification" ? "Receipt verified: Goodwill" :
                         txType === "store_addition" ? "New store added: Salvation Army" :
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
    this.transactionIdCounter = 11; // After adding 10 sample transactions
    
    // Add sample sustainable stores
    const sampleStores: InsertThriftStore[] = [
      {
        name: "Goodwill",
        address: "360 5th St",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7790,
        longitude: -122.4028,
        storeType: "general",
        addedBy: null
      },
      {
        name: "Salvation Army Thrift Store",
        address: "1500 Valencia St",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7487,
        longitude: -122.4202,
        storeType: "clothing",
        addedBy: null
      },
      {
        name: "Out of the Closet",
        address: "1295 Folsom St",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7739,
        longitude: -122.4103, 
        storeType: "clothing",
        addedBy: null
      },
      {
        name: "Buffalo Exchange",
        address: "1555 Haight St",
        city: "San Francisco",
        state: "CA", 
        latitude: 37.7702,
        longitude: -122.4476,
        storeType: "clothing",
        addedBy: null
      },
      {
        name: "GameStop",
        address: "789 Market St",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7857,
        longitude: -122.4058,
        storeType: "used_games",
        addedBy: null
      },
      {
        name: "Barnes & Noble",
        address: "1270 4th St",
        city: "San Francisco",
        state: "CA",
        latitude: 37.7741,
        longitude: -122.3885,
        storeType: "re-use item", // Standardized category
        addedBy: null
      }
    ];

    // Clear any existing stores and add fresh sample data
    this.thriftStores.clear();
    
    sampleStores.forEach(store => {
      this.createThriftStore(store);
    });
  }

  // Helper method to add pre-configured users (for testing only)
  private addUser(user: User): void {
    // Ensure User object has all required fields properly typed
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
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    
    // Create user with explicit properties to match User type
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
    
    // Generate a referral code if not provided
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
    // Generate a random code with user ID to ensure uniqueness
    const code = `${Math.random().toString(36).substring(2, 8)}${userId}`;
    
    // Update the user with this code
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
    
    // If user doesn't have a referral code yet, generate one
    if (!user.referralCode) {
      return this.generateReferralCode(userId);
    }
    
    return user.referralCode;
  }

  async updateUserTokenBalance(id: number, newBalance: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // Ensure token balance is never negative
    const safeBalance = Math.max(0, newBalance);
    
    const updatedUser = { ...user, tokenBalance: safeBalance };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStreak(id: number, streak: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    // For test user 102, always log streak operations
    if (id === 102) {
      console.log(`[STREAK DEBUG] Updating user ${id} streak from ${user.currentStreak} to ${streak}`);
    }
    
    const updatedUser = { ...user, currentStreak: streak };
    this.users.set(id, updatedUser);
    
    // Verify for test user 102
    if (id === 102) {
      const verifyUser = this.users.get(id);
      console.log(`[STREAK DEBUG] After update, user ${id} streak is now: ${verifyUser?.currentStreak}`);
    }
    
    return updatedUser;
  }

  async updateUserLastActivity(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, lastActivityDate: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Thrift store methods
  async getThriftStore(id: number): Promise<ThriftStore | undefined> {
    return this.thriftStores.get(id);
  }

  async getThriftStores(): Promise<ThriftStore[]> {
    return Array.from(this.thriftStores.values());
  }

  async getThriftStoresByLocation(lat: number, lng: number, radiusKm: number): Promise<ThriftStore[]> {
    // Simple distance calculation (not accounting for Earth's curvature for simplicity)
    // In a real app, you would use the Haversine formula
    const stores = Array.from(this.thriftStores.values());
    return stores.filter(store => {
      const latDiff = store.latitude - lat;
      const lngDiff = store.longitude - lng;
      // Very rough approximation: 1 degree ~= 111km
      const distanceSquared = (latDiff * 111) ** 2 + (lngDiff * 111 * Math.cos(lat * Math.PI / 180)) ** 2;
      return Math.sqrt(distanceSquared) <= radiusKm;
    });
  }

  async createThriftStore(insertStore: InsertThriftStore): Promise<ThriftStore> {
    const id = this.storeIdCounter++;
    const now = new Date();
    
    // Create store with explicit properties to match ThriftStore type
    const store: ThriftStore = { 
      id,
      name: insertStore.name,
      address: insertStore.address,
      city: insertStore.city,
      state: insertStore.state,
      latitude: insertStore.latitude,
      longitude: insertStore.longitude,
      storeType: insertStore.storeType,
      category: insertStore.storeType || "thrift", // Use storeType as category or default to "thrift"
      verified: true, // Auto-verify sample data
      addedBy: insertStore.addedBy || null,
      createdAt: now
    };
    
    this.thriftStores.set(id, store);
    return store;
  }

  async verifyThriftStore(id: number): Promise<ThriftStore | undefined> {
    const store = await this.getThriftStore(id);
    if (!store) return undefined;
    
    const verifiedStore = { ...store, verified: true };
    this.thriftStores.set(id, verifiedStore);
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
    const now = new Date();
    
    // Create receipt with explicit properties to match Receipt type
    const receipt: Receipt = { 
      id,
      userId: insertReceipt.userId || null,
      storeId: insertReceipt.storeId || null,
      amount: insertReceipt.amount,
      purchaseDate: insertReceipt.purchaseDate,
      imageUrl: insertReceipt.imageUrl || null,
      tokenReward: insertReceipt.tokenReward,
      category: insertReceipt.category || "thrift", // Default to "thrift" if not specified
      verified: false,
      needsManualReview: insertReceipt.needsManualReview || false,
      hasImage: insertReceipt.hasImage || false,
      createdAt: now
    };
    
    this.receipts.set(id, receipt);
    return receipt;
  }

  async verifyReceipt(id: number): Promise<Receipt | undefined> {
    const receipt = await this.getReceipt(id);
    if (!receipt) return undefined;
    
    // Make sure we maintain all required fields
    const verifiedReceipt = { 
      ...receipt, 
      verified: true,
      // Ensure category is set (default to thrift_clothing if missing for any reason)
      category: receipt.category || 'thrift_clothing'
    };
    this.receipts.set(id, verifiedReceipt);
    return verifiedReceipt;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId || transaction.userId === null) // Include null userId for sustainability transactions
      .sort((a, b) => {
        // Sort by creation date (most recent first)
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.type === type)
      .sort((a, b) => {
        // Sort by creation date (most recent first)
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
  }

  // Get receipts needing manual review
  async getReceiptsNeedingReview(): Promise<Receipt[]> {
    return Array.from(this.receipts.values()).filter(receipt => receipt.needsManualReview && !receipt.verified);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    
    // Create transaction with explicit properties to match Transaction type
    const transaction: Transaction = {
      id,
      userId: insertTransaction.userId || null,
      type: insertTransaction.type,
      amount: insertTransaction.amount,
      description: insertTransaction.description,
      txHash: insertTransaction.txHash || null,
      referenceId: insertTransaction.referenceId || null,
      createdAt: now
    };
    
    this.transactions.set(id, transaction);
    
    // Update user token balance
    if (insertTransaction.userId) {
      const user = await this.getUser(insertTransaction.userId);
      if (user) {
        const newBalance = user.tokenBalance + insertTransaction.amount;
        await this.updateUserTokenBalance(user.id, newBalance);
      }
    }
    
    return transaction;
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
    const now = new Date();
    
    // Create referral with explicit properties to match Referral type
    const referral: Referral = {
      id,
      referrerId: insertReferral.referrerId,
      referredId: insertReferral.referredId,
      code: insertReferral.code,
      status: insertReferral.status || 'pending',
      completedAt: null,
      rewardedAt: null,
      createdAt: now
    };
    
    this.referrals.set(id, referral);
    return referral;
  }
  
  async updateReferralStatus(id: number, status: string): Promise<Referral | undefined> {
    const referral = await this.getReferral(id);
    if (!referral) return undefined;
    
    const now = new Date();
    const updatedReferral = { 
      ...referral, 
      status,
      completedAt: status === 'completed' ? now : referral.completedAt,
      rewardedAt: status === 'rewarded' ? now : referral.rewardedAt
    };
    
    this.referrals.set(id, updatedReferral);
    return updatedReferral;
  }
  
  async getUserReferralCount(userId: number): Promise<number> {
    const referrals = await this.getUserReferrals(userId);
    return referrals.filter(r => r.status === 'rewarded').length;
  }
  
  // Development and testing methods
  async deleteUserTransactions(userId: number): Promise<boolean> {
    try {
      // Find and delete all transactions for this user
      const userTransactions = Array.from(this.transactions.values())
        .filter(t => t.userId === userId);
      
      // Remove each transaction from the map
      userTransactions.forEach(t => {
        this.transactions.delete(t.id);
      });
      
      console.log(`[DEV] Deleted ${userTransactions.length} transactions for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`[DEV] Error deleting transactions for user ${userId}:`, error);
      return false;
    }
  }
  
  async deleteUserReceipts(userId: number): Promise<boolean> {
    try {
      // Find and delete all receipts for this user
      const userReceipts = Array.from(this.receipts.values())
        .filter(r => r.userId === userId);
      
      // Remove each receipt from the map
      userReceipts.forEach(r => {
        this.receipts.delete(r.id);
      });
      
      console.log(`[DEV] Deleted ${userReceipts.length} receipts for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`[DEV] Error deleting receipts for user ${userId}:`, error);
      return false;
    }
  }
}

// Database storage implementation
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
    
  async generateReferralCode(userId: number): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar-looking characters
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Update user with the new referral code
    await db.update(users)
      .set({ referralCode: code })
      .where(eq(users.id, userId));
    
    return code;
  }
  
  async getUserReferralCode(userId: number): Promise<string | null> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return null;
    }
    
    // If user already has a code, return it
    if (user.referralCode) {
      return user.referralCode;
    }
    
    // Otherwise, generate a new code
    return await this.generateReferralCode(userId);
  }

  async updateUserTokenBalance(id: number, newBalance: number): Promise<User | undefined> {
    // Ensure token balance is never negative
    const safeBalance = Math.max(0, newBalance);
    
    const [user] = await db
      .update(users)
      .set({ tokenBalance: safeBalance })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async updateUserStreak(id: number, streak: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ currentStreak: streak })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserLastActivity(id: number): Promise<User | undefined> {
    const now = new Date();
    const [user] = await db
      .update(users)
      .set({ lastActivityDate: now })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getThriftStore(id: number): Promise<ThriftStore | undefined> {
    const [store] = await db.select().from(thriftStores).where(eq(thriftStores.id, id));
    return store;
  }

  async getThriftStores(): Promise<ThriftStore[]> {
    return db.select().from(thriftStores);
  }

  async getThriftStoresByLocation(lat: number, lng: number, radiusKm: number): Promise<ThriftStore[]> {
    // For a real implementation, you would use PostGIS for this
    // Here we'll use a simpler approach with a bounding box
    // Note: This is not perfectly accurate for large distances
    
    // Convert radius to rough latitude/longitude delta (very approximate)
    const latDelta = radiusKm / 111.0; // 1 degree lat is ~111 km
    const lngDelta = radiusKm / (111.0 * Math.cos(lat * (Math.PI / 180))); // adjust for longitude
    
    const stores = await db.select().from(thriftStores)
      .where(
        and(
          sql`${thriftStores.latitude} BETWEEN ${lat - latDelta} AND ${lat + latDelta}`,
          sql`${thriftStores.longitude} BETWEEN ${lng - lngDelta} AND ${lng + lngDelta}`
        )
      );
    
    // Further refine with a more precise distance calculation
    return stores.filter(store => {
      // Calculate direct distance
      const distance = Math.sqrt(
        Math.pow(lat - store.latitude, 2) + 
        Math.pow(lng - store.longitude, 2)
      ) * 111.0; // Convert to km
      
      return distance <= radiusKm;
    });
  }

  async createThriftStore(insertStore: InsertThriftStore): Promise<ThriftStore> {
    const [store] = await db.insert(thriftStores).values(insertStore).returning();
    return store;
  }

  async verifyThriftStore(id: number): Promise<ThriftStore | undefined> {
    const [store] = await db
      .update(thriftStores)
      .set({ verified: true })
      .where(eq(thriftStores.id, id))
      .returning();
    return store;
  }

  async getReceipt(id: number): Promise<Receipt | undefined> {
    const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id));
    return receipt;
  }

  async getUserReceipts(userId: number): Promise<Receipt[]> {
    return db.select().from(receipts).where(eq(receipts.userId, userId));
  }

  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const [receipt] = await db.insert(receipts).values(insertReceipt).returning();
    return receipt;
  }

  async verifyReceipt(id: number): Promise<Receipt | undefined> {
    // First get the receipt to make sure we have all information
    const existingReceipt = await this.getReceipt(id);
    if (!existingReceipt) return undefined;
    
    // Make sure we preserve category field when updating
    const [receipt] = await db
      .update(receipts)
      .set({ 
        verified: true,
        // Keep existing category or default to thrift_clothing
        category: existingReceipt.category || 'thrift_clothing' 
      })
      .where(eq(receipts.id, id))
      .returning();
    return receipt;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    // Include both user transactions and null userId sustainability transactions
    return db.select().from(transactions).where(
      sql`${transactions.userId} = ${userId} OR ${transactions.userId} IS NULL`
    ).orderBy(sql`${transactions.createdAt} DESC`);
  }
  
  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(eq(transactions.type, type))
      .orderBy(sql`${transactions.createdAt} DESC`);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }
  
  async getReferral(id: number): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.id, id));
    return referral;
  }

  async getUserReferrals(userId: number): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.code, code));
    return referral;
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals).values(insertReferral).returning();
    return referral;
  }

  async updateReferralStatus(id: number, status: string): Promise<Referral | undefined> {
    const [referral] = await db
      .update(referrals)
      .set({ status })
      .where(eq(referrals.id, id))
      .returning();
    return referral;
  }

  async getUserReferralCount(userId: number): Promise<number> {
    const referrals = await this.getUserReferrals(userId);
    return referrals.length;
  }
  
  // Development and testing methods
  async deleteUserTransactions(userId: number): Promise<boolean> {
    try {
      // Delete all transactions for this user
      await db.delete(transactions)
        .where(eq(transactions.userId, userId));
      
      console.log(`[DEV] Deleted transactions for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`[DEV] Error deleting transactions for user ${userId}:`, error);
      return false;
    }
  }
  
  async deleteUserReceipts(userId: number): Promise<boolean> {
    try {
      // Delete all receipts for this user
      await db.delete(receipts)
        .where(eq(receipts.userId, userId));
      
      console.log(`[DEV] Deleted receipts for user ${userId}`);
      return true;
    } catch (error) {
      console.error(`[DEV] Error deleting receipts for user ${userId}:`, error);
      return false;
    }
  }
}

// Choose which storage implementation to use
// For development with in-memory storage:
export const storage = new MemStorage();

// To use database storage, comment out the line above and uncomment this line:
// export const storage = new DatabaseStorage();
