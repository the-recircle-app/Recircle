/**
 * Test Third Receipt Approval Script
 * Run this to approve the latest test receipt and see automatic balance updates
 */

import fetch from 'node-fetch';

async function approveThirdReceipt() {
  console.log('🧪 Testing automatic token balance update process');
  
  // This payload matches the format expected by the receipt-approved endpoint
  const approvalPayload = {
    receipt_id: "2",
    user_id: 102,
    user_wallet: "0xTestWalletAddress123456",
    store_name: "Eco Thrift Store",
    purchase_amount: 45.99,
    estimated_reward: 15,
    status: "approved",
    admin_notes: "Testing automatic balance updates"
  };
  
  console.log('\nSending approval to server...');
  console.log('\nApproval payload:');
  console.log(JSON.stringify(approvalPayload, null, 2));
  
  try {
    // First check current balance
    const userBeforeResponse = await fetch('http://localhost:5000/api/users/102');
    const userBefore = await userBeforeResponse.json();
    console.log(`\nBefore approval - User token balance: ${userBefore.tokenBalance}`);
    
    // Send the approval
    const response = await fetch('http://localhost:5000/api/receipt-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(approvalPayload)
    });
    
    const result = await response.json();
    
    console.log('\n✅ Approval result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Wait a moment to let the server process the update
    console.log('\nWaiting for server to process...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check user balance after approval
    console.log('\nChecking token balance update...');
    const userAfterResponse = await fetch('http://localhost:5000/api/users/102');
    const userAfter = await userAfterResponse.json();
    
    console.log(`\nUser: ${userAfter.username}`);
    console.log(`Before approval: ${userBefore.tokenBalance} tokens`);
    console.log(`After approval: ${userAfter.tokenBalance} tokens`);
    console.log(`Difference: ${userAfter.tokenBalance - userBefore.tokenBalance} tokens`);
    
    if (userAfter.tokenBalance > userBefore.tokenBalance) {
      console.log('\n✅ SUCCESS! Token balance was updated successfully on the server.');
      console.log('Check the UI to see if the balance updates automatically.');
    } else {
      console.log('\n❓ Token balance did not change on the server. Check the logs.');
    }
    
  } catch (error) {
    console.error('\n❌ Error during approval:', error);
  }
}

// Run the test
approveThirdReceipt();
