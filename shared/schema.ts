import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Type declaration to fix circular reference
type UsersTable = {
  id: number;
  username: string;
  password: string;
  walletAddress: string | null;
  tokenBalance: number;
  currentStreak: number;
  lastActivityDate: Date | null;
  referralCode: string | null;
  referredBy: number | null;
  isAdmin: boolean;
};

// Users table for authentication and profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").unique(),
  tokenBalance: doublePrecision("token_balance").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  lastActivityDate: timestamp("last_activity_date"),
  referralCode: text("referral_code").unique(), // Unique referral code for each user
  referredBy: integer("referred_by").references((): any => users.id), // User ID who referred this user
  isAdmin: boolean("is_admin").default(false).notNull(), // Admin status for accessing admin features
});

// Transportation services table to track verified sustainable transportation providers
export const sustainableStores = pgTable("sustainable_stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  storeType: text("store_type").notNull(),
  category: text("category").notNull().default("transportation"), // transportation, rideshare, public_transit, ev_rental
  verified: boolean("verified").default(false),
  addedBy: integer("added_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Receipt images table for fraud detection and manual review
export const receiptImages = pgTable("receipt_images", {
  id: serial("id").primaryKey(),
  receiptId: integer("receipt_id").references(() => receipts.id),
  imageData: text("image_data").notNull(), // Base64 encoded image data
  imageHash: text("image_hash").notNull().unique(), // SHA-256 hash for duplicate detection
  mimeType: text("mime_type").notNull(), // image/jpeg, image/png, etc.
  fileSize: integer("file_size").notNull(), // Size in bytes
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"), // When manual reviewer viewed this image
  reviewedBy: integer("reviewed_by").references(() => users.id), // Admin who reviewed
  fraudFlags: text("fraud_flags").array(), // Array of potential fraud indicators
});

// Receipts table to track verified purchases
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => sustainableStores.id),
  userId: integer("user_id").references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  imageUrl: text("image_url"), // Deprecated - use receiptImages table instead
  category: text("category").notNull().default("transportation"), // transportation, rideshare, public_transit, ev_rental
  verified: boolean("verified").default(false),
  tokenReward: doublePrecision("token_reward").notNull(),
  needsManualReview: boolean("needs_manual_review").default(false), // Flag to indicate if receipt needs manual review
  hasImage: boolean("has_image").default(false), // Indicates if receipt has associated image
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions table to track all B3tr token activities
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // receipt_verification, store_addition, token_redemption, referral_reward
  amount: doublePrecision("amount").notNull(), // positive for rewards, negative for spending
  description: text("description").notNull(),
  txHash: text("tx_hash"), // VeChain transaction hash
  referenceId: integer("reference_id"), // ID of the receipt, store, or referral if applicable
  createdAt: timestamp("created_at").defaultNow(),
});

// Referrals table to track user referrals
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),  // User who referred someone
  referredId: integer("referred_id").references(() => users.id).notNull(), // User who was referred
  code: text("code").notNull(), // The referral code that was used
  status: text("status").notNull().default("pending"), // pending, completed, rewarded
  completedAt: timestamp("completed_at"), // When referral was completed (first receipt scanned)
  rewardedAt: timestamp("rewarded_at"), // When referrer was rewarded
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, tokenBalance: true });

export const insertStoreSchema = createInsertSchema(sustainableStores)
  .omit({ id: true, verified: true, createdAt: true });

export const insertReceiptSchema = createInsertSchema(receipts)
  .omit({ id: true, verified: true, createdAt: true });

export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({ id: true, createdAt: true });

export const insertReferralSchema = createInsertSchema(referrals)
  .omit({ id: true, completedAt: true, rewardedAt: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof sustainableStores.$inferSelect;

export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type Receipt = typeof receipts.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Backward compatibility types (to ease transition)
// Quiz and quiz results tables
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correctOption: integer("correct_option").notNull(),
  explanation: text("explanation").notNull(),
  difficultyLevel: integer("difficulty_level").notNull().default(1),
  tokenReward: integer("token_reward").notNull().default(2),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
  correct: boolean("correct").notNull(),
  rewardAmount: integer("reward_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzes)
  .omit({ id: true, createdAt: true });

export const insertQuizResultSchema = createInsertSchema(quizResults)
  .omit({ id: true, createdAt: true });

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResults.$inferSelect;

// Type definitions for receipt images
export const insertReceiptImageSchema = createInsertSchema(receiptImages)
  .omit({ id: true, uploadedAt: true });

export type InsertReceiptImage = z.infer<typeof insertReceiptImageSchema>;
export type ReceiptImage = typeof receiptImages.$inferSelect;

export type ThriftStore = Store;
export type InsertThriftStore = InsertStore;
export const thriftStores = sustainableStores;

// Note: Database indexes will be added in a separate migration for production optimization
