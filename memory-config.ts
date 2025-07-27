/**
 * Memory Configuration and Cleanup Utility
 * Provides memory optimization functions for build and runtime
 */

interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
}

export class MemoryManager {
  private memoryStats: MemoryStats;
  
  constructor() {
    this.memoryStats = MemoryManager.getMemoryStats();
  }
  
  /**
   * Trigger manual garbage collection
   */
  static forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
      console.log('[MEMORY] Garbage collection triggered');
    } else {
      console.warn('[MEMORY] Garbage collection not available - add --expose-gc flag');
    }
  }
  
  /**
   * Monitor and log memory usage
   */
  static getMemoryStats(): MemoryStats {
    const usage = process.memoryUsage();
    const stats: MemoryStats = {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024)
    };
    
    const percentage = Math.round((stats.heapUsed / stats.heapTotal) * 100);
    console.log(`[MEMORY] Heap: ${stats.heapUsed}MB/${stats.heapTotal}MB (${percentage}%) | RSS: ${stats.rss}MB`);
    return stats;
  }
  
  /**
   * Setup memory monitoring with automatic cleanup
   */
  static setupMemoryMonitoring(interval: number = 30000): NodeJS.Timeout {
    // Check if garbage collection is available at startup
    if (!global.gc) {
      console.warn('[MEMORY] ⚠️  Garbage collection not available - memory monitoring disabled');
      console.warn('[MEMORY] To enable: restart with NODE_OPTIONS="--expose-gc"');
      return setInterval(() => {}, interval); // Return dummy interval to avoid errors
    }
    
    console.log('[MEMORY] ✅ Memory monitoring enabled with garbage collection');
    
    return setInterval(() => {
      const stats = MemoryManager.getMemoryStats();
      
      // Trigger GC if heap usage is above 80%
      const heapUsagePercent = (stats.heapUsed / stats.heapTotal) * 100;
      if (heapUsagePercent > 80) {
        console.log(`[MEMORY] High heap usage detected: ${heapUsagePercent.toFixed(1)}%`);
        if (global.gc) {
          global.gc();
          console.log('[MEMORY] Garbage collection triggered');
        }
      }
    }, interval);
  }
  
  /**
   * Get optimized Node.js flags for different scenarios
   */
  static getNodeFlags(scenario: 'build' | 'runtime' = 'runtime'): string[] {
    const baseFlags = ['--expose-gc'];
    
    if (scenario === 'build') {
      return [
        ...baseFlags,
        '--max-old-space-size=8192',
        '--max-semi-space-size=256',
        '--max-old-space-size=8192'
      ];
    } else {
      return [
        ...baseFlags,
        '--max-old-space-size=4096',
        '--max-semi-space-size=128'
      ];
    }
  }
  
  /**
   * Clean up system memory before build
   */
  static async cleanupBeforeBuild(): Promise<void> {
    console.log('[MEMORY] Starting pre-build cleanup');
    
    // Force garbage collection multiple times
    for (let i = 0; i < 3; i++) {
      MemoryManager.forceGarbageCollection();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    MemoryManager.getMemoryStats();
    console.log('[MEMORY] Pre-build cleanup completed');
  }
  
  /**
   * Configure environment variables for memory optimization
   */
  static configureEnvironment(scenario: 'build' | 'runtime' = 'runtime'): void {
    const flags = MemoryManager.getNodeFlags(scenario);
    
    process.env.NODE_OPTIONS = flags.join(' ');
    process.env.UV_THREADPOOL_SIZE = scenario === 'build' ? '128' : '64';
    
    console.log(`[MEMORY] Environment configured for ${scenario}:`);
    console.log(`[MEMORY] NODE_OPTIONS: ${process.env.NODE_OPTIONS}`);
    console.log(`[MEMORY] UV_THREADPOOL_SIZE: ${process.env.UV_THREADPOOL_SIZE}`);
  }
}