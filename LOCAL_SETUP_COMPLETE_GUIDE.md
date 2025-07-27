# Complete Local Setup Guide - ReCircle + Solo Node

## Overview
Run both your Solo node AND ReCircle on your computer for real blockchain integration.

## Step 1: Download ReCircle to Your Computer

1. **Download the entire project from Replit**
   - Go to the file manager in Replit
   - Select all files and download as ZIP
   - Extract to a folder like `C:\ReCircle\`

2. **Install Node.js dependencies**
   ```cmd
   cd C:\ReCircle
   npm install
   ```

## Step 2: Configure for Local Development

1. **Copy the local environment file**
   ```cmd
   copy .env.local .env
   ```

2. **Update .env for your computer**
   ```
   # Solo Node Configuration (your localhost)
   VITE_SOLO_MODE_ENABLED=true
   SOLO_MODE_ENABLED=true
   VITE_CHAIN_ID=39
   VITE_RPC_URL=http://localhost:8669
   VITE_SOLO_NETWORK_URL=http://localhost:8669
   
   # Database (local SQLite)
   DATABASE_URL=sqlite:./local-recircle.db
   
   # Development Settings
   NODE_ENV=development
   PORT=3000
   CORS_ORIGIN=http://localhost:3000
   ```

## Step 3: Deploy B3TR to Your Solo Node

1. **Run the deployment script**
   ```cmd
   node scripts/deploy-solo-contracts.cjs
   ```

2. **Update .env with the deployed contract address**
   ```
   SOLO_B3TR_CONTRACT_ADDRESS=0x[new-contract-address]
   ```

## Step 4: Start ReCircle Locally

```cmd
npm run dev
```

**Access Points:**
- ReCircle App: http://localhost:3000
- Solo Node API: http://localhost:8669
- VeWorld connects to: localhost:8669

## Step 5: Test Complete Flow

1. **Connect VeWorld to Solo Network:**
   - Network: Solo Node
   - RPC URL: http://localhost:8669
   - Chain ID: 39

2. **Submit a receipt in ReCircle**
3. **Check VeWorld wallet for B3TR tokens**

## Result
Real blockchain transactions between your local ReCircle app and Solo node!