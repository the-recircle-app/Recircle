#!/usr/bin/env node

/**
 * Memory Monitor Script
 * Real-time memory usage monitoring for production environments
 */

function formatBytes(bytes) {
  return Math.round(bytes / 1024 / 1024) + 'MB';
}

function getMemoryStats() {
  const memUsage = process.memoryUsage();
  return {
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal,
    external: memUsage.external,
    rss: memUsage.rss,
    timestamp: new Date().toISOString()
  };
}

function logMemoryStats() {
  const stats = getMemoryStats();
  console.log(`[${stats.timestamp}] Memory - Heap: ${formatBytes(stats.heapUsed)}/${formatBytes(stats.heapTotal)} | RSS: ${formatBytes(stats.rss)} | External: ${formatBytes(stats.external)}`);
  
  // Warning thresholds
  const heapUsagePercent = (stats.heapUsed / stats.heapTotal) * 100;
  if (heapUsagePercent > 80) {
    console.warn(`[WARNING] High heap usage: ${heapUsagePercent.toFixed(1)}%`);
  }
  
  if (stats.rss > 2 * 1024 * 1024 * 1024) { // 2GB
    console.warn(`[WARNING] High RSS memory: ${formatBytes(stats.rss)}`);
  }
}

function startMonitoring(interval = 10000) {
  console.log(`[MONITOR] Starting memory monitoring (interval: ${interval}ms)`);
  logMemoryStats(); // Initial reading
  
  const monitor = setInterval(logMemoryStats, interval);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[MONITOR] Stopping memory monitoring');
    clearInterval(monitor);
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n[MONITOR] Stopping memory monitoring');
    clearInterval(monitor);
    process.exit(0);
  });
  
  return monitor;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const interval = process.argv[2] ? parseInt(process.argv[2]) : 10000;
  startMonitoring(interval);
}

export { startMonitoring, getMemoryStats, logMemoryStats };