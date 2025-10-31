/**
 * Create a second test receipt for further testing
 */

import fetch from 'node-fetch';

async function createSecondTestReceipt() {
  try {
    console.log('🧪 Creating second test receipt for user ID 102');
    
    // Simple receipt payload that matches the server's expected format
    const receiptPayload = {
      userId: 102,
      storeId: null,  // Let the server handle null storeId
      storeName: "Second Hand Shop",
      amount: 35.99,
      purchaseDate: new Date().toISOString(),
      receiptId: `RECEIPT-${Date.now()}`,
      status: "pending_review",
      confidence: 0.8,
      isSustainable: true,
      requiresManualReview: true,
      reviewReason: "Testing follow-up approval",
      estimatedReward: 10
    };
    
    console.log('Sending receipt data to server...');
    
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
    } else {
      console.log('\n❌ Error creating receipt:');
      console.log(JSON.stringify(result, null, 2));
    }
    
    // Create a receipt approval payload for testing
    const approvalPayload = {
      receipt_id: result.id.toString(), // Use the actual receipt ID from response
      user_id: receiptPayload.userId,
      user_wallet: "0xTestWalletAddress123456",
      store_name: receiptPayload.storeName,
      purchase_amount: receiptPayload.amount,
      estimated_reward: receiptPayload.estimatedReward,
      status: "approved",
      admin_notes: "Second approval test"
    };
    
    console.log('\n--- RECEIPT APPROVAL INFORMATION ---');
    console.log(`Receipt ID: ${approvalPayload.receipt_id}`);
    console.log(`User ID: ${approvalPayload.user_id}`);
    console.log(`Store: ${approvalPayload.store_name}`);
    console.log(`Purchase Amount: $${approvalPayload.purchase_amount}`);
    console.log(`Estimated Reward: ${approvalPayload.estimated_reward} tokens`);
    
    // Create test approval script for the second receipt
    await createSecondApprovalScript(approvalPayload);
    
    return approvalPayload;
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Create a test script for approving the second receipt
async function createSecondApprovalScript(payload) {
  const fs = await import('fs');
  
  const scriptContent = `/**
 * Test Second Receipt Approval Script
 * Run this to approve the second test receipt and see token balance update
 */

import fetch from 'node-fetch';

async function approveSecondReceipt() {
  console.log('🧪 Testing second receipt approval process');
  
  // This payload matches the format expected by the receipt-approved endpoint
  const approvalPayload = ${JSON.stringify(payload, null, 2)};
  
  console.log('\\nSending approval to server...');
  
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
    console.log(\`\\nBefore approval - User token balance: \${userBefore.tokenBalance}\`);
    
    // Send the approval
    const response = await fetch('http://localhost:5000/api/receipt-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(approvalPayload)
    });
    
    const result = await response.json();
    
    console.log('\\n✅ Approval result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Wait a moment to let the server process the update
    console.log('\\nWaiting for server to process...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check user balance after approval
    console.log('\\nChecking token balance update...');
    const userAfterResponse = await fetch('http://localhost:5000/api/users/102');
    const userAfter = await userAfterResponse.json();
    
    console.log(\`\\nUser: \${userAfter.username}\`);
    console.log(\`Before approval: \${userBefore.tokenBalance} tokens\`);
    console.log(\`After approval: \${userAfter.tokenBalance} tokens\`);
    console.log(\`Difference: \${userAfter.tokenBalance - userBefore.tokenBalance} tokens\`);
    
    // Now send a special refresh signal to the client
    console.log('\\nSending refresh signal to client...');
    
    // Get all receipts - this often causes the client to update
    await fetch('http://localhost:5000/api/users/102/receipts');
    
    if (userAfter.tokenBalance > userBefore.tokenBalance) {
      console.log('\\n✅ SUCCESS! Token balance was updated successfully on the server.');
      console.log('If the UI is not updating, you may need to refresh the browser.');
    } else {
      console.log('\\n❓ Token balance did not change on the server. Check the logs.');
    }
    
  } catch (error) {
    console.error('\\n❌ Error during approval:', error);
  }
}

// Run the test
approveSecondReceipt();
`;

  fs.writeFileSync('test-approve-second-receipt.js', scriptContent);
  console.log('\n✅ Created test-approve-second-receipt.js for testing the second approval');
}

// Run the receipt creation
createSecondTestReceipt();