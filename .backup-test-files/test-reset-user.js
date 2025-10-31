/**
 * Test script to reset user streak and action count
 */

import fetch from 'node-fetch';

async function resetUserStats() {
  try {
    console.log('🧪 Resetting user ID 102 stats for testing...');
    
    // Reset user payload
    const resetPayload = {
      userId: 102,
      resetDaily: true,
      resetStreak: false
    };
    
    console.log('Sending reset request to server...');
    
    const response = await fetch('http://localhost:5000/api/users/reset-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resetPayload)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ User reset successful:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      const error = await response.json();
      console.log('\n❌ Error resetting user:');
      console.log(JSON.stringify(error, null, 2));
      
      // If the endpoint doesn't exist, we need to create it
      console.log('\nEndpoint might be missing. Let\'s try updating the user directly...');
      
      // Try direct update approach
      const userUpdateResponse = await fetch(`http://localhost:5000/api/users/102`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dailyActions: 0,
          lastActionDate: null
        })
      });
      
      if (userUpdateResponse.ok) {
        const updateResult = await userUpdateResponse.json();
        console.log('\n✅ User updated successfully:');
        console.log(JSON.stringify(updateResult, null, 2));
      } else {
        console.log('\n❌ Failed to update user directly. Using test approach...');
        
        // Last resort: Create a test-only endpoint for this purpose
        const testResetResponse = await fetch(`http://localhost:5000/api/test/reset-user/102`, {
          method: 'POST'
        });
        
        if (testResetResponse.ok) {
          console.log('\n✅ User reset through test endpoint');
        } else {
          console.log('\n❌ All reset attempts failed. Please implement one of these endpoints or manually reset in the database.');
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the reset
resetUserStats();