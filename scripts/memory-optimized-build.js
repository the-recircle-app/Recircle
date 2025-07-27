#!/usr/bin/env node

/**
 * Memory-Optimized Build Script for ReCircle Deployment
 * Handles JavaScript heap out of memory errors during build process
 * Uses official VeChain libraries with proper memory management
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';

function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

let memoryMonitor;

function startMemoryMonitoring() {
  memoryMonitor = setInterval(() => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);
    
    log(`Memory: Heap ${heapUsedMB}/${heapTotalMB}MB, RSS ${rssMB}MB`, 'MEMORY');
    
    // Trigger garbage collection if heap usage is high
    if (heapUsedMB > 6000 && global.gc) {
      log('Triggering garbage collection due to high memory usage', 'MEMORY');
      global.gc();
    }
  }, 10000);
}

function stopMemoryMonitoring() {
  if (memoryMonitor) {
    clearInterval(memoryMonitor);
    log('Memory monitoring stopped.', 'MEMORY');
  }
}

async function runViteBuild() {
  return new Promise((resolve, reject) => {
    log('Starting Vite build with memory optimization...');
    
    const viteBuild = spawn('npx', ['vite', 'build'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=8192 --optimize-for-size --gc-interval=100'
      }
    });
    
    viteBuild.on('close', (code) => {
      if (code === 0) {
        log('Vite build completed successfully');
        resolve();
      } else {
        reject(new Error(`Vite build failed with code ${code}`));
      }
    });
    
    viteBuild.on('error', (error) => {
      reject(error);
    });
  });
}

async function runESBuild() {
  return new Promise((resolve, reject) => {
    log('Starting ESBuild for server...');
    
    const esBuild = spawn('npx', [
      'esbuild', 
      'server/index.ts', 
      '--platform=node', 
      '--packages=external', 
      '--bundle', 
      '--format=esm', 
      '--outdir=dist'
    ], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });
    
    esBuild.on('close', (code) => {
      if (code === 0) {
        log('ESBuild completed successfully');
        resolve();
      } else {
        reject(new Error(`ESBuild failed with code ${code}`));
      }
    });
    
    esBuild.on('error', (error) => {
      reject(error);
    });
  });
}

async function buildWithMemoryOptimization() {
  try {
    log('Starting memory-optimized build process');
    
    // Start memory monitoring
    startMemoryMonitoring();
    
    // Force garbage collection if available
    if (global.gc) {
      log('Running initial garbage collection');
      global.gc();
    }
    
    // Run Vite build with memory optimization
    await runViteBuild();
    
    // Clean up memory before server build
    if (global.gc) {
      log('Running garbage collection between builds');
      global.gc();
    }
    
    // Run ESBuild for server
    await runESBuild();
    
    log('Build process completed successfully');
    
  } catch (error) {
    log(`Build failed: ${error.message}`, 'ERROR');
    process.exit(1);
  } finally {
    stopMemoryMonitoring();
  }
}

// Enable garbage collection
process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --expose-gc';

// Start the build process
buildWithMemoryOptimization();