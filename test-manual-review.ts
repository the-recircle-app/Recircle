/**
 * Test script for the manual review webhook integration
 * 
 * This script simulates a receipt validation failure and tests the integration
 * with the Google Sheets webhook for manual review.
 */

import fetch from 'node-fetch';

async function testManualReview() {
  console.log('Testing manual review webhook integration...');
  
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
        userId: 102,
        walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686', // Example wallet address
        
        // Store details to test GameStop detection
        storeHint: 'GameStop',
        imageName: 'gamestop_receipt.jpg',
        isGameStop: true,
        
        // Receipt details
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: 59.99,
        
        // Pre-owned item flags
        preOwned: true,
        containsPreOwnedItems: true,
        preOwnedKeywordsFound: ['pre-owned', 'used game'],
      }),
    });

    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    // Test 2: Test mode with manual review flag
    console.log('\n--- Test 2: Test mode with manual review flag ---');
    const testResponse = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testMode: true,
        logForManualReview: true,
        userId: 102,
        walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686', // Example wallet address
        testType: 'sustainable',
        storeHint: 'Goodwill Test',
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: 25.50,
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
        userId: 102,
        walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
        // Providing an empty/invalid image to cause an error
        image: 'invalid_base64_data',
        storeHint: 'Barnes & Noble',
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: 32.75,
      }),
    });
    
    console.log(`Error test response status: ${errorResponse.status}`);
    try {
      const errorData = await errorResponse.json();
      console.log('Error test response data:', JSON.stringify(errorData, null, 2));
    } catch (e) {
      console.error('Error parsing JSON response:', e);
    }
    
    // Report completion
    console.log('\nManual review webhook integration test complete');
    console.log('Check the logs for [MANUAL REVIEW] messages to confirm webhook calls');
  } catch (error) {
    console.error('Error testing manual review webhook:', error);
  }
}

testManualReview();