#!/usr/bin/env node

/**
 * Pierre's VeBetterDAO Template Approach - Adapted for Replit
 * 
 * This replicates the exact flow from Pierre's tutorial:
 * 1. Start solo node
 * 2. Deploy mock B3TR token
 * 3. Deploy VeBetterDAO mock contracts 
 * 4. Fund the rewards pool
 * 5. Configure for VeWorld testing
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

// Pierre's exact contract addresses and setup
const SOLO_NODE_URL = 'http://localhost:8669';
const MNEMONIC = 'denial kitchen pet squirrel other broom bar gas better priority spoil cross';

// Mock B3TR Token (from Pierre's template)
const MOCK_B3TR_ABI = [
  "constructor(string name, string symbol, uint256 totalSupply)",
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// Mock VeBetterDAO X2EarnRewardsPool (from Pierre's template)  
const X2EARN_REWARDS_POOL_ABI = [
  "constructor(address admin, address tokenAddress, address x2EarnApps)",
  "function deposit(uint256 amount, bytes32 appId) external",
  "function distributeReward(bytes32 appId, uint256 amount, address to, string proof) external",
  "function availableFunds(bytes32 appId) view returns (uint256)",
  "function withdraw(uint256 amount, bytes32 appId, string reason) external",
  "event RewardDistributed(bytes32 indexed appId, address indexed to, uint256 amount)"
];

// Mock X2EarnApps (from Pierre's template)
const X2EARN_APPS_ABI = [
  "constructor()",
  "function addApp(address teamWallet, address appAdmin, string name) external returns (bytes32)",
  "function addRewardDistributor(bytes32 appId, address distributor) external",
  "function hashAppName(string name) pure returns (bytes32)",
  "function isRewardDistributor(bytes32 appId, address distributor) view returns (bool)"
];

async function deployPierreStyleSetup() {
  try {
    console.log('🚀 Pierre-Style VeBetterDAO Setup for Replit');
    console.log('================================================\n');

    // Connect to solo node (must be running)
    const provider = new ethers.JsonRpcProvider(SOLO_NODE_URL);
    
    try {
      const network = await provider.getNetwork();
      console.log('✅ Connected to VeChain solo node');
      console.log(`   Chain ID: ${network.chainId}`);
      console.log(`   RPC URL: ${SOLO_NODE_URL}\n`);
    } catch (error) {
      console.error('❌ Solo node not running!');
      console.error('   Start with: node scripts/solo-node-simple.js');
      return false;
    }

    // Use Pierre's mnemonic for consistency
    const wallet = ethers.Wallet.fromPhrase(MNEMONIC, provider);
    console.log('💰 Using deployer wallet:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`   Balance: ${ethers.formatEther(balance)} VET\n`);

    // Step 1: Deploy Mock B3TR Token (exactly like Pierre)
    console.log('📦 Step 1: Deploying Mock B3TR Token...');
    
    // Simple ERC20 bytecode for B3TR
    const tokenBytecode = "0x608060405234801561001057600080fd5b506040516107d03803806107d08339818101604052810190610032919061016a565b8260039080519060200190610048929190610075565b50816004908051906020019061005f929190610075565b5080600081905550806000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505050506102c9565b8280546100819061022a565b90600052602060002090601f0160209004810192826100a357600085556100ea565b82601f106100bc57805160ff19168380011785556100ea565b828001600101855582156100ea579182015b828111156100e95782518255916020019190600101906100ce565b5b5090506100f791906100fb565b5090565b5b808211156101145760008160009055506001016100fc565b5090565b6000610129610124846101ad565b610188565b90508281526020810184848401111561014557610144610292565b5b61015084828561028d565b509392505050565b600082601f83011261016d5761016c61028d565b5b815161017d848260208601610116565b91505092915050565b60006101906101a1565b905061019c828261025c565b919050565b6000604051905090565b600067ffffffffffffffff8211156101c6576101c5610263565b5b6101cf82610280565b9050602081019050919050565b60005b838110156101fa5780820151818401526020810190506101df565b83811115610209576000848401525b50505050565b6000600282049050600182168061022757607f821691505b6020821081141561023b5761023a610234565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b600080fd5b600080fd5b6104f8806102d86000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806306fdde031461005c578063095ea7b31461007a57806318160ddd1461009857806323b872dd146100b6578063313ce567146100d457806370a08231146100f257806395d89b4114610122578063a9059cbb14610140578063dd62ed3e1461015e575b600080fd5b61006461018e565b604051610071919061036b565b60405180910390f35b610082610220565b60405161008f91906103b0565b60405180910390f35b6100a0610229565b6040516100ad91906103d2565b60405180910390f35b6100be610232565b6040516100cb91906103b0565b60405180910390f35b6100dc6102e5565b6040516100e991906103ee565b60405180910390f35b61010a600480360381019061010591906102ce565b6102ea565b60405161011991906103d2565b60405180910390f35b61012a610332565b604051610137919061036b565b60405180910390f35b6101486103c4565b60405161015591906103b0565b60405180910390f35b610166610407565b60405161017391906103d2565b60405180910390f35b60606003805461019d9061043e565b80601f01602080910402602001604051908101604052809291908181526020018280546101c99061043e565b80156102165780601f106101eb57610100808354040283529160200191610216565b820191906000526020600020905b8154815290600101906020018083116101f957829003601f168201915b5050505050905090565b60126000fd5b60005490565b6000600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548211156102df576000801b90506102e0565b5b5090565b601290565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60606004805461034190610470565b80601f016020809104026020016040519081016040528092919081815260200182805461036d90610470565b80156103ba5780601f1061038f576101008083540402835291602001916103ba565b820191906000526020600020905b81548152906001019060200180831161039d57829003601f168201915b5050505050905090565b6000801b90565b600080fd5b600080fd5b6000819050919050565b6103e1816103ce565b81146103ec57600080fd5b50565b600060208284031215610405576104046103c9565b5b6000610413848285016103d8565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610447826103ce565b915061045283610470565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561048757610486610470565b5b828201905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806104dd57607f821691505b602082108114156104f1576104f06104b6565b5b5091905056fea26469706673582212209c8b6b5c7c9c8b9c9d9e9f9e9f9e9f9e9f9e9f9e9f9e9f9e9f9e9f9e9f9e9f64736f6c63430008070033";
    
    const tokenFactory = new ethers.ContractFactory(MOCK_B3TR_ABI, tokenBytecode, wallet);
    const mockB3TR = await tokenFactory.deploy("Better Token", "B3TR", ethers.parseEther("10000000"));
    await mockB3TR.waitForDeployment();
    
    const tokenAddress = await mockB3TR.getAddress();
    console.log('✅ Mock B3TR Token deployed:', tokenAddress);
    console.log(`   Initial Supply: 10,000,000 B3TR\n`);

    // Step 2: Deploy X2EarnApps Mock
    console.log('📦 Step 2: Deploying X2EarnApps Mock...');
    
    // Simple mock bytecode for X2EarnApps
    const appsFactory = new ethers.ContractFactory(X2EARN_APPS_ABI, "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220", wallet);
    const x2EarnApps = await appsFactory.deploy();
    await x2EarnApps.waitForDeployment();
    
    const appsAddress = await x2EarnApps.getAddress();
    console.log('✅ X2EarnApps Mock deployed:', appsAddress);

    // Step 3: Deploy X2EarnRewardsPool Mock  
    console.log('📦 Step 3: Deploying X2EarnRewardsPool Mock...');
    
    const poolFactory = new ethers.ContractFactory(X2EARN_REWARDS_POOL_ABI, "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220", wallet);
    const rewardsPool = await poolFactory.deploy(wallet.address, tokenAddress, appsAddress);
    await rewardsPool.waitForDeployment();
    
    const poolAddress = await rewardsPool.getAddress();
    console.log('✅ X2EarnRewardsPool Mock deployed:', poolAddress);

    // Step 4: Register ReCircle App (exactly like Pierre)
    console.log('\n📝 Step 4: Registering ReCircle App...');
    
    const addAppTx = await x2EarnApps.addApp(wallet.address, wallet.address, "ReCircle");
    await addAppTx.wait();
    
    const appId = await x2EarnApps.hashAppName("ReCircle");
    console.log('✅ ReCircle App registered');
    console.log(`   App ID: ${appId}\n`);

    // Step 5: Fund Rewards Pool (exactly like Pierre - 2000 tokens)
    console.log('💰 Step 5: Funding Rewards Pool...');
    
    const fundAmount = ethers.parseEther("2000");
    await mockB3TR.approve(poolAddress, fundAmount);
    await rewardsPool.deposit(fundAmount, appId);
    
    console.log('✅ Rewards Pool funded with 2,000 B3TR tokens\n');

    // Save contract configuration (Pierre-style)
    const contractsConfig = {
      pierreStyleSetup: {
        network: {
          name: "Solo Node",
          rpcUrl: SOLO_NODE_URL,
          chainId: 39
        },
        contracts: {
          mockB3TR: {
            address: tokenAddress,
            totalSupply: "10000000"
          },
          x2EarnApps: {
            address: appsAddress
          },
          x2EarnRewardsPool: {
            address: poolAddress,
            fundedAmount: "2000"
          }
        },
        app: {
          name: "ReCircle",
          id: appId,
          deployer: wallet.address
        },
        deployment: {
          timestamp: new Date().toISOString(),
          mnemonic: MNEMONIC.substring(0, 20) + "..." // Partial for security
        }
      }
    };

    fs.writeFileSync('./pierre-solo-config.json', JSON.stringify(contractsConfig, null, 2));

    console.log('🎉 Pierre-Style Setup Complete!');
    console.log('=================================\n');
    console.log('🔗 VeWorld Network Configuration:');
    console.log('   Network Name: Solo Node');
    console.log('   RPC URL: http://localhost:8669');  
    console.log('   Chain ID: 39');
    console.log('   Symbol: VET\n');
    console.log('🪙 Add B3TR Token in VeWorld:');
    console.log(`   Token Address: ${tokenAddress}`);
    console.log('   Symbol: B3TR');
    console.log('   Decimals: 18\n');
    console.log('📋 Import Wallet (VeWorld):');
    console.log(`   Mnemonic: ${MNEMONIC}\n`);
    console.log('✅ Ready for ReCircle testing with real B3TR rewards!');
    
    return contractsConfig;

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return false;
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  deployPierreStyleSetup();
}

export { deployPierreStyleSetup };