/**
 * CRITICAL TEST: Verify Real Blockchain Distribution is Working
 * 
 * This test will verify that the sendReward function actually creates real VeChain transactions
 * instead of fake placeholder hashes like "txhash-a-197fa456d0e"
 */

import { sendReward } from './server/utils/distributeReward.js';

async function testRealBlockchainFix() {
  console.log('🧪 TESTING REAL BLOCKCHAIN DISTRIBUTION');
  console.log('=====================================');
  
  // Test with the same wallet that had fake transactions
  const testUserWallet = '0xf1f72b305b7bf7b25e85d356927af36b88dc84ee';
  const testAmount = '5.0'; // Small test amount
  
  console.log(`\n📊 Test Parameters:`);
  console.log(`User Wallet: ${testUserWallet}`);
  console.log(`Amount: ${testAmount} B3TR`);
  console.log(`Expected: 70% (${parseFloat(testAmount) * 0.7} B3TR) to user, 30% (${parseFloat(testAmount) * 0.3} B3TR) to app fund\n`);
  
  try {
    console.log('⏳ Calling sendReward function...');
    
    const result = await sendReward({
      recipient: testUserWallet,
      amount: testAmount,
      proofTypes: ["receipt_id", "test_verification"],
      proofValues: ["TEST-001", "blockchain_fix_test"],
      impactTypes: ["test_run"],
      impactValues: ["verification"],
      receiptId: 'TEST-BLOCKCHAIN'
    });
    
    console.log('\n📝 RESULT ANALYSIS:');
    console.log('==================');
    console.log(`Success: ${result.success}`);
    console.log(`Message: ${result.message}`);
    console.log(`User TX Hash: ${result.hash}`);
    console.log(`App TX Hash: ${result.appHash || 'Not provided'}`);
    
    // Check if transaction hashes look real
    const isRealHash = result.hash && result.hash.startsWith('0x') && result.hash.length === 66;
    const isFakeHash = result.hash && (result.hash.includes('txhash-') || result.hash.includes('test-tx-hash'));
    
    console.log('\n🔍 HASH ANALYSIS:');
    console.log('=================');
    console.log(`Hash Format: ${result.hash}`);
    console.log(`Real VeChain Hash: ${isRealHash ? '✅ YES' : '❌ NO'}`);
    console.log(`Fake/Mock Hash: ${isFakeHash ? '❌ YES' : '✅ NO'}`);
    
    if (isRealHash) {
      console.log('\n🎉 SUCCESS: Real blockchain transactions are working!');
      console.log(`View on testnet explorer: https://explore-testnet.vechain.org/transactions/${result.hash}`);
      
      if (result.appHash && result.appHash.startsWith('0x')) {
        console.log(`App fund transaction: https://explore-testnet.vechain.org/transactions/${result.appHash}`);
      }
    } else {
      console.log('\n❌ PROBLEM: Still generating fake transaction hashes');
      console.log('This means the blockchain distribution is not working properly.');
      
      // Check environment variables that might be causing test mode
      console.log('\n🔍 Environment Check:');
      console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
      console.log(`TEST_MODE: ${process.env.TEST_MODE}`);
      console.log(`VECHAIN_NETWORK: ${process.env.VECHAIN_NETWORK}`);
      console.log(`REWARD_DISTRIBUTOR_WALLET: ${process.env.REWARD_DISTRIBUTOR_WALLET ? 'SET' : 'NOT SET'}`);
    }
    
    console.log('\n📊 Distribution Details:');
    if (result.distribution) {
      console.log(`User Amount: ${result.distribution.user} B3TR`);
      console.log(`App Amount: ${result.distribution.app || '0'} B3TR`);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR during blockchain test:', error);
    console.error('Stack trace:', error.stack);
  }
}

testRealBlockchainFix().catch(console.error);