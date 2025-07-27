# VeBetterDAO App Registration Guide

## Issue Identified
ReCircle is executing blockchain transactions successfully, but tokens aren't appearing in VeWorld because the app is not properly registered in the VeBetterDAO ecosystem.

## Required Steps for Token Distribution

### 1. Register App in VeBetterDAO Testnet
- **URL**: https://dev.testnet.governance.vebetterdao.org/
- **Action**: Connect wallet and register "ReCircle" as an X2Earn app
- **Result**: Get proper APP_ID and register in X2EarnApps contract

### 2. Claim Test B3TR Tokens  
- **Faucet**: Available on testnet dashboard (2.9831M B3TR available)
- **Amount**: Claim sufficient B3TR for testing (suggest 10,000+ B3TR)
- **Purpose**: Fund the app balance for token distribution

### 3. Deposit B3TR to App Balance
- **Location**: App management page in governance dashboard
- **Action**: Click "Deposit" in app balance section  
- **Amount**: Transfer claimed B3TR to app for distribution

### 4. Add Reward Distributor Address
- **Location**: App settings (cogs icon) in governance dashboard
- **Address**: 0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee
- **Purpose**: Authorize our wallet to distribute rewards

## Current Configuration
```
APP_ID: 0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1
DISTRIBUTOR_WALLET: 0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee  
X2EARN_APPS: 0xcB23Eb1bBD5c07553795b9538b1061D0f4ABA153
X2EARN_REWARDS_POOL: 0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38
```

## Why Tokens Aren't Appearing in VeWorld
1. **No App Registration**: ReCircle may not be registered in X2EarnApps contract
2. **No Funding**: App balance may be 0 B3TR (cannot distribute what doesn't exist)
3. **Unauthorized Distributor**: Our wallet may not be authorized to distribute rewards
4. **Contract Rejection**: VeBetterDAO contracts reject calls from unregistered apps

## Next Steps
1. **Visit Testnet Dashboard**: https://dev.testnet.governance.vebetterdao.org/
2. **Connect VeWorld Wallet**: Use the same wallet address (0x87c844e3314396ca43e5a6065e418d26a09db02b)
3. **Register ReCircle App**: Follow the X2Earn app submission process
4. **Fund and Configure**: Complete the setup to enable real token distribution

## Expected Result
After proper registration:
- Users receive B3TR tokens directly in VeWorld (no redeem button needed)
- Transactions are recognized by VeChain explorer
- App appears in VeBetterDAO governance allocation rounds
- Real sustainability rewards ecosystem operational

## Testing After Registration
```bash
# Test immediate token distribution
curl -X POST http://localhost:5000/api/test-direct-vebetterdao-distribution \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x87c844e3314396ca43e5a6065e418d26a09db02b", "amount": 5.0}'
```

This will resolve the core issue where blockchain transactions execute but tokens don't reach VeWorld wallets.