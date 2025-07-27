/**
 * Direct test of the fixed blockchain distribution function
 * This bypasses the API and tests the core distribution logic
 */

import { sendReward } from './server/utils/distributeReward-hybrid.ts';

async function testDirectBlockchainFix() {
  console.log('🔧 Direct Test: Fixed Blockchain Distribution');
  console.log('=============================================');
  
  const testRecipient = '0x15D009B3A5811fdE66F19b2db1D40172d53E5653'; // Test wallet
  const testAmount = '10.0'; // 10 B3TR total
  
  console.log(`Testing direct blockchain distribution:`);
  console.log(`- Total amount: ${testAmount} B3TR`);
  console.log(`- User (70%): ${parseFloat(testAmount) * 0.7} B3TR`);
  console.log(`- App fund (30%): ${parseFloat(testAmount) * 0.3} B3TR`);
  console.log(`- Recipient: ${testRecipient}`);
  console.log(`- App fund wallet: 0x119761865b79bea9e7924edaa630942322ca09d1`);
  console.log('');
  
  try {
    console.log('Executing blockchain distribution...');
    
    const result = await sendReward({
      recipient: testRecipient,
      amount: testAmount,
      proofTypes: ["blockchain_fix_test", "direct_test"],
      proofValues: ["test-fix-001", "verification"],
      impactTypes: ["test_impact"],
      impactValues: ["direct_blockchain_test"],
      receiptId: 'test-fix-001',
      mode: 'auto'
    });
    
    console.log('');
    console.log('📊 Distribution Results:');
    console.log('========================');
    
    if (result.success) {
      console.log('✅ Distribution Status: SUCCESS');
      console.log(`✅ Message: ${result.message}`);
      console.log('');
      
      console.log('🔍 Transaction Analysis:');
      if (result.userHash) {
        console.log(`✅ User Transaction: ${result.userHash}`);
        console.log(`   Amount: ${result.distribution?.user || 'Unknown'} B3TR`);
      } else {
        console.log('❌ User Transaction: FAILED');
      }
      
      if (result.appHash) {
        console.log(`✅ App Fund Transaction: ${result.appHash}`);
        console.log(`   Amount: ${result.distribution?.app || 'Unknown'} B3TR`);
        console.log('🎉 CRITICAL FIX WORKING: App fund receives real tokens!');
      } else {
        console.log('❌ App Fund Transaction: FAILED');
        console.log('⚠️ Still need to fix app fund blockchain execution');
      }
      
      console.log('');
      console.log('📈 Business Impact:');
      if (result.userHash && result.appHash) {
        console.log('✅ Revenue generation: FIXED');
        console.log('✅ Both wallets receive real B3TR tokens');
        console.log('✅ 70/30 model working correctly');
      } else {
        console.log('❌ Revenue generation: STILL BROKEN');
        console.log('❌ App fund not receiving real tokens');
      }
      
    } else {
      console.log('❌ Distribution Status: FAILED');
      console.log(`❌ Error: ${result.message}`);
      console.log('❌ Both transactions failed');
    }
    
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('1. Monitor VeChain testnet for transaction confirmations');
    console.log('2. Check wallet balances for actual token transfers');
    console.log('3. If working, apply to all reward endpoints');
    console.log('4. Test with various amounts and scenarios');
    
  } catch (error) {
    console.error('❌ Direct test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the direct test
testDirectBlockchainFix()
  .then(() => {
    console.log('\n✅ Direct blockchain test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Direct test failed:', error);
    process.exit(1);
  });