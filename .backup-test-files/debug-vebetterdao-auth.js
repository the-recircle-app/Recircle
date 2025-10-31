import { ThorClient } from '@vechain/sdk-network';
import dotenv from 'dotenv';
dotenv.config();

const CONFIG = {
    APP_ID: process.env.APP_ID || '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1',
    X2EARN_APPS: '0xcB23Eb1bBD5c07553795b9538b1061D0f4ABA153',
    X2EARN_REWARDS_POOL: '0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38',
    DISTRIBUTOR: '0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee'
};

async function debugVeBetterDAOAuth() {
    try {
        const thorClient = ThorClient.at('https://testnet.vechain.org');
        
        console.log('=== VeBetterDAO Authorization Debug ===');
        console.log(`App ID: ${CONFIG.APP_ID}`);
        console.log(`Distributor Wallet: ${CONFIG.DISTRIBUTOR}`);
        
        // Check if app exists in X2EarnApps
        const appsABI = [{
            name: 'apps',
            inputs: [{ name: '', type: 'bytes32' }],
            outputs: [
                { name: 'id', type: 'bytes32' },
                { name: 'name', type: 'string' },
                { name: 'admin', type: 'address' },
                { name: 'metadataURI', type: 'string' }
            ],
            constant: true,
            type: 'function'
        }];
        
        const appsContract = thorClient.contracts.load(CONFIG.X2EARN_APPS, appsABI);
        const appInfo = await appsContract.read.apps(CONFIG.APP_ID);
        
        console.log('\n=== App Registration Status ===');
        console.log(`App exists: ${appInfo[0] !== '0x0000000000000000000000000000000000000000000000000000000000000000'}`);
        console.log(`App name: ${appInfo[1]}`);
        console.log(`App admin: ${appInfo[2]}`);
        
        // Check if distributor is app admin
        const isAdminABI = [{
            name: 'isAppAdmin',
            inputs: [
                { name: 'appId', type: 'bytes32' },
                { name: 'admin', type: 'address' }
            ],
            outputs: [{ name: '', type: 'bool' }],
            constant: true,
            type: 'function'
        }];
        
        const rewardsContract = thorClient.contracts.load(CONFIG.X2EARN_REWARDS_POOL, isAdminABI);
        const isAdmin = await rewardsContract.read.isAppAdmin(CONFIG.APP_ID, CONFIG.DISTRIBUTOR);
        
        console.log('\n=== Authorization Status ===');
        console.log(`Distributor is app admin: ${isAdmin}`);
        console.log(`Registered admin: ${appInfo[2]}`);
        console.log(`Distributor wallet: ${CONFIG.DISTRIBUTOR}`);
        console.log(`Admin matches distributor: ${appInfo[2].toLowerCase() === CONFIG.DISTRIBUTOR.toLowerCase()}`);
        
        if (!isAdmin) {
            console.log('\n❌ ISSUE FOUND: Distributor wallet not authorized as app admin');
            console.log('SOLUTION: Update app admin to distributor wallet or use registered admin wallet');
        } else {
            console.log('\n✅ Authorization looks correct - checking other issues...');
        }
        
    } catch (error) {
        console.error('Debug error:', error.message);
    }
}

debugVeBetterDAOAuth();