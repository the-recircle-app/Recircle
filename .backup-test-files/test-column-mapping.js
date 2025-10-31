/**
 * Simple test for Google Sheet column mapping 
 * Tests that estimated_reward goes into BaseReward column correctly
 */
import fetch from 'node-fetch';

// Original webhook URL that was working
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzDqopOu-WNEt9vxOn9Qrm0aD4K9gOnzj7AgRw-zXLJ8BtYk5_0V8d0dDyv816J-Eb3/exec';

async function testColumnMapping() {
  console.log("🧪 Testing Google Sheet column mapping with structured payload");
  
  // Format date in human-readable format for display in the sheet
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const testPayload = {
    receipt_id: `verification-test-${Date.now()}`, // Unique ID for each test run
    user_id: "102",
    user_wallet: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
    username: "MappingTestUser",
    store_name: `✅ COLUMN MAPPING TEST at ${formattedDate}`,  // Make it very obvious in the sheet
    purchase_date: "2025-05-13",
    purchase_amount: 49.99,
    amount: 49.99,
    category: "thrift",
    is_preowned: true,
    containsPreOwnedItems: true, // Add the exact field name used in the webhook code
    preowned_keywords: "used,secondhand,column-test",
    estimated_reward: 9.5, // This should show up in the BaseReward column
    base_reward: 9.5,      // Include both field names to ensure one works
    streak_multiplier: 1.1,
    final_reward: 10.45,
    status: "NEEDS_REVIEW",
    confidence: 0.75,
    notes: "This is a verification test of the Google Sheets column mapping at " + formattedDate,
    is_test_mode: true,
    app_version: "1.0.5"
  };
  
  console.log("Sending payload:", JSON.stringify(testPayload, null, 2));
  
  try {
    const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response text: ${responseText}`);
    
    // Try to parse JSON from response which might contain HTML
    try {
      // Extract JSON if embedded in HTML
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
        const jsonText = jsonMatch[0];
        const jsonData = JSON.parse(jsonText);
        console.log("Parsed response JSON:", JSON.stringify(jsonData, null, 2));
      } else {
        console.log("No JSON found in response");
      }
    } catch (jsonError) {
      console.log("Failed to parse JSON from response:", jsonError.message);
    }
    
    console.log("✅ Test completed");
    
  } catch (error) {
    console.error("❌ Error during test:", error.message);
  }
}

// Run the test
testColumnMapping().catch(console.error);