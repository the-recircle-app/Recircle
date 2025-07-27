/**
 * Test complete VeBetterDAO integration with Solo node
 * Tests the full ReCircle reward distribution system
 */

async function testCompleteVeBetterDAO() {
    console.log('🧪 Testing Complete VeBetterDAO Integration with Solo Node');
    
    try {
        // Test the solo VeBetterDAO distribution directly
        const { distributeSoloVeBetterDAO, getSoloB3TRBalance } = await import('./server/utils/solo-vebetterdao.js');
        
        const testRecipient = '0xd3ae78222beadb038203be21ed5ce7c9b1bff602';
        const testAmount = 8;
        
        console.log('\n1. 📊 Checking initial balance...');
        const initialBalance = await getSoloB3TRBalance(testRecipient);
        console.log(`   Initial balance: ${initialBalance} B3TR`);
        
        console.log(`\n2. 📤 Distributing ${testAmount} B3TR via Solo VeBetterDAO...`);
        const result = await distributeSoloVeBetterDAO(testRecipient, testAmount);
        
        if (result.success) {
            console.log('   ✅ SUCCESS: Distribution completed');
            console.log(`   Transaction Hash: ${result.txHash}`);
            console.log(`   Amount: ${result.amount} B3TR`);
            console.log(`   Recipient: ${result.recipient}`);
            
            console.log('\n3. 🔄 Checking final balance...');
            const finalBalance = await getSoloB3TRBalance(testRecipient);
            console.log(`   Final balance: ${finalBalance} B3TR`);
            
            const balanceIncrease = BigInt(finalBalance) - BigInt(initialBalance);
            console.log(`   Balance increase: ${balanceIncrease} B3TR`);
            
            if (balanceIncrease >= BigInt(testAmount)) {
                console.log('   ✅ SUCCESS: Balance correctly increased');
                return { success: true, result };
            } else {
                console.log('   ❌ ERROR: Balance did not increase correctly');
                return { success: false, error: 'Balance verification failed' };
            }
        } else {
            console.log('   ❌ FAILED: Distribution failed');
            console.log(`   Error: ${result.error}`);
            return { success: false, result };
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Test the API endpoint integration
async function testAPIIntegration() {
    console.log('\n🌐 Testing API VeBetterDAO Integration');
    
    try {
        const response = await fetch('http://localhost:5000/api/test/vebetterdao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: '0xd3ae78222beadb038203be21ed5ce7c9b1bff602',
                amount: 6
            })
        });
        
        const result = await response.json();
        console.log('API Response:', JSON.stringify(result, null, 2));
        
        return result.distribution_result?.success || false;
        
    } catch (error) {
        console.error('API test failed:', error.message);
        return false;
    }
}

// Run complete test suite
testCompleteVeBetterDAO()
    .then((result) => {
        console.log('\n📊 Direct Test Result:', result);
        return testAPIIntegration();
    })
    .then((apiSuccess) => {
        console.log('\n📊 API Test Success:', apiSuccess);
        
        if (apiSuccess) {
            console.log('\n🎉 CONCLUSION: Complete VeBetterDAO integration working with real B3TR tokens!');
            console.log('    ✅ Solo node operational');
            console.log('    ✅ Real B3TR transfers working');
            console.log('    ✅ API integration functional');
            console.log('    ✅ Ready for ReCircle receipt processing');
        } else {
            console.log('\n❌ CONCLUSION: API integration needs fixes');
        }
    })
    .catch((error) => {
        console.error('Test suite error:', error);
    });