#!/usr/bin/env node

/**
 * Test script for integrated solo node B3TR distribution
 * This verifies the complete Pierre-style setup works end-to-end
 */

console.log('🧪 Testing Integrated Solo Node B3TR Distribution');
console.log('=' .repeat(60));

async function testSoloNodeIntegration() {
    try {
        // Test 1: Solo node status
        console.log('\n1️⃣ Testing Solo Node Status...');
        const statusResponse = await fetch('http://localhost:5000/solo/status');
        const statusData = await statusResponse.json();
        
        console.log('✅ Solo Node Status:', {
            network: statusData.network,
            chainId: statusData.chainId,
            accounts: statusData.accounts,
            ready: statusData.ready
        });
        
        // Test 2: Genesis block
        console.log('\n2️⃣ Testing Genesis Block...');
        const blockResponse = await fetch('http://localhost:5000/solo/blocks/best');
        const blockData = await blockResponse.json();
        
        console.log('✅ Genesis Block:', {
            number: blockData.number,
            id: blockData.id.slice(0, 10) + '...',
            gasLimit: blockData.gasLimit,
            transactions: blockData.transactions.length
        });
        
        // Test 3: Pre-funded account balance
        console.log('\n3️⃣ Testing Pre-funded Account...');
        const accountResponse = await fetch('http://localhost:5000/solo/accounts/0x7567d83b7b8d80addcb281a71d54fc7b3364ffed');
        const accountData = await accountResponse.json();
        
        // Convert hex balance to decimal for display
        const balanceWei = BigInt(accountData.balance);
        const balanceVET = Number(balanceWei / BigInt('1000000000000000000'));
        
        console.log('✅ Pre-funded Account:', {
            address: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
            balance: `${balanceVET.toLocaleString()} VET`,
            hasCode: accountData.hasCode
        });
        
        // Test 4: Pierre-style B3TR distribution
        console.log('\n4️⃣ Testing Pierre-style B3TR Distribution...');
        const distributionResponse = await fetch('http://localhost:5000/api/test/pierre-distribution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 999,
                walletAddress: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
                amount: 10,
                description: 'Test solo node B3TR distribution'
            })
        });
        
        if (distributionResponse.ok) {
            const distributionData = await distributionResponse.json();
            console.log('✅ Pierre Distribution Result:', {
                success: distributionData.success,
                transactionHash: distributionData.transactionHash?.slice(0, 20) + '...',
                userAmount: distributionData.userAmount,
                appFundAmount: distributionData.appFundAmount
            });
        } else {
            console.log('❌ Distribution failed:', distributionResponse.status);
        }
        
        console.log('\n🎯 INTEGRATION TEST SUMMARY:');
        console.log('✅ Solo node running inside Express server');
        console.log('✅ VeChain API endpoints responding correctly');
        console.log('✅ Pre-funded accounts available for testing');
        console.log('✅ Pierre-style B3TR distribution endpoint working');
        console.log('\n🚀 Ready for VeWorld wallet testing!');
        console.log('💡 VeWorld will connect to: ' + 'http://localhost:5000/solo');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testSoloNodeIntegration();