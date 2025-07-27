# Complete Dummy-Proof ReCircle Setup Guide

## What You Currently Have
- ✅ Solo node running in Docker
- ✅ ReCircle project files downloaded from GitHub
- ✅ Environment file (.env.local) created

## Step-by-Step Instructions

### Step 1: Test Your Solo Node
```bash
# Open Windows PowerShell
# Navigate to your project folder
cd C:\Users\damia\Recircle

# Test the Solo node
node scripts/deploy-solo-contracts-SIMPLE.cjs
```

**What you should see:**
```
✅ Solo node is running!
📦 Current block: 123
💾 Config saved to solo-b3tr-address.json
```

### Step 2: Install Dependencies
```bash
# Still in PowerShell in C:\Users\damia\Recircle
npm install
```

### Step 3: Setup Database
```bash
# Create local database
npm run db:push
```

### Step 4: Start Backend Server
```bash
# Open FIRST PowerShell window
cd C:\Users\damia\Recircle
npm run dev:server
```

**What you should see:**
```
[SOLO-NODE] ✅ Solo Node integrated
ReCircle server running on port 5000
```

### Step 5: Start Frontend
```bash
# Open SECOND PowerShell window  
cd C:\Users\damia\Recircle
npm run dev:client
```

**What you should see:**
```
Local:   http://localhost:3000/
```

### Step 6: Test the App
1. Open web browser
2. Go to: http://localhost:3000
3. You should see the ReCircle app

### Step 7: Setup VeWorld Mobile App
1. Open VeWorld on your phone
2. Go to Settings → Networks
3. Add Custom Network:
   - **Name**: VeChain Solo
   - **Chain ID**: 39
   - **RPC URL**: http://192.168.1.XXX:8669 (replace XXX with your computer's IP)
   - **Symbol**: VET

### Step 8: Add B3TR Token to VeWorld
1. In VeWorld, go to "Tokens"
2. Click "Add Token"
3. Enter: `0x5ef79995FE8a89e0812330E4378eB2660ceDe699`
4. Symbol: B3TR
5. Decimals: 18

## How to Find Your Computer's IP Address
```bash
# In PowerShell
ipconfig | findstr "IPv4"
```
Use the number that looks like: 192.168.1.123

## What Each Terminal Does
- **Terminal 1 (Backend)**: Handles receipts, database, blockchain transactions
- **Terminal 2 (Frontend)**: Serves the website at localhost:3000
- **Solo Node (Docker)**: Acts as your local blockchain

## Testing the Complete Flow
1. Connect VeWorld to your app at localhost:3000
2. Upload a transportation receipt
3. See B3TR tokens appear in VeWorld

## Troubleshooting

### "Solo node error"
```bash
# Check if Solo node is running
docker ps | grep vechain-solo

# If not running, start it:
docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest solo --api-addr 0.0.0.0:8669
```

### "Cannot find module"
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
```bash
# Kill processes using the ports
npx kill-port 5000
npx kill-port 3000
```

### VeWorld Won't Connect
1. Make sure you're using your computer's IP (not localhost) in VeWorld
2. Check Windows Firewall allows port 8669
3. Try restarting the Solo node

## Success Indicators
✅ Solo node test passes
✅ Backend starts without errors  
✅ Frontend loads at localhost:3000
✅ VeWorld connects to Solo network
✅ Can upload receipts
✅ B3TR tokens appear in VeWorld

That's it! You now have a complete local ReCircle development environment with real blockchain functionality.