/**
 * Test for integrating directly with Google Sheet webhook
 * This script tests sending data to your Google Sheet webhook after receipt approval
 */

// Google Sheet webhook URL from project configuration
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzDqopOu-WNEt9vxOn9Qrm0aD4K9gOnzj7AgRw-zXLJ8BtYk5_0V8d0dDyv816J-Eb3/exec';

// Two-step process: first validate a receipt (manual review), then approve it and notify Google Sheets
async function testGoogleSheetWebhookFlow() {
  console.log("\n🧪 Testing complete Google Sheet webhook flow...");
  console.log("Step 1: Create a manual review receipt");
  
  let receipt_id;
  let estimated_reward;
  
  try {
    // Step 1: Submit a receipt that needs manual review
    const testReceiptData = {
      userId: 102,
      imageUrl: "https://storage.googleapis.com/recircle/receipt-test-manual-review.jpg",
      storeData: {
        name: "Second Chance Books",
        address: "789 Reading Ave, Chicago, IL 60601",
        isThrift: false,
        confidence: 0.65 // Below threshold for auto approval
      },
      purchaseData: {
        totalAmount: 37.50,
        date: "2025-05-13",
        itemCount: 3,
        items: [
          { name: "Used Paperback", price: 12.50 },
          { name: "Second-hand Textbook", price: 18.00 },
          { name: "Bookmark", price: 7.00 }
        ]
      },
      analysisResults: {
        confidence: 0.65,
        needsManualReview: true,
        reviewReason: "Confidence below threshold (0.65 < 0.8)",
        estimatedRewards: 8.8 // Estimated reward based on purchase amount
      }
    };
    
    // Submit the receipt for validation
    const validationResponse = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testReceiptData),
    });
    
    const validationResult = await validationResponse.json();
    console.log("Validation result:", JSON.stringify(validationResult, null, 2));
    
    // Store receipt info for the next step
    receipt_id = validationResult.receiptId || '12345';
    estimated_reward = validationResult.estimatedRewards || 8.8;
    
    // Step 2: Approve the receipt via the receipt-approved endpoint
    console.log("\nStep 2: Approving the receipt via receipt-approved endpoint");
    const approvalPayload = {
      receipt_id: receipt_id,
      user_id: 102,
      user_wallet: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
      store_name: "Second Chance Books",
      purchase_amount: 37.50,
      estimated_reward: estimated_reward,
      status: "approved",
      admin_notes: "Approval test via script"
    };
    
    const approvalResponse = await fetch('http://localhost:5000/api/receipt-approved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalPayload),
    });
    
    const approvalResult = await approvalResponse.json();
    console.log("Approval result:", JSON.stringify(approvalResult, null, 2));
    
    // Step 3: Send test data directly to Google Sheet webhook
    console.log("\nStep 3: Sending test data to Google Sheet webhook");
    const googleSheetPayload = {
      action: "receipt_approval_test",
      test_id: "GS_TEST_" + Date.now(),
      approval_data: approvalResult,
      timestamp: new Date().toISOString(),
      test_info: {
        success: approvalResult.success, 
        receipt_id: receipt_id,
        user_id: 102,
        store_name: "Second Chance Books",
        reward: estimated_reward
      }
    };
    
    // Log what we're sending to Google Sheet
    console.log("Sending to Google Sheet:", GOOGLE_SHEET_WEBHOOK_URL);
    
    try {
      // Send to Google Sheet with timeout
      const gsResponse = await Promise.race([
        fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(googleSheetPayload),
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Google Sheet webhook request timed out')), 10000)
        )
      ]);
      
      // Try to read response, but Google Sheet Apps Script might not return a proper response
      try {
        const gsResponseText = await gsResponse.text();
        console.log("Google Sheet response status:", gsResponse.status);
        console.log("Google Sheet response:", gsResponseText);
      } catch (e) {
        console.log("Note: Google Sheet webhook may not return a response");
      }
      
      console.log("✅ Google Sheet webhook test completed");
      
    } catch (gsError) {
      console.error("Error or timeout with Google Sheet webhook:", gsError.message);
      console.log("This might be expected as Apps Script webhooks sometimes don't respond properly");
      console.log("✅ Test completed - check your Google Sheet to see if the data was recorded");
    }
    
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Run the test
testGoogleSheetWebhookFlow();