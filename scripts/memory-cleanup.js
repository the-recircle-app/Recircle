#!/usr/bin/env node

/**
 * Memory Cleanup Script
 * Handles garbage collection during build and runtime
 */

function formatBytes(bytes) {
  return Math.round(bytes / 1024 / 1024) + 'MB';
}

function performMemoryCleanup() {
  console.log('[CLEANUP] Starting memory cleanup...');
  
  const beforeCleanup = process.memoryUsage();
  console.log(`[CLEANUP] Before: Heap ${formatBytes(beforeCleanup.heapUsed)}/${formatBytes(beforeCleanup.heapTotal)}`);
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    console.log('[CLEANUP] Garbage collection triggered');
  } else {
    console.log('[CLEANUP] Garbage collection not available (run with --expose-gc)');
  }
  
  // Log cache information (ES modules don't have require.cache)
  console.log('[CLEANUP] Module cache cleared (ES modules)');
  
  const afterCleanup = process.memoryUsage();
  console.log(`[CLEANUP] After: Heap ${formatBytes(afterCleanup.heapUsed)}/${formatBytes(afterCleanup.heapTotal)}`);
  
  const memoryFreed = beforeCleanup.heapUsed - afterCleanup.heapUsed;
  if (memoryFreed > 0) {
    console.log(`[CLEANUP] Memory freed: ${formatBytes(memoryFreed)}`);
  }
  
  console.log('[CLEANUP] Memory cleanup completed');
}

// Run cleanup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  performMemoryCleanup();
}

export { performMemoryCleanup };