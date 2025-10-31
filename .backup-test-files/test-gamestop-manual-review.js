/**
 * Test script specifically for GameStop manual review with pre-owned items
 * This simulates a GameStop receipt that has lower confidence and needs manual review
 */

// Create a sample GameStop receipt needing manual review
const testData = {
  userId: 102,
  imageUrl: "https://storage.googleapis.com/recircle/receipt-gamestop-preowned.jpg",
  storeData: {
    name: "GameStop",
    address: "500 Park Ave, New York, NY 10022",
    isThrift: false,
    confidence: 0.65 // Below threshold for auto approval
  },
  purchaseData: {
    totalAmount: 48.99,
    date: "2025-05-13",
    itemCount: 2,
    items: [
      { 
        name: "Pre-owned: Elden Ring PS5", 
        price: 39.99,
        isPreOwned: true 
      },
      { 
        name: "Controller Skin", 
        price: 9.00,
        isPreOwned: false 
      }
    ]
  },
  analysisResults: {
    isPreOwned: true,
    sustainableItems: 1,
    confidence: 0.65,
    needsManualReview: true,
    reviewReason: "Confidence below threshold (0.65 < 0.8)",
    estimatedRewards: 9.4, // Estimated reward based on purchase amount
    itemAnalysis: "Contains 1 pre-owned game (Elden Ring) which is eligible for sustainability rewards"
  }
};

// Call the validate endpoint to trigger manual review
async function testManualReview() {
  console.log("🧪 Sending GameStop receipt with pre-owned items for manual review...");
  
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
      console.log("✅ Manual review triggered as expected");
      console.log(`   - Estimated rewards: ${result.estimatedRewards}`);
      console.log(`   - Review reason: ${result.reviewReason}`);
    } else {
      console.error("❌ ERROR: Manual review was not triggered");
    }
    
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Run the test
testManualReview();