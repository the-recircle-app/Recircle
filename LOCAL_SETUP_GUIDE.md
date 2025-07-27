# 🚀 Complete Local Setup: ReCircle with Real B3TR Distribution

This guide walks you through setting up the complete ReCircle system on your local machine with real B3TR token distribution visible in VeWorld.

## 📋 Prerequisites

- Node.js 18+ installed
- Chrome browser with VeWorld extension
- Git for cloning the repository
- PostgreSQL (or use the included database setup)

---

## 1️⃣ Clone and Setup the Repository

```bash
# Clone your ReCircle repository
git clone [your-repo-url] recircle-local
cd recircle-local

# Install dependencies
npm install
```

## 2️⃣ Environment Configuration

Create your local environment file:

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local  # or use your preferred editor
```

**Required `.env.local` configuration:**

```env
# Database (use your local PostgreSQL or Replit's remote)
DATABASE_URL=your-postgresql-connection-string

# OpenAI for receipt processing (get from OpenAI dashboard)
OPENAI_API_KEY=sk-your-openai-api-key

# Solo Node Configuration (these enable local B3TR distribution)
VITE_SOLO_MODE_ENABLED=true
SOLO_MODE_ENABLED=true
VITE_CHAIN_ID=39
VITE_RPC_URL=http://localhost:8669

# B3TR Contract (deployed by Solo node)
SOLO_B3TR_CONTRACT_ADDRESS=0x5ef79995fe8a89e0812330e4378eb2660cede699

# Pre-funded wallet addresses (from Solo node)
DISTRIBUTOR_PRIVATE_KEY=your-distributor-private-key
SOLO_DEPLOYER_ADDRESS=0x7567d83b7b8d80addcb281a71d54fc7b3364ffed
```

## 3️⃣ Database Setup

```bash
# Push database schema to your PostgreSQL
npm run db:push

# Verify database connection
node -e "console.log('Testing DB connection...'); process.exit(0);"
```

## 4️⃣ Start the Development Server

```bash
# Start the full-stack application
npm run dev
```

This command starts:
- Express.js backend on port 5000
- Vite React frontend (usually port 5173)
- **Integrated VeChain Solo Node on port 8669**
- PostgreSQL database connection

You should see output like:
```
[SOLO-NODE] 🚀 Setting up integrated VeChain Solo Node routes
[SOLO-NODE] 🪙 B3TR Token deployed at: 0x5ef79995fe8a89e0812330e4378eb2660cede699
[SOLO-NODE] 💰 Pre-funded accounts available
ReCircle server running on port 5000
```

## 5️⃣ Configure VeWorld Extension

### Add Solo Network to VeWorld:

1. **Open Chrome** → VeWorld extension → ⚙️ **Settings** → **Networks** → **+ Add Network**

2. **Fill in these exact values:**
   ```
   Network Name: VeChain Solo
   RPC URL: http://localhost:8669
   Chain Tag (Hex): 0x27
   ```

3. **Save** and select **"VeChain Solo"** as your active network

4. **Verify**: VeWorld should now show "VeChain Solo" in the network dropdown

### Add B3TR Token to VeWorld:

1. In VeWorld main view → **My Tokens** → **+ Add Token**

2. **Enter these exact values:**
   ```
   Token Address: 0x5ef79995fe8a89e0812330e4378eb2660cede699
   Symbol: B3TR
   Decimals: 18
   ```

3. **Confirm** the popup

4. **Result**: You should now see "B3TR 0.00" under My Tokens

## 6️⃣ Connect VeWorld to ReCircle

1. **Navigate to your local ReCircle:**
   ```
   http://localhost:5173  # (or the port shown in your terminal)
   ```

2. **Important**: Do NOT use any preview iframe - open this URL directly in Chrome

3. **Connect Wallet**: Click the wallet connect button in ReCircle

4. **VeWorld Popup**: Approve the connection when VeWorld prompts

5. **Verify**: ReCircle should show your connected wallet address

## 7️⃣ Test Real B3TR Distribution

### Option A: Use Solo Setup Page
1. Navigate to `http://localhost:5173/solo-setup`
2. Try the automatic setup buttons (may work if VeWorld APIs are available)
3. Use manual configuration if automatic fails

### Option B: Submit a Receipt
1. **Go to**: http://localhost:5173/scan
2. **Upload a transportation receipt** (Uber, Lyft, Metro, etc.)
3. **Wait ~10 seconds** for processing
4. **Check VeWorld**: Refresh "My Tokens" → B3TR balance should increase!

### Option C: Direct API Test
```bash
# Test the distribution endpoint directly
curl -X POST http://localhost:5000/api/test/vebetterdao \
  -H "Content-Type: application/json" \
  -d '{"recipient":"YOUR_WALLET_ADDRESS","amount":10}'
```

## 8️⃣ Verify Success

**✅ Successful Setup Indicators:**

1. **Backend Logs:**
   ```
   [SOLO-VEBETTERDAO] ✅ Successfully distributed X B3TR
   [SOLO-VEBETTERDAO] Transaction: 0x[transaction-hash]
   ```

2. **VeWorld Balance:**
   - B3TR token shows increased balance
   - Transaction appears in wallet history

3. **ReCircle Frontend:**
   - Receipt submissions show success messages
   - User balance increases in dashboard

## 🔧 Architecture Overview

**Your ReCircle System:**

```
Frontend (React + Vite) → Backend (Express.js) → Solo Node (port 8669)
     ↓                         ↓                      ↓
  User Interface          Receipt Processing     Real B3TR Contract
     ↓                         ↓                      ↓
  VeWorld Wallet ←───── Blockchain Transactions ←──────┘
```

**Key Components:**
- **Solo Node**: Integrated VeChain blockchain simulator
- **B3TR Contract**: Real smart contract deployed on Solo
- **VeBetterDAO Integration**: Authentic token distribution system
- **Receipt Processing**: AI validation + blockchain rewards

## 🛠️ Development Workflow

**Daily Development:**
```bash
# Start everything
npm run dev

# In another terminal - check Solo node status
curl http://localhost:8669/health

# Test B3TR balance
curl -X POST http://localhost:5000/api/test/balance \
  -H "Content-Type: application/json" \
  -d '{"address":"YOUR_WALLET_ADDRESS"}'
```

**Key URLs:**
- **ReCircle App**: http://localhost:5173
- **Solo Node**: http://localhost:8669
- **Backend API**: http://localhost:5000
- **Solo Setup**: http://localhost:5173/solo-setup

## 🚨 Troubleshooting

### "window.vechain.request is not a function"
- **Solution**: Make sure you're on localhost:5173 with VeWorld extension enabled, not in any iframe

### No B3TR Balance Change
- **Check**: Backend logs for transaction hashes
- **Verify**: Solo node is running on port 8669
- **Test**: `curl http://localhost:8669/accounts` should return pre-funded accounts

### Port Conflicts
- **Frontend**: Change port in vite.config.ts or use `--port` flag
- **Backend**: Modify server/index.ts to use different port
- **Solo Node**: Currently fixed at 8669 (integrated)

### Database Issues
- **Verify**: PostgreSQL connection in .env.local
- **Reset**: `npm run db:push` to refresh schema

## 🎯 Success Criteria

**You'll know it's working when:**

1. ✅ Solo node shows B3TR contract deployed
2. ✅ VeWorld connects to Solo network successfully  
3. ✅ B3TR token appears with 0.00 balance in VeWorld
4. ✅ Receipt submission increases B3TR balance in VeWorld
5. ✅ Backend logs show real transaction hashes
6. ✅ ReCircle dashboard reflects updated balances

## 📱 Production Deployment

**When ready for production:**
1. Replace Solo node with VeChain testnet/mainnet
2. Update environment variables for production endpoints
3. Configure real VeBetterDAO governance registration
4. Deploy to your preferred hosting platform

**The beauty of this setup:** Everything runs locally so VeWorld can inject `window.vechain` and you'll see real B3TR tokens on the Solo blockchain!

---

🎉 **Result**: Complete local development environment with real blockchain B3TR distribution visible in VeWorld wallets!