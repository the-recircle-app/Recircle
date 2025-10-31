/**
 * Test Second Receipt Approval Script
 * Run this to approve the second test receipt and see token balance update
 */

import fetch from 'node-fetch';

async function approveSecondReceipt() {
  console.log('🧪 Testing second receipt approval process');
  
  // This payload matches the format expected by the receipt-approved endpoint
  const approvalPayload = {
  "receipt_id": "1",
  "user_id": 102,
  "user_wallet": "0xTestWalletAddress123456",
  "store_name": "Second Hand Shop",
  "purchase_amount": 35.99,
  "estimated_reward": 10,
  "status": "approved",
  "admin_notes": "Second approval test"
};
  
  console.log('\nSending approval to server...');
  
  try {
    // Force refresh the UI by triggering a client event
    const triggerRefreshPayload = {
      event: "token_balance_updated",
      userId: 102,
      newBalance: "refresh" // Special value to force client to fetch latest balance
    };
    
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
    
    // Now send a special refresh signal to the client
    console.log('\nSending refresh signal to client...');
    
    // Get all receipts - this often causes the client to update
    await fetch('http://localhost:5000/api/users/102/receipts');
    
    if (userAfter.tokenBalance > userBefore.tokenBalance) {
      console.log('\n✅ SUCCESS! Token balance was updated successfully on the server.');
      console.log('If the UI is not updating, you may need to refresh the browser.');
    } else {
      console.log('\n❓ Token balance did not change on the server. Check the logs.');
    }
    
  } catch (error) {
    console.error('\n❌ Error during approval:', error);
  }
}

// Run the test
approveSecondReceipt();
