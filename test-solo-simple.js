/**
 * Simple test of Solo node B3TR functionality
 * Tests real B3TR token transfers on integrated solo node
 */

const BASE_URL = 'http://localhost:5000';

async function testSoloNodeB3TR() {
    console.log('🧪 Testing Integrated Solo Node B3TR Distribution');
    
    try {
        // Test 1: Check solo node status
        console.log('\n1. 📊 Checking Solo Node Status...');
        const statusResponse = await fetch(`${BASE_URL}/solo/status`);
        const status = await statusResponse.json();
        console.log('   Status:', status);
        
        // Test 2: Check B3TR balances
        console.log('\n2. 💰 Checking B3TR Balances...');
        const account1 = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';
        const account2 = '0xd3ae78222beadb038203be21ed5ce7c9b1bff602';
        const contractAddress = '0x5ef79995fe8a89e0812330e4378eb2660cede699';
        
        const balance1Response = await fetch(`${BASE_URL}/solo/contracts/${contractAddress}/balances/${account1}`);
        const balance1 = await balance1Response.json();
        console.log(`   Account 1 (${account1}): ${balance1.balance} B3TR`);
        
        const balance2Response = await fetch(`${BASE_URL}/solo/contracts/${contractAddress}/balances/${account2}`);
        const balance2 = await balance2Response.json();
        console.log(`   Account 2 (${account2}): ${balance2.balance} B3TR`);
        
        // Test 3: Execute B3TR transfer
        console.log('\n3. 📤 Testing B3TR Transfer...');
        const transferAmount = '5000000000000000000'; // 5 B3TR (18 decimals)
        
        const transferResponse = await fetch(`${BASE_URL}/solo/contracts/${contractAddress}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from: account1,
                to: account2,
                amount: transferAmount
            })
        });
        
        const transferResult = await transferResponse.json();
        console.log('   Transfer result:', transferResult);
        
        if (transferResult.txID) {
            console.log('   ✅ SUCCESS: Real B3TR transfer completed');
            console.log(`   Transaction ID: ${transferResult.txID}`);
            
            // Check updated balances
            console.log('\n4. 🔄 Checking Updated Balances...');
            const newBalance2Response = await fetch(`${BASE_URL}/solo/contracts/${contractAddress}/balances/${account2}`);
            const newBalance2 = await newBalance2Response.json();
            console.log(`   Account 2 new balance: ${newBalance2.balance} B3TR`);
            
            // Verify the increase
            const oldBalance = BigInt(balance2.balance);
            const newBalance = BigInt(newBalance2.balance);
            const increase = newBalance - oldBalance;
            console.log(`   Balance increase: ${increase.toString()} wei (${increase.toString() / BigInt('1000000000000000000')} B3TR)`);
            
            if (increase > 0) {
                console.log('   ✅ SUCCESS: Balance correctly increased after transfer');
                return { success: true, txHash: transferResult.txID, amount: increase.toString() };
            } else {
                console.log('   ❌ ERROR: Balance did not increase');
                return { success: false, error: 'Balance did not increase after transfer' };
            }
        } else {
            console.log('   ❌ ERROR: Transfer failed');
            return { success: false, error: transferResult.error || 'Transfer failed' };
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run the test
testSoloNodeB3TR()
    .then((result) => {
        console.log('\n📋 Final Test Result:', result);
        if (result.success) {
            console.log('🎉 CONCLUSION: Solo node B3TR distribution is working with real tokens!');
        } else {
            console.log('❌ CONCLUSION: Solo node B3TR distribution failed');
        }
    })
    .catch((error) => {
        console.error('Test suite error:', error);
    });