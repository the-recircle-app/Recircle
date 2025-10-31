/**
 * Test real B3TR distribution using the integrated solo node system
 * This script directly tests our working solo node with real B3TR tokens
 */

// Test the working real B3TR distribution system
async function testRealB3TRDistribution() {
    console.log('🧪 Testing Real B3TR Distribution on Solo Node');
    
    try {
        // Import and test solo B3TR distribution directly
        const { distributeRealB3TR } = await import('./server/utils/solo-b3tr-real.js');
        
        const testRecipient = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed'; // Pre-funded account
        const testAmount = 10; // 10 B3TR tokens
        
        console.log(`📤 Distributing ${testAmount} B3TR to ${testRecipient}`);
        
        const result = await distributeRealB3TR(testRecipient, testAmount);
        
        if (result.success) {
            console.log('✅ SUCCESS: Real B3TR distribution completed');
            console.log(`   Transaction Hash: ${result.txHash}`);
            console.log(`   Amount: ${testAmount} B3TR`);
            console.log(`   Recipient: ${testRecipient}`);
        } else {
            console.log('❌ FAILED: Real B3TR distribution failed');
            console.log(`   Error: ${result.error}`);
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Test script error:', error.message);
        return { success: false, error: error.message };
    }
}

// Also test API endpoint
async function testAPIEndpoint() {
    console.log('\n🌐 Testing API Endpoint for Solo B3TR');
    
    try {
        const response = await fetch('http://localhost:5000/api/test/solo-distribution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
                amount: 5
            })
        });
        
        const result = await response.text();
        console.log('API Response:', result);
        
    } catch (error) {
        console.error('API test failed:', error.message);
    }
}

// Run tests
testRealB3TRDistribution()
    .then((result) => {
        console.log('\n📊 Final Result:', result);
        return testAPIEndpoint();
    })
    .catch((error) => {
        console.error('Test suite failed:', error);
    });