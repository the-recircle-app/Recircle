/**
 * Test script for manual approval through Google Sheets
 * This simulates the payload that would be sent when an admin approves a receipt in Google Sheets
 * for multiple different scenarios (GameStop, thrift store, etc.)
 */

// Function to test approval of a specific receipt type
async function testApproveReceipt(testCase) {
  console.log(`\n🧪 Testing manual approval for ${testCase.type} receipt...`);
  
  try {
    // Create a payload similar to what Google Sheet would send for approval
    const payload = {
      receipt_id: testCase.receipt_id,
      user_id: 102,
      user_wallet: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
      store_name: testCase.store_name,
      purchase_amount: testCase.purchase_amount,
      estimated_reward: testCase.estimated_reward,
      status: "approved",
      admin_notes: testCase.admin_notes || "Approved via test script"
    };
    
    console.log("Sending approval payload:", JSON.stringify(payload, null, 2));
    
    // Send the POST request to our endpoint
    const response = await fetch('http://localhost:5000/api/receipt-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // Read response data
    const responseText = await response.text();
    console.log(`Response Status: ${response.status}`);
    
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

// Define test cases for different receipt types
const testCases = [
  {
    type: "GameStop Pre-owned",
    receipt_id: "GS12345",
    store_name: "GameStop",
    purchase_amount: 55.99,
    estimated_reward: 9.8,
    admin_notes: "Pre-owned games confirmed, approving for sustainability rewards"
  },
  {
    type: "Salvation Army Thrift",
    receipt_id: "SA67890",
    store_name: "Salvation Army",
    purchase_amount: 37.25,
    estimated_reward: 8.9,
    admin_notes: "Thrift store purchase confirmed"
  },
  {
    type: "Local Secondhand Shop",
    receipt_id: "LS24680",
    store_name: "Village Vintage",
    purchase_amount: 42.75,
    estimated_reward: 9.2,
    admin_notes: "Local secondhand shop verified, sustainability approved"
  }
];

// Run the tests with a delay between each
async function runAll() {
  for (let i = 0; i < testCases.length; i++) {
    await testApproveReceipt(testCases[i]);
    
    // Add a delay between tests to prevent overwhelming the server
    if (i < testCases.length - 1) {
      console.log("\nWaiting 2 seconds before next test...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log("\n✅ All manual approval tests completed");
}

// Run all the tests
runAll();