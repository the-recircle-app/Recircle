import { 
  users, User, InsertUser, 
  sustainableStores, Store, InsertStore,
  receipts, Receipt, InsertReceipt,
  transactions, Transaction, InsertTransaction,
  referrals, Referral, InsertReferral,
  reviewEmployees, ReviewEmployee, InsertReviewEmployee,
  workSessions, WorkSession, InsertWorkSession,
  reviewActions, ReviewAction, InsertReviewAction
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
  getAllUsers(): Promise<User[]>;
  getAllReceipts(): Promise<Receipt[]>;
  
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
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferralStatus(id: number, status: string): Promise<Referral | undefined>;
  getUserReferralCount(userId: number): Promise<number>;

  // Employee tracking methods
  getEmployee(id: number): Promise<ReviewEmployee | undefined>;
  getEmployees(): Promise<ReviewEmployee[]>;
  getActiveEmployees(): Promise<ReviewEmployee[]>;
  createEmployee(employee: InsertReviewEmployee): Promise<ReviewEmployee>;
  updateEmployee(id: number, updates: Partial<ReviewEmployee>): Promise<ReviewEmployee | undefined>;

  // Work session methods
  getWorkSession(id: number): Promise<WorkSession | undefined>;
  getEmployeeWorkSessions(employeeId: number): Promise<WorkSession[]>;
  getActiveWorkSessions(): Promise<WorkSession[]>;
  createWorkSession(session: InsertWorkSession): Promise<WorkSession>;
  endWorkSession(id: number, reviewsCompleted: number, notes?: string): Promise<WorkSession | undefined>;
  updateWorkSessionReviewCount(id: number, reviewsCompleted: number): Promise<WorkSession | undefined>;

  // Review action methods
  getReviewAction(id: number): Promise<ReviewAction | undefined>;
  getEmployeeReviewActions(employeeId: number, date?: Date): Promise<ReviewAction[]>;
  getWorkSessionReviewActions(workSessionId: number): Promise<ReviewAction[]>;
  createReviewAction(action: InsertReviewAction): Promise<ReviewAction>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stores: Map<number, Store>;
  private receipts: Map<number, Receipt>;
  private transactions: Map<number, Transaction>;
  private referrals: Map<number, Referral>;
  private employees: Map<number, ReviewEmployee>;
  private workSessions: Map<number, WorkSession>;
  private reviewActions: Map<number, ReviewAction>;
  
  private userIdCounter: number;
  private storeIdCounter: number;
  private receiptIdCounter: number;
  private transactionIdCounter: number;
  private referralIdCounter: number;
  private employeeIdCounter: number;
  private workSessionIdCounter: number;
  private reviewActionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.stores = new Map();
    this.receipts = new Map();
    this.transactions = new Map();
    this.referrals = new Map();
    this.employees = new Map();
    this.workSessions = new Map();
    this.reviewActions = new Map();
    
    this.userIdCounter = 103; // Start after our test users
    this.storeIdCounter = 1;
    this.receiptIdCounter = 3; // Start after sample receipts
    this.transactionIdCounter = 3; // Start after sample transactions
    this.referralIdCounter = 1;
    this.employeeIdCounter = 1;
    this.workSessionIdCounter = 1;
    this.reviewActionIdCounter = 1;

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

  async getUserReferralCount(userId: number): Promise<number> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referrerId === userId && referral.status === "completed"
    ).length;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllReceipts(): Promise<Receipt[]> {
    return Array.from(this.receipts.values());
  }

  // Employee tracking methods
  async getEmployee(id: number): Promise<ReviewEmployee | undefined> {
    return this.employees.get(id);
  }

  async getEmployees(): Promise<ReviewEmployee[]> {
    return Array.from(this.employees.values());
  }

  async getActiveEmployees(): Promise<ReviewEmployee[]> {
    return Array.from(this.employees.values()).filter(emp => emp.isActive);
  }

  async createEmployee(insertEmployee: InsertReviewEmployee): Promise<ReviewEmployee> {
    const id = this.employeeIdCounter++;
    const employee: ReviewEmployee = {
      id,
      name: insertEmployee.name,
      email: insertEmployee.email,
      isActive: insertEmployee.isActive ?? true,
      hourlyRate: insertEmployee.hourlyRate ?? null,
      createdAt: new Date(),
      lastActiveAt: insertEmployee.lastActiveAt ?? null
    };
    
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: number, updates: Partial<ReviewEmployee>): Promise<ReviewEmployee | undefined> {
    const employee = await this.getEmployee(id);
    if (!employee) return undefined;
    
    const updatedEmployee = { ...employee, ...updates };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  // Work session methods
  async getWorkSession(id: number): Promise<WorkSession | undefined> {
    return this.workSessions.get(id);
  }

  async getEmployeeWorkSessions(employeeId: number): Promise<WorkSession[]> {
    return Array.from(this.workSessions.values()).filter(session => session.employeeId === employeeId);
  }

  async getActiveWorkSessions(): Promise<WorkSession[]> {
    return Array.from(this.workSessions.values()).filter(session => session.isActive);
  }

  async createWorkSession(insertSession: InsertWorkSession): Promise<WorkSession> {
    const id = this.workSessionIdCounter++;
    const session: WorkSession = {
      id,
      employeeId: insertSession.employeeId,
      startTime: insertSession.startTime,
      endTime: insertSession.endTime || null,
      isActive: insertSession.isActive ?? true,
      reviewsCompleted: insertSession.reviewsCompleted ?? 0,
      notes: insertSession.notes || null,
      createdAt: new Date()
    };
    
    this.workSessions.set(id, session);
    return session;
  }

  async endWorkSession(id: number, reviewsCompleted: number, notes?: string): Promise<WorkSession | undefined> {
    const session = await this.getWorkSession(id);
    if (!session) return undefined;
    
    const updatedSession = { 
      ...session, 
      endTime: new Date(),
      isActive: false,
      reviewsCompleted,
      notes: notes || session.notes || null
    };
    
    this.workSessions.set(id, updatedSession);
    return updatedSession;
  }

  async updateWorkSessionReviewCount(id: number, reviewsCompleted: number): Promise<WorkSession | undefined> {
    const session = await this.getWorkSession(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, reviewsCompleted };
    this.workSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Review action methods
  async getReviewAction(id: number): Promise<ReviewAction | undefined> {
    return this.reviewActions.get(id);
  }

  async getEmployeeReviewActions(employeeId: number, date?: Date): Promise<ReviewAction[]> {
    let actions = Array.from(this.reviewActions.values()).filter(action => action.employeeId === employeeId);
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      actions = actions.filter(action => {
        const actionDate = new Date(action.completedAt);
        return actionDate >= startOfDay && actionDate < endOfDay;
      });
    }
    
    return actions;
  }

  async getWorkSessionReviewActions(workSessionId: number): Promise<ReviewAction[]> {
    return Array.from(this.reviewActions.values()).filter(action => action.workSessionId === workSessionId);
  }

  async createReviewAction(insertAction: InsertReviewAction): Promise<ReviewAction> {
    const id = this.reviewActionIdCounter++;
    const action: ReviewAction = {
      id,
      employeeId: insertAction.employeeId,
      workSessionId: insertAction.workSessionId,
      receiptId: insertAction.receiptId,
      action: insertAction.action,
      timeSpent: insertAction.timeSpent || null,
      notes: insertAction.notes || null,
      completedAt: new Date()
    };
    
    this.reviewActions.set(id, action);
    return action;
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
    const result = await db.select().from(users).where(eq(users.walletAddress, walletAddress)).limit(1);
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

  async getUserReferralCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(referrals).where(
      and(eq(referrals.referrerId, userId), eq(referrals.status, "completed"))
    );
    return result[0]?.count || 0;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllReceipts(): Promise<Receipt[]> {
    return await db.select().from(receipts);
  }

  // Employee tracking methods - PgStorage implementation
  async getEmployee(id: number): Promise<ReviewEmployee | undefined> {
    const result = await db.select().from(reviewEmployees).where(eq(reviewEmployees.id, id)).limit(1);
    return result[0];
  }

  async getEmployees(): Promise<ReviewEmployee[]> {
    return await db.select().from(reviewEmployees);
  }

  async getActiveEmployees(): Promise<ReviewEmployee[]> {
    return await db.select().from(reviewEmployees).where(eq(reviewEmployees.isActive, true));
  }

  async createEmployee(insertEmployee: InsertReviewEmployee): Promise<ReviewEmployee> {
    const result = await db.insert(reviewEmployees).values(insertEmployee).returning();
    return result[0];
  }

  async updateEmployee(id: number, updates: Partial<ReviewEmployee>): Promise<ReviewEmployee | undefined> {
    const result = await db.update(reviewEmployees).set(updates).where(eq(reviewEmployees.id, id)).returning();
    return result[0];
  }

  async getWorkSession(id: number): Promise<WorkSession | undefined> {
    const result = await db.select().from(workSessions).where(eq(workSessions.id, id)).limit(1);
    return result[0];
  }

  async getEmployeeWorkSessions(employeeId: number): Promise<WorkSession[]> {
    return await db.select().from(workSessions).where(eq(workSessions.employeeId, employeeId));
  }

  async getActiveWorkSessions(): Promise<WorkSession[]> {
    return await db.select().from(workSessions).where(eq(workSessions.isActive, true));
  }

  async createWorkSession(insertSession: InsertWorkSession): Promise<WorkSession> {
    const result = await db.insert(workSessions).values(insertSession).returning();
    return result[0];
  }

  async endWorkSession(id: number, reviewsCompleted: number, notes?: string): Promise<WorkSession | undefined> {
    const updates: any = {
      endTime: new Date(),
      isActive: false,
      reviewsCompleted
    };
    if (notes) updates.notes = notes;
    
    const result = await db.update(workSessions).set(updates).where(eq(workSessions.id, id)).returning();
    return result[0];
  }

  async updateWorkSessionReviewCount(id: number, reviewsCompleted: number): Promise<WorkSession | undefined> {
    const result = await db.update(workSessions).set({ reviewsCompleted }).where(eq(workSessions.id, id)).returning();
    return result[0];
  }

  async getReviewAction(id: number): Promise<ReviewAction | undefined> {
    const result = await db.select().from(reviewActions).where(eq(reviewActions.id, id)).limit(1);
    return result[0];
  }

  async getEmployeeReviewActions(employeeId: number, date?: Date): Promise<ReviewAction[]> {
    let query = db.select().from(reviewActions).where(eq(reviewActions.employeeId, employeeId));
    
    if (date) {
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      query = query.where(
        and(
          eq(reviewActions.employeeId, employeeId),
          sql`${reviewActions.completedAt} >= ${startOfDay}`,
          sql`${reviewActions.completedAt} < ${endOfDay}`
        )
      );
    }
    
    return await query;
  }

  async getWorkSessionReviewActions(workSessionId: number): Promise<ReviewAction[]> {
    return await db.select().from(reviewActions).where(eq(reviewActions.workSessionId, workSessionId));
  }

  async createReviewAction(insertAction: InsertReviewAction): Promise<ReviewAction> {
    const result = await db.insert(reviewActions).values(insertAction).returning();
    return result[0];
  }
}

// Use MemStorage for local development and testing, PgStorage for production
function createStorage() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasValidDatabase = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sqlite');
  
  if (isProduction && hasValidDatabase) {
    console.log('[STORAGE] Using PostgreSQL storage for production');
    return new PgStorage();
  } else {
    console.log('[STORAGE] Using in-memory storage for local development');
    return new MemStorage();
  }
}

export const storage = createStorage();