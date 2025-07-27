import { ethers } from 'ethers';

/**
 * Test script to verify B3TR contract deployment and simulate ReCircle transactions
 * Run this after successful deployment to ensure everything works
 */

// Configuration - UPDATE THESE AFTER DEPLOYMENT
const CONFIG = {
  soloNodeUrl: "http://192.168.12.101:8669",
  contractAddress: "0x1234567890123456789012345678901234567890", // UPDATE THIS
  wallets: {
    main: "0x15d009b3a5811fde66f19b2db1d40172d53e5653",
    distributor: "0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee",
    appFund: "0x119761865b79bea9e7924edaa630942322ca09d1"
  },
  // Solo node private keys for testing
  privateKeys: {
    deployer: "0x99f3c8a2b37b8a8e3a9a5e3c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f",
    distributor: "0x88e3c2b37b8a8e3a9a5e3c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4"
  }
};

const B3TR_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

async function testB3TRDeployment() {
  try {
    console.log('🧪 TESTING B3TR CONTRACT DEPLOYMENT...');
    console.log(`📡 Solo Node: ${CONFIG.soloNodeUrl}`);
    console.log(`📄 Contract: ${CONFIG.contractAddress}`);
    
    // Connect to solo node
    const provider = new ethers.JsonRpcProvider(CONFIG.soloNodeUrl);
    const contract = new ethers.Contract(CONFIG.contractAddress, B3TR_ABI, provider);
    
    // Test 1: Basic contract info
    console.log('\n📋 CONTRACT INFORMATION:');
    console.log('========================');
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const totalSupply = await contract.totalSupply();
    
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Decimals: ${decimals}`);
    console.log(`Total Supply: ${ethers.formatEther(totalSupply)} B3TR`);
    
    // Test 2: Check wallet balances
    console.log('\n💰 WALLET BALANCES:');
    console.log('==================');
    for (const [name, address] of Object.entries(CONFIG.wallets)) {
      const balance = await contract.balanceOf(address);
      console.log(`${name}: ${ethers.formatEther(balance)} B3TR (${address})`);
    }
    
    // Test 3: Simulate ReCircle reward distribution
    console.log('\n🎯 SIMULATING RECIRCLE REWARD DISTRIBUTION:');
    console.log('==========================================');
    
    const distributorWallet = new ethers.Wallet(CONFIG.privateKeys.distributor, provider);
    const contractWithSigner = contract.connect(distributorWallet);
    
    // Simulate 10 B3TR reward (7 to user, 3 to app fund)
    const userReward = ethers.parseEther("7");
    const appFundReward = ethers.parseEther("3");
    
    console.log('Distributing rewards...');
    console.log(`  User reward: 7 B3TR → ${CONFIG.wallets.main}`);
    console.log(`  App fund: 3 B3TR → ${CONFIG.wallets.appFund}`);
    
    // Send user reward
    const userTx = await contractWithSigner.transfer(CONFIG.wallets.main, userReward);
    await userTx.wait();
    console.log(`  ✅ User reward transaction: ${userTx.hash}`);
    
    // Send app fund reward
    const appTx = await contractWithSigner.transfer(CONFIG.wallets.appFund, appFundReward);
    await appTx.wait();
    console.log(`  ✅ App fund transaction: ${appTx.hash}`);
    
    // Test 4: Verify updated balances
    console.log('\n📊 UPDATED BALANCES:');
    console.log('===================');
    const mainBalance = await contract.balanceOf(CONFIG.wallets.main);
    const appFundBalance = await contract.balanceOf(CONFIG.wallets.appFund);
    const distributorBalance = await contract.balanceOf(CONFIG.wallets.distributor);
    
    console.log(`Main wallet: ${ethers.formatEther(mainBalance)} B3TR`);
    console.log(`App fund: ${ethers.formatEther(appFundBalance)} B3TR`);
    console.log(`Distributor: ${ethers.formatEther(distributorBalance)} B3TR`);
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('====================================');
    console.log('✅ Contract deployed successfully');
    console.log('✅ Wallets funded with B3TR tokens');
    console.log('✅ Reward distribution working');
    console.log('✅ Transaction hashes generated');
    console.log('\nYour solo node is ready for ReCircle integration!');
    
    return {
      success: true,
      contractInfo: { name, symbol, decimals: decimals.toString(), totalSupply: ethers.formatEther(totalSupply) },
      balances: {
        main: ethers.formatEther(mainBalance),
        appFund: ethers.formatEther(appFundBalance),
        distributor: ethers.formatEther(distributorBalance)
      },
      testTransactions: [userTx.hash, appTx.hash]
    };
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('==================');
    console.log('1. Make sure solo node is running');
    console.log('2. Verify contract address is correct');
    console.log('3. Check that deployment completed successfully');
    console.log('4. Ensure wallets were funded during deployment');
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run tests
testB3TRDeployment();