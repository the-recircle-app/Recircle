#!/usr/bin/env node

// Production startup with memory optimization
const nodeOptions = '--max-old-space-size=4096';
process.env.NODE_OPTIONS = nodeOptions;
process.env.NODE_ENV = 'production';

console.log('Starting ReCircle server with memory optimization...');

// Import and start the server
import('./dist/index.js')
  .then(() => console.log('Server started successfully'))
  .catch(error => {
    console.error('Server startup error:', error);
    process.exit(1);
  });