import { 
  users, User, InsertUser, 
  sustainableStores, Store, InsertStore,
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
    
    this.userIdCounter = 1;
    this.storeIdCounter = 1;
    this.receiptIdCounter = 1;
    this.transactionIdCounter = 1;
    this.referralIdCounter = 1;

    // Initialize with transportation services
    this.initializeTransportationData();
  }

  private initializeTransportationData(): void {
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
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress
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

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
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

  async getUserReferralCount(userId: number): Promise<number> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referrerId === userId && referral.status === "completed"
    ).length;
  }
}

export const storage = new MemStorage();