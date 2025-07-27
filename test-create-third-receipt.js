/**
 * Create a third test receipt with different data to avoid duplication
 */

import fetch from 'node-fetch';

async function createThirdTestReceipt() {
  try {
    console.log('🧪 Creating third test receipt for user ID 102');
    
    // Different receipt payload to avoid duplication detection
    const receiptPayload = {
      userId: 102,
      storeId: null,
      storeName: "Eco Thrift Store",
      amount: 45.99,  // Different amount
      purchaseDate: new Date().toISOString(),
      receiptId: `RECEIPT-${Date.now()}`,
      status: "pending_review",
      confidence: 0.9,
      isSustainable: true,
      requiresManualReview: true,
      reviewReason: "Testing automatic balance updates",
      estimatedReward: 15  // Higher reward
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
      
      // Create an approval payload for this receipt
      const receiptId = result.id.toString();
      await createApprovalScript(receiptId, receiptPayload);
      
      console.log(`\n🔄 Next step: Run node test-approve-third-receipt.js to approve this receipt`);
    } else {
      console.log('\n❌ Error creating receipt:');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Create a test script for approving the third receipt
async function createApprovalScript(receiptId, payload) {
  const fs = await import('fs');
  
  const scriptContent = `/**
 * Test Third Receipt Approval Script
 * Run this to approve the latest test receipt and see automatic balance updates
 */

import fetch from 'node-fetch';

async function approveThirdReceipt() {
  console.log('🧪 Testing automatic token balance update process');
  
  // This payload matches the format expected by the receipt-approved endpoint
  const approvalPayload = {
    receipt_id: "${receiptId}",
    user_id: ${payload.userId},
    user_wallet: "0xTestWalletAddress123456",
    store_name: "${payload.storeName}",
    purchase_amount: ${payload.amount},
    estimated_reward: ${payload.estimatedReward},
    status: "approved",
    admin_notes: "Testing automatic balance updates"
  };
  
  console.log('\\nSending approval to server...');
  console.log('\\nApproval payload:');
  console.log(JSON.stringify(approvalPayload, null, 2));
  
  try {
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
    
    if (userAfter.tokenBalance > userBefore.tokenBalance) {
      console.log('\\n✅ SUCCESS! Token balance was updated successfully on the server.');
      console.log('Check the UI to see if the balance updates automatically.');
    } else {
      console.log('\\n❓ Token balance did not change on the server. Check the logs.');
    }
    
  } catch (error) {
    console.error('\\n❌ Error during approval:', error);
  }
}

// Run the test
approveThirdReceipt();
`;

  fs.writeFileSync('test-approve-third-receipt.js', scriptContent);
  console.log('\n✅ Created test-approve-third-receipt.js for testing automatic balance updates');
}

// Run the receipt creation
createThirdTestReceipt();