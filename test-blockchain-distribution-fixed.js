/**
 * Test script to verify the fixed 70/30 blockchain distribution
 * This script tests that both user and app fund wallets receive real B3TR tokens
 */

import { executeRealBlockchainDistribution, logDistributionResult } from './server/utils/distributeReward-fixed.js';

async function testFixedBlockchainDistribution() {
  console.log('🧪 Testing Fixed Blockchain Distribution (70/30 Model)');
  console.log('======================================================');
  
  // Test with a 10 B3TR reward (7 to user, 3 to app fund)
  const testUserWallet = '0x15D009B3A5811fdE66F19b2db1D40172d53E5653'; // Use a test wallet
  const testAmount = '10.0';
  
  console.log(`Testing distribution of ${testAmount} B3TR:`);
  console.log(`- User should get: ${parseFloat(testAmount) * 0.7} B3TR`);
  console.log(`- App fund should get: ${parseFloat(testAmount) * 0.3} B3TR`);
  console.log('');
  
  try {
    // Execute the fixed distribution
    const result = await executeRealBlockchainDistribution(
      testUserWallet,
      testAmount,
      'test_distribution'
    );
    
    // Log the results
    logDistributionResult(result, 'TEST');
    
    if (result.success) {
      console.log('');
      console.log('✅ SUCCESS: Fixed distribution test completed!');
      console.log(`✅ User received: ${result.userAmount} B3TR (${result.userHash})`);
      
      if (result.appHash) {
        console.log(`✅ App fund received: ${result.appAmount} B3TR (${result.appHash})`);
        console.log('🎉 CRITICAL FIX WORKING: App fund now receives real tokens!');
      } else {
        console.log(`⚠️ App fund transaction failed but user succeeded`);
      }
      
      console.log('');
      console.log('Next steps:');
      console.log('1. Check both wallets on VeChain explorer');
      console.log('2. Verify real B3TR tokens were transferred');
      console.log('3. Replace the old distribution with this fixed version');
      
    } else {
      console.error('❌ FAILED: Distribution test failed');
      console.error('Error:', result.message);
    }
    
  } catch (error) {
    console.error('❌ FAILED: Test script error:', error);
  }
}

// Run the test
testFixedBlockchainDistribution()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });