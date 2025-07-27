/**
 * Test script to simulate manual review process with mock receipt data
 * This test bypasses the image validation step
 */

import fetch from 'node-fetch';

// Configuration
const API_URL = 'http://localhost:5000';
const USER_ID = 102;
const WALLET_ADDRESS = '0x7dE3085b3190B3a787822Ee16F23be010f5F8686';

// Create a mock validation to avoid needing an actual receipt image
async function createMockValidation() {
  console.log('Creating mock receipt validation...');
  
  // Create a mock receipt validation result with low confidence to trigger manual review
  const mockValidation = {
    success: true,
    message: "Receipt validated and requires manual review",
    data: {
      status: "NEEDS_REVIEW",
      store_name: "GameStop",
      address: "123 Main Street, Anytown, USA",
      receipt_date: "2025-05-13",
      total: 59.99,
      items: [
        {
          name: "Pre-owned Xbox Series X Controller",
          price: 39.99,
          quantity: 1,
          is_preowned: true,
          is_sustainable: true
        },
        {
          name: "Game Protection Plan",
          price: 19.99,
          quantity: 1,
          is_preowned: false,
          is_sustainable: false
        }
      ],
      confidence: 0.68, // Low confidence to ensure manual review
      validation_id: `mock-validation-${Date.now()}`,
      estimated_reward: 8, // Base reward amount
      validation_details: {
        is_thrift_store: false,
        is_gamestop: true,
        has_preowned_items: true,
        store_description: "GameStop - Video game retailer with pre-owned items"
      }
    }
  };
  
  return mockValidation;
}

// Create a receipt submission that will need manual review
async function createManualReviewReceipt() {
  console.log('Simulating a receipt submission that requires manual review...');
  
  try {
    // Get the mock validation result
    const validationResult = await createMockValidation();
    console.log('Mock validation created:', JSON.stringify(validationResult, null, 2));
    
    // Now submit the mock-validated receipt
    const submitResponse = await fetch(`${API_URL}/api/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: USER_ID,
        store_name: validationResult.data.store_name,
        store_address: validationResult.data.address,
        purchase_date: validationResult.data.receipt_date,
        total_amount: validationResult.data.total,
        items: validationResult.data.items,
        validation_id: validationResult.data.validation_id,
        user_wallet: WALLET_ADDRESS,
        confidence: validationResult.data.confidence,
        status: validationResult.data.status,
        estimated_reward: validationResult.data.estimated_reward,
        // Include additional metadata
        receipt_meta: {
          validation_details: validationResult.data.validation_details,
          needs_review_reason: "Low confidence score and contains pre-owned items"
        }
      }),
    });
    
    const submissionResult = await submitResponse.json();
    console.log('\nReceipt submission result:', JSON.stringify(submissionResult, null, 2));
    
    if (submissionResult.success) {
      console.log(`\n✅ Successfully created a manual review receipt with ID: ${submissionResult.data.id}`);
      console.log(`Estimated reward (pending approval): ${validationResult.data.estimated_reward} B3TR tokens`);
      console.log('\nNext steps:');
      console.log('1. This receipt should now be logged to Google Sheets for manual review');
      console.log('2. To simulate approval, run the approval test with this receipt ID:');
      console.log(`   node test-receipt-manual-approval.js with receipt ID ${submissionResult.data.id}`);
      
      // Now simulate approval of this receipt
      await simulateManualApproval(submissionResult.data.id);
    } else {
      console.error('Failed to submit receipt:', submissionResult.message);
    }
    
  } catch (error) {
    console.error('Error creating manual review receipt:', error);
  }
}

// Simulate approval of a receipt through the Google Sheet webhook
async function simulateManualApproval(receiptId) {
  console.log(`\n=== Simulating manual approval for receipt ID: ${receiptId} ===`);
  
  try {
    // Create an approval payload similar to what Google Sheet would send
    const approvalPayload = {
      receipt_id: receiptId,
      user_id: USER_ID.toString(),
      user_wallet: WALLET_ADDRESS,
      store_name: "GameStop",
      purchase_amount: 59.99,
      estimated_reward: 8,
      status: "approved",
      admin_notes: "Verified pre-owned items. Approved via test script."
    };
    
    console.log('Sending approval request...', JSON.stringify(approvalPayload, null, 2));
    
    // Call the receipt-approved endpoint
    const response = await fetch(`${API_URL}/api/receipt-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvalPayload),
    });
    
    // Get the response
    const approvalResult = await response.json();
    console.log('\nApproval result:', JSON.stringify(approvalResult, null, 2));
    
    if (approvalResult.success) {
      console.log(`\n✅ Receipt ${receiptId} successfully approved!`);
      console.log(`Tokens awarded: ${approvalResult.reward} B3TR`);
      console.log(`New user balance: ${approvalResult.newBalance} B3TR`);
      
      // Verify token balance updated in the user account
      const userResponse = await fetch(`${API_URL}/api/users/${USER_ID}`);
      const userData = await userResponse.json();
      
      console.log(`\nVerified user balance from user API: ${userData.tokenBalance} B3TR`);
      if (userData.tokenBalance === approvalResult.newBalance) {
        console.log('✅ Balance update verified in user account!');
      } else {
        console.error('❌ Balance inconsistency detected!');
      }
    } else {
      console.error('Manual approval failed:', approvalResult.message);
    }
    
  } catch (error) {
    console.error('Error during manual approval process:', error);
  }
}

// Run the test
createManualReviewReceipt();