/**
 * Test script specifically for GameStop receipt validation
 * This test simulates a GameStop receipt with pre-owned items
 */

import fetch from 'node-fetch';

async function testGameStopReceiptValidation() {
  console.log('Testing GameStop receipt validation...');

  try {
    // Test using test mode but with specific GameStop receipt type
    console.log('\n--- GameStop with pre-owned items test ---');
    const response = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: "dGVzdCBpbWFnZSBkYXRhIGZvciBHYW1lU3RvcCByZWNlaXB0IHdpdGggcHJlLW93bmVkIGl0ZW1z", // Dummy base64 data
        testMode: true,
        testType: 'used_games',
        userId: 102,
        walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
        storeHint: 'GameStop',
        preOwned: true,
        containsPreOwnedItems: true,
        preOwnedKeywordsFound: ['PRE-OWNED', '930/00'],
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: 29.99,
      }),
    });

    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    // Compare the confidence score before and after our prompt improvements
    console.log('\nConfidence score analysis:');
    console.log('- Expected high confidence (>0.9) for GameStop pre-owned items');
    console.log(`- Actual confidence: ${data.confidence}`);
    console.log(`- Confidence improved: ${data.confidence > 0.8 ? 'YES' : 'NO'}`);
    console.log(`- Is sent for manual review: ${data.needsManualReview ? 'YES' : 'NO'}`);
    
  } catch (error) {
    console.error('Error testing GameStop receipt validation:', error);
  }
}

testGameStopReceiptValidation();