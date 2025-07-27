/**
 * Memory Optimization Fix Script
 * Enables garbage collection and memory monitoring for development
 */

// Enable memory monitoring immediately
import { MemoryManager } from './memory-config.js';

console.log("🔧 FIXING MEMORY OPTIMIZATION...\n");

// Configure environment for runtime
MemoryManager.configureEnvironment('runtime');

// Start memory monitoring
console.log("📊 Starting memory monitoring...");
const monitoring = MemoryManager.setupMemoryMonitoring(30000);

// Get initial memory stats
console.log("💾 Initial memory stats:");
MemoryManager.getMemoryStats();

// Test garbage collection
console.log("\n🗑️ Testing garbage collection:");
MemoryManager.forceGarbageCollection();

console.log("\n✅ Memory optimization enabled!");
console.log("The development server should now properly manage memory usage.");
console.log("Monitoring will log stats every 30 seconds and trigger cleanup when needed.\n");

// Keep the process alive for monitoring
console.log("Press Ctrl+C to stop monitoring...");
process.on('SIGINT', () => {
  console.log("\n⏹️ Stopping memory monitoring...");
  clearInterval(monitoring);
  process.exit(0);
});