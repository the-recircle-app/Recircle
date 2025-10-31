/**
 * Test script to create a receipt for manual approval
 * This creates a receipt for user ID 102 that can be approved via the Google Sheet integration
 */

import fetch from 'node-fetch';

async function createReceiptForApproval() {
  console.log('🧪 Creating receipt for testing approval process');
  
  try {
    // Get the test user (ID: 102)
    const userResponse = await fetch('http://localhost:5000/api/users/102');
    const user = await userResponse.json();
    console.log(`Found user: ${user.username} (ID: ${user.id})`);
    
    // Create a test store if needed
    const storeName = "Metro Bus Transportation";
    const storeResponse = await fetch('http://localhost:5000/api/thrift-stores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: storeName,
        address: "123 Thrift Avenue, Secondhand City, CA 94302",
        lat: 37.7749, 
        lng: -122.4194
      })
    });
    
    const store = await storeResponse.json();
    console.log(`Using store: ${store.name} (ID: ${store.id})`);
    
    // Create a receipt with manual review status
    const receiptId = `TEST-${Date.now()}`;
    const purchaseAmount = 25.99;
    const estimatedReward = 8;
    
    console.log(`Creating receipt ${receiptId} for manual approval...`);
    
    const receiptPayload = {
      receipt_id: receiptId,
      user_id: user.id,
      store_id: store.id,
      store_name: store.name,
      purchase_amount: purchaseAmount,
      purchase_date: new Date().toISOString(),
      status: "pending_review",
      estimated_reward: estimatedReward,
      validation_result: {
        is_sustainable: true,
        confidence: 0.7,
        store_type: "thrift_store",
        items_summary: "Mixed used clothing and household items",
        requires_manual_review: true,
        review_reason: "Testing manual approval process"
      }
    };
    
    const receiptResponse = await fetch('http://localhost:5000/api/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(receiptPayload)
    });
    
    const receipt = await receiptResponse.json();
    
    console.log('\n✅ Success! Created a receipt for manual approval:');
    console.log(JSON.stringify(receipt, null, 2));
    console.log('\n--- RECEIPT APPROVAL INFORMATION ---');
    console.log(`Receipt ID: ${receiptId}`);
    console.log(`User ID: ${user.id}`);
    console.log(`User Wallet: ${user.wallet || "Not connected yet"}`);
    console.log(`Store: ${store.name}`);
    console.log(`Purchase Amount: $${purchaseAmount}`);
    console.log(`Estimated Reward: ${estimatedReward} tokens`);
    console.log(`Status: ${receipt.status || "pending_review"}`);
    console.log('\nThis receipt is now ready for manual approval through the Google Sheets integration.');
    
  } catch (error) {
    console.error('❌ Error creating receipt:', error);
  }
}

// Run the test
createReceiptForApproval();