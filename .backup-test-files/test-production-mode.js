/**
 * Production Mode Test Script
 * This script tests that the test features work correctly in the production environment
 * without actually modifying real data.
 */

import fetch from 'node-fetch';

// Configuration
const API_URL = 'http://localhost:5000'; // Change this to your production URL for real testing

async function testProductionSafeMode() {
  console.log('🧪 Testing Production-Safe Test Mode');
  console.log(`API URL: ${API_URL}`);
  
  try {
    // Create a test-only payload that won't affect real data
    const testPayload = {
      receipt_id: `TEST-${Date.now()}`,
      user_id: 'TEST-USER-ID',
      user_wallet: 'TEST-WALLET-ADDRESS',
      store_name: 'TEST STORE',
      purchase_amount: 0.01,
      estimated_reward: 0.01,
      status: 'approved',
      test_mode: true,  // Add a flag server can detect
      admin_notes: 'Production API Test - SAFE MODE'
    };
    
    console.log('\nSending test payload:');
    console.log(JSON.stringify(testPayload, null, 2));
    
    // Make the request with special test headers
    const response = await fetch(`${API_URL}/api/receipt-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Test-Mode': 'true'  // Add a test mode header server can detect
      },
      body: JSON.stringify(testPayload),
    });
    
    console.log(`\nResponse status: ${response.status}`);
    
    // Check content type
    const contentType = response.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);
    
    // Parse response as JSON
    const responseData = await response.json();
    console.log('Response data:');
    console.log(JSON.stringify(responseData, null, 2));
    
    // Check if test mode was detected
    if (responseData.test_mode === true) {
      console.log('\n✅ Success! Server properly detected test mode and returned a safe response.');
      console.log('This confirms the production safety mechanism is working correctly.');
    } else {
      console.log('\n❌ Warning! Server did not properly identify the request as a test.');
      console.log('Check your server implementation of the test mode detection logic.');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing production mode:', error);
  }
}

// Run the test
testProductionSafeMode();