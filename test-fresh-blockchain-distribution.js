/**
 * Test fresh blockchain distribution with unique receipt data
 */

const API_URL = 'http://localhost:5000';

async function submitFreshReceipt() {
  console.log('Submitting fresh receipt for blockchain distribution...');
  
  try {
    // Create unique receipt data to avoid duplicates
    const today = new Date();
    const uniqueAmount = 35.75; // Different amount
    const receiptData = {
      userId: 1,
      storeId: 2, // Different store (Lyft instead of Uber)
      amount: uniqueAmount,
      category: "ride-share",
      tokenReward: 12, // Different reward amount
      purchaseDate: today.toISOString().split('T')[0],
      hasImage: false,
      needsManualReview: false,
      isTestMode: false,
      
      // Add analysis result to bypass validation checks
      analysisResult: {
        isValid: true,
        storeName: "Lyft",
        isThriftStore: false,
        isSustainableStore: true,
        sustainableCategory: "transportation",
        purchaseCategory: "ride_share",
        totalAmount: uniqueAmount,
        confidence: 0.96, // High confidence
        reasons: ["Valid Lyft transportation receipt"],
        isAcceptable: true,
        estimatedReward: 12,
        testMode: false,
        timeoutFallback: false,
        containsPreOwnedItems: false,
        needsManualReview: false,
        sentForManualReview: false
      },
      
      paymentMethod: {
        type: "digital",
        isDigital: true
      },
      containsPreOwnedItems: false
    };
    
    console.log('Submitting Lyft receipt with amount:', uniqueAmount);
    
    const response = await fetch(`${API_URL}/api/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Fresh receipt submitted successfully');
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

async function testCompleteBlockchainDistribution() {
  console.log('Testing complete VeBetterDAO blockchain distribution\n');
  
  // Step 1: Check initial balance
  console.log('Step 1: Checking initial user balance...');
  const initialBalance = await checkUserBalance();
  if (!initialBalance) {
    console.error('Failed to get initial user balance');
    return;
  }
  
  console.log(`Initial balance: ${initialBalance.tokenBalance} B3TR`);
  console.log(`Wallet address: ${initialBalance.walletAddress}\n`);
  
  // Step 2: Submit fresh receipt
  console.log('Step 2: Submitting fresh receipt...');
  const receipt = await submitFreshReceipt();
  if (!receipt) {
    console.error('Failed to submit fresh receipt');
    return;
  }
  
  console.log('Fresh receipt submitted successfully\n');
  
  // Step 3: Wait for blockchain processing
  console.log('Step 3: Waiting for blockchain distribution...');
  await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
  
  // Step 4: Check final balance
  console.log('Step 4: Checking final user balance...');
  const finalBalance = await checkUserBalance();
  if (!finalBalance) {
    console.error('Failed to get final user balance');
    return;
  }
  
  console.log(`Final balance: ${finalBalance.tokenBalance} B3TR\n`);
  
  // Step 5: Calculate distribution results
  const balanceIncrease = finalBalance.tokenBalance - initialBalance.tokenBalance;
  console.log('Results:');
  console.log(`- Balance increase: ${balanceIncrease} B3TR`);
  console.log(`- Expected reward: ${receipt.tokenReward} B3TR`);
  
  if (balanceIncrease > 0) {
    console.log('Reward distribution successful!');
    
    // Calculate expected 70/30 distribution
    const totalReward = receipt.tokenReward;
    const expectedUserReward = Math.round(totalReward * 0.7 * 10) / 10; // Round to 1 decimal
    
    console.log('\nExpected VeBetterDAO Distribution:');
    console.log(`- User (70%): ${expectedUserReward} B3TR`);
    console.log(`- App Fund (30%): ${Math.round(totalReward * 0.3 * 10) / 10} B3TR`);
    console.log(`- Total distributed: ${totalReward} B3TR`);
    
    console.log('\nBlockchain distribution status:');
    console.log('Check server logs for transaction hashes and distribution details');
  } else {
    console.log('No reward distribution detected');
    console.log('Check server logs for blockchain transaction errors');
  }
}

// Run the test
testCompleteBlockchainDistribution().catch(console.error);