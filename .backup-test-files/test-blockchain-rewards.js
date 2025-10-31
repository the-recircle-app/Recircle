/**
 * Test script to verify blockchain reward distribution
 * This will submit a receipt and check if the 70/30 distribution works
 */

const API_URL = 'http://localhost:5000';

async function submitTestReceipt() {
  console.log('Submitting test receipt for blockchain distribution...');
  
  try {
    const receiptData = {
      userId: 1,
      storeId: 1, // Uber - ride share
      amount: 25.50,
      category: "ride-share",
      tokenReward: 10,
      purchaseDate: new Date().toISOString().split('T')[0],
      hasImage: false,
      needsManualReview: false
    };
    
    console.log('Receipt data:', receiptData);
    
    const response = await fetch(`${API_URL}/api/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Receipt submitted successfully');
      console.log('Receipt ID:', result.id);
      console.log('Token reward:', result.tokenReward);
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

async function checkUserBalance() {
  try {
    const response = await fetch(`${API_URL}/api/users/1`);
    const userData = await response.json();
    
    console.log('User token balance:', userData.tokenBalance);
    console.log('User wallet address:', userData.walletAddress);
    
    return userData;
  } catch (error) {
    console.error('Error checking user balance:', error);
    return null;
  }
}

async function testBlockchainDistribution() {
  console.log('🧪 Testing VeBetterDAO blockchain distribution\n');
  
  // Step 1: Check initial balance
  console.log('Step 1: Checking initial user balance...');
  const initialBalance = await checkUserBalance();
  if (!initialBalance) {
    console.error('❌ Failed to get initial user balance');
    return;
  }
  
  console.log(`Initial balance: ${initialBalance.tokenBalance} B3TR\n`);
  
  // Step 2: Submit test receipt
  console.log('Step 2: Submitting test receipt...');
  const receipt = await submitTestReceipt();
  if (!receipt) {
    console.error('❌ Failed to submit test receipt');
    return;
  }
  
  console.log('✅ Receipt submitted successfully\n');
  
  // Step 3: Wait for processing
  console.log('Step 3: Waiting for blockchain distribution...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Step 4: Check final balance
  console.log('Step 4: Checking final user balance...');
  const finalBalance = await checkUserBalance();
  if (!finalBalance) {
    console.error('❌ Failed to get final user balance');
    return;
  }
  
  console.log(`Final balance: ${finalBalance.tokenBalance} B3TR\n`);
  
  // Step 5: Calculate distribution
  const balanceIncrease = finalBalance.tokenBalance - initialBalance.tokenBalance;
  console.log('📊 Results:');
  console.log(`- Balance increase: ${balanceIncrease} B3TR`);
  console.log(`- Expected reward: ${receipt.tokenReward} B3TR`);
  
  if (balanceIncrease > 0) {
    console.log('✅ Reward distribution successful!');
    
    // Calculate expected 70/30 distribution
    const totalReward = receipt.tokenReward;
    const expectedUserReward = Math.round(totalReward * 0.7);
    const expectedAppReward = Math.round(totalReward * 0.3);
    
    console.log('\n🔄 Expected VeBetterDAO Distribution:');
    console.log(`- User (70%): ${expectedUserReward} B3TR`);
    console.log(`- App Fund (30%): ${expectedAppReward} B3TR`);
    console.log(`- Total distributed: ${totalReward} B3TR`);
    
    if (balanceIncrease === expectedUserReward) {
      console.log('\n✅ VeBetterDAO 70/30 distribution working correctly!');
    } else {
      console.log(`\n⚠️  User received ${balanceIncrease} B3TR, expected ${expectedUserReward} B3TR`);
    }
  } else {
    console.log('❌ No reward distribution detected');
  }
  
  console.log('\n📋 Check server logs for blockchain transaction details');
}

// Run the test
testBlockchainDistribution().catch(console.error);