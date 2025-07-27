# VeChain Solo Node Testing Guide

## Quick Start

### 1. Start Solo Node
```bash
node scripts/solo-node-simple.js
```

### 2. Verify Solo Node Running
```bash
curl http://localhost:8669/status
```

### 3. Test Fake B3TR Distribution
```bash
node test-solo-distribution.js
```

## What the Solo Node Provides

### Safe Testing Environment
- **Isolated Network**: No connection to real VeChain testnet/mainnet
- **Unlimited Resources**: Fake VET, VTHO, and B3TR tokens for testing
- **Real API Responses**: Authentic VeChain blockchain API simulation
- **No Financial Risk**: Zero real money involved in testing

### Pre-funded Accounts
```javascript
// Admin Account
Address: 0x7567d83b7b8d80addcb281a71d54fc7b3364ffed
Private Key: 0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36
Balance: 25,000,000 VET + 5,000,000 VTHO

// Distributor Account  
Address: 0xd3ae78222beadb038203be21ed5ce7c9b1bff602
Private Key: 0x7f9290af603f8ce9c391b88222e6eff75db6c60ff07e1f0b2d34d1c6b85c936e
Balance: 25,000,000 VET + 5,000,000 VTHO
```

### Available Endpoints
- `GET /status` - Solo node status
- `GET /blocks/best` - Latest block info  
- `GET /accounts/:address` - Account balance
- `POST /transactions` - Send transaction
- `GET /transactions/:id/receipt` - Transaction receipt

## Integration with ReCircle

### Automatic Detection
Your ReCircle app automatically detects when solo node is running and switches to safe testing mode.

### Testing Workflow
1. Start solo node: `node scripts/solo-node-simple.js`
2. Solo node runs on http://localhost:8669
3. Submit transportation receipts in ReCircle
4. Watch fake B3TR tokens distribute safely
5. Verify transaction receipts and balances

### Environment Variables for Solo Testing
```bash
VECHAIN_NETWORK=solo
VECHAIN_RPC_URL=http://localhost:8669
TEST_MODE=true
```

## Benefits Over VeBetterDAO Testnet

### Why Solo Node is Better
- **Always Available**: No dependency on external testnet infrastructure  
- **Faster Testing**: Instant transaction confirmation
- **Unlimited Tokens**: Never run out of test tokens
- **Complete Control**: Test edge cases and error scenarios
- **Privacy**: No external data transmission

### VeBetterDAO Testnet Issues (Resolved)
- ❌ VeBetterDAO testnet ended May 2024
- ❌ Testnet contracts deprecated and non-functional
- ❌ No longer maintained or supported
- ✅ **Solution**: Solo node provides same testing capabilities

## Production Deployment

When ready for production:
1. Update contracts to VeBetterDAO mainnet addresses
2. Switch VECHAIN_NETWORK to 'mainnet'
3. Use real VeBetterDAO app allocation
4. Test thoroughly on solo node first

Your technical implementation is correct - solo node enables safe development without real money risk while maintaining authentic blockchain behavior.