import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: any = null;
let db: any = null;

if (!process.env.DATABASE_URL) {
  console.log('[DB] No DATABASE_URL found - using in-memory storage fallback');
  // Create minimal fallback exports
  pool = null;
  db = null;
} else {
  // Optimized connection pool for autoscale deployment
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum connections per instance
    min: 2,  // Minimum connections to maintain
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // 5s timeout for new connections
  });

  db = drizzle({ client: pool, schema });
}

export { pool, db };
