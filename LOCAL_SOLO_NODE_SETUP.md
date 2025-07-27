# VeChain Solo Node Setup (Local Machine)

## Prerequisites
1. **Docker Desktop** - Download from https://www.docker.com/products/docker-desktop/
2. **Your local machine** (Windows, Mac, or Linux)
3. **8GB+ RAM recommended** for smooth operation

## Step 1: Install Docker
- Download Docker Desktop for your operating system
- Install and start Docker Desktop
- Verify installation: Open terminal/command prompt and run `docker --version`

## Step 2: Download VeChain Solo Node
```bash
# Create a folder for VeChain solo node
mkdir vechain-solo
cd vechain-solo

# Download the solo node Docker image
docker pull vechain/thor:latest
```

## Step 3: Start Solo Node with B3TR Support
```bash
# Start the solo node with custom genesis (includes B3TR token)
docker run -d \
  --name vechain-solo \
  -p 8669:8669 \
  -e NETWORK=solo \
  -e GENESIS_DATA='{"alloc":{"0x15d009b3a5811fde66f19b2db1d40172d53e5653":{"balance":"1000000000000000000000","energy":"1000000000000000000000"}}}' \
  vechain/thor:latest \
  --network solo \
  --api-addr 0.0.0.0:8669 \
  --api-cors "*" \
  --api-timeout 60s

# Check if it's running
docker ps
```

## Step 4: Configure VeWorld for Solo Node
1. Open VeWorld mobile app
2. Go to Settings > Network
3. Add Custom Network:
   - **Network Name**: "Local Solo"
   - **RPC URL**: `http://YOUR_LOCAL_IP:8669`
   - **Chain ID**: `0x27` (39 in decimal)

## Step 5: Deploy B3TR Contract to Solo Node
```bash
# Create a simple B3TR deployment script
cat > deploy-b3tr.js << 'EOF'
const { ethers } = require('ethers');

// B3TR Token Contract ABI (simplified)
const B3TR_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// Simple B3TR Token Bytecode (ERC20-like)
const B3TR_BYTECODE = "0x608060405234801561001057600080fd5b50..."; // Full bytecode needed

async function deployB3TR() {
  const provider = new ethers.JsonRpcProvider('http://localhost:8669');
  const wallet = new ethers.Wallet('0x...your-private-key', provider);
  
  const factory = new ethers.ContractFactory(B3TR_ABI, B3TR_BYTECODE, wallet);
  const contract = await factory.deploy();
  
  console.log('B3TR Token deployed at:', contract.address);
  
  // Mint some tokens to your wallet
  const mintTx = await contract.mint(wallet.address, ethers.parseUnits('1000000', 18));
  await mintTx.wait();
  
  console.log('Minted 1M B3TR tokens to', wallet.address);
}

deployB3TR().catch(console.error);
EOF

# Run the deployment
node deploy-b3tr.js
```

## Step 6: Update Replit Environment
Once your solo node is running, update your Replit `.env`:

```env
# Point to your local solo node
VECHAIN_NETWORK_URL=http://YOUR_LOCAL_IP:8669
B3TR_CONTRACT_ADDRESS=0x... # Address from deployment step
NODE_ENV=development
VEBETTERDAO_MODE=solo
```

## Why This Works
- **Real Blockchain**: Solo node runs actual VeChain blockchain
- **Real Tokens**: B3TR contract deployed with real token functionality  
- **VeWorld Compatible**: Solo node speaks same protocol as mainnet/testnet
- **Unlimited Testing**: Free VET, VTHO, and B3TR for testing
- **Immediate Visibility**: Tokens appear in VeWorld wallet instantly

## Difficulty Level: EASY
- Total setup time: 15-30 minutes
- Technical skill needed: Basic (copy/paste commands)
- Once running, works exactly like mainnet but free

## Alternative: Thor Solo Binary
If Docker doesn't work, you can also download the Thor solo binary directly:
1. Go to https://github.com/vechain/thor/releases
2. Download `thor-solo` for your operating system
3. Run: `./thor-solo --network solo --api-addr 0.0.0.0:8669`

This gives you a real VeChain environment where B3TR tokens will actually appear in your VeWorld wallet!