/**
 * Script to simulate Google Sheets manual approval
 * This simulates exactly what happens when a receipt is approved through Google Sheets
 */

import fetch from 'node-fetch';

async function simulateGoogleSheetApproval() {
  try {
    console.log('🧪 Simulating Google Sheet manual approval...');
    
    // First check current balance
    const userBeforeResponse = await fetch('http://localhost:5000/api/users/102');
    const userBefore = await userBeforeResponse.json();
    console.log(`\nBefore approval - User token balance: ${userBefore.tokenBalance}`);
    
    // This is exactly the payload that would be sent from Google Sheets
    // when a manual approval is triggered
    const approvalPayload = {
      receipt_id: "1",
      user_id: 102,
      user_wallet: "0xTestWalletAddress123456",
      store_name: "Google Sheets Test Store",
      purchase_amount: 55.99,
      estimated_reward: 20,
      status: "approved",
      admin_notes: "Manually approved via Google Sheets test"
    };
    
    console.log('\nSending Google Sheets approval to server...');
    console.log('\nApproval payload:');
    console.log(JSON.stringify(approvalPayload, null, 2));
    
    // Send the approval to the receipt-approved endpoint
    // This is the exact endpoint that Google Sheets would call
    const response = await fetch('http://localhost:5000/api/receipt-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(approvalPayload)
    });
    
    const result = await response.json();
    
    console.log('\n✅ Google Sheet approval response:');
    console.log(JSON.stringify(result, null, 2));
    
    // Wait a moment for the server to process the update
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
      console.log('\nCheck the UI to see if the balance updates automatically without refreshing.');
      console.log('You should see a green notification appear when the balance updates.');
    } else {
      console.log('\n❓ Token balance did not change on the server. Check the logs.');
    }
    
    console.log('\n📱 IMPORTANT: Keep watching the app UI for:');
    console.log('  1. Balance update notification appearing automatically');
    console.log('  2. Token balance changing from 15 to 35 without refreshing');
    console.log('  3. This all happens without clicking any buttons or refreshing the page');
    
  } catch (error) {
    console.error('\n❌ Error during approval simulation:', error);
  }
}

// Run the Google Sheet approval simulation
simulateGoogleSheetApproval();