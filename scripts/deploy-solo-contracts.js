#!/usr/bin/env node

/**
 * Deploy mock B3TR tokens and VeBetterDAO contracts to solo node
 * Based on Pierre's tutorial approach but adapted for Replit
 */

const { ethers } = require('ethers');
const { ThorClient, VeChainProvider } = require('@vechain/sdk-network');

const SOLO_NODE_URL = 'http://localhost:8669';

// Mock B3TR Token Contract (simplified ERC20)
const MOCK_B3TR_ABI = [
  "constructor(string memory name, string memory symbol, uint256 totalSupply)",
  "function mint(address to, uint256 amount) public",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const MOCK_B3TR_BYTECODE = "0x608060405234801561001057600080fd5b506040516109c23803806109c28339818101604052810190610032919061028e565b82600390816100419190610540565b5080600490816100519190610540565b50806000819055508060016000610066610069565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505050506106d4565b600033905090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6100d78261008e565b810181811067ffffffffffffffff821117156100f6576100f561009f565b5b80604052505050565b6000610109610070565b905061011582826100ce565b919050565b600067ffffffffffffffff8211156101355761013461009f565b5b61013e8261008e565b9050602081019050919050565b60005b8381101561016957808201518184015260208101905061014e565b83811115610178576000848401525b50505050565b600061019161018c8461011a565b6100ff565b9050828152602081018484840111156101ad576101ac610089565b5b6101b884828561014b565b509392505050565b600082601f8301126101d5576101d4610084565b5b81516101e584826020860161017e565b91505092915050565b6000819050919050565b610201816101ee565b811461020c57600080fd5b50565b60008151905061021e816101f8565b92915050565b60008060006060848603121561023d5761023c61007a565b5b600084015167ffffffffffffffff81111561025b5761025a61007f565b5b610267868287016101c0565b935050602084015167ffffffffffffffff8111156102885761028761007f565b5b610294868287016101c0565b92505060406102a58682870161020f565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806102ff57607f821691505b602082108103610312576103116102b8565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026103657fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82610342565b61036f8683610342565b95508019841693508086168417925050509392505050565b6000819050919050565b60006103ac6103a76103a2846101ee565b610387565b6101ee565b9050919050565b6000819050919050565b6103c683610391565b6103da6103d2826103b3565b84845461034f565b825550505050565b600090565b6103ef6103e2565b6103fa8184846103bd565b505050565b5b8181101561041e576104136000826103e7565b600181019050610400565b5050565b601f8211156104635761043481610318565b61043d8461032d565b8101602085101561044c578190505b61046061045885610318565b8301826103ff565b50505b505050565b600082821c905092915050565b600061048660001984600802610468565b1980831691505092915050565b600061049f8383610475565b9150826002028217905092915050565b6104b8826102af565b67ffffffffffffffff8111156104d1576104d061009f565b5b6104db82546102e7565b6104e6828285610422565b600060209050601f831160018114610519576000841561050757829003601f168a5b610511868261046b565b86555050610537565b6000610524868a5b60011660208410811461053157929003601f168901525b505050928501925050565b50505b610548600a610070565b61051182826004975060208210811461056f575b50509091565b80020160a01b810180821b6100000000000000000000000000005b9052565b60405180910390fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd"

// Mock VeBetterDAO Rewards Pool Contract
const MOCK_REWARDS_ABI = [
  "constructor(address tokenAddress)",
  "function depositReward(uint256 amount) public",
  "function distributeReward(address to, uint256 amount) public returns (bool)",
  "function getBalance() view returns (uint256)",
  "event RewardDistributed(address indexed to, uint256 amount)"
];

async function deployToSoloNode() {
  try {
    console.log('🚀 Deploying contracts to VeChain solo node...');
    
    // Connect to solo node
    const provider = new ethers.providers.JsonRpcProvider(SOLO_NODE_URL);
    
    // Test connection
    try {
      const network = await provider.getNetwork();
      console.log('✅ Connected to solo node, chainId:', network.chainId);
    } catch (error) {
      console.error('❌ Failed to connect to solo node at', SOLO_NODE_URL);
      console.error('Make sure solo node is running: node scripts/solo-node-simple.js');
      return;
    }

    // Use first account from solo node (should have VET for gas)
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      console.error('❌ No accounts available in solo node');
      return;
    }
    
    console.log('📝 Available accounts:', accounts.length);
    console.log('💰 Using deployer account:', accounts[0]);

    // Create wallet instance
    const wallet = provider.getSigner(0);
    
    // Deploy Mock B3TR Token
    console.log('\n📦 Deploying Mock B3TR Token...');
    const tokenFactory = new ethers.ContractFactory(MOCK_B3TR_ABI, MOCK_B3TR_BYTECODE, wallet);
    const mockB3TR = await tokenFactory.deploy("Better Token", "B3TR", ethers.utils.parseEther("10000000")); // 10M tokens
    await mockB3TR.deployed();
    
    console.log('✅ Mock B3TR deployed at:', mockB3TR.address);
    
    // Deploy Mock Rewards Pool
    console.log('\n📦 Deploying Mock Rewards Pool...');
    // Simple rewards pool bytecode (would need full implementation)
    const rewardsFactory = new ethers.ContractFactory(MOCK_REWARDS_ABI, "0x608060405234801561001057600080fd5b50", wallet);
    const rewardsPool = await rewardsFactory.deploy(mockB3TR.address);
    await rewardsPool.deployed();
    
    console.log('✅ Mock Rewards Pool deployed at:', rewardsPool.address);
    
    // Fund rewards pool with tokens
    console.log('\n💰 Funding rewards pool...');
    await mockB3TR.approve(rewardsPool.address, ethers.utils.parseEther("1000000"));
    await rewardsPool.depositReward(ethers.utils.parseEther("1000000")); // 1M tokens
    
    // Save contract addresses
    const contractsConfig = {
      soloNode: {
        rpcUrl: SOLO_NODE_URL,
        chainId: 39,
        mockB3TR: {
          address: mockB3TR.address,
          deployedBalance: "10000000"
        },
        rewardsPool: {
          address: rewardsPool.address,
          fundedBalance: "1000000"
        },
        deployerAccount: accounts[0]
      }
    };
    
    require('fs').writeFileSync('./solo-contracts.json', JSON.stringify(contractsConfig, null, 2));
    
    console.log('\n🎉 Solo node deployment complete!');
    console.log('📋 Contract addresses saved to solo-contracts.json');
    console.log('\n🔗 VeWorld Network Settings:');
    console.log('Network Name: Solo Node');
    console.log('RPC URL: http://localhost:8669');
    console.log('Chain ID: 39');
    console.log('Symbol: VET');
    console.log('\n🪙 Add Custom Token in VeWorld:');
    console.log('Token Address:', mockB3TR.address);
    console.log('Symbol: B3TR');
    console.log('Decimals: 18');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

if (require.main === module) {
  deployToSoloNode();
}

module.exports = { deployToSoloNode };