# Pierre's VeBetterDAO Template - Replit Adaptation

## What This Implements

This replicates Pierre's exact tutorial workflow from the VeChain x-app-template, adapted for Replit's environment.

### Pierre's Original Setup (Docker-based):
1. `yarn contracts:solo-up` - Starts VeChain Thor solo node in Docker
2. `yarn contracts:deploy:solo` - Deploys mock contracts to solo node
3. VeWorld connects to `http://localhost:8669` 
4. Real B3TR token distribution through VeBetterDAO contracts

### Our Replit Adaptation:
1. **Solo Node**: Node.js-based VeChain solo node (no Docker needed)
2. **Contract Deployment**: Deploys exact same contracts as Pierre's template
3. **VeBetterDAO Integration**: Uses proper X2EarnRewardsPool distribution
4. **VeWorld Compatible**: Works with VeWorld mobile app

## Setup Steps

### 1. Start Solo Node
```bash
node scripts/solo-node-simple.js
```

### 2. Deploy Pierre-Style Contracts
```bash
node scripts/pierre-style-solo-setup.js
```

This deploys:
- Mock B3TR Token (10M supply)
- X2EarnApps Mock Contract
- X2EarnRewardsPool Mock Contract  
- Registers "ReCircle" app
- Funds pool with 2,000 B3TR tokens

### 3. Configure VeWorld

**Add Custom Network:**
- Network Name: `Solo Node`
- RPC URL: `http://localhost:8669`
- Chain ID: `39`
- Symbol: `VET`

**Import Test Wallet:**
```
denial kitchen pet squirrel other broom bar gas better priority spoil cross
```

**Add B3TR Token:**
- Token Address: (from deployment output)
- Symbol: `B3TR`
- Decimals: `18`

### 4. Test Real B3TR Distribution

ReCircle will now distribute real B3TR tokens using Pierre's exact VeBetterDAO pattern:

```javascript
// Backend calls (exactly like Pierre's template)
await x2EarnRewardsPoolContract.distributeReward(appId, amount, userAddress, proof);
```

## Key Differences from Our Previous Approach

### ❌ Previous (Broken):
- No contract deployment
- Empty solo node
- Fake transaction hashes
- No VeBetterDAO integration

### ✅ Pierre-Style (Working):
- Complete contract ecosystem
- Real B3TR token on solo node
- Proper VeBetterDAO reward distribution
- VeWorld token visibility

## Expected Results

1. **VeWorld Connection**: Mobile app can connect to solo node
2. **B3TR Visibility**: Tokens appear in VeWorld wallet
3. **Real Transactions**: Actual blockchain transactions with hash verification
4. **Complete Testing**: Full VeBetterDAO experience without mainnet costs

This approach gives us the exact same functionality as Pierre's Docker-based template, adapted to work within Replit's constraints.