/**
 * Test script for transportation receipt with low confidence
 * This simulates a receipt from a transportation service, which should bypass manual review
 * even with lower confidence levels
 */

// Create a sample transportation receipt with low confidence
const testData = {
  userId: 102,
  imageUrl: "https://storage.googleapis.com/recircle/receipt-uber-ride.jpg",
  storeData: {
    name: "Uber",
    address: "Digital Service, San Francisco, CA",
    isTransportation: true,
    confidence: 0.72 // Above 0.7 threshold for transportation services
  },
  purchaseData: {
    totalAmount: 32.50,
    date: "2025-05-13",
    serviceType: "rideshare",
    rides: [
      { 
        from: "Downtown", 
        to: "Airport",
        distance: "15.2 miles",
        price: 32.50
      }
    ]
  },
  analysisResults: {
    isTransportationService: true,
    confidence: 0.72,
    needsManualReview: false, // Should bypass review due to transportation service rule
    estimatedRewards: 8.6, // Estimated reward based on purchase amount
    itemAnalysis: "All rides with sustainable transportation services are considered eco-friendly"
  }
};

// Call the validate endpoint to trigger manual review bypass
async function testTransportationReview() {
  console.log("🧪 Sending Uber transportation receipt for validation...");
  
  try {
    const response = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    console.log("Response status:", response.status);
    console.log("Response:", JSON.stringify(result, null, 2));
    
    if (result.needsManualReview) {
      console.error("❌ ERROR: Manual review was triggered for transportation service");
    } else {
      console.log("✅ Manual review bypassed as expected for transportation service");
      console.log(`   - Rewards: ${result.estimatedRewards}`);
      console.log(`   - Store name: ${result.storeName}`);
    }
    
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Run the test
testTransportationReview();