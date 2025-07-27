#!/usr/bin/env node
import fetch from 'node-fetch';

const YOUR_WALLET = '0x865306084235Bf804c8Bba8a8d56890940ca8F0b';

console.log('🎯 Testing DIRECT B3TR distribution to your wallet...');
console.log('Wallet:', YOUR_WALLET);

async function testDirectDistribution() {
    try {
        console.log('\n1️⃣ Calling VeBetterDAO distribution endpoint...');
        
        const response = await fetch('http://localhost:5000/api/test/vebetterdao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: YOUR_WALLET,
                userAmount: 25.5,
                appFundAmount: 10.9,
                proof: 'direct_test_' + Date.now()
            })
        });
        
        const result = await response.json();
        console.log('Distribution result:', result);
        
        if (result.success) {
            console.log('\n✅ SUCCESS! B3TR tokens distributed');
            console.log('Transaction Hash:', result.txHash);
            console.log('Amount:', result.userAmount, 'B3TR');
            console.log('App Fund:', result.appFundAmount, 'B3TR');
        } else {
            console.log('\n❌ Distribution failed:', result.error);
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

testDirectDistribution().then(result => {
    console.log('\n📋 FINAL RESULT:');
    if (result.success) {
        console.log('✅ Real B3TR tokens sent to your wallet!');
        console.log('Transaction:', result.txHash);
        console.log('\n🎯 Next Steps:');
        console.log('1. Add Solo network to VeWorld:');
        console.log('   - Chain ID: 39');
        console.log('   - RPC URL: http://localhost:5000/solo');
        console.log('2. Check your wallet for B3TR tokens');
        console.log('3. The tokens should be visible in your VeWorld app');
    } else {
        console.log('❌ Failed:', result.error || 'Unknown error');
    }
});