/**
 * Test script to directly reset user daily action count in the database
 */

import fetch from 'node-fetch';

async function resetUserDirectly() {
  try {
    console.log('🧪 Directly resetting user ID 102 dailyActions count...');
    
    // First check current state
    const userBeforeResponse = await fetch('http://localhost:5000/api/users/102');
    const userBefore = await userBeforeResponse.json();
    console.log(`\nBefore reset - User daily actions: ${userBefore.dailyActions}, Limit: ${userBefore.dailyActionLimit}`);
    
    // Reset just the daily actions field
    const payload = {
      dailyActions: 0
    };
    
    console.log('\nSending direct update to server...');
    
    const response = await fetch('http://localhost:5000/api/users/102', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      console.log('\n✅ User daily actions reset successfully!');
      
      // Check the updated state
      const userAfterResponse = await fetch('http://localhost:5000/api/users/102');
      const userAfter = await userAfterResponse.json();
      console.log(`\nAfter reset - User daily actions: ${userAfter.dailyActions}, Limit: ${userAfter.dailyActionLimit}`);
    } else {
      const errorData = await response.json();
      console.log('\n❌ Error resetting user daily actions:');
      console.log(JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the user reset
resetUserDirectly();