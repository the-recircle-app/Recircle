/**
 * Create test user 103 for Google Apps Script integration testing
 */

import { storage } from './server/storage.js';

async function createTestUser103() {
  try {
    console.log('Creating test user with ID 103...');
    
    // Check if user 103 already exists
    const existingUsers = await storage.getAllUsers();
    const user103 = existingUsers.find(u => u.id === 103);
    
    if (user103) {
      console.log('User 103 already exists:', user103);
      return;
    }
    
    // Create user 103
    const newUser = await storage.createUser({
      email: 'transportation-test@recircle.app',
      walletAddress: '0x742d35Cc6634C0532925a3b8D1111111',
      username: 'TransportationTester103'
    });
    
    console.log('✅ Created test user 103:', newUser);
    
    // Also create a test receipt for this user
    const testReceipt = await storage.createReceipt({
      userId: newUser.id,
      storeId: 1,
      storeName: 'EV Hertz Test',
      category: 'electric_vehicle',
      amount: 45.00,
      tokenReward: 10.0,
      submittedAt: new Date().toISOString(),
      status: 'pending_manual_review',
      imageUrl: 'test-image-url'
    });
    
    console.log('✅ Created test receipt for user 103:', testReceipt);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser103();