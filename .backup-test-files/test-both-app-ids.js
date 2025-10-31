import { ThorClient } from '@vechain/sdk-network';
import { ProviderInternalBaseWallet } from '@vechain/sdk-network';
import dotenv from 'dotenv';
dotenv.config();

async function testBothAppIds() {
    try {
        const thorClient = ThorClient.at('https://testnet.vechain.org');
        
        const MAIN_APP_ID = process.env.APP_ID;
        const TESTNET_APP_ID = process.env.VITE_TESTNET_APP_ID;
        const REWARDS_POOL = process.env.X2EARN_REWARDS_POOL;
        const DISTRIBUTOR_KEY = process.env.DISTRIBUTOR_PRIVATE_KEY;
        
        console.log('=== Testing Both APP IDs ===');
        console.log(`Main APP_ID: ${MAIN_APP_ID}`);
        console.log(`Testnet APP_ID: ${TESTNET_APP_ID}`);
        console.log(`Rewards Pool: ${REWARDS_POOL}`);
        
        const wallet = new ProviderInternalBaseWallet(
            [{ privateKey: Buffer.from(DISTRIBUTOR_KEY.slice(2), 'hex'), address: '' }],
            { 
                node: 'https://testnet.vechain.org',
                network: 'test',
                delegate: {
                    url: 'https://sponsor-testnet.vechain.energy/by/90'
                }
            }
        );
        
        const signer = thorClient.getSigner(wallet.account(0));
        
        // Test with main APP_ID
        console.log('\n=== Testing Main APP_ID ===');
        await testDistribution(thorClient, signer, MAIN_APP_ID, REWARDS_POOL, 'Main');
        
        // Test with testnet APP_ID  
        console.log('\n=== Testing Testnet APP_ID ===');
        await testDistribution(thorClient, signer, TESTNET_APP_ID, REWARDS_POOL, 'Testnet');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function testDistribution(thorClient, signer, appId, rewardsPool, label) {
    try {
        const abi = [{
            name: 'distributeReward',
            inputs: [
                { name: 'appId', type: 'bytes32' },
                { name: 'amount', type: 'uint256' },
                { name: 'recipient', type: 'address' },
                { name: 'proof', type: 'string' }
            ],
            outputs: [{ name: '', type: 'bool' }],
            type: 'function'
        }];
        
        const contract = thorClient.contracts.load(rewardsPool, abi);
        
        // Test tiny amount to user wallet
        const result = await contract.transact.distributeReward(
            appId,
            '1000000000000000000', // 1 B3TR
            '0x87C844e3314396Ca43E5A6065E418D26a09db02B', // Test recipient
            'TEST_PROOF_DATA'
        ).call(signer);
        
        console.log(`${label} APP_ID test:`, {
            txHash: result.txid,
            events: result.outputs?.[0]?.events?.length || 0,
            transfers: result.outputs?.[0]?.transfers?.length || 0,
            success: result.outputs?.[0]?.events?.length > 0 || result.outputs?.[0]?.transfers?.length > 0
        });
        
    } catch (error) {
        console.log(`${label} APP_ID failed:`, error.message);
    }
}

testBothAppIds();