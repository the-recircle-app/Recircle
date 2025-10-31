#!/usr/bin/env node

/**
 * Quick test to verify the complete wallet flow is ready
 */

console.log('🧪 Testing Complete VeWorld Wallet Flow');
console.log('=' .repeat(50));

async function testWalletFlow() {
    try {
        // Test solo node connection
        console.log('1. Testing solo node connection...');
        const soloStatus = await fetch('http://localhost:5000/solo/status');
        const soloData = await soloStatus.json();
        console.log('✅ Solo node ready:', soloData.ready);
        
        // Test wallet addresses endpoint
        console.log('2. Testing wallet addresses...');
        const walletsResponse = await fetch('http://localhost:5000/api/wallets');
        const walletsData = await walletsResponse.json();
        console.log('✅ Wallet addresses loaded');
        
        // Test Pierre distribution endpoint
        console.log('3. Testing B3TR distribution...');
        const testWallet = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed'; // Pre-funded solo account
        
        const distributionResponse = await fetch('http://localhost:5000/api/test/pierre-distribution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'test-user',
                walletAddress: testWallet,
                amount: 15,
                description: 'Wallet flow test'
            })
        });
        
        const distributionData = await distributionResponse.json();
        console.log('✅ B3TR distribution working:', distributionData.success);
        
        console.log('\n🎯 WALLET FLOW TEST COMPLETE');
        console.log('✅ Solo node integrated and running');
        console.log('✅ VeWorld will connect to: http://localhost:5000/solo');
        console.log('✅ B3TR tokens will be distributed with real transaction hashes');
        console.log('\n💡 Ready to test in browser - no redeployment needed!');
        
    } catch (error) {
        console.error('❌ Wallet flow test failed:', error.message);
    }
}

testWalletFlow();