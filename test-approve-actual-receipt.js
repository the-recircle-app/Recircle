/**
 * Test Receipt Approval Script (with real receipt ID)
 * This script approves the actual receipt in the database (ID: 1)
 */

import fetch from 'node-fetch';

async function approveActualReceipt() {
  console.log('🧪 Testing receipt approval for real receipt ID 1');
  
  // Use the real receipt ID from the database
  const approvalPayload = {
    receipt_id: "1", // Use the actual receipt ID from the database
    user_id: 102,
    user_wallet: "0xTestWalletAddress123456",
    store_name: "Waymo Rideshare",
    purchase_amount: 25.99,
    estimated_reward: 8,
    status: "approved",
    admin_notes: "Approved via test script"
  };
  
  console.log('\nSending approval to server...');
  console.log('Approval payload:');
  console.log(JSON.stringify(approvalPayload, null, 2));
  
  try {
    // First, check current balance
    const userBeforeResponse = await fetch('http://localhost:5000/api/users/102');
    const userBefore = await userBeforeResponse.json();
    console.log(`\nBefore approval - User token balance: ${userBefore.tokenBalance}`);
    
    // Send approval
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
    
    // Small delay to allow server to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const userAfterResponse = await fetch('http://localhost:5000/api/users/102');
    const userAfter = await userAfterResponse.json();
    
    console.log(`\nUser: ${userAfter.username}`);
    console.log(`Before approval: ${userBefore.tokenBalance} tokens`);
    console.log(`After approval: ${userAfter.tokenBalance} tokens`);
    console.log(`Difference: ${userAfter.tokenBalance - userBefore.tokenBalance} tokens`);
    
    if (userAfter.tokenBalance > userBefore.tokenBalance) {
      console.log('\n✅ SUCCESS! Token balance was updated successfully.');
    } else {
      console.log('\n❌ Token balance did not change. Check the server logs for details.');
    }
    
  } catch (error) {
    console.error('\n❌ Error during approval:', error);
  }
}

// Run the test
approveActualReceipt();