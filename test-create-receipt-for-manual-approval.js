/**
 * Test script to create a receipt for manual approval via Google Sheets
 * This creates a receipt for user ID 102 that can be approved via the Google Sheet integration
 */

import fetch from 'node-fetch';

async function createReceiptForApproval() {
  try {
    console.log('🧪 Creating test receipt for Google Sheets manual approval...');
    
    // First check current balance
    const userBeforeResponse = await fetch('http://localhost:5000/api/users/102');
    const userBefore = await userBeforeResponse.json();
    console.log(`\nBefore submission - User token balance: ${userBefore.tokenBalance}`);
    
    // Receipt data with a unique identifier
    const timestamp = Date.now();
    const receiptPayload = {
      userId: 102,
      storeId: null,
      storeName: "Google Sheets Test Store",
      amount: 55.99,
      purchaseDate: new Date().toISOString(),
      receiptId: `MANUAL-${timestamp}`,
      status: "pending_review",
      confidence: 0.8,
      isSustainable: true,
      requiresManualReview: true,
      reviewReason: "Created for Google Sheets approval test",
      estimatedReward: 20  // Higher reward for testing
    };
    
    console.log('\nSending receipt data to server...');
    
    const response = await fetch('http://localhost:5000/api/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(receiptPayload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Receipt created successfully:');
      console.log(JSON.stringify(result, null, 2));
      
      // Show the receipt ID which will be needed for manual approval
      console.log(`\n🔑 IMPORTANT: The receipt ID for manual approval is: ${result.id}`);
      
      // Instruction for manual approval via Google Sheets
      console.log(`
=====================================================
📋 MANUAL APPROVAL INSTRUCTIONS:
=====================================================

1. Open your Google Sheets approval spreadsheet
2. In the approval sheet, add a new row with the following information:
   - Receipt ID: ${result.id}
   - User ID: 102
   - User Wallet: 0xTestWalletAddress123456
   - Store Name: Google Sheets Test Store
   - Purchase Amount: 55.99
   - Estimated Reward: 20
   - Status: approved
   - Notes: Manually approved via Google Sheets

3. Use the Google Sheets interface to trigger the approval
   - Look for an "Approve Receipt" button or menu option
   - When you click this button, the spreadsheet will send the approval to your server

4. Watch the app interface
   - The token balance should automatically update from ${userBefore.tokenBalance} to ${userBefore.tokenBalance + 20}
   - You should see a confirmation notification appear
   - This will happen without refreshing the page or clicking any buttons

=====================================================
`);
    } else {
      console.log('\n❌ Error creating receipt:');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the receipt creation
createReceiptForApproval();