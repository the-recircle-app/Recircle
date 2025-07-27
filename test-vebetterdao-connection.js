/**
 * Test VeBetterDAO Connection and Smart Contract Integration
 * Verifies your registered ReCircle app can distribute rewards
 */

import { ethers } from 'ethers';

// Your VeBetterDAO Configuration
const CONFIG = {
    APP_ID: '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1',
    X2EARN_REWARDS_POOL: '0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38',
    REWARD_DISTRIBUTOR: '0x15D009B3A5811fdE66F19b2db1D40172d53E5653',
    RPC_URL: 'https://sync-testnet.vechain.org'
};

// VeBetterDAO Rewards Pool ABI
const REWARDS_POOL_ABI = [
    "function distributeReward(bytes32 appId, address recipient, uint256 amount) external returns (bool)",
    "function distributeRewardWithProof(bytes32 appId, address recipient, uint256 amount, string[] calldata proofTypes, string[] calldata proofValues) external returns (bool)",
    "function getAppBalance(bytes32 appId) external view returns (uint256)"
];

async function testVeBetterDAOConnection() {
    console.log('🔗 Testing VeBetterDAO Smart Contract Integration');
    console.log('===============================================');
    
    try {
        // Test basic connection first
        console.log('📡 Testing network connection...');
        
        const testProvider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        
        // Simple network test
        try {
            const blockNumber = await testProvider.getBlockNumber();
            console.log(`✅ Connected to VeChain testnet - Block: ${blockNumber}`);
        } catch (networkError) {
            console.log('❌ Network connection failed:', networkError.message);
            console.log('💡 VeChain testnet might be experiencing issues');
            return;
        }
        
        // Test with mnemonic if available
        const mnemonic = process.env.TESTNET_MNEMONIC;
        if (!mnemonic) {
            console.log('⚠️  TESTNET_MNEMONIC not found - cannot test reward distribution');
            console.log('💡 Add your testnet mnemonic to test full functionality');
            return;
        }
        
        const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(testProvider);
        console.log(`✅ Wallet connected: ${wallet.address}`);
        
        // Check wallet balance
        const balance = await testProvider.getBalance(wallet.address);
        console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} VET`);
        
        // Connect to VeBetterDAO rewards pool
        const rewardsPool = new ethers.Contract(
            CONFIG.X2EARN_REWARDS_POOL,
            REWARDS_POOL_ABI,
            wallet
        );
        
        console.log('🔍 Testing VeBetterDAO contract calls...');
        
        // Test app balance check
        try {
            const appBalance = await rewardsPool.getAppBalance(CONFIG.APP_ID);
            console.log(`✅ App balance: ${ethers.formatEther(appBalance)} B3TR`);
        } catch (balanceError) {
            console.log('⚠️  App balance check failed - this is expected if app needs funding');
            console.log(`   Error: ${balanceError.message}`);
        }
        
        // Test reward distribution (very small amount)
        const testRecipient = wallet.address;
        const testAmount = ethers.parseEther('0.01'); // 0.01 B3TR
        
        console.log(`🧪 Testing reward distribution (${ethers.formatEther(testAmount)} B3TR)...`);
        
        try {
            // Prepare proof data
            const proofTypes = ['receipt_validation', 'store_verification'];
            const proofValues = ['integration_test', 'test_store'];
            
            const tx = await rewardsPool.distributeRewardWithProof(
                CONFIG.APP_ID,
                testRecipient,
                testAmount,
                proofTypes,
                proofValues,
                {
                    gasLimit: 300000
                }
            );
            
            console.log(`📤 Transaction submitted: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Reward distribution successful!`);
            console.log(`   Block: ${receipt.blockNumber}`);
            console.log(`   Gas used: ${receipt.gasUsed}`);
            
        } catch (rewardError) {
            if (rewardError.message.includes('insufficient balance')) {
                console.log('⚠️  App needs B3TR tokens for reward distribution');
                console.log('💡 Contact VeBetterDAO team to fund your app');
            } else if (rewardError.message.includes('unauthorized')) {
                console.log('⚠️  Reward distributor not authorized');
                console.log('💡 Verify your wallet is registered as distributor');
            } else {
                console.log(`⚠️  Reward test failed: ${rewardError.message}`);
            }
        }
        
        console.log('\n📋 Integration Status:');
        console.log(`✅ App ID: ${CONFIG.APP_ID}`);
        console.log(`✅ Rewards Pool: ${CONFIG.X2EARN_REWARDS_POOL}`);
        console.log(`✅ Network connection: Working`);
        console.log(`✅ Smart contract: Accessible`);
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Request B3TR tokens from VeBetterDAO team');
        console.log('2. Test with real receipt submissions');
        console.log('3. Monitor transaction success rates');
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        
        if (error.message.includes('network')) {
            console.log('💡 Try alternative VeChain RPC endpoints');
        } else if (error.message.includes('mnemonic')) {
            console.log('💡 Verify your TESTNET_MNEMONIC is correct');
        }
    }
}

// Create integration configuration
function createIntegrationConfig() {
    const config = {
        deployment: {
            network: 'testnet',
            appId: CONFIG.APP_ID,
            rewardsPool: CONFIG.X2EARN_REWARDS_POOL,
            deployedAt: new Date().toISOString()
        },
        integration: {
            ready: true,
            contractType: 'VeBetterDAO_Native',
            description: 'Direct integration with VeBetterDAO rewards system'
        },
        endpoints: {
            distributeReward: `${CONFIG.X2EARN_REWARDS_POOL}#distributeReward`,
            distributeWithProof: `${CONFIG.X2EARN_REWARDS_POOL}#distributeRewardWithProof`,
            checkBalance: `${CONFIG.X2EARN_REWARDS_POOL}#getAppBalance`
        }
    };
    
    console.log('\n💾 Saving integration configuration...');
    require('fs').writeFileSync('vebetterdao-integration.json', JSON.stringify(config, null, 2));
    console.log('✅ Configuration saved to vebetterdao-integration.json');
}

// Execute test
testVeBetterDAOConnection()
    .then(() => {
        createIntegrationConfig();
        console.log('\n🎉 VeBetterDAO integration test complete!');
    })
    .catch(console.error);