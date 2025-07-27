/**
 * Test script to create a receipt that requires manual review
 * This will create a receipt with a confidence score low enough to trigger manual review
 */

import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';

// Configuration
const API_URL = 'http://localhost:5000';
const USER_ID = 102; // Test user ID
const WALLET_ADDRESS = '0x7dE3085b3190B3a787822Ee16F23be010f5F8686'; // Test wallet address

async function createManualReviewReceipt() {
  console.log('Creating a receipt submission that will require manual review...');
  
  try {
    // First validate the receipt to trigger manual review
    const validateResponse = await fetch(`${API_URL}/api/receipts/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Use GameStop as the store - often requires manual review
        store_name: 'GameStop',
        user_id: USER_ID,
        purchase_date: '2025-05-13',
        // Simulate a low confidence receipt that will need manual review
        total_amount: 49.99,
        // Low confidence of 0.65 to ensure manual review
        confidence: 0.65,
        user_wallet: WALLET_ADDRESS,
        items: [
          {
            name: 'Pre-owned PlayStation 5 Game',
            price: 49.99,
            quantity: 1
          }
        ]
      }),
    });
    
    const validationResult = await validateResponse.json();
    console.log('Validation response:', JSON.stringify(validationResult, null, 2));
    
    if (!validationResult.success) {
      console.error('Receipt validation failed:', validationResult.message);
      return;
    }
    
    // Now submit the receipt to create a manual review entry
    const submitResponse = await fetch(`${API_URL}/api/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: USER_ID,
        store_name: 'GameStop',
        store_address: '123 Main St, Anytown, USA',
        purchase_date: '2025-05-13',
        total_amount: 49.99,
        items: validationResult.data.items,
        validation_id: validationResult.data.validation_id,
        user_wallet: WALLET_ADDRESS,
        // For testing, use low confidence to trigger manual review
        confidence: 0.65,
        status: validationResult.data.status,
        estimated_reward: validationResult.data.estimated_reward,
      }),
    });
    
    const submissionResult = await submitResponse.json();
    console.log('\nReceipt submission result:', JSON.stringify(submissionResult, null, 2));
    
    if (submissionResult.success) {
      console.log(`\n✅ Successfully created a manual review receipt with ID: ${submissionResult.data.id}`);
      console.log(`Estimated reward: ${submissionResult.data.estimated_reward} B3TR tokens (pending manual review)`);
      console.log('\nNext step: Use the Google Sheet to approve this receipt manually');
      console.log(`Run: node test-receipt-manual-approval.js with receipt ID: ${submissionResult.data.id}`);
    } else {
      console.error('Failed to submit receipt:', submissionResult.message);
    }
    
  } catch (error) {
    console.error('Error creating manual review receipt:', error);
  }
}

createManualReviewReceipt();