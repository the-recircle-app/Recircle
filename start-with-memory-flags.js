#!/usr/bin/env node

/**
 * Development Server Starter with Memory Optimization
 * This script starts the development server with proper Node.js memory flags
 */

const { spawn } = require('child_process');

console.log('🚀 Starting ReCircle development server with memory optimization...\n');

// Set proper Node.js flags for development
const nodeOptions = [
  '--expose-gc',              // Enable garbage collection
  '--max-old-space-size=4096', // Set max heap size to 4GB
  '--max-semi-space-size=128'  // Optimize for development
].join(' ');

// Start the development server with enhanced memory flags
const child = spawn('node', ['--loader', 'tsx/esm', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    NODE_OPTIONS: nodeOptions
  }
});

child.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`\n⏹️ Server stopped with exit code: ${code}`);
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating development server...');
  child.kill('SIGTERM');
});