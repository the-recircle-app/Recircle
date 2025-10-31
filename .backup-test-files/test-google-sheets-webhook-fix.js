/**
 * Test script to verify the Google Sheets webhook integration is working
 * This simulates what your updated Google Apps Script should send
 */

async function testUpdatedWebhookIntegration() {
  console.log("🧪 Testing Updated Google Sheets Integration...\n");
  
  // Test with your actual user data
  const testPayload = {
    receipt_id: "SHEETS-TEST-" + Date.now(),
    user_id: 1, // Your existing test user
    user_wallet: "0x9bf41f1ecd0e925c6158c98beb569526f9721300",
    store_name: "Test Transportation Service - Uber",
    purchase_amount: 25.50,
    estimated_reward: 15.0,
    status: "approved",
    admin_notes: "Test approval from updated Google Apps Script",
    source: "google_sheets_manual_approval"
  };
  
  try {
    console.log("📤 Sending test webhook payload:");
    console.log(JSON.stringify(testPayload, null, 2));
    
    const response = await fetch('http://localhost:5000/api/receipt-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    const result = await response.text();
    console.log("\n📥 Webhook Response:");
    console.log("Status:", response.status);
    console.log("Response:", result);
    
    if (response.status === 200) {
      console.log("\n✅ SUCCESS: Webhook integration is working!");
      console.log("This means your Google Apps Script should work once updated.");
      
      // Check if tokens were distributed
      console.log("\n🪙 Checking token distribution...");
      const balanceResponse = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (balanceResponse.ok) {
        const userData = await balanceResponse.json();
        console.log("User balance after approval:", userData.tokenBalance);
      }
      
    } else {
      console.log("\n❌ FAILED: Check the error message above");
    }
    
  } catch (error) {
    console.log("\n❌ ERROR:", error.message);
  }
}

testUpdatedWebhookIntegration();