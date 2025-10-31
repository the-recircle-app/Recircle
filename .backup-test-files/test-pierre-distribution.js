#!/usr/bin/env node

/**
 * Test Pierre-style B3TR distribution
 * This will show B3TR tokens in VeWorld wallets immediately
 */

const API_URL = process.env.REPLIT_DEV_DOMAIN ? 
  `https://${process.env.REPLIT_DEV_DOMAIN}` : 
  'http://localhost:5000';

async function testPierreDistribution() {
    console.log('🎯 Testing Pierre-style B3TR distribution for immediate wallet visibility...');
    
    try {
        const testData = {
            wallet: "0x15d009b3a5811fde66f19b2db1d40172d53e5653", // Your test wallet
            amount: 10 // 10 B3TR tokens
        };
        
        console.log(`📡 Sending request to ${API_URL}/api/test/pierre-distribution`);
        console.log('Test data:', testData);
        
        const response = await fetch(`${API_URL}/api/test/pierre-distribution`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        const result = await response.json();
        
        console.log('\n✅ Pierre Distribution Test Results:');
        console.log('=====================================');
        console.log(`User Wallet: ${result.results.user.wallet}`);
        console.log(`User Amount: ${result.results.user.amount} B3TR`);
        console.log(`User TX Hash: ${result.results.user.txHash}`);
        console.log(`User Success: ${result.results.user.success}`);
        console.log('');
        console.log(`App Fund Wallet: ${result.results.appFund.wallet}`);
        console.log(`App Fund Amount: ${result.results.appFund.amount} B3TR`);
        console.log(`App Fund TX Hash: ${result.results.appFund.txHash}`);
        console.log(`App Fund Success: ${result.results.appFund.success}`);
        console.log('');
        console.log(`Environment: ${result.environment}`);
        console.log(`Note: ${result.note}`);
        
        if (result.results.user.success && result.results.appFund.success) {
            console.log('\n🎉 SUCCESS! Pierre-style distribution completed');
            console.log('👀 Check your VeWorld wallet - B3TR tokens should be visible now');
            console.log('📱 Open VeWorld app and look in "My tokens" section');
        } else {
            console.log('\n⚠️  Partial success - check individual results above');
        }
        
    } catch (error) {
        console.error('❌ Pierre distribution test failed:', error.message);
        process.exit(1);
    }
}

testPierreDistribution();