/**
 * Comprehensive test for Google Sheet webhook integration
 * This tests both regular receipt submission and manual review formats
 */

import fetch from 'node-fetch';

// Google Sheet webhook URL - the corrected URL as used in the application
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzDqopOu-WNEt9vxOn9Qrm0aD4K9gOnzj7AgRw-zXLJ8BtYk5_0V8d0dDyv816J-Eb3/exec';

// Format date for easy identification in the spreadsheet
const now = new Date();
const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
const UNIQUE_TEST_ID = `full-webhook-test-${Date.now()}`;

async function testRegularReceiptWebhook() {
  console.log('\n--- Testing REGULAR RECEIPT webhook ---');
  
  // This payload follows the exact format expected by your Google Sheet
  const payload = {
    // Required fields in both formats
    receipt_id: `${UNIQUE_TEST_ID}-regular`,
    receiptId: `${UNIQUE_TEST_ID}-regular`,
    user_id: "103", // Use a different user ID to avoid daily action limit
    userId: "103",
    wallet_address: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
    walletAddress: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
    username: "ComprehensiveTest",
    store_name: `✅ COMPLETE TEST - ${formattedDate}`,
    storeName: `✅ COMPLETE TEST - ${formattedDate}`,
    store_id: 5,
    storeId: 5,
    purchase_date: "2025-05-13", 
    purchaseDate: "2025-05-13",
    purchase_amount: 45.99,
    purchaseAmount: 45.99,
    amount: 45.99,
    
    // Sustainability information
    sustainability_category: "thrift",
    sustainabilityCategory: "thrift",
    receipt_category: "thrift",
    receiptCategory: "thrift",
    contains_pre_owned: true,
    containsPreOwned: true,
    containsPreOwnedItems: true,
    
    // Reward information
    base_reward: 10,
    baseReward: 10,
    token_reward: 10,
    tokenReward: 10,
    final_reward: 10,
    finalReward: 10,
    
    // Status flags
    is_acceptable: true,
    isAcceptable: true,
    needs_manual_review: false,
    needsManualReview: false,
    
    // Additional fields
    payment_method: {
      method: "VISA",
      cardLastFour: "1234",
      isDigital: false
    },
    paymentMethod: {
      method: "VISA",
      cardLastFour: "1234",
      isDigital: false
    },
    
    // Event metadata
    event_type: "submission",
    eventType: "submission",
    timestamp: new Date().toISOString(),
    is_test_mode: true,
    isTestMode: true,
    
    // Debug information
    _debug: true,
    validation_reasons: ["Valid thrift store receipt"],
    validationReasons: ["Valid thrift store receipt"],
    confidence_score: 0.95,
    confidenceScore: 0.95,
    app_version: "1.0.5",
    appVersion: "1.0.5",
  };
  
  try {
    console.log(`Sending webhook with payload: ${JSON.stringify(payload, null, 2).slice(0, 500)}...`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'RecircleRewards-App',
        'X-Event-Type': 'test_submission'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseText.slice(0, 500)}`);
    
    if (response.ok) {
      console.log('✅ Regular receipt webhook test successful');
    } else {
      console.log('❌ Regular receipt webhook test failed');
    }
  } catch (error) {
    console.error(`Error testing webhook: ${error.message}`);
  }
}

async function testManualReviewWebhook() {
  console.log('\n--- Testing MANUAL REVIEW webhook ---');
  
  // This payload follows the exact format expected by your Google Sheet for manual review
  const payload = {
    // Required fields in both formats
    receipt_id: `${UNIQUE_TEST_ID}-manual`,
    receiptId: `${UNIQUE_TEST_ID}-manual`,
    user_id: "103", // Use a different user ID to avoid daily action limit
    userId: "103",
    wallet_address: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
    walletAddress: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
    username: "ManualReviewTest",
    store_name: `⚠️ MANUAL REVIEW TEST - ${formattedDate}`,
    storeName: `⚠️ MANUAL REVIEW TEST - ${formattedDate}`,
    store_id: 0,
    storeId: 0,
    purchase_date: "2025-05-13",
    purchaseDate: "2025-05-13",
    purchase_amount: 59.99,
    purchaseAmount: 59.99,
    amount: 59.99,
    
    // Critical for manual review
    needs_manual_review: true,
    needsManualReview: true,
    is_acceptable: false,
    isAcceptable: false,
    
    // Category placeholders
    receipt_category: "pending-review",
    receiptCategory: "pending-review",
    sustainability_category: "pending-review",
    sustainabilityCategory: "pending-review",
    contains_pre_owned: false,
    containsPreOwned: false,
    containsPreOwnedItems: false,
    
    // Placeholder reward values
    base_reward: 0,
    baseReward: 0,
    token_reward: 0,
    tokenReward: 0,
    final_reward: 0,
    finalReward: 0,
    
    // Event metadata
    event_type: "manual_review",
    eventType: "manual_review",
    timestamp: new Date().toISOString(),
    is_test_mode: true,
    isTestMode: true,
    
    // Debug and notes
    validation_reasons: "AI validation timed out; needs manual review",
    validationReasons: "AI validation timed out; needs manual review",
    notes: "AI validation timed out; needs manual review",
    confidence_score: 0.2,
    confidenceScore: 0.2,
    app_version: "1.0.5",
    appVersion: "1.0.5",
    image_url: "https://example.com/receipt/67890.jpg",
    imageUrl: "https://example.com/receipt/67890.jpg"
  };
  
  try {
    console.log(`Sending manual review webhook with payload: ${JSON.stringify(payload, null, 2).slice(0, 500)}...`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'RecircleRewards-App',
        'X-Event-Type': 'manual_review'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseText.slice(0, 500)}`);
    
    if (response.ok) {
      console.log('✅ Manual review webhook test successful');
    } else {
      console.log('❌ Manual review webhook test failed');
    }
  } catch (error) {
    console.error(`Error testing manual review webhook: ${error.message}`);
  }
}

async function testSimpleTestPing() {
  console.log('\n--- Testing simple ping webhook ---');
  
  // Simple test ping with unique identifier
  const payload = {
    ping: true,
    test: "connection",
    timestamp: new Date().toISOString(),
    test_id: UNIQUE_TEST_ID,
    test_date: formattedDate
  };
  
  try {
    console.log(`Sending test ping: ${JSON.stringify(payload)}`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'RecircleRewards-Test'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${responseText.slice(0, 500)}`);
  } catch (error) {
    console.error(`Error testing ping: ${error.message}`);
  }
}

async function runTests() {
  console.log('Running comprehensive webhook tests...\n');
  
  try {
    // First test a simple ping
    await testSimpleTestPing();
    
    // Test regular receipt webhook
    await testRegularReceiptWebhook();
    
    // Test manual review webhook
    await testManualReviewWebhook();
    
    console.log('\nAll webhook tests completed.');
    console.log(`All tests used unique ID prefix: ${UNIQUE_TEST_ID}`);
    console.log(`Test timestamp: ${formattedDate}`);
    console.log('Check your Google Sheet for entries with this unique ID and timestamp');
    console.log('The entries should appear in the corresponding tabs or a newly created tab');
  } catch (error) {
    console.error(`Error in tests: ${error.message}`);
  }
}

// Run the tests
runTests();