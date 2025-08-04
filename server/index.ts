import express from "express";
import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";
import { setupSoloNodeRoutes } from "./solo-node";

const PORT = process.env.PORT || 5000;

// Enhanced memory optimization with MemoryManager integration
let memoryOptimizationEnabled = false;

// Initialize memory management
async function initializeMemoryOptimization() {
  try {
    const { MemoryManager } = await import("../memory-config.ts");
    
    console.log('Initializing memory optimization for', process.env.NODE_ENV || 'development');
    MemoryManager.configureEnvironment('runtime');
    MemoryManager.setupMemoryMonitoring(30000);
    memoryOptimizationEnabled = true;
    return true;
  } catch (error) {
    console.log('Using fallback memory optimization');
    
    // Set garbage collection frequency for development
    if (typeof global.gc === 'function') {
      setInterval(() => {
        global.gc!();
      }, 30000); // Run garbage collection every 30 seconds
      console.log('✅ Garbage collection enabled');
    } else {
      console.warn('❌ Garbage collection not available - restart with NODE_OPTIONS="--expose-gc"');
    }
    
    // Monitor memory usage with better thresholds for development
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const used = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
      const total = Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100;
      const percentage = Math.round((used / total) * 100);
      
      console.log(`[MEMORY] Heap: ${used}MB/${total}MB (${percentage}%)`);
      
      // Trigger garbage collection if memory usage is high (for development: 25MB or 80%)
      const threshold = process.env.NODE_ENV === 'production' ? 3000 : 25;
      const percentageThreshold = 80;
      
      if ((used > threshold || percentage > percentageThreshold) && typeof global.gc === 'function') {
        console.log(`[MEMORY] High usage detected (${percentage}%), triggering cleanup`);
        global.gc();
      }
    }, 30000); // Check every 30 seconds in development
  }
  return false;
}

// Process error handlers for graceful shutdown
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  gracefulShutdown('SIGINT');
});

let server: any;

function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}, starting graceful shutdown`);
  
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.log('Forcing shutdown');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

async function startServer() {
  // Initialize memory optimization first
  memoryOptimizationEnabled = await initializeMemoryOptimization();
  
  const app = express();
  
  // Memory-efficient express settings
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  
  server = await registerRoutes(app);
  
  // Setup integrated solo node routes ONLY in development
  if (process.env.NODE_ENV !== "production") {
    setupSoloNodeRoutes(app);
    console.log('[SOLO-NODE] Solo Node enabled for development environment');
  } else {
    console.log('[PRODUCTION] Solo Node disabled - using real VeChain testnet');
  }

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`ReCircle server running on port ${PORT}`);
    console.log(`Memory optimization enabled: ${memoryOptimizationEnabled || process.env.NODE_ENV === "production"}`);
    console.log(`Server bound to 0.0.0.0:${PORT} for external access`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});