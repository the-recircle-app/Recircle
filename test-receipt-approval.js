/**
 * Test Receipt Approval Script
 * Run this to approve the test receipt and see token balance update
 */

import fetch from 'node-fetch';

async function approveTestReceipt() {
  console.log('🧪 Testing receipt approval process');
  
  // This payload matches the format expected by the receipt-approved endpoint
  const approvalPayload = {
  "receipt_id": "TEST-1748813326341",
  "user_id": 102,
  "user_wallet": "0xTestWalletAddress123456",
  "store_name": "Thrift City USA",
  "purchase_amount": 25.99,
  "estimated_reward": 8,
  "status": "approved",
  "admin_notes": "Approved for testing"
};
  
  console.log('\nSending approval to server...');
  
  try {
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
    
    // Check user balance after approval
    console.log('\nChecking token balance update...');
    const userResponse = await fetch('http://localhost:5000/api/users/102');
    const user = await userResponse.json();
    
    console.log(`\nUser: ${user.username}`);
    console.log(`Current token balance: ${user.tokenBalance}`);
    console.log(`Should now include the ${approvalPayload.estimated_reward} tokens from this approval.`);
    
  } catch (error) {
    console.error('\n❌ Error during approval:', error);
  }
}

// Run the test
approveTestReceipt();
