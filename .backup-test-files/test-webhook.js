// Test script for the store approval webhook
import fetch from 'node-fetch';

async function testWebhook() {
  try {
    // Replace with your test wallet address (this should be a valid wallet in your system)
    const testWalletAddress = '0x7dE3085b3190B3a787822Ee16F23be010f5F8686'; // Test wallet
    
    // Webhook payload
    const payload = {
      user_wallet: testWalletAddress,
      store_name: "Green Earth Recycled Books",
      status: "approved"
    };
    
    console.log('Sending webhook test with payload:', payload);
    
    // Send the POST request to the webhook endpoint
    const response = await fetch('http://localhost:5000/api/store-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // Parse and display the response
    const responseData = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(responseData, null, 2));
    
  } catch (error) {
    console.error('Error testing webhook:', error);
  }
}

// Execute the test
testWebhook();