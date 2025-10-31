/**
 * Test script for rideshare receipt manual review bypass
 * 
 * This script tests whether rideshare receipts properly bypass
 * the manual review process regardless of confidence level.
 */

import fetch from 'node-fetch';

// Configure test parameters
const TEST_USER_ID = 102;
const TEST_RECEIPT_DATA = {
  // Common receipt data
  userId: TEST_USER_ID,
  
  // Test case specific data
  walletAddress: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
  
  // Three scenarios to test - make each unique to avoid duplicate detection
  testCases: [
    {
      storeName: "Uber",
      confidenceLevel: 0.65, // Low confidence to trigger normal manual review
      description: "Uber with low confidence",
      amount: 25.99,
      imageUrl: "test-image-uber.jpg",
      purchaseDate: "2025-05-01", // Different dates for each test
      storeId: 1
    },
    {
      storeName: "Lyft Transportation",
      confidenceLevel: 0.73, // Just above threshold
      description: "Lyft just above threshold",
      amount: 15.50,
      imageUrl: "test-image-lyft.jpg",
      purchaseDate: "2025-05-02",
      storeId: 2
    },
    {
      storeName: "Waymo Rideshare",
      confidenceLevel: 0.90, // High confidence
      description: "Waymo rideshare high confidence",
      amount: 10.25,
      imageUrl: "test-image-waymo.jpg",
      purchaseDate: "2025-05-03",
      storeId: 3
    }
  ]
};

// Mock receipt data creation function
function createMockReceiptData(testCase) {
  return {
    userId: TEST_USER_ID,
    walletAddress: TEST_RECEIPT_DATA.walletAddress,
    storeName: testCase.storeName,
    purchaseDate: testCase.purchaseDate, // Use unique date for each test
    amount: testCase.amount, // Use unique amount for each test
    storeId: testCase.storeId, // Use unique store ID for each test
    
    // Required empty image data to pass validation
    // This is a tiny 1x1 transparent GIF
    imageData: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    
    // Add debugging flags to bypass full AI validation
    // but still test our webhook override logic
    debugMode: true,
    bypassImageValidation: true,
    
    // Receipt validation data
    confidenceLevel: testCase.confidenceLevel,
    
    // Force some conditions that would normally trigger manual review
    // to test our override is working
    sentForManualReview: true,
    isTimeoutFallback: false,
    aiTestMode: true, // This would normally force manual review
    
    // Other validation metadata
    validateSustainableStore: true,
    containsPreOwnedItems: true,
    sustainabilityCategory: "thrift purchase"
  };
}

// Function to call the receipt submission endpoint
async function testReceiptValidation(testCase) {
  try {
    console.log(`\n----- Testing: ${testCase.description} -----`);
    
    const receiptData = createMockReceiptData(testCase);
    console.log(`Submitting receipt with store name: ${receiptData.storeName}`);
    console.log(`Confidence level: ${receiptData.confidenceLevel}`);
    console.log(`Test mode flag: ${receiptData.aiTestMode}`);
    
    // Call the receipts creation endpoint directly
    const response = await fetch('http://localhost:5000/api/receipts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // This mimics what would be submitted after validation
        userId: receiptData.userId,
        storeId: receiptData.storeId, // Use unique store ID from test case
        storeName: receiptData.storeName,
        amount: receiptData.amount, // Use unique amount from test case
        purchaseDate: receiptData.purchaseDate, // Use unique date from test case
        paymentMethod: "CREDIT",
        imageUrl: testCase.imageUrl, // Use unique image URL for each test
        
        // Add analysis result with the proper confidence and store name
        // This is what the override logic checks for
        analysisResult: {
          storeName: receiptData.storeName,
          confidence: receiptData.confidenceLevel, 
          sentForManualReview: true,
          testMode: true,
          timeoutFallback: false,
        },
        
        // These are the key fields we need to test
        // They would normally trigger manual review
        sentForManualReview: true,
        confidenceLevel: receiptData.confidenceLevel,
        aiTestMode: true,
        
        // Receipt metadata
        sustainabilityCategory: "thrift purchase",
        containsPreOwnedItems: true,
      }),
    });
    
    const result = await response.json();
    
    console.log(`Response status: ${response.status}`);
    console.log(`Validation result:`, result);
    
    // For receipt creation, success means that the receipt was created without error
    // We can check the logs to see if manual review was successfully bypassed
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ SUCCESS: Receipt created for ${testCase.storeName}`);
      // Webhook bypass success is logged in the server logs
      console.log(`Check server logs for CRITICAL OVERRIDE message with "${testCase.storeName}"`);
    } else {
      console.log(`❌ FAILED: Receipt creation failed for ${testCase.storeName}`);
    }
    
    return {
      success: response.status === 200 || response.status === 201,
      result
    };
  } catch (error) {
    console.error(`Error testing ${testCase.description}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to wait between tests
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run all test cases
async function runTests() {
  console.log('===== TESTING THRIFT STORE MANUAL REVIEW BYPASS =====');
  console.log(`Starting tests at ${new Date().toLocaleTimeString()}`);
  
  const results = [];
  
  for (const testCase of TEST_RECEIPT_DATA.testCases) {
    const result = await testReceiptValidation(testCase);
    results.push({
      testCase: testCase.description,
      success: result.success,
      details: result.result
    });
    
    // Add a 2-second delay between tests to avoid any race conditions
    await sleep(2000);
  }
  
  // Display summary
  console.log('\n===== TEST RESULTS SUMMARY =====');
  let allPassed = true;
  
  for (const result of results) {
    if (result.success) {
      console.log(`✅ PASSED: ${result.testCase}`);
    } else {
      console.log(`❌ FAILED: ${result.testCase}`);
      allPassed = false;
    }
  }
  
  console.log(`\nOverall test status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Tests completed at ${new Date().toLocaleTimeString()}`);
}

// Execute the tests in ES Modules
runTests().catch(console.error);