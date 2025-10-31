import { ThorClient } from '@vechain/sdk-network';
import dotenv from 'dotenv';
dotenv.config();

const VEBETTERDAO_CONFIG = {
    APP_ID: process.env.APP_ID || '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1',
    X2EARN_REWARDS_POOL: '0x6Bee7DDab6c99d5B2Af0554EaEA484CE18F52631',
};

async function checkAppBalance() {
    try {
        const thorClient = ThorClient.at('https://testnet.vechain.org');
        
        // Check app balance using getAppBalance function
        const getAppBalanceABI = [{
            name: 'getAppBalance',
            inputs: [{ name: 'appId', type: 'bytes32' }],
            outputs: [{ name: '', type: 'uint256' }],
            constant: true,
            type: 'function'
        }];
        
        const contract = thorClient.contracts.load(VEBETTERDAO_CONFIG.X2EARN_REWARDS_POOL, getAppBalanceABI);
        const balanceResult = await contract.read.getAppBalance(VEBETTERDAO_CONFIG.APP_ID);
        
        const balanceWei = balanceResult.toString();
        const balanceB3TR = parseFloat(balanceWei) / 1e18;
        
        console.log(`App Balance Check:`);
        console.log(`  App ID: ${VEBETTERDAO_CONFIG.APP_ID}`);
        console.log(`  X2EarnRewardsPool: ${VEBETTERDAO_CONFIG.X2EARN_REWARDS_POOL}`);
        console.log(`  Balance (wei): ${balanceWei}`);
        console.log(`  Balance (B3TR): ${balanceB3TR.toFixed(6)}`);
        
        if (balanceB3TR > 0) {
            console.log(`✅ App has ${balanceB3TR.toFixed(2)} B3TR available for distribution`);
        } else {
            console.log(`❌ App has no B3TR balance allocated`);
        }
        
    } catch (error) {
        console.error('Error checking app balance:', error.message);
    }
}

checkAppBalance();