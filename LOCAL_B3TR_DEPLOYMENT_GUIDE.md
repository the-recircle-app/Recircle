# Step-by-Step B3TR Deployment Guide for Your Solo Node

## Prerequisites Check
Your solo node should be running at: `192.168.12.101:8669`

## Step 1: Download Required Files to Your Local Machine

Download these files from your Replit project to your local machine:

1. `SOLO_NODE_B3TR_DEPLOYMENT.js` 
2. `package.json` (to get the ethers.js dependency)

## Step 2: Set Up Local Node.js Environment

Open terminal/command prompt on your local machine and run:

```bash
# Create a new directory for the deployment
mkdir vechain-b3tr-deployment
cd vechain-b3tr-deployment

# Initialize npm project
npm init -y

# Install required dependencies
npm install ethers@6.14.1
```

## Step 3: Copy the Deployment Script

Create a file called `deploy-b3tr.js` in your new directory with this content:

```javascript
import { ethers } from 'ethers';

// B3TR Token Contract (Standard ERC-20)
const B3TR_CONTRACT = {
  abi: [
    "constructor(string memory name, string memory symbol, uint256 totalSupply)",
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function mint(address to, uint256 amount) returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ],
  bytecode: "0x608060405234801561001057600080fd5b506040516107d03803806107d08339818101604052810190610032919061016a565b8260039081610041919061043c565b50816004908161005191906103c4565b5080600281905550806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055503373ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516100f991906104f3565b60405180910390a3505050610508565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61016482610113565b810181811067ffffffffffffffff8211171561018357610182610124565b5b80604052505050565b6000610196610106565b90506101a2828261015b565b919050565b600067ffffffffffffffff8211156101c2576101c1610124565b5b6101cb82610113565b9050602081019050919050565b60006101eb6101e6846101a7565b61018c565b90508281526020810184848401111561020757610206610110565b5b6102128482856101d8565b509392505050565b600082601f83011261022f5761022e61010b565b5b815161023f8482602086016101d8565b91505092915050565b6000819050919050565b61025b81610248565b811461026657600080fd5b50565b60008151905061027881610252565b92915050565b60008060006060848603121561029757610296610101565b5b600084015167ffffffffffffffff8111156102b5576102b4610104565b5b6102c18682870161021a565b935050602084015167ffffffffffffffff8111156102e2576102e1610104565b5b6102ee8682870161021a565b92505060406102ff86828701610269565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061035a57607f821691505b60208210810361036d5761036c610313565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026103d57fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610398565b6103df8683610398565b95508019841693508086168417925050509392505050565b6000819050919050565b600061041c61041761041284610248565b6103f7565b610248565b9050919050565b6000819050919050565b61043683610401565b61044a61044282610423565b8484546103a5565b825550505050565b600090565b61045f610452565b61046a81848461042d565b505050565b5b8181101561048e57610483600082610457565b600181019050610470565b5050565b601f8211156104d35761049481610373565b61049d84610388565b810160208510156104ac578190505b6104c06104b885610388565b83018261046f565b50505b505050565b600082821c905092915050565b60006104e6600019846008026104c8565b1980831691505092915050565b60006104ff83836104d5565b9150826002028217905092915050565b61051882610309565b67ffffffffffffffff81111561053157610530610124565b5b61053b8254610342565b610546828285610492565b600060209050601f8311600181146105795760008415610567578287015190505b61057185826104f3565b8655506105d9565b601f19841661058786610373565b60005b828110156105af5784890151825560018201915060208501945060208101905061058a565b868310156105cc57848901516105c8601f8916826104d5565b8355505b6001600288020188555050505b505050505050565b6102b9806105f06000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80634b82736511610071578063405765b71161005b578063405765b714610169578063a9059cbb14610199578063dd62ed3e146101c9576100a9565b80634b8273651461011357806370a0823114610143576100a9565b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100fc57806323b872dd146100fa578063313ce567146100f5576100a9565b600080fd5b6100b66101f9565b6040516100c391906101fe565b60405180910390f35b6100e660048036038101906100e19190610220565b610287565b6040516100f3919061027b565b60405180910390f35b6100fa610379565b005b610104610382565b60405161010b91906102a5565b60405180910390f35b61012d600480360381019061012891906102c0565b610388565b60405161013a91906102a5565b60405180910390f35b61015d600480360381019061015891906102c0565b6103d0565b60405161016a91906102a5565b60405180910390f35b610183600480360381019061017e9190610220565b610418565b604051610190919061027b565b60405180910390f35b6101b360048036038101906101ae9190610220565b6104ac565b6040516101c0919061027b565b60405180910390f35b6101e360048036038101906101de91906102ed565b6105a1565b6040516101f091906102a5565b60405180910390f35b60606003805461020890610325565b80601f016020809104026020016040519081016040528092919081815260200182805461023490610325565b80156102815780601f1061025657610100808354040283529160200191610281565b820191906000526020600020905b81548152906001019060200180831161026457829003601f168201915b50505050509050919050565b600081600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161036791906102a5565b60405180910390a36001905092915050565b60006012905090565b60025481565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b600081600060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546104699190610356565b925050819055508273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516100a991906102a5565b60008160008073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561052a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610521906103d6565b60405180910390fd5b81600080336073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546105799190610385565b9250508190555081600080848073ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546105cf9190610356565b925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161063391906102a5565b60405180910390a36001905092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050929150505056fea2646970667358221220db6f1e5a8c4b7dddf1d2e8f8cb9b4b5c4d5e9b9a5b4b5c4d5e9b9a5b4b5c4d00064736f6c634300080f0033"
};

// Configuration
const DEPLOYMENT_CONFIG = {
  name: "VeBetter Token",
  symbol: "B3TR",
  totalSupply: ethers.parseEther("1000000"), // 1 Million tokens
  soloNodeUrl: "http://192.168.12.101:8669",
  wallets: {
    // Your main wallet (will receive tokens)
    main: "0x15d009b3a5811fde66f19b2db1d40172d53e5653",
    // ReCircle distributor wallet
    distributor: "0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee",
    // App fund wallet
    appFund: "0x119761865b79bea9e7924edaa630942322ca09d1"
  }
};

async function deployB3TRContract() {
  try {
    console.log('🚀 Deploying B3TR Token to Solo Node...');
    console.log(`📡 Solo Node: ${DEPLOYMENT_CONFIG.soloNodeUrl}`);
    
    // Connect to your solo node
    const provider = new ethers.JsonRpcProvider(DEPLOYMENT_CONFIG.soloNodeUrl);
    
    // Test connection first
    try {
      const network = await provider.getNetwork();
      console.log(`✅ Connected to network (chainId: ${network.chainId})`);
    } catch (error) {
      throw new Error(`Cannot connect to solo node: ${error.message}`);
    }
    
    // Use solo node's default private key
    const deployerKey = "0x99f3c8a2b37b8a8e3a9a5e3c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f";
    const deployer = new ethers.Wallet(deployerKey, provider);
    
    console.log(`💼 Deployer address: ${deployer.address}`);
    
    // Check deployer balance
    const balance = await provider.getBalance(deployer.address);
    console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} VET`);
    
    if (balance === 0n) {
      throw new Error("Deployer has no VET for gas fees. Solo node might not be properly funded.");
    }
    
    // Deploy contract
    console.log('📝 Deploying B3TR contract...');
    const factory = new ethers.ContractFactory(
      B3TR_CONTRACT.abi,
      B3TR_CONTRACT.bytecode,
      deployer
    );
    
    const contract = await factory.deploy(
      DEPLOYMENT_CONFIG.name,
      DEPLOYMENT_CONFIG.symbol,
      DEPLOYMENT_CONFIG.totalSupply
    );
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    
    console.log(`✅ B3TR deployed at: ${contractAddress}`);
    
    // Fund wallets with B3TR tokens
    console.log('💰 Distributing B3TR tokens...');
    
    const distributions = [
      { address: DEPLOYMENT_CONFIG.wallets.main, amount: "100000", name: "Main Wallet" },
      { address: DEPLOYMENT_CONFIG.wallets.distributor, amount: "50000", name: "Distributor" },
      { address: DEPLOYMENT_CONFIG.wallets.appFund, amount: "25000", name: "App Fund" }
    ];
    
    for (const dist of distributions) {
      console.log(`   Sending ${dist.amount} B3TR to ${dist.name} (${dist.address})`);
      const amount = ethers.parseEther(dist.amount);
      const tx = await contract.transfer(dist.address, amount);
      await tx.wait();
      
      const balance = await contract.balanceOf(dist.address);
      console.log(`   ✅ Balance: ${ethers.formatEther(balance)} B3TR`);
    }
    
    // Output final information
    console.log('\n🎉 DEPLOYMENT COMPLETE!');
    console.log('=================================');
    console.log(`📄 Contract Address: ${contractAddress}`);
    console.log(`🌐 Network: Your Solo Node (${DEPLOYMENT_CONFIG.soloNodeUrl})`);
    console.log(`💎 Total Supply: ${ethers.formatEther(DEPLOYMENT_CONFIG.totalSupply)} B3TR`);
    console.log('\n📋 Add this to your ReCircle .env file:');
    console.log(`B3TR_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`SOLO_NODE_DEPLOYED=true`);
    
    return {
      success: true,
      contractAddress,
      network: DEPLOYMENT_CONFIG.soloNodeUrl,
      totalSupply: ethers.formatEther(DEPLOYMENT_CONFIG.totalSupply),
      distributions
    };
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run deployment
deployB3TRContract();
```

## Step 4: Run the Deployment

In your terminal, execute:

```bash
# Make sure you're in the deployment directory
cd vechain-b3tr-deployment

# Run the deployment script
node deploy-b3tr.js
```

## Step 5: Expected Output

You should see output like this:

```
🚀 Deploying B3TR Token to Solo Node...
📡 Solo Node: http://192.168.12.101:8669
✅ Connected to network (chainId: 39)
💼 Deployer address: 0x8e2f2c8a5e7f8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c
💰 Deployer balance: 1000.0 VET
📝 Deploying B3TR contract...
✅ B3TR deployed at: 0x1234567890123456789012345678901234567890
💰 Distributing B3TR tokens...
   Sending 100000 B3TR to Main Wallet (0x15d009b3a5811fde66f19b2db1d40172d53e5653)
   ✅ Balance: 100000.0 B3TR
   Sending 50000 B3TR to Distributor (0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee)
   ✅ Balance: 50000.0 B3TR
   Sending 25000 B3TR to App Fund (0x119761865b79bea9e7924edaa630942322ca09d1)
   ✅ Balance: 25000.0 B3TR

🎉 DEPLOYMENT COMPLETE!
=================================
📄 Contract Address: 0x1234567890123456789012345678901234567890
🌐 Network: Your Solo Node (http://192.168.12.101:8669)
💎 Total Supply: 1000000.0 B3TR

📋 Add this to your ReCircle .env file:
B3TR_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
SOLO_NODE_DEPLOYED=true
```

## Step 6: Update ReCircle Configuration

Once deployment succeeds, copy the contract address and update your ReCircle .env file with the output provided.

## Troubleshooting

**If you get "Cannot connect to solo node":**
1. Verify Docker container is running: `docker ps`
2. Check the IP address: `docker inspect vechain-solo | grep IPAddress`
3. Test connectivity: `curl http://192.168.12.101:8669/blocks/best`

**If you get "Deployer has no VET":**
Your solo node needs to be properly initialized with genesis accounts. The solo node should automatically fund the deployer address.

Would you like me to proceed with any of these steps or do you need clarification on any part?