/**
 * Comprehensive test for Google Sheet webhook integration
 * This test verifies clean JSON responses and checks for any HTML content in responses
 */
import fetch from 'node-fetch';

// Google Sheet webhook URL from project configuration
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzDqopOu-WNEt9vxOn9Qrm0aD4K9gOnzj7AgRw-zXLJ8BtYk5_0V8d0dDyv816J-Eb3/exec';

// Test a simulated receipt approval from the Google Sheet 
async function testReceiptApprovalResponse() {
  console.log("\n🧪 Testing receipt approval endpoint with Google Sheet webhook payload...");
  
  try {
    // Create a payload similar to what Google Sheet would send
    const testPayload = {
      receiptId: 12345,
      status: "approved",
      adminNotes: "Test approval from Google Sheet webhook",
      estimatedRewards: 8.5,
      userId: 102,
      storeName: "GameStop",
      storeAddress: "123 Main St",
      purchaseTotal: 45.99,
      purchaseDate: "2025-05-10",
      itemsCount: 2,
      imageUrl: "https://example.com/receipt.jpg"
    };
    
    // Send the POST request to our endpoint
    const response = await fetch('http://localhost:3000/api/receipt-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    // Read response data
    const responseText = await response.text();
    console.log(`Response Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
    // Check if the response contains HTML tags (which would break Google Sheets)
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(responseText);
    if (hasHtmlTags) {
      console.error("❌ ERROR: Response contains HTML tags that will break Google Sheets!");
      console.error(responseText);
    } else {
      console.log("✅ Response is clean (no HTML tags)");
    }
    
    // Try to parse as JSON to verify it's valid JSON format
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log("✅ Response is valid JSON format");
      console.log("Response data:", JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.error("❌ ERROR: Response is not valid JSON format");
      console.error("Raw response:", responseText);
    }
    
    // Test sending directly to Google Sheet webhook (if response is clean)
    if (!hasHtmlTags) {
      console.log("\n🧪 Testing direct integration with Google Sheet webhook...");
      
      // Create the data to send to Google Sheet webhook
      const googleSheetData = {
        action: "test_connection",
        responseData: responseText,
        timestamp: new Date().toISOString()
      };
      
      // Send to Google Sheet
      const gsResponse = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleSheetData),
      });
      
      const gsResponseText = await gsResponse.text();
      console.log(`Google Sheet Response Status: ${gsResponse.status}`);
      console.log("Google Sheet Response:", gsResponseText);
    }
    
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Test a manual review payload for Google Sheet integration
async function testManualReviewPayload() {
  console.log("\n🧪 Testing manual review payload with Google Sheet webhook...");
  
  try {
    // Create a payload for a receipt that needs manual review
    const testData = {
      userId: 102,
      imageUrl: "https://storage.googleapis.com/recircle/receipt_12345.jpg",
      storeData: {
        name: "GameStop",
        address: "456 Commerce Ave, Brooklyn, NY",
        isThrift: false,
        confidence: 0.65 // Below threshold, should trigger manual review
      },
      purchaseData: {
        totalAmount: 65.99,
        date: "2025-05-13",
        itemCount: 3
      },
      analysisResults: {
        isPreOwned: true,
        sustainableItems: 2,
        confidence: 0.65,
        needsManualReview: true,
        reviewReason: "Confidence below threshold (0.65 < 0.8)",
        estimatedRewards: 10.5
      }
    };
    
    // Send to our API endpoint
    const response = await fetch('http://localhost:3000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    // Read response data
    const responseData = await response.json();
    console.log("Validation Response:", JSON.stringify(responseData, null, 2));
    
    // Check if the manual review webhook was triggered
    if (responseData.needsManualReview) {
      console.log("✅ Manual review was triggered as expected");
    } else {
      console.error("❌ ERROR: Manual review was not triggered");
    }
    
  } catch (error) {
    console.error("Error during manual review test:", error);
  }
}

// Run all tests
async function runAllTests() {
  console.log("=== GOOGLE SHEET INTEGRATION TESTS ===");
  console.log("Testing with webhook URL:", GOOGLE_SHEET_WEBHOOK_URL);
  
  await testReceiptApprovalResponse();
  await testManualReviewPayload();
  
  console.log("\n=== TESTS COMPLETED ===");
}

// Run the tests
runAllTests();