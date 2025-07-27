# Step-by-Step Solo Node Deployment Guide

## 🎯 OBJECTIVE
Set up VeChain solo node to test complete user flow: wallet connection → receipt submission → real B3TR tokens appearing in VeWorld wallet.

## ✅ BREAKTHROUGH CONFIRMED
**CRITICAL B3TR UNITS BUG FIXED**: Server now passes proper wei units (`10000000000000000000`) instead of raw numbers (`10`). This will fix the 0 B3TR transfers we saw on testnet.

## 📋 STEP 1: Prepare Your Environment

First, let's verify your setup and get the solo node running:

```bash
# Check if Docker is available
docker --version

# Check if you have the solo node files
ls -la LOCAL_B3TR_*
```

## 📋 STEP 2: Start VeChain Solo Node

The solo node simulates a complete VeChain blockchain on your local machine:

```bash
# Method 1: Simple Docker start (try this first)
docker run -d -p 8669:8669 --name vechain-solo vechain/thor-solo:latest

# Method 2: If that fails, use our custom script
node LOCAL_B3TR_TEST_SCRIPT.js
```

**Expected Output:**
```
✅ VeChain Solo Node running on localhost:8669
✅ Genesis block available
✅ Accounts pre-funded with VET and VTHO
```

## 📋 STEP 3: Test Solo Node Connection

Verify the solo node is responding:

```bash
# Test basic connectivity
curl http://localhost:8669/blocks/best

# Should return JSON with block info
```

## 📋 STEP 4: Deploy B3TR Token to Solo Node

Our script will deploy a test B3TR token contract:

```bash
# Deploy B3TR contract to solo node
node SOLO_NODE_B3TR_DEPLOYMENT.js
```

**Expected Output:**
```
✅ B3TR contract deployed to: 0x1234...
✅ Initial supply minted: 1,000,000 B3TR
✅ Test accounts funded with B3TR tokens
```

## 📋 STEP 5: Update ReCircle Configuration

Point ReCircle to use your solo node instead of testnet:

```bash
# Update environment variables
echo "VECHAIN_NETWORK=solo" >> .env
echo "SOLO_NODE_URL=http://localhost:8669" >> .env
echo "SOLO_MODE=true" >> .env
```

## 📋 STEP 6: Test ReCircle → Solo Node Integration

Use our test endpoint to verify the connection:

```bash
# Test ReCircle can connect to solo node
curl -X POST http://localhost:5000/api/test/solo-connection
```

**Expected Output:**
```json
{
  "success": true,
  "soloNodeConnected": true,
  "b3trContractDeployed": true,
  "testAccountsFunded": true
}
```

## 📋 STEP 7: Test Complete User Flow

Now test the full user experience:

1. **Connect VeWorld Wallet**: Use the solo node network in VeWorld
2. **Submit Receipt**: Upload a transportation receipt
3. **Verify B3TR Distribution**: Check your VeWorld wallet for new B3TR tokens

```bash
# Test B3TR distribution with our fixed units
curl -X POST http://localhost:5000/api/test/b3tr-units-fix
```

**Expected Results:**
- Transaction hash returned
- VeWorld wallet shows increased B3TR balance
- Complete user flow proven working

## 📋 STEP 8: Production Migration Plan

Once solo node proves the flow:

1. **Switch Network URL**: Change from `localhost:8669` to mainnet URL
2. **Update Private Keys**: Use real VeBetterDAO authorization keys  
3. **Deploy**: Same code, real blockchain, real tokens

## 🔧 TROUBLESHOOTING

### Solo Node Won't Start
```bash
# Kill existing containers
docker stop vechain-solo && docker rm vechain-solo

# Try different port
docker run -d -p 8670:8669 --name vechain-solo vechain/thor-solo:latest
```

### Connection Issues
```bash
# Check if solo node is running
docker ps | grep vechain-solo

# Check logs
docker logs vechain-solo
```

### VeWorld Connection Issues
1. Add `localhost:8669` as custom network in VeWorld
2. Use solo node chain ID: `0x27` (39 decimal)
3. Import test account private key for funded wallet

## 🎯 SUCCESS CRITERIA

✅ Solo node running and responding
✅ B3TR contract deployed with test tokens
✅ ReCircle connects to solo node successfully
✅ Receipt submission creates blockchain transaction
✅ VeWorld wallet shows B3TR token increase
✅ Complete user flow proven end-to-end

---

**NEXT STEPS AFTER SUCCESS:**
1. Document the working configuration
2. Plan mainnet migration with same code
3. Ready for community endorsement with proven flow