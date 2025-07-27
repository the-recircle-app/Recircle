/**
 * Script to debug Google Sheets approval issues
 * This script will monitor the server logs for approval requests and confirm the token balance
 */

import fetch from 'node-fetch';

async function debugGoogleSheetsApproval() {
  try {
    console.log('🔍 Debugging Google Sheets approval process...');
    
    // First check current balance
    const userBeforeResponse = await fetch('http://localhost:5000/api/users/102');
    const userBefore = await userBeforeResponse.json();
    console.log(`\nCurrent token balance: ${userBefore.tokenBalance}`);
    
    // Let's check if there are any open receipts waiting for approval
    const receiptsResponse = await fetch('http://localhost:5000/api/users/102/receipts');
    const receipts = await receiptsResponse.json();
    
    console.log('\nReceipts waiting for approval:');
    receipts.forEach(receipt => {
      console.log(`- Receipt #${receipt.id}: ${receipt.verified ? 'Approved' : 'Pending'}, Amount: $${receipt.amount}, Date: ${receipt.purchaseDate}`);
    });
    
    // Let's check recent transactions to see if any approvals were processed
    const transactionsResponse = await fetch('http://localhost:5000/api/users/102/transactions');
    const transactions = await transactionsResponse.json();
    
    console.log('\nRecent transactions:');
    transactions.slice(0, 5).forEach(transaction => {
      console.log(`- Transaction #${transaction.id}: Type: ${transaction.type}, Amount: ${transaction.amount} B3TR, Time: ${transaction.createdAt}`);
    });
    
    console.log('\n📋 GOOGLE SHEETS DEBUGGING INSTRUCTIONS:');
    console.log('1. Make sure your Google Sheets approval payload matches this format:');
    console.log(`
    {
      "receipt_id": "RECEIPT_ID",     // Must be a string with the receipt ID
      "user_id": 102,                 // Must be the user ID as a number
      "user_wallet": "0xUserWallet",  // Must be the user's wallet address
      "store_name": "Store Name",     // Name of the store
      "purchase_amount": 45.99,       // Purchase amount (number)
      "estimated_reward": 8,          // Estimated reward amount (number)
      "status": "approved",           // Must be "approved" (lowercase)
      "admin_notes": "Manual notes"   // Any notes from the approver
    }
    `);
    
    console.log('\n2. Make sure your Google Sheets script is sending to this exact endpoint:');
    console.log('   http://YOUR_SERVER_URL/api/receipt-approved');
    
    console.log('\n3. Test by approving a receipt that has not yet been approved (check list above)');
    
    console.log('\n4. Check if your Google Sheets script is logging any errors');
    
    console.log('\nNow let\'s use a direct API call to manually approve a receipt:');
    
    const pendingReceipts = receipts.filter(r => !r.verified);
    if (pendingReceipts.length > 0) {
      // Find the most recent unapproved receipt
      const receiptToApprove = pendingReceipts[0];
      console.log(`\nFound receipt #${receiptToApprove.id} ready for approval`);
      
      // Let's try to approve it directly
      console.log(`\nAttempting direct approval of receipt #${receiptToApprove.id}...`);
      
      const approvalPayload = {
        receipt_id: receiptToApprove.id.toString(),
        user_id: 102,
        user_wallet: "0xTestWalletAddress123456",
        store_name: "Debug Test Store",
        purchase_amount: receiptToApprove.amount,
        estimated_reward: 8, // Standard reward amount
        status: "approved",
        admin_notes: "Debug manual approval test"
      };
      
      console.log('\nApproval payload:');
      console.log(JSON.stringify(approvalPayload, null, 2));
      
      const response = await fetch('http://localhost:5000/api/receipt-approved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approvalPayload)
      });
      
      const result = await response.json();
      
      console.log('\n✅ Direct approval response:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check balance again after direct approval
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userAfterResponse = await fetch('http://localhost:5000/api/users/102');
      const userAfter = await userAfterResponse.json();
      
      console.log(`\nBalance before: ${userBefore.tokenBalance} B3TR`);
      console.log(`Balance after: ${userAfter.tokenBalance} B3TR`);
      console.log(`Difference: ${userAfter.tokenBalance - userBefore.tokenBalance} B3TR`);
      
      if (userAfter.tokenBalance > userBefore.tokenBalance) {
        console.log('\n✅ Direct approval worked! The token balance was updated.');
        console.log('This confirms that the API endpoint works correctly.');
        console.log('\nIf your Google Sheets approval is not working, the issue is likely in:');
        console.log('1. The payload format from Google Sheets');
        console.log('2. The endpoint URL in your Google Sheets script');
        console.log('3. Network connectivity from Google Sheets to your server');
      } else {
        console.log('\n❌ Direct approval failed to update the balance.');
        console.log('This suggests a server-side issue with processing approvals.');
      }
    } else {
      console.log('\n❕ No pending receipts found to approve.');
    }
    
  } catch (error) {
    console.error('\n❌ Error during debugging:', error);
  }
}

// Run the debugging process
debugGoogleSheetsApproval();