/**
 * Directly approve the latest receipt to verify the automatic update system
 */

import fetch from 'node-fetch';

async function approveLatestReceipt() {
  try {
    console.log('🧪 Testing direct approval of latest receipt...');
    
    // First check current balance
    const userBeforeResponse = await fetch('http://localhost:5000/api/users/102');
    const userBefore = await userBeforeResponse.json();
    console.log(`\nBefore approval - User token balance: ${userBefore.tokenBalance}`);
    
    // Approval payload for receipt #1
    const approvalPayload = {
      receipt_id: "1",
      user_id: 102,
      user_wallet: "0xTestWalletAddress123456",
      store_name: "Unique Test Shop",
      purchase_amount: 67.89,
      estimated_reward: 10,
      status: "approved",
      admin_notes: "Testing manual approval and automatic balance update"
    };
    
    console.log('\nSending approval payload:');
    console.log(JSON.stringify(approvalPayload, null, 2));
    
    // Send direct API request to approve the receipt
    const response = await fetch('http://localhost:5000/api/receipt-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(approvalPayload)
    });
    
    const result = await response.json();
    
    console.log('\n✅ Direct approval result:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔍 Now watch the UI closely for:');
    console.log('1. Balance update notification appearing');
    console.log('2. Token balance changing from 63 to 73 B3TR without any page refresh');
    
    // Check the balance after approval
    await new Promise(resolve => setTimeout(resolve, 1000));
    const userAfterResponse = await fetch('http://localhost:5000/api/users/102');
    const userAfter = await userAfterResponse.json();
    
    console.log(`\nBalance update on server:
- Before: ${userBefore.tokenBalance} B3TR
- After: ${userAfter.tokenBalance} B3TR
- Difference: ${userAfter.tokenBalance - userBefore.tokenBalance} B3TR
`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the approval
approveLatestReceipt();