/**
 * Test script for new transportation Google Sheet integration
 * This will test the webhook with proper transportation field mapping
 */

async function testNewTransportationSheet() {
  console.log("🚗 Testing New Transportation Google Sheet Integration...\n");
  
  // Test payload matching the new transportation sheet structure
  const testPayload = {
    receipt_id: "TRANSPORT-TEST-" + Date.now(),
    user_id: 1,
    user_wallet: "0x9bf41f1ecd0e925c6158c98beb569526f9721300",
    store_name: "Uber Technologies", // Service Provider field
    purchase_amount: 32.50, // Trip Amount field
    estimated_reward: 18.0, // Estimated Reward field
    status: "approved",
    admin_notes: "Approved via new transportation Google Sheet",
    source: "google_sheets_transportation_review",
    transportation_category: "Ride-share Service",
    trip_date: "2025-07-09"
  };
  
  try {
    console.log("📤 Testing with transportation-focused payload:");
    console.log(JSON.stringify(testPayload, null, 2));
    
    const response = await fetch('http://localhost:5000/api/receipt-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    const result = await response.text();
    console.log("\n📥 Response from ReCircle:");
    console.log("Status:", response.status);
    console.log("Response:", result);
    
    if (response.status === 200) {
      console.log("\n✅ SUCCESS: New transportation sheet integration ready!");
      console.log("Your new Google Apps Script deployment should work perfectly.");
      
      // Parse response to show token distribution details
      try {
        const data = JSON.parse(result);
        console.log("\n🪙 Token Distribution Summary:");
        console.log("- User reward:", data.reward + " B3TR");
        console.log("- New balance:", data.newBalance + " B3TR");
        console.log("- Receipt ID:", data.receipt_id);
      } catch (e) {
        console.log("Response parsing note: Full details in response above");
      }
      
    } else {
      console.log("\n❌ ISSUE: Check error details above");
    }
    
  } catch (error) {
    console.log("\n❌ ERROR:", error.message);
  }
  
  console.log("\n📋 Next Steps:");
  console.log("1. Deploy your new Google Apps Script to the transportation sheet");
  console.log("2. Update webhook URL to: https://workspace.reign360.replit.app/api/receipt-approved");
  console.log("3. Verify column indices match your sheet structure");
  console.log("4. Test by marking a receipt as 'Approved' in column E");
}

testNewTransportationSheet();