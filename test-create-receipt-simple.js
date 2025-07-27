/**
 * Simplified test script to create a receipt for manual approval
 */

import fetch from 'node-fetch';

async function createTestReceipt() {
  try {
    console.log('🧪 Creating test receipt for user ID 102');
    
    // Simple receipt payload that matches the server's expected format
    const receiptPayload = {
      userId: 102,
      storeId: null,  // Let the server handle null storeId
      storeName: "Uber Transportation",
      amount: 25.99,
      purchaseDate: new Date().toISOString(),
      receiptId: `TEST-${Date.now()}`,
      status: "pending_review",
      confidence: 0.7,
      isSustainable: true,
      requiresManualReview: true,
      reviewReason: "Testing manual approval process",
      estimatedReward: 8
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
      
      // Even if there was an error, let's create a test receipt approval payload
      // This can be used directly with our receipt-approved endpoint
      console.log('\n--- CREATING MANUAL APPROVAL PAYLOAD ---');
    }
    
    // Create a receipt approval payload for manual testing
    const approvalPayload = {
      receipt_id: receiptPayload.receiptId,
      user_id: receiptPayload.userId,
      user_wallet: "0xTestWalletAddress123456",
      store_name: receiptPayload.storeName,
      purchase_amount: receiptPayload.amount,
      estimated_reward: receiptPayload.estimatedReward,
      status: "approved",
      admin_notes: "Approved for testing"
    };
    
    console.log('\n--- RECEIPT APPROVAL INFORMATION ---');
    console.log(`Receipt ID: ${approvalPayload.receipt_id}`);
    console.log(`User ID: ${approvalPayload.user_id}`);
    console.log(`Store: ${approvalPayload.store_name}`);
    console.log(`Purchase Amount: $${approvalPayload.purchase_amount}`);
    console.log(`Estimated Reward: ${approvalPayload.estimated_reward} tokens`);
    
    console.log('\n--- MANUAL APPROVAL PAYLOAD ---');
    console.log(JSON.stringify(approvalPayload, null, 2));
    
    // Save the approval payload to a file for easy reuse
    console.log('\nNow you can test approval by running:');
    console.log('node test-receipt-approval.js');
    
    // Now create a test approval script
    await createTestApprovalScript(approvalPayload);
    
    return approvalPayload;
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Create a test script for running the approval later
async function createTestApprovalScript(payload) {
  const fs = await import('fs');
  
  const scriptContent = `/**
 * Test Receipt Approval Script
 * Run this to approve the test receipt and see token balance update
 */

import fetch from 'node-fetch';

async function approveTestReceipt() {
  console.log('🧪 Testing receipt approval process');
  
  // This payload matches the format expected by the receipt-approved endpoint
  const approvalPayload = ${JSON.stringify(payload, null, 2)};
  
  console.log('\\nSending approval to server...');
  
  try {
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
    
    // Check user balance after approval
    console.log('\\nChecking token balance update...');
    const userResponse = await fetch('http://localhost:5000/api/users/102');
    const user = await userResponse.json();
    
    console.log(\`\\nUser: \${user.username}\`);
    console.log(\`Current token balance: \${user.tokenBalance}\`);
    console.log(\`Should now include the \${approvalPayload.estimated_reward} tokens from this approval.\`);
    
  } catch (error) {
    console.error('\\n❌ Error during approval:', error);
  }
}

// Run the test
approveTestReceipt();
`;

  fs.writeFileSync('test-receipt-approval.js', scriptContent);
  console.log('\n✅ Created test-receipt-approval.js for testing the approval');
}

// Run the receipt creation
createTestReceipt();