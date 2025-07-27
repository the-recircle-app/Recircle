/**
 * Test script to verify token balance updates are working properly
 */

// You can run this file directly with node:
// node test-token-balance.js

// Using native fetch (Node.js 18+)
// No need to import fetch for newer Node.js versions

const TEST_USER_ID = 102; // Use the test user ID
const TEST_AMOUNT = 10; // Test with 10 tokens

// Set the API URL based on environment (local vs. production)
const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testTokenBalance() {
  console.log('🧪 Testing token balance update mechanism...');
  
  try {
    // Step 1: Get current user data to check starting balance
    console.log(`\nGetting initial user data for user ${TEST_USER_ID}...`);
    const initialResponse = await fetch(`${API_URL}/api/users/${TEST_USER_ID}`);
    
    if (!initialResponse.ok) {
      console.error(`Failed to get user data: ${initialResponse.status} ${initialResponse.statusText}`);
      return;
    }
    
    const initialUser = await initialResponse.json();
    console.log(`Initial user data: ${JSON.stringify(initialUser, null, 2)}`);
    console.log(`Starting token balance: ${initialUser.tokenBalance}`);
    
    // Step 2: Create direct transaction to add tokens
    console.log(`\nCreating test transaction to add ${TEST_AMOUNT} tokens...`);
    const transactionResponse = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        type: 'test_transaction',
        amount: TEST_AMOUNT,
        description: `Test transaction add ${TEST_AMOUNT} tokens via direct API`,
      }),
    });
    
    if (!transactionResponse.ok) {
      console.error(`Failed to create transaction: ${transactionResponse.status} ${transactionResponse.statusText}`);
      return;
    }
    
    const transaction = await transactionResponse.json();
    console.log(`Transaction created: ${JSON.stringify(transaction, null, 2)}`);
    
    // Step 3: Check if user balance was updated
    console.log(`\nChecking if user balance was updated...`);
    
    // Wait a moment to ensure changes have propagated
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedResponse = await fetch(`${API_URL}/api/users/${TEST_USER_ID}`);
    
    if (!updatedResponse.ok) {
      console.error(`Failed to get updated user data: ${updatedResponse.status} ${updatedResponse.statusText}`);
      return;
    }
    
    const updatedUser = await updatedResponse.json();
    console.log(`Updated user data: ${JSON.stringify(updatedUser, null, 2)}`);
    console.log(`New token balance: ${updatedUser.tokenBalance}`);
    
    // Step 4: Verify the balance increased by the expected amount
    const expectedBalance = initialUser.tokenBalance + TEST_AMOUNT;
    const actualBalance = updatedUser.tokenBalance;
    
    if (actualBalance === expectedBalance) {
      console.log(`\n✅ SUCCESS: Token balance updated correctly!`);
      console.log(`Initial balance: ${initialUser.tokenBalance}`);
      console.log(`Amount added: ${TEST_AMOUNT}`);
      console.log(`New balance: ${actualBalance}`);
    } else {
      console.error(`\n❌ ERROR: Token balance not updated correctly!`);
      console.error(`Initial balance: ${initialUser.tokenBalance}`);
      console.error(`Amount added: ${TEST_AMOUNT}`);
      console.error(`Expected new balance: ${expectedBalance}`);
      console.error(`Actual new balance: ${actualBalance}`);
      console.error(`Difference: ${actualBalance - expectedBalance}`);
    }
    
  } catch (error) {
    console.error('Error occurred during test:', error);
  }
}

// Run the test
testTokenBalance();