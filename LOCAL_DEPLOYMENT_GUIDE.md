# Deploy B3TR to Your Local Solo Node

## What You Need to Do (On Your Computer)

Your Solo node is running perfectly at localhost:8669. Now you need to deploy B3TR tokens to it so ReCircle can distribute real tokens.

## Steps:

**1. Download the deployment script from Replit to your computer**
- Copy the content of `scripts/deploy-solo-contracts.cjs` to your computer
- Save it as `deploy-solo-contracts.cjs`

**2. Install dependencies (if needed)**
```cmd
npm install ethers
```

**3. Run the deployment**
```cmd
node deploy-solo-contracts.cjs
```

## What Will Happen:
- Script connects to your Solo node at localhost:8669
- Uses the Solo node's mnemonic to create a deployer wallet
- Deploys B3TR token contract to your Solo blockchain
- Saves deployment info to `solo-deployment.json`

## Expected Output:
```
🚀 Connecting to VeChain Solo Node...
✅ Solo node connected. Best block: 15
👤 Deployer address: 0x...
💰 Deployer balance: 1000000 VET
🏗️  Deploying B3TR Token contract...
✅ B3TR Token deployed successfully!
   Contract Address: 0x...
   Total Supply: 1,000,000 B3TR
```

## Then Update ReCircle:
After successful deployment, update your ReCircle .env.local with the new contract address.

This approach ensures everything runs on your local machine where the Solo node is actually running!