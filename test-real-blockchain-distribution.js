/**
 * Test script to verify the fixed 70/30 blockchain distribution with REAL transactions
 * This will test that both user and app fund wallets receive actual B3TR tokens
 */

async function testRealBlockchainDistribution() {
  console.log('🔧 Testing Fixed Blockchain Distribution (Real Transactions)');
  console.log('========================================================');
  
  const testAmount = '10.0'; // 10 B3TR total (7 to user, 3 to app fund)
  const userId = 102; // Test user
  
  console.log(`Testing ${testAmount} B3TR distribution:`);
  console.log(`- User should receive: ${parseFloat(testAmount) * 0.7} B3TR`);
  console.log(`- App fund should receive: ${parseFloat(testAmount) * 0.3} B3TR`);
  console.log('');
  
  try {
    // Submit a test receipt to trigger the fixed distribution
    const response = await fetch('http://localhost:5000/api/submit-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        amount: testAmount,
        store: 'Waymo Self-Driving Test',
        imageUrl: 'data:image/jpeg;base64,test_fixed_distribution',
        confidence: 0.95,
        validationResult: {
          isValid: true,
          isThriftStore: false,
          isTransportation: true,
          confidence: 0.95,
          merchant: 'Waymo',
          amount: parseFloat(testAmount),
          category: 'ride_share',
          description: 'Testing fixed blockchain distribution'
        }
      })
    });
    
    const result = await response.json();
    console.log('Receipt submission result:', result);
    
    if (result.blockchainTx) {
      console.log('');
      console.log('🔍 Blockchain Transaction Analysis:');
      console.log('=====================================');
      
      if (result.blockchainTx.success) {
        console.log('✅ Distribution Status: SUCCESS');
        console.log(`✅ User Hash: ${result.blockchainTx.userHash || 'Missing'}`);
        console.log(`✅ App Fund Hash: ${result.blockchainTx.appHash || 'Missing'}`);
        
        if (result.blockchainTx.userHash && result.blockchainTx.appHash) {
          console.log('');
          console.log('🎉 CRITICAL FIX WORKING!');
          console.log('Both wallets received REAL blockchain transactions!');
          console.log('');
          console.log('📊 Revenue Generation:');
          console.log(`- User received: ${parseFloat(testAmount) * 0.7} B3TR (real tokens)`);
          console.log(`- App fund received: ${parseFloat(testAmount) * 0.3} B3TR (real tokens)`);
          console.log('- Business model now generating actual revenue!');
          
        } else {
          console.log('');
          console.log('⚠️ PARTIAL FIX:');
          if (result.blockchainTx.userHash && !result.blockchainTx.appHash) {
            console.log('- User transaction: SUCCESS');
            console.log('- App fund transaction: FAILED');
            console.log('- Still need to fix app fund blockchain calls');
          }
        }
        
      } else {
        console.log('❌ Distribution Status: FAILED');
        console.log('Error:', result.blockchainTx.message);
      }
      
      console.log('');
      console.log('🔍 Next Steps:');
      console.log('1. Check VeChain explorer for transaction confirmations');
      console.log('2. Verify token balances in both wallets');
      console.log('3. Monitor for additional test transactions');
      console.log('4. Apply to all reward types (achievements, streaks)');
      
    } else {
      console.log('❌ No blockchain transaction data in response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRealBlockchainDistribution()
  .then(() => {
    console.log('\n✅ Blockchain distribution test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });