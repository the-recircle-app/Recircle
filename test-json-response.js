/**
 * Test script to verify JSON response integrity from API endpoints
 * This tests the updated middleware to ensure no HTML content is returned
 */

import fetch from 'node-fetch';

// Configuration
const API_URL = 'http://localhost:5000';

async function testReceiptApprovalEndpoint() {
  console.log('Testing receipt approval endpoint for clean JSON response...');
  
  try {
    // Test payload for receipt approval
    const testPayload = {
      receipt_id: '12345',
      user_id: '102',
      user_wallet: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
      store_name: 'GameStop',
      purchase_amount: 49.99,
      estimated_reward: 8,
      status: 'approved',
      admin_notes: 'Test approval via JSON validation test'
    };
    
    // Call the receipt-approved endpoint
    const response = await fetch(`${API_URL}/api/receipt-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    // Check content type header
    const contentType = response.headers.get('content-type');
    console.log(`Response status: ${response.status}`);
    console.log(`Content-Type: ${contentType}`);
    
    // Get response as text to inspect for HTML
    const responseText = await response.text();
    
    // Check if response contains HTML tags
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(responseText);
    
    console.log('\nResponse body:');
    console.log(responseText);
    
    if (hasHtmlTags) {
      console.error('\n❌ ERROR: Response contains HTML tags!');
      // Extract and show HTML content
      const htmlMatch = responseText.match(/<html[\s\S]*<\/html>/i);
      if (htmlMatch) {
        console.error('HTML content detected:');
        console.error(htmlMatch[0].slice(0, 200) + '...');
      }
    } else {
      console.log('\n✅ SUCCESS: Response is clean JSON with no HTML content');
      // Try parsing JSON
      try {
        const jsonData = JSON.parse(responseText);
        console.log('Parsed JSON data:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.error('Failed to parse response as JSON:', e.message);
      }
    }
    
  } catch (error) {
    console.error('Error testing receipt approval endpoint:', error);
  }
}

// Test store approval endpoint too (similar webhook endpoint)
async function testStoreApprovalEndpoint() {
  console.log('\nTesting store approval endpoint for clean JSON response...');
  
  try {
    // Test payload for store approval
    const testPayload = {
      store_id: '789',
      user_id: '102',
      store_name: 'Local Thrift Shop',
      status: 'approved',
      admin_notes: 'Test store approval via JSON validation test'
    };
    
    // Call the store-approved endpoint
    const response = await fetch(`${API_URL}/api/store-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    // Check content type header
    const contentType = response.headers.get('content-type');
    console.log(`Response status: ${response.status}`);
    console.log(`Content-Type: ${contentType}`);
    
    // Get response as text to inspect for HTML
    const responseText = await response.text();
    
    // Check if response contains HTML tags
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(responseText);
    
    console.log('\nResponse body:');
    console.log(responseText);
    
    if (hasHtmlTags) {
      console.error('\n❌ ERROR: Response contains HTML tags!');
    } else {
      console.log('\n✅ SUCCESS: Response is clean JSON with no HTML content');
    }
    
  } catch (error) {
    console.error('Error testing store approval endpoint:', error);
  }
}

// Run both tests
async function runTests() {
  console.log('=== Testing JSON Response Integrity ===\n');
  await testReceiptApprovalEndpoint();
  await testStoreApprovalEndpoint();
  console.log('\n=== Tests Complete ===');
}

runTests();