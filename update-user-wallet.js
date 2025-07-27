/**
 * Direct user wallet update script for blockchain distribution testing
 * This bypasses the API and updates the storage directly
 */

// Use CommonJS require since we're in a Node.js environment
const path = require('path');
const { fileURLToPath } = require('url');

// Import the storage from the server
async function loadStorage() {
  const { storage } = await import('./server/storage.js');
  return storage;
}

async function updateUserWallet() {
  console.log('Updating user 1 wallet address directly...');
  
  try {
    // Get current user
    const user = await storage.getUser(1);
    if (!user) {
      console.error('User 1 not found');
      return false;
    }
    
    console.log('Current user wallet:', user.walletAddress);
    
    // Update wallet address to the distributor wallet for testing
    const updatedUser = await storage.updateUser(1, {
      walletAddress: '0x15D009B3A5811fdE66F19b2db1D40172d53E5653'
    });
    
    if (updatedUser) {
      console.log('Updated user wallet:', updatedUser.walletAddress);
      console.log('User wallet address updated successfully');
      return true;
    } else {
      console.error('Failed to update user wallet');
      return false;
    }
  } catch (error) {
    console.error('Error updating user wallet:', error);
    return false;
  }
}

updateUserWallet();