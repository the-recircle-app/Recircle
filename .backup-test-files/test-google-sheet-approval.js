/**
 * Test script for Google Sheet approval integration
 * 
 * This script simulates the exact payload that would be sent from Google Sheets
 * when approving a receipt, and verifies the response format is clean JSON.
 */

import fetch from 'node-fetch';

// Function to test receipt approval
async function testReceiptApproval() {
  console.log('Testing Google Sheet receipt approval integration...');
  
  try {
    // Create multiple test payloads to simulate various scenarios from Google Sheets
    const testPayloads = [
      {
        // Standard GameStop approval
        receipt_id: '423299',
        user_id: '102',
        user_wallet: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
        store_name: 'GameStop',
        purchase_amount: 59.99,
        estimated_reward: 10,
        status: 'approved',
        admin_notes: 'Pre-owned items verified'
      },
      {
        // Minimal payload (only required fields)
        user_id: '102',
        status: 'approved'
      }
    ];
    
    // Test each payload and check response format
    for (let i = 0; i < testPayloads.length; i++) {
      const payload = testPayloads[i];
      console.log(`\n[Test ${i+1}] Sending approval payload: ${JSON.stringify(payload, null, 2)}`);
      
      // Make the request to the receipt approval endpoint
      const response = await fetch('http://localhost:5000/api/receipt-approved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Get response as text first to verify it's valid JSON
      const responseText = await response.text();
      console.log(`\nRaw response (${responseText.length} chars): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      
      // Try parsing as JSON
      try {
        const responseData = JSON.parse(responseText);
        console.log('Response parsed as valid JSON ✅');
        console.log('Response data:', JSON.stringify(responseData, null, 2));
        
        // Check for HTML content in any string fields
        const containsHtml = checkForHtmlContent(responseData);
        if (containsHtml) {
          console.log('⚠️ WARNING: Response contains HTML-like content');
        } else {
          console.log('No HTML content detected in response ✅');
        }
        
        // Verify successful response
        if (response.status === 200 && responseData.success) {
          console.log(`✅ Test ${i+1} successful! New balance: ${responseData.newBalance}`);
          
          // Make a request to get the latest transactions to verify they were created
          console.log('\nVerifying transaction history was updated:');
          const txResponse = await fetch('http://localhost:5000/api/users/102/transactions');
          const transactions = await txResponse.json();
          
          console.log(`Found ${transactions.length} transactions`);
          console.log('Latest 3 transactions:');
          transactions.slice(0, 3).forEach(tx => {
            console.log(`- [${tx.id}] ${tx.type}: ${tx.amount} B3TR - ${tx.description}`);
          });
        } else {
          console.log(`❌ Test ${i+1} failed!`);
          if (responseData.message) {
            console.log(`Error message: ${responseData.message}`);
          }
        }
      } catch (err) {
        console.log(`❌ Failed to parse response as JSON: ${err.message}`);
        console.log('Response is not valid JSON! This will cause problems with Google Sheets.');
      }
    }
    
    // Let's also verify the user's balance directly
    console.log('\nVerifying user balance:');
    const userResponse = await fetch('http://localhost:5000/api/users/102');
    const userData = await userResponse.json();
    console.log(`User token balance: ${userData.tokenBalance}`);
    
    return true;
  } catch (error) {
    console.error('Error during test:', error.message);
    return false;
  }
}

// Helper function to check for HTML content in response
function checkForHtmlContent(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  
  // Check all string values for HTML tags
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'string' && (
      value.includes('<html') || 
      value.includes('<!DOCTYPE') || 
      value.includes('<body') ||
      value.includes('<div') ||
      value.includes('<script')
    )) {
      console.log(`Found HTML content in field: ${key}`);
      return true;
    }
    
    // Recursively check nested objects
    if (typeof value === 'object' && value !== null) {
      if (checkForHtmlContent(value)) {
        return true;
      }
    }
  }
  
  return false;
}

// Run the test
testReceiptApproval().then(result => {
  if (result) {
    console.log('\nAll tests completed.');
    process.exit(0);
  } else {
    console.log('\nTests encountered errors.');
    process.exit(1);
  }
}).catch(err => {
  console.error('\nUnexpected error:', err);
  process.exit(1);
});