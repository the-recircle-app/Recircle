/**
 * Test script for the receipt approval webhook update integration
 * 
 * This script tests if the approval update webhook correctly sends
 * updated status information to Google Sheets.
 */

import fetch from 'node-fetch';

async function testApprovalUpdateWebhook() {
  console.log('Testing approval update webhook...');
  
  // Create test data with a unique ID
  const testReceiptId = `test-update-${Date.now().toString(36)}`;
  const testUserId = 102;
  const testStoreName = 'Update Webhook Test Store';
  
  try {
    console.log(`Creating a receipt approval with ID: ${testReceiptId}`);
    
    // Make the request to approve a receipt
    const response = await fetch('http://localhost:5000/api/receipt-approved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receipt_id: testReceiptId,
        user_id: testUserId,
        store_name: testStoreName,
        base_reward: 10,
        total_reward: 15,
        estimated_reward: 10,
        status: "approved",
        estimated_impact: "moderate",
        user_wallet: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686"
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response from receipt approval endpoint:', data);
    
    if (data.success) {
      console.log('✅ Receipt approval successfully processed');
      console.log(`New token balance: ${data.newBalance}`);
      
      // Check for event_type which indicates the webhook should be triggered
      if (data.event_type === 'receipt_approval') {
        console.log('✅ Response includes event_type for webhook identification');
        console.log('The webhook should have sent an update to Google Sheets.');
        console.log('Check the server logs for webhook success/failure messages.');
        console.log('\nIMPORTANT: Check Google Sheets to verify the status was updated.');
      } else {
        console.warn('⚠️ Response is missing event_type for webhook identification');
      }
    } else {
      console.error('❌ Receipt approval failed:', data.message || 'No error message provided');
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testApprovalUpdateWebhook();