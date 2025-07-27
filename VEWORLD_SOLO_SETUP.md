# VeWorld Solo Node Network Setup

## Step 1: Start Solo Node
```bash
node scripts/solo-node-simple.js
```

## Step 2: Configure VeWorld for Solo Network

### Add Custom Network in VeWorld
1. Open VeWorld mobile app
2. Go to Settings → Networks
3. Add Custom Network:
   - **Network Name**: Solo Node
   - **RPC URL**: http://localhost:8669
   - **Chain ID**: 39
   - **Symbol**: VET
   - **Explorer URL**: (leave blank)

### Switch to Solo Network
1. In VeWorld, select "Solo Node" network
2. VeWorld will now connect to your local solo node
3. Your wallet will show the pre-funded solo account balances

## Step 3: Import Solo Account (Optional)
To see the pre-funded test accounts in VeWorld:

**Account 1 (Admin)**
- Address: `0x7567d83b7b8d80addcb281a71d54fc7b3364ffed`
- Private Key: `0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36`
- Balance: 25,000,000 VET + 5,000,000 VTHO

**Account 2 (Distributor)**
- Address: `0xd3ae78222beadb038203be21ed5ce7c9b1bff602`
- Private Key: `0x7f9290af603f8ce9c391b88222e6eff75db6c60ff07e1f0b2d34d1c6b85c936e`
- Balance: 25,000,000 VET + 5,000,000 VTHO

## Step 4: Test B3TR Token Visibility
1. Connect VeWorld to your ReCircle app (on solo network)
2. Submit a transportation receipt
3. Watch B3TR tokens appear in VeWorld wallet
4. Verify transaction history shows the distribution

## Benefits
- See real B3TR token movements in VeWorld
- Test complete user experience safely
- No real money or mainnet transactions
- Unlimited testing with fake tokens

This setup mirrors exactly what you saw in the X-2-Earn template video!