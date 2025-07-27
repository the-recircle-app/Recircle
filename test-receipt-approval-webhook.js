/**
 * Test script for the receipt approval webhook integration
 * 
 * This script tests if the receipt-approved endpoint properly updates
 * the Google Sheets status when a receipt is approved.
 */

import fetch from 'node-fetch';

async function testReceiptApprovalWebhook() {
  console.log('Testing receipt approval with Google Sheets webhook update...');
  
  // Create a unique ID for this test
  const testReceiptId = `test-${Date.now().toString(36)}`;
  const testUserId = 102;
  const testStoreName = 'Webhook Test Store';
  
  try {
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
        estimated_impact: "moderate",
        wallet_address: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686"
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
      
      // Check for webhook update fields
      if (data.event_type === 'receipt_approval') {
        console.log('✅ Response includes event_type for webhook identification');
      } else {
        console.warn('⚠️ Response is missing event_type for webhook identification');
      }
      
      console.log('This test does not verify if the Google Sheet was actually updated.');
      console.log('Please check the Google Sheet manually to confirm the status was updated.');
    } else {
      console.error('❌ Receipt approval failed:', data.message || 'No error message provided');
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testReceiptApprovalWebhook();