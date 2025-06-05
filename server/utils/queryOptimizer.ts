/**
 * Query Optimizer for Autoscale Deployment
 * Implements caching and query optimizations for high-traffic scenarios
 */

import { eq, and, desc } from "drizzle-orm";

// Simple in-memory cache for frequently accessed data
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean expired entries every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  shutdown(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

export const queryCache = new QueryCache();

// Optimized query builders for common operations
export const optimizedQueries = {
  
  // User queries with caching
  getUserWithCache: (db: any, id: number) => {
    const cacheKey = `user:${id}`;
    const cached = queryCache.get(cacheKey);
    if (cached) return Promise.resolve(cached);

    return db.select().from(users).where(eq(users.id, id)).then((result: any) => {
      const user = result[0];
      if (user) queryCache.set(cacheKey, user, 300); // 5 minute cache
      return user;
    });
  },

  // Receipt queries optimized for pagination
  getUserReceiptsOptimized: (db: any, userId: number, limit: number = 50) => {
    return db
      .select()
      .from(receipts)
      .where(eq(receipts.userId, userId))
      .orderBy(desc(receipts.createdAt))
      .limit(limit);
  },

  // Transaction queries with type filtering
  getUserTransactionsOptimized: (db: any, userId: number, type?: string) => {
    const baseQuery = db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(100);

    if (type) {
      return baseQuery.where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, type)
      ));
    }

    return baseQuery;
  },

  // Store queries with location optimization
  getStoresByTypeOptimized: (db: any, storeType: string) => {
    const cacheKey = `stores:${storeType}`;
    const cached = queryCache.get(cacheKey);
    if (cached) return Promise.resolve(cached);

    return db
      .select()
      .from(sustainableStores)
      .where(and(
        eq(sustainableStores.storeType, storeType),
        eq(sustainableStores.verified, true)
      ))
      .then((result: any) => {
        queryCache.set(cacheKey, result, 600); // 10 minute cache for stores
        return result;
      });
  }
};

// Query performance monitoring
export const queryMetrics = {
  queries: new Map<string, { count: number; totalTime: number }>(),

  recordQuery: (queryName: string, executionTime: number) => {
    const existing = queryMetrics.queries.get(queryName) || { count: 0, totalTime: 0 };
    queryMetrics.queries.set(queryName, {
      count: existing.count + 1,
      totalTime: existing.totalTime + executionTime
    });
  },

  getMetrics: () => {
    const metrics: any = {};
    for (const [name, data] of queryMetrics.queries.entries()) {
      metrics[name] = {
        count: data.count,
        averageTime: data.totalTime / data.count,
        totalTime: data.totalTime
      };
    }
    return metrics;
  }
};

// Batch operation utilities for high-traffic scenarios
export const batchOperations = {
  
  // Batch user balance updates
  updateMultipleBalances: async (db: any, updates: Array<{ userId: number; newBalance: number }>) => {
    const promises = updates.map(update => 
      db.update(users)
        .set({ tokenBalance: update.newBalance })
        .where(eq(users.id, update.userId))
    );
    
    return Promise.all(promises);
  },

  // Batch transaction creation
  createMultipleTransactions: async (db: any, transactions: any[]) => {
    return db.insert(transactions).values(transactions).returning();
  }
};