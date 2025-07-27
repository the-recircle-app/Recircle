#!/bin/bash

echo "🚀 Starting ReCircle development server with memory optimization..."

# Export Node.js flags for memory optimization
export NODE_OPTIONS="--expose-gc --max-old-space-size=4096 --max-semi-space-size=128"
export NODE_ENV="development"

echo "NODE_OPTIONS: $NODE_OPTIONS"
echo "NODE_ENV: $NODE_ENV"

# Start the development server
exec npx tsx server/index.ts