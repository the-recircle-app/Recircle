/**
 * Test script for the manual review webhook integration
 * 
 * This script simulates a receipt validation failure and tests the integration
 * with the Google Sheets webhook for manual review.
 */

import fetch from 'node-fetch';

// Format date for clear identification in the spreadsheet
const now = new Date();
const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
const UNIQUE_TEST_ID = `manual-review-${Date.now()}`;

async function testManualReview() {
  console.log('Testing manual review webhook integration...');
  console.log(`Using unique test ID: ${UNIQUE_TEST_ID}`);
  console.log(`Test timestamp: ${formattedDate}`);
  
  try {
    // Test 1: Timeout fallback scenario
    console.log('\n--- Test 1: Timeout fallback scenario ---');
    const response = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Force a timeout fallback scenario
        timeoutFallback: true,
        
        // Include user data
        userId: 103, // Using a different user ID to avoid daily action limit
        walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686', // Example wallet address
        
        // Store details to test GameStop detection with unique identifier
        storeHint: `GameStop Test ${UNIQUE_TEST_ID}`,
        imageName: 'gamestop_receipt.jpg',
        isGameStop: true,
        
        // Receipt details
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: 59.99,
        
        // Pre-owned item flags
        preOwned: true,
        containsPreOwnedItems: true,
        preOwnedKeywordsFound: ['pre-owned', 'used game'],
        
        // Add extra tracking for Google Sheets
        notes: `Test 1: Timeout fallback scenario at ${formattedDate}`,
        receiptId: `${UNIQUE_TEST_ID}-test1`
      }),
    });

    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    // Test 2: Test mode with manual review flag - Using force timeout flag to bypass image validation
    console.log('\n--- Test 2: Test mode with manual review flag ---');
    const testResponse = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testMode: true,
        timeoutFallback: true, // Add this to force manual review without image
        logForManualReview: true,
        userId: 103, // Using a different user ID to avoid daily action limit
        walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686', // Example wallet address
        testType: 'sustainable',
        storeHint: `✅ GOODWILL TEST - ${UNIQUE_TEST_ID}`,
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: 25.50,
        notes: `Test 2: Manual review test at ${formattedDate}`,
        receiptId: `${UNIQUE_TEST_ID}-test2`,
        confidence: 0.75, // Add medium confidence to test manual review
        isThriftStore: true, // Add thrift store flag to test that workflow
      }),
    });
    
    console.log(`Test mode response status: ${testResponse.status}`);
    const testData = await testResponse.json();
    console.log('Test mode response data:', JSON.stringify(testData, null, 2));
    
    // Test 3: Simulate OpenAI error
    console.log('\n--- Test 3: Simulate OpenAI error ---');
    const errorResponse = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 103, // Using a different user ID to avoid daily action limit
        walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
        // Providing an empty/invalid image to cause an error
        image: 'invalid_base64_data',
        storeHint: `⚠️ ERROR TEST - ${UNIQUE_TEST_ID}`,
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: 32.75,
        notes: `Test 3: Simulated API error at ${formattedDate}`,
        receiptId: `${UNIQUE_TEST_ID}-test3`,
      }),
    });
    
    console.log(`Error test response status: ${errorResponse.status}`);
    try {
      const errorData = await errorResponse.json();
      console.log('Error test response data:', JSON.stringify(errorData, null, 2));
    } catch (e) {
      console.error('Error parsing JSON response:', e.message);
    }
    
    // Report completion
    console.log('\nManual review webhook integration test complete');
    console.log(`All tests used unique ID prefix: ${UNIQUE_TEST_ID}`);
    console.log(`Test timestamp: ${formattedDate}`);
    console.log('Check the Google Sheet for entries with this unique ID and timestamp');
    console.log('The entries should appear in the "Manual Review" tab or a newly created tab');
  } catch (error) {
    console.error('Error testing manual review webhook:', error);
  }
}

testManualReview();