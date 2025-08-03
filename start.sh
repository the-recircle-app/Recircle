#!/bin/bash

# Production startup script with proper environment configuration
export NODE_ENV=production
export PORT=5000

# Set missing blockchain environment variables for deployment
export REWARD_DISTRIBUTOR_WALLET=${REWARD_DISTRIBUTOR_WALLET:-"0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee"}
export CREATOR_FUND_WALLET=${CREATOR_FUND_WALLET:-"0x87c844e3314396ca43e5a6065e418d26a09db02b"}
export APP_FUND_WALLET=${APP_FUND_WALLET:-"0x119761865b79bea9e7924edaa630942322ca09d1"}

# Set default blockchain configuration if not provided
export VECHAIN_PRIVATE_KEY=${VECHAIN_PRIVATE_KEY:-$DISTRIBUTOR_PRIVATE_KEY}
export VECHAIN_NETWORK=${VECHAIN_NETWORK:-"testnet"}

echo "Starting ReCircle production server..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Blockchain configured: $([ -n "$VECHAIN_PRIVATE_KEY" ] && echo "✅ Yes" || echo "⚠️ No")"

# Start the application
node dist/index.js