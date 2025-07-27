#!/usr/bin/env node
import fetch from 'node-fetch';

const YOUR_WALLET = '0x865306084235Bf804c8Bba8a8d56890940ca8F0b';
const API_BASE = 'http://localhost:5000/api';

console.log('🧪 Testing ReCircle B3TR distribution to your wallet...');
console.log('Wallet Address:', YOUR_WALLET);

async function testTokenDistribution() {
    try {
        // 1. Create or get user with your wallet
        console.log('\n1️⃣ Creating user account...');
        const createUserResponse = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser_' + Date.now(),
                password: 'testpass123',
                walletAddress: YOUR_WALLET
            })
        });
        
        const userData = await createUserResponse.json();
        console.log('User created:', userData);
        
        // 2. Submit a high-confidence transportation receipt
        console.log('\n2️⃣ Submitting Uber receipt for auto-approval...');
        const receiptData = {
            storeId: 1, // Default transportation store
            userId: userData.id,
            amount: 25.50,
            purchaseDate: new Date().toISOString(),
            category: 'transportation',
            tokenReward: 17.85, // 70% of 25.50
            needsManualReview: false,
            hasImage: true,
            verified: true
        };
        
        const receiptResponse = await fetch(`${API_BASE}/receipts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(receiptData)
        });
        
        const receiptResult = await receiptResponse.json();
        console.log('Receipt submitted:', receiptResult);
        
        // 3. Check user balance after distribution
        console.log('\n3️⃣ Checking token distribution...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for processing
        
        const balanceResponse = await fetch(`${API_BASE}/users/${userData.id}`);
        const balanceData = await balanceResponse.json();
        console.log('User balance after receipt:', balanceData.totalTokens, 'B3TR');
        
        // 4. Check transaction details
        if (receiptResult.blockchain?.txHash) {
            console.log('\n4️⃣ Blockchain transaction details:');
            console.log('Transaction Hash:', receiptResult.blockchain.txHash);
            console.log('User Amount:', receiptResult.blockchain.userAmount, 'B3TR');
            console.log('App Fund Amount:', receiptResult.blockchain.appFundAmount, 'B3TR');
            console.log('✅ Real B3TR tokens distributed to your wallet!');
        } else {
            console.log('\n⚠️ Receipt queued for manual review');
        }
        
        return {
            success: true,
            walletAddress: YOUR_WALLET,
            tokensEarned: receiptResult.blockchain?.userAmount || 0,
            txHash: receiptResult.blockchain?.txHash
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run the test
testTokenDistribution().then(result => {
    console.log('\n📋 TEST SUMMARY:');
    console.log('Success:', result.success);
    if (result.success) {
        console.log('Wallet:', result.walletAddress);
        console.log('B3TR Earned:', result.tokensEarned);
        console.log('Transaction:', result.txHash);
        console.log('\n🎯 Next Steps:');
        console.log('1. Add Solo network to VeWorld (Chain ID: 39, RPC: http://localhost:5000/solo)');
        console.log('2. Check your wallet for B3TR tokens');
    } else {
        console.log('Error:', result.error);
    }
}).catch(console.error);