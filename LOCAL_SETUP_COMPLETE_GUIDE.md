# Complete Local ReCircle Setup Guide

## Overview
This guide sets up the full ReCircle application on your local Windows machine with:
- VeChain Solo node (running in Docker)
- ReCircle backend server
- ReCircle frontend
- Real B3TR token distribution
- VeWorld wallet integration

## Prerequisites
- Docker Desktop installed and running
- Node.js 18+ installed
- Git installed
- VeWorld mobile app

## Step 1: Solo Node Setup (Already Done!)

Your Solo node is already running correctly. Verify with:
```bash
docker ps
# Should show vechain-solo container running on port 8669
```

## Step 2: ReCircle Project Setup

### Clone and Install
```bash
cd C:\Users\damia\Recircle
npm install
```

### Environment Configuration
Create `.env.local` file:
```env
# Solo Node Configuration
VITE_SOLO_MODE_ENABLED=true
SOLO_MODE_ENABLED=true
VITE_CHAIN_ID=39
VITE_RPC_URL=http://localhost:8669
VITE_SOLO_NETWORK_URL=http://localhost:8669

# B3TR Contract (Pre-deployed in Solo system)
SOLO_B3TR_CONTRACT_ADDRESS=0x5ef79995FE8a89e0812330E4378eB2660ceDe699

# Wallet Configuration
SOLO_DEPLOYER_ADDRESS=0x7567d83b7b8d80addcb281a71d54fc7b3364ffed
SOLO_PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113b37a7c0f456fca3fcfd623a6
DISTRIBUTOR_PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113b37a7c0f456fca3fcfd623a6

# Database (Use local file)
DATABASE_URL=sqlite:./local-recircle.db

# OpenAI (Optional - for receipt processing)
OPENAI_API_KEY=your_openai_key_here
```

## Step 3: Database Setup
```bash
# Initialize local database
npm run db:push
```

## Step 4: Start Backend Server
```bash
# Terminal 1 - Backend
npm run dev:server
```

You should see:
```
[SOLO-NODE] ✅ Solo Node integrated into Express server
[SOLO-NODE] 🪙 B3TR Token deployed at: 0x5ef79995fe8a89e0812330e4378eb2660cede699
ReCircle server running on port 5000
```

## Step 5: Start Frontend Development Server
```bash
# Terminal 2 - Frontend
npm run dev:client
```

Frontend will be available at: `http://localhost:3000`

## Step 6: VeWorld Wallet Setup

### Add Solo Network to VeWorld:
1. Open VeWorld mobile app
2. Go to Settings → Networks
3. Add Custom Network:
   - **Network Name**: VeChain Solo
   - **Chain ID**: 39
   - **RPC URL**: http://YOUR_LOCAL_IP:8669
   - **Symbol**: VET
   - **Block Explorer**: (leave empty)

### Find Your Local IP:
```bash
# Windows PowerShell
ipconfig | findstr "IPv4"
# Use the IP address (e.g., 192.168.1.100)
```

### Add B3TR Token to VeWorld:
1. In VeWorld, go to "Tokens"
2. Click "Add Token"
3. Enter contract address: `0x5ef79995FE8a89e0812330E4378eB2660ceDe699`
4. Symbol: B3TR
5. Decimals: 18

## Step 7: Test the Complete Flow

### Test Solo Node Connection:
```bash
# Test script
node scripts/deploy-solo-contracts.cjs
```

Should output:
```
✅ Solo node is running!
📦 Current block: 245
🎯 Your Solo network is ready!
```

### Test ReCircle App:
1. Open `http://localhost:3000` in browser
2. Connect VeWorld wallet
3. Upload a transportation receipt
4. Check B3TR tokens appear in VeWorld

## Step 8: Full Development Workflow

### Backend Development:
```bash
# Watch backend changes
npm run dev:server

# View logs
# Backend logs show in terminal
```

### Frontend Development:
```bash
# Watch frontend changes  
npm run dev:client

# Frontend auto-reloads at localhost:3000
```

### Database Management:
```bash
# Reset database
rm local-recircle.db
npm run db:push

# View database
# Use SQLite browser or VS Code extension
```

## Troubleshooting

### Solo Node Issues:
```bash
# Restart Solo node
docker stop vechain-solo
docker rm vechain-solo
docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest solo --api-addr 0.0.0.0:8669

# Check logs
docker logs vechain-solo
```

### VeWorld Connection Issues:
1. Ensure your local IP is correct in VeWorld RPC URL
2. Try `http://localhost:8669` if on same machine
3. Check Windows Firewall allows port 8669

### Backend Issues:
```bash
# Clear cache and restart
rm -rf node_modules package-lock.json
npm install
npm run dev:server
```

### Frontend Issues:
```bash
# Clear Vite cache
rm -rf .vite
npm run dev:client
```

## Production Deployment Notes

When ready for production:
1. Change environment variables to use real VeChain testnet/mainnet
2. Use proper PostgreSQL database
3. Set production domain in CORS settings
4. Use real VeBetterDAO contracts

## File Structure
```
C:\Users\damia\Recircle\
├── .env.local              # Local environment config
├── local-recircle.db       # Local SQLite database
├── solo-b3tr-address.json  # Solo deployment config
├── scripts/
│   └── deploy-solo-contracts.cjs  # Solo node test script
├── server/                 # Backend code
├── client/                 # Frontend code
└── shared/                 # Shared types and schemas
```

## Success Indicators

✅ Solo node running (Docker container active)
✅ Backend server starts without errors
✅ Frontend loads at localhost:3000
✅ VeWorld connects to Solo network
✅ B3TR tokens visible in VeWorld
✅ Receipt upload creates real blockchain transactions
✅ User balance updates in both app and VeWorld

This setup gives you a complete local development environment with real blockchain functionality!