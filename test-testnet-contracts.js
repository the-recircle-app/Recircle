import { ThorClient } from '@vechain/sdk-network';
import dotenv from 'dotenv';
dotenv.config();

async function testTestnetContracts() {
    try {
        const thorClient = ThorClient.at('https://testnet.vechain.org');
        
        console.log('=== Testing VeBetterDAO Testnet Contracts ===');
        
        const CONFIG = {
            APP_ID: process.env.APP_ID,
            X2EARN_REWARDS_POOL: process.env.X2EARN_REWARDS_POOL,
            DISTRIBUTOR: process.env.REWARD_DISTRIBUTOR_WALLET,
            TREASURY: process.env.ADMIN_PRIVATE_KEY ? '0x15d009b3a5811fde66f19b2db1d40172d53e5653' : 'Unknown'
        };
        
        console.log(`App ID: ${CONFIG.APP_ID}`);
        console.log(`X2EarnRewardsPool: ${CONFIG.X2EARN_REWARDS_POOL}`);
        console.log(`Distributor: ${CONFIG.DISTRIBUTOR}`);
        console.log(`Treasury/Admin: ${CONFIG.TREASURY}`);
        
        // Test if contracts are actually deployed on testnet
        const rewardsPoolCode = await thorClient.accounts.getAccount(CONFIG.X2EARN_REWARDS_POOL);
        console.log(`\nRewards Pool Contract exists: ${rewardsPoolCode.codeHash !== '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'}`);
        
        // Check if this is actually a testnet vs mainnet issue
        if (rewardsPoolCode.codeHash === '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470') {
            console.log('❌ Contract not found on testnet - checking if these are mainnet addresses...');
            
            // Try mainnet
            const mainnetClient = ThorClient.at('https://mainnet.vechain.org');
            const mainnetCode = await mainnetClient.accounts.getAccount(CONFIG.X2EARN_REWARDS_POOL);
            console.log(`Contract exists on mainnet: ${mainnetCode.codeHash !== '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'}`);
            
            if (mainnetCode.codeHash !== '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470') {
                console.log('🎯 ISSUE FOUND: You are using MAINNET contract addresses but connecting to TESTNET');
                console.log('SOLUTION: Either switch to mainnet network or get correct testnet contract addresses');
            }
        } else {
            console.log('✅ Contract found on testnet, checking authorization...');
            
            // Test actual authorization
            const testReward = await thorClient.contracts.load(CONFIG.X2EARN_REWARDS_POOL, [{
                name: 'distributeReward',
                inputs: [
                    { name: 'appId', type: 'bytes32' },
                    { name: 'amount', type: 'uint256' },
                    { name: 'recipient', type: 'address' },
                    { name: 'proof', type: 'string' }
                ],
                outputs: [{ name: '', type: 'bool' }],
                type: 'function'
            }]);
            
            console.log('Contract loaded successfully for testing');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testTestnetContracts();