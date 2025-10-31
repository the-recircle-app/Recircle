/**
 * Test script to verify VeBetterDAO 70/30 blockchain distribution
 * This script updates the user wallet address and tests the distribution
 */

const API_URL = 'http://localhost:5000';

async function updateUserWallet() {
  console.log('Updating user 1 wallet address to enable blockchain distribution...');
  
  try {
    // Get current user data
    const userResponse = await fetch(`${API_URL}/api/users/1`);
    const userData = await userResponse.json();
    
    console.log('Current user wallet:', userData.walletAddress);
    
    // Update to use the distributor wallet address for testing
    const updateData = {
      walletAddress: '0x15D009B3A5811fdE66F19b2db1D40172d53E5653'
    };
    
    const updateResponse = await fetch(`${API_URL}/api/users/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (updateResponse.ok) {
      const updatedUser = await updateResponse.json();
      console.log('Updated user wallet:', updatedUser.walletAddress);
      return true;
    } else {
      console.error('Failed to update user wallet');
      return false;
    }
  } catch (error) {
    console.error('Error updating user wallet:', error);
    return false;
  }
}

async function testReceiptSubmission() {
  console.log('Testing receipt submission with blockchain distribution...');
  
  try {
    const receiptData = {
      userId: 1,
      storeId: 1,
      amount: 25.50,
      category: "ride-share",
      tokenReward: 10,
      purchaseDate: new Date().toISOString().split('T')[0],
      hasImage: false,
      needsManualReview: false
    };
    
    console.log('Submitting test receipt:', receiptData);
    
    const response = await fetch(`${API_URL}/api/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Receipt submitted successfully');
      console.log('Receipt ID:', result.id);
      return result;
    } else {
      const errorText = await response.text();
      console.error('Receipt submission failed:', errorText);
      return null;
    }
  } catch (error) {
    console.error('Error submitting receipt:', error);
    return null;
  }
}

async function checkDistributionLogs() {
  console.log('Checking server logs for blockchain distribution...');
  // Note: This would require access to server logs
  // For now, we'll just check the user's updated balance
  
  try {
    const userResponse = await fetch(`${API_URL}/api/users/1`);
    const userData = await userResponse.json();
    
    console.log('User token balance after distribution:', userData.tokenBalance);
    
    return userData;
  } catch (error) {
    console.error('Error checking user data:', error);
    return null;
  }
}

async function runTest() {
  console.log('🧪 Testing VeBetterDAO 70/30 blockchain distribution\n');
  
  // Step 1: Update user wallet address
  const walletUpdated = await updateUserWallet();
  if (!walletUpdated) {
    console.error('❌ Failed to update user wallet address');
    return;
  }
  
  console.log('✅ User wallet address updated\n');
  
  // Step 2: Submit a test receipt
  const receipt = await testReceiptSubmission();
  if (!receipt) {
    console.error('❌ Failed to submit test receipt');
    return;
  }
  
  console.log('✅ Test receipt submitted\n');
  
  // Step 3: Wait a moment for processing
  console.log('Waiting for blockchain distribution to process...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Step 4: Check results
  const finalUserData = await checkDistributionLogs();
  if (finalUserData) {
    console.log('✅ Test completed');
    console.log('\nFinal Results:');
    console.log(`- User token balance: ${finalUserData.tokenBalance}`);
    console.log('- Check server logs for blockchain distribution details');
  }
  
  console.log('\n📊 Expected distribution (if successful):');
  console.log('- User (70%): 7 B3TR');
  console.log('- Creator Fund (15%): 1.5 B3TR');
  console.log('- App Fund (15%): 1.5 B3TR');
}

// Run the test
runTest().catch(console.error);