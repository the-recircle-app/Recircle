/**
 * Simple test for receipt approval endpoint
 * Tests that the response is clean JSON with no HTML
 */

// Directly use fetch without import (uses global fetch)
const url = 'http://localhost:5000/api/receipt-approved';

async function testReceiptApprovalEndpoint() {
  console.log("🧪 Testing receipt approval endpoint with simulated Google Sheet payload...");
  
  try {
    // Create a payload similar to what Google Sheet would send
    const testPayload = {
      receipt_id: 12345,
      user_id: 102,
      user_wallet: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
      store_name: "GameStop",
      purchase_amount: 45.99,
      estimated_reward: 8.5,
      status: "approved",
      admin_notes: "Test approval from API test"
    };
    
    // Send the POST request to our endpoint
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    // Read response data
    const responseText = await response.text();
    console.log(`Response Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type') || 'not set'}`);
    
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
      
      // Check if token balance was updated
      if (jsonResponse.success && jsonResponse.newBalance) {
        console.log(`✅ Token balance updated to: ${jsonResponse.newBalance}`);
      }
    } catch (e) {
      console.error("❌ ERROR: Response is not valid JSON format");
      console.error("Raw response:", responseText);
    }
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Run the test
testReceiptApprovalEndpoint();