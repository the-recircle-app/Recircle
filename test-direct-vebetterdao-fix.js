/**
 * Test VeBetterDAO Direct Distribution Fix
 * This script tests the exact issue preventing automatic token distribution to VeWorld
 */

// Test script to debug VeBetterDAO distribution issue

const VECHAIN_CONFIG = {
    APP_ID: '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1',
    DISTRIBUTOR: '0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee',
    TESTNET_USER: '0x87c844e3314396ca43e5a6065e418d26a09db02b'
};

async function testDirectVeBetterDAODistribution() {
    console.log('🔍 TESTING VEBETTERDAO DIRECT DISTRIBUTION');
    console.log('=========================================');
    console.log(`App ID: ${VECHAIN_CONFIG.APP_ID}`);
    console.log(`Distributor: ${VECHAIN_CONFIG.DISTRIBUTOR}`);
    console.log(`Test User: ${VECHAIN_CONFIG.TESTNET_USER}`);
    console.log('');

    // Test data that mimics a high-confidence Uber receipt
    const rewardData = {
        recipient: VECHAIN_CONFIG.TESTNET_USER,
        amount: 7.5, // B3TR tokens
        receiptData: {
            storeName: "Uber",
            category: "ride_share",
            totalAmount: 25.99,
            confidence: 0.95,
            ipfsHash: "QmTestUberReceipt123"
        },
        environmentalImpact: {
            co2SavedGrams: 750,
            sustainabilityCategory: "sustainable_transportation"
        }
    };

    console.log('📋 Test reward data:');
    console.log(JSON.stringify(rewardData, null, 2));
    console.log('');

    try {
        console.log('🚀 Attempting VeBetterDAO distribution...');
        const result = await distributeVeBetterDAOReward(rewardData);
        
        console.log('📊 DISTRIBUTION RESULT:');
        console.log(`Success: ${result.success}`);
        console.log(`Transaction Hash: ${result.txHash || 'N/A'}`);
        console.log(`Error: ${result.error || 'N/A'}`);
        
        if (result.success) {
            console.log('');
            console.log('✅ SUCCESS! VeBetterDAO distribution working correctly');
            console.log(`🔗 Transaction: ${result.txHash}`);
            console.log('💰 User should now see B3TR tokens in VeWorld wallet');
        } else {
            console.log('');
            console.log('❌ FAILED! VeBetterDAO distribution not working');
            console.log(`🔧 Error details: ${result.error}`);
            console.log('');
            console.log('🎯 COMMON FIXES:');
            console.log('1. Check app is properly registered in VeBetterDAO governance');
            console.log('2. Verify app has sufficient B3TR balance for distribution');
            console.log('3. Confirm distributor wallet is authorized');
            console.log('4. Check contract addresses are correct for testnet');
        }
        
        return result;
    } catch (error) {
        console.error('❌ CRITICAL ERROR:', error);
        return { success: false, error: error.message };
    }
}

// Run the test
testDirectVeBetterDAODistribution()
    .then(result => {
        console.log('');
        console.log('🏁 Test completed');
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Test crashed:', error);
        process.exit(1);
    });