/**
 * CRITICAL TEST: Real VeBetterDAO Smart Contract Integration
 * 
 * This test verifies that our fixed receipt submission flow now creates
 * REAL VeChain blockchain transactions via VeBetterDAO smart contract
 * instead of just database entries.
 */

const API_BASE_URL = 'http://localhost:5000';

async function testRealVeBetterDAOIntegration() {
  console.log('\n🧪 TESTING REAL VEBETTERDAO SMART CONTRACT INTEGRATION');
  console.log('='.repeat(50));
  
  try {
    // First, ensure test user exists
    const testWallet = '0x6c9f2c3e8a5b4c7d9e1f2a3b4c5d6e7f8a9b0c1d';
    
    console.log('📝 Creating/updating test user...');
    const userResponse = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: testWallet,
        connectedWallet: testWallet
      })
    });
    
    let userId;
    if (userResponse.ok) {
      const userData = await userResponse.json();
      userId = userData.id;
      console.log(`   ✅ User created/found: ID ${userId}`);
    } else {
      // User might already exist, try to find them
      const existingUserResponse = await fetch(`${API_BASE_URL}/api/users?wallet=${testWallet}`);
      if (existingUserResponse.ok) {
        const existingUsers = await existingUserResponse.json();
        userId = existingUsers[0]?.id || 102; // Fallback to 102
        console.log(`   ✅ Existing user found: ID ${userId}`);
      } else {
        userId = 102; // Use hardcoded ID as fallback
        console.log(`   ⚠️ Using fallback user ID: ${userId}`);
      }
    }
    
    // Test data for a high-confidence Uber receipt (should trigger real blockchain)
    const receiptData = {
      userId: userId,
      walletAddress: testWallet,
      storeName: 'Uber Technologies',
      storeId: 10, // Uber store ID
      purchaseDate: new Date().toISOString(),
      amount: 24.50,
      imageUrl: 'test-uber-receipt.jpg',
      isTestMode: false, // IMPORTANT: Real mode to test actual blockchain
      tokenReward: 7.0 // High reward to make it significant
    };
    
    console.log('📝 Submitting test receipt...');
    console.log(`   Store: ${receiptData.storeName}`);
    console.log(`   Amount: $${receiptData.amount}`);
    console.log(`   Expected reward: ${receiptData.tokenReward} B3TR`);
    console.log(`   User wallet: ${receiptData.walletAddress}`);
    
    const response = await fetch(`${API_BASE_URL}/api/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiptData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('\n✅ Receipt submission response:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check if we got a real VeChain transaction hash
    if (result.transaction && result.transaction.txHash) {
      const txHash = result.transaction.txHash;
      
      if (txHash.startsWith('0x') && txHash.length === 66 && !txHash.includes('pending')) {
        console.log('\n🎉 SUCCESS: Real VeChain transaction hash detected!');
        console.log(`   Transaction: ${txHash}`);
        console.log('   This means the VeBetterDAO smart contract was called!');
        
        // Verify the user's balance was updated in the database
        const userResponse = await fetch(`${API_BASE_URL}/api/users/${receiptData.userId}`);
        const userData = await userResponse.json();
        
        console.log(`\n💰 User balance: ${userData.tokenBalance} B3TR`);
        console.log('   User should now see real B3TR tokens in VeWorld wallet!');
        
        return {
          success: true,
          message: 'Real VeBetterDAO smart contract integration working!',
          txHash: txHash,
          userBalance: userData.tokenBalance
        };
        
      } else {
        console.log('\n❌ ISSUE: Still getting pending/fake transaction hash');
        console.log(`   Hash: ${txHash}`);
        console.log('   VeBetterDAO smart contract was NOT called properly');
        
        return {
          success: false,
          message: 'Still using pending transactions instead of real blockchain',
          txHash: txHash
        };
      }
    } else {
      console.log('\n❌ ERROR: No transaction hash in response');
      console.log('   VeBetterDAO integration failed completely');
      
      return {
        success: false,
        message: 'No transaction created - VeBetterDAO integration broken'
      };
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkVeBetterDAOStatus() {
  console.log('\n🔍 CHECKING VEBETTERDAO CONNECTION STATUS');
  console.log('='.repeat(40));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/test-vebetterdao-status`);
    const status = await response.json();
    
    console.log('VeBetterDAO Status:');
    console.log(`   App Balance: ${status.appBalance} B3TR`);
    console.log(`   Authorized: ${status.isAuthorized}`);
    
    if (status.error) {
      console.log(`   Error: ${status.error}`);
    }
    
    return status;
    
  } catch (error) {
    console.log(`   Connection Error: ${error.message}`);
    return { error: error.message };
  }
}

// Run the comprehensive test
async function runTest() {
  console.log('🚀 CRITICAL BLOCKCHAIN INTEGRATION TEST');
  console.log('Testing if ReCircle now creates REAL VeChain transactions');
  console.log('instead of just database entries...\n');
  
  // First check VeBetterDAO connection
  await checkVeBetterDAOStatus();
  
  // Then test the real integration
  const result = await testRealVeBetterDAOIntegration();
  
  console.log('\n📊 FINAL RESULT:');
  console.log('='.repeat(30));
  if (result.success) {
    console.log('🎉 SUCCESS: Real blockchain transactions are now working!');
    console.log('   Users will see actual B3TR tokens in their VeWorld wallets');
    console.log('   App fund wallet will receive real revenue');
    console.log('   Business model is now operational');
  } else {
    console.log('❌ FAILED: Still not creating real blockchain transactions');
    console.log('   Issue needs to be investigated further');
    console.log(`   Error: ${result.message || result.error}`);
  }
  
  return result;
}

// Execute test
runTest().catch(console.error);