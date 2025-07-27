/**
 * Test VeBetterDAO Registration for ReCircle
 * This script attempts to register ReCircle with the actual VeBetterDAO testnet contracts
 */

import { ethers } from 'ethers';

// Real VeBetterDAO Testnet Contract Addresses
const CONFIG = {
    X2EARN_APPS: '0xcB23Eb1bBD5c07553795b9538b1061D0f4ABA153',
    X2EARN_REWARDS_POOL: '0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38',
    TOKEN_ADDRESS: '0x0dd62dac6abb12bd62a58469b34f4d986697ef19',
    NETWORK_RPC: 'https://testnet.vecha.in',
};

// X2EarnApps contract ABI (key functions only)
const X2EARN_APPS_ABI = [
    "function addApp(address teamWallet, address appAdmin, string memory appName) external",
    "function hashAppName(string memory appName) external view returns (bytes32)",
    "function addRewardDistributor(bytes32 appId, address distributor) external",
    "function getApp(bytes32 appId) external view returns (tuple(string name, address teamWallet, address appAdmin, bool isActive))"
];

async function testVeBetterDAOConnection() {
    console.log('🔗 Testing VeBetterDAO Connection...\n');

    try {
        // Connect to VeChain testnet
        const provider = new ethers.JsonRpcProvider(CONFIG.NETWORK_RPC);
        console.log('✅ Connected to VeChain testnet');

        // Check if mnemonic is available
        const mnemonic = process.env.TESTNET_MNEMONIC;
        if (!mnemonic) {
            console.log('❌ TESTNET_MNEMONIC not found');
            console.log('Please set your testnet mnemonic phrase');
            return;
        }

        // Derive the correct wallet - checking for the one matching your REWARD_DISTRIBUTOR_WALLET
        const wallet = ethers.Wallet.fromPhrase(mnemonic, "m/44'/818'/0'/0/0").connect(provider);
        console.log(`✅ Wallet connected: ${wallet.address}`);
        
        // Verify this matches your expected address
        const expectedAddress = "0x15D009B3A5811fdE66F19b2db1D40172d53E5653";
        if (wallet.address.toLowerCase() !== expectedAddress.toLowerCase()) {
            console.log(`⚠️ Address mismatch. Expected: ${expectedAddress}, Got: ${wallet.address}`);
            // Try different derivation paths
            for (let i = 0; i < 10; i++) {
                const testWallet = ethers.Wallet.fromPhrase(mnemonic, `m/44'/818'/0'/0/${i}`);
                console.log(`  Path m/44'/818'/0'/0/${i}: ${testWallet.address}`);
                if (testWallet.address.toLowerCase() === expectedAddress.toLowerCase()) {
                    console.log(`✅ Found matching wallet at index ${i}`);
                    break;
                }
            }
        }

        // Check wallet balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} VET`);

        if (balance === 0n) {
            console.log('❌ Wallet has no VET. Please get testnet VET from faucet');
            return;
        }

        // Connect to X2EarnApps contract
        const x2EarnApps = new ethers.Contract(CONFIG.X2EARN_APPS, X2EARN_APPS_ABI, wallet);
        console.log('✅ Connected to X2EarnApps contract');

        // Check if ReCircle is already registered
        try {
            const appId = await x2EarnApps.hashAppName("ReCircle");
            console.log(`📝 ReCircle APP_ID would be: ${appId}`);

            try {
                const appData = await x2EarnApps.getApp(appId);
                console.log('✅ ReCircle is already registered!');
                console.log(`   Name: ${appData.name}`);
                console.log(`   Team Wallet: ${appData.teamWallet}`);
                console.log(`   App Admin: ${appData.appAdmin}`);
                console.log(`   Active: ${appData.isActive}`);
                
                // Generate .env update
                console.log('\n🔧 Add this to your .env file:');
                console.log(`APP_ID=${appId}`);
                return appId;
            } catch (getAppError) {
                console.log('ℹ️ ReCircle not yet registered, attempting registration...');
            }
        } catch (hashError) {
            console.log('❌ Error getting APP_ID hash:', hashError.message);
            return;
        }

        // Attempt to register ReCircle
        try {
            console.log('📝 Registering ReCircle app...');
            const tx = await x2EarnApps.addApp(
                wallet.address, // teamWallet
                wallet.address, // appAdmin  
                "ReCircle"      // appName
            );

            console.log(`⏳ Registration transaction submitted: ${tx.hash}`);
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                const appId = await x2EarnApps.hashAppName("ReCircle");
                console.log('🎉 ReCircle successfully registered!');
                console.log(`✅ APP_ID: ${appId}`);
                
                // Generate .env update
                console.log('\n🔧 Add this to your .env file:');
                console.log(`APP_ID=${appId}`);
                console.log(`X2EARN_APPS=${CONFIG.X2EARN_APPS}`);
                console.log(`X2EARN_REWARDS_POOL=${CONFIG.X2EARN_REWARDS_POOL}`);
                console.log(`TOKEN_ADDRESS=${CONFIG.TOKEN_ADDRESS}`);
                
                return appId;
            } else {
                console.log('❌ Registration transaction failed');
            }
        } catch (registerError) {
            if (registerError.message.includes('App already exists')) {
                console.log('ℹ️ App already exists, getting existing APP_ID...');
                const appId = await x2EarnApps.hashAppName("ReCircle");
                console.log(`✅ Existing APP_ID: ${appId}`);
                return appId;
            } else {
                console.log('❌ Registration failed:', registerError.message);
            }
        }

    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        
        if (error.message.includes('network')) {
            console.log('💡 Try checking your internet connection or VeChain testnet status');
        }
    }
}

// Run the test
testVeBetterDAOConnection()
    .then((appId) => {
        if (appId) {
            console.log('\n🎯 Next steps:');
            console.log('1. Update your .env file with the APP_ID above');
            console.log('2. Get testnet B3TR tokens from VeBetterDAO faucet');
            console.log('3. Test reward distribution in your ReCircle app');
        }
    })
    .catch(console.error);

export { testVeBetterDAOConnection, CONFIG };