/**
 * Complete test script to test the full manual review process
 * This script handles both creating a receipt for manual review and approving it
 */

import fetch from 'node-fetch';
import { format } from 'date-fns';

// Configuration
const API_URL = 'http://localhost:5000';
const USER_ID = 103; // Using a different user ID to avoid daily action limit
const WALLET_ADDRESS = '0x7dE3085b3190B3a787822Ee16F23be010f5F8686'; // Test wallet address

async function ensureUserExists() {
  console.log(`Checking if test user ID ${USER_ID} exists...`);
  
  try {
    // Try to get the user
    const userResponse = await fetch(`${API_URL}/api/users/${USER_ID}`);
    
    if (userResponse.status === 200) {
      const userData = await userResponse.json();
      console.log(`Test user exists with ID: ${userData.id}`);
      return userData;
    }
    
    // If user not found, create one
    console.log(`Creating test user with ID: ${USER_ID}...`);
    
    const newUser = {
      id: USER_ID,
      username: 'testuser103',
      password: 'password123',
      email: 'testuser103@example.com',
      walletAddress: WALLET_ADDRESS,
      tokenBalance: 0,
      receiptCount: 0,
      type: 'standard'
    };
    
    const createResponse = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    });
    
    const createResult = await createResponse.json();
    
    if (createResult.success || createResult.id) {
      console.log(`Created new test user with ID: ${USER_ID}`);
      return newUser;
    } else {
      throw new Error(`Failed to create user: ${JSON.stringify(createResult)}`);
    }
  } catch (error) {
    console.error('Error finding/creating user:', error);
    throw error;
  }
}

async function findOrCreateStore() {
  console.log('Locating a test store...');
  
  try {
    // Try to find an existing GameStop store
    const storesResponse = await fetch(`${API_URL}/api/thrift-stores?q=GameStop`);
    const storesData = await storesResponse.json();
    
    if (storesData && storesData.length > 0) {
      console.log(`Found existing GameStop store with ID: ${storesData[0].id}`);
      return storesData[0];
    }
    
    // If no store found, create one
    console.log('No GameStop store found, creating a new one...');
    
    const newStore = {
      name: 'GameStop Test Store',
      address: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      latitude: 37.7749,
      longitude: -122.4194,
      storeType: 'retail',
      category: 'used_video_games_electronics',
      addedBy: USER_ID
    };
    
    const createResponse = await fetch(`${API_URL}/api/thrift-stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStore),
    });
    
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log(`Created new GameStop store with ID: ${createResult.data.id}`);
      return createResult.data;
    } else {
      throw new Error(`Failed to create store: ${createResult.message}`);
    }
  } catch (error) {
    console.error('Error finding/creating store:', error);
    throw error;
  }
}

async function createManualReviewReceipt() {
  console.log('\nCreating a receipt that requires manual review...');
  
  try {
    // First, make sure the test user exists
    await ensureUserExists();
    
    // Then, find or create a store
    const store = await findOrCreateStore();
    
    // Calculate the purchase date (today)
    const today = new Date();
    const purchaseDate = format(today, 'yyyy-MM-dd');
    
    // Define the receipt data
    const receiptData = {
      storeId: store.id,
      userId: USER_ID,
      amount: 59.99, // Purchase amount
      purchaseDate: purchaseDate,
      imageUrl: null, // No image URL for test
      tokenReward: 0, // Will be calculated on approval
      category: 'used_video_games_electronics',
      needsManualReview: true, // Force manual review
      
      // Additional metadata
      store_name: store.name,
      store_address: store.address,
      confidence: 0.68, // Low confidence to trigger manual review
      status: 'NEEDS_REVIEW',
      user_wallet: WALLET_ADDRESS,
      estimated_reward: 8, // Estimated reward amount
      
      // Add additional fields for better tracking
      items: [
        {
          name: 'Pre-owned Xbox Series X Controller',
          price: 39.99,
          quantity: 1,
          is_preowned: true,
          is_sustainable: true
        },
        {
          name: 'Game Protection Plan',
          price: 19.99,
          quantity: 1,
          is_preowned: false,
          is_sustainable: false
        }
      ]
    };
    
    console.log('Submitting receipt with data:', JSON.stringify(receiptData, null, 2));
    
    // Submit the receipt
    const submitResponse = await fetch(`${API_URL}/api/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiptData),
    });
    
    const submissionResult = await submitResponse.json();
    console.log('\nReceipt submission result:', JSON.stringify(submissionResult, null, 2));
    
    if (submissionResult.success || submissionResult.id) {
      const receiptId = submissionResult.id || submissionResult.data.id;
      console.log(`\n✅ Successfully created manual review receipt with ID: ${receiptId}`);
      console.log(`Estimated reward: ${receiptData.estimated_reward} B3TR tokens (pending manual review)`);
      
      // Now simulate approval of this receipt
      await approveReceiptManually(receiptId);
    } else {
      console.error('Failed to submit receipt:', submissionResult.message);
    }
    
  } catch (error) {
    console.error('Error creating manual review receipt:', error);
  }
}

async function approveReceiptManually(receiptId) {
  console.log(`\n=== Simulating manual approval for receipt ID: ${receiptId} ===`);
  
  try {
    // Create an approval payload similar to what Google Sheet would send
    const approvalPayload = {
      receipt_id: receiptId,
      user_id: USER_ID.toString(),
      user_wallet: WALLET_ADDRESS,
      store_name: 'GameStop Test Store',
      purchase_amount: 59.99,
      estimated_reward: 8,
      status: 'approved',
      admin_notes: 'Verified pre-owned items. Approved via test script.'
    };
    
    console.log('Sending approval request:', JSON.stringify(approvalPayload, null, 2));
    
    // Call the receipt-approved endpoint (the one that was returning HTML before)
    const response = await fetch(`${API_URL}/api/receipt-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvalPayload),
    });
    
    // Get response content type
    const contentType = response.headers.get('content-type');
    console.log(`Response status: ${response.status}`);
    console.log(`Content-Type: ${contentType}`);
    
    // Get the response as text first to check for HTML
    const responseText = await response.text();
    
    // Check if response contains HTML tags
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(responseText);
    
    if (hasHtmlTags) {
      console.error('\n❌ ERROR: Response contains HTML tags!');
      console.error(responseText.substring(0, 200) + '...');
    } else {
      // Try to parse as JSON
      try {
        const approvalResult = JSON.parse(responseText);
        console.log('\nApproval result:', JSON.stringify(approvalResult, null, 2));
        
        if (approvalResult.success) {
          console.log(`\n✅ Receipt ${receiptId} successfully approved!`);
          console.log(`Tokens awarded: ${approvalResult.reward} B3TR`);
          console.log(`New user balance: ${approvalResult.newBalance} B3TR`);
          
          // Verify token balance updated in the user account
          const userResponse = await fetch(`${API_URL}/api/users/${USER_ID}`);
          const userData = await userResponse.json();
          
          console.log(`\nVerified user balance from user API: ${userData.tokenBalance} B3TR`);
          if (userData.tokenBalance === approvalResult.newBalance) {
            console.log('✅ Balance update verified in user account!');
          } else {
            console.error('❌ Balance inconsistency detected!');
            console.log(`Balance in approval response: ${approvalResult.newBalance}`);
            console.log(`Balance in user account: ${userData.tokenBalance}`);
          }
          
          // Get the user's transactions to verify the receipt reward transaction
          const txResponse = await fetch(`${API_URL}/api/users/${USER_ID}/transactions`);
          const transactions = await txResponse.json();
          
          // Find the most recent transaction
          if (transactions && transactions.length > 0) {
            const latestTx = transactions[0];
            console.log('\nLatest transaction:', JSON.stringify(latestTx, null, 2));
          }
        } else {
          console.error('Manual approval failed:', approvalResult.message);
        }
      } catch (e) {
        console.error('Error parsing JSON response:', e.message);
        console.error('Raw response:', responseText);
      }
    }
    
  } catch (error) {
    console.error('Error during manual approval process:', error);
  }
}

// Run the complete test
createManualReviewReceipt();