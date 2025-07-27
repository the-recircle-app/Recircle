/**
 * Test script to diagnose issues with the receipt approval endpoint
 * This script directly calls the /api/receipt-approved endpoint with
 * the exact same format that Google Sheets would use for approval
 */

// Generate a unique suffix for test receipts to avoid duplicates
const TEST_SUFFIX = Date.now().toString().substring(6);

// Test case configuration
const TEST_USER_ID = 102;
const TEST_WALLET = "0x7dE3085b3190B3a787822Ee16F23be010f5F8686";
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Test cases with different data types and formats
const TEST_CASES = [
  {
    name: "Format1: String IDs, Number reward",
    payload: {
      receipt_id: `test-receipt-${TEST_SUFFIX}-1`,
      user_id: String(TEST_USER_ID),
      user_wallet: TEST_WALLET,
      store_name: "TestStore Format1",
      purchase_amount: 49.99,
      estimated_reward: 8,
      status: "approved",
      admin_notes: "Test approval - Format1: String IDs, Number reward"
    }
  },
  {
    name: "Format2: Number IDs, Number reward",
    payload: {
      receipt_id: `test-receipt-${TEST_SUFFIX}-2`,
      user_id: TEST_USER_ID,
      user_wallet: TEST_WALLET,
      store_name: "TestStore Format2",
      purchase_amount: 59.99,
      estimated_reward: 10,
      status: "approved",
      admin_notes: "Test approval - Format2: Number IDs, Number reward"
    }
  },
  {
    name: "Format3: String IDs, String reward",
    payload: {
      receipt_id: `test-receipt-${TEST_SUFFIX}-3`,
      user_id: String(TEST_USER_ID),
      user_wallet: TEST_WALLET,
      store_name: "TestStore Format3",
      purchase_amount: "69.99",
      estimated_reward: "12",
      status: "approved",
      admin_notes: "Test approval - Format3: String IDs, String reward"
    }
  },
  {
    name: "Format4: Number IDs, String reward",
    payload: {
      receipt_id: `test-receipt-${TEST_SUFFIX}-4`,
      user_id: TEST_USER_ID,
      user_wallet: TEST_WALLET,
      store_name: "TestStore Format4",
      purchase_amount: "79.99",
      estimated_reward: "14",
      status: "approved",
      admin_notes: "Test approval - Format4: Number IDs, String reward"
    }
  }
];

// Helper to create delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test a specific approval payload
 */
async function testApproval(testCase) {
  console.log(`\n======= Testing ${testCase.name} =======`);
  
  try {
    // 1. Get initial user data to check starting balance
    console.log(`Getting initial user data...`);
    const initialUserResponse = await fetch(`${API_URL}/api/users/${TEST_USER_ID}`);
    
    if (!initialUserResponse.ok) {
      console.error(`Failed to get user data: ${initialUserResponse.status} ${initialUserResponse.statusText}`);
      return;
    }
    
    const initialUser = await initialUserResponse.json();
    console.log(`Initial token balance: ${initialUser.tokenBalance}`);
    
    // 2. Send approval request
    console.log(`\nSending approval request with payload:`);
    console.log(JSON.stringify(testCase.payload, null, 2));
    
    const response = await fetch(`${API_URL}/api/receipt-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.payload),
    });
    
    // 3. Get and analyze response
    console.log(`\nResponse status: ${response.status}`);
    
    // Get response as text first to examine any possible HTML issues
    const responseText = await response.text();
    
    // Check if it's valid JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("Valid JSON response received");
      console.log(JSON.stringify(responseData, null, 2));
    } catch (e) {
      console.error("INVALID JSON response! Showing raw response:");
      console.error(responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""));
      return;
    }
    
    // 4. Wait a moment to ensure changes have time to propagate
    console.log("\nWaiting a moment for changes to propagate...");
    await sleep(1000);
    
    // 5. Get updated user data
    console.log(`\nGetting updated user data...`);
    const updatedUserResponse = await fetch(`${API_URL}/api/users/${TEST_USER_ID}`);
    
    if (!updatedUserResponse.ok) {
      console.error(`Failed to get updated user data: ${updatedUserResponse.status} ${updatedUserResponse.statusText}`);
      return;
    }
    
    const updatedUser = await updatedUserResponse.json();
    console.log(`Updated token balance: ${updatedUser.tokenBalance}`);
    
    // 6. Check for transaction records
    console.log(`\nChecking transactions...`);
    const transactionsResponse = await fetch(`${API_URL}/api/users/${TEST_USER_ID}/transactions`);
    
    if (!transactionsResponse.ok) {
      console.error(`Failed to get transactions: ${transactionsResponse.status} ${transactionsResponse.statusText}`);
      return;
    }
    
    const transactions = await transactionsResponse.json();
    
    // Find most recent transaction
    const recentTransactions = transactions
      .filter(t => t.type === "receipt_verification")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    console.log("Most recent receipt transactions:");
    if (recentTransactions.length > 0) {
      recentTransactions.forEach(tx => {
        console.log(`- ID: ${tx.id}, Amount: ${tx.amount}, Description: ${tx.description}, Created: ${tx.createdAt}`);
      });
    } else {
      console.log("No recent receipt transactions found!");
    }
    
    // 7. Verify balance change
    const expectedReward = parseFloat(String(testCase.payload.estimated_reward));
    const expectedBalance = initialUser.tokenBalance + expectedReward;
    
    if (updatedUser.tokenBalance === expectedBalance) {
      console.log(`\n✅ SUCCESS: Token balance updated correctly!`);
      console.log(`Initial balance: ${initialUser.tokenBalance}`);
      console.log(`Reward amount: ${expectedReward}`);
      console.log(`New balance: ${updatedUser.tokenBalance}`);
    } else if (updatedUser.tokenBalance > initialUser.tokenBalance) {
      console.log(`\n⚠️ PARTIAL SUCCESS: Balance increased but not by the expected amount!`);
      console.log(`Initial balance: ${initialUser.tokenBalance}`);
      console.log(`Expected reward: ${expectedReward}`);
      console.log(`Actual increase: ${updatedUser.tokenBalance - initialUser.tokenBalance}`);
      console.log(`New balance: ${updatedUser.tokenBalance}`);
    } else {
      console.log(`\n❌ FAILURE: Token balance was not updated!`);
      console.log(`Initial balance: ${initialUser.tokenBalance}`);
      console.log(`Expected increase: ${expectedReward}`);
      console.log(`Actual balance: ${updatedUser.tokenBalance}`);
    }
  } catch (error) {
    console.error(`Error testing approval:`, error);
  }
}

/**
 * Run all tests sequentially
 */
async function runTests() {
  console.log(`🧪 Starting receipt approval endpoint tests`);
  console.log(`API URL: ${API_URL}`);
  console.log(`Test user ID: ${TEST_USER_ID}`);
  console.log(`Test wallet: ${TEST_WALLET}`);
  console.log(`Test suffix: ${TEST_SUFFIX}`);
  
  // Run tests one by one
  for (const testCase of TEST_CASES) {
    await testApproval(testCase);
    
    // Small delay between tests
    await sleep(500);
  }
  
  console.log("\n🔬 All tests completed!");
}

// Run the tests
runTests();