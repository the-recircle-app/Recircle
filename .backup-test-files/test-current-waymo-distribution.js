/**
 * Test current Waymo receipt distribution to verify 70/30 model
 */

import fetch from 'node-fetch';

async function testCurrentDistribution() {
  console.log('Testing current Waymo receipt distribution...');
  
  try {
    // Check recent transactions to see the actual distribution
    const response = await fetch('http://localhost:5000/api/transactions/user/1');
    const transactions = await response.json();
    
    console.log('\nRecent transactions:');
    transactions.slice(0, 10).forEach(tx => {
      console.log(`- ${tx.type}: ${tx.amount} B3TR - ${tx.description}`);
    });
    
    // Look for the most recent receipt transaction
    const recentReceiptTx = transactions.find(tx => tx.type === 'receipt_verification');
    
    if (recentReceiptTx) {
      console.log(`\nMost recent receipt reward: ${recentReceiptTx.amount} B3TR`);
      console.log(`Expected 70% of base reward (likely 10 B3TR) = 7 B3TR`);
      console.log(`Actual reward matches expected: ${recentReceiptTx.amount === 7 ? 'YES' : 'NO'}`);
    }
    
    // Check for sustainability transactions
    const allTransactions = await fetch('http://localhost:5000/api/transactions');
    const allTx = await allTransactions.json();
    
    const recentSustainability = allTx.filter(tx => 
      tx.type.includes('sustainability') && 
      new Date(tx.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    console.log('\nRecent sustainability transactions:');
    recentSustainability.forEach(tx => {
      console.log(`- ${tx.type}: ${tx.amount} B3TR`);
    });
    
  } catch (error) {
    console.error('Error checking distribution:', error);
  }
}

testCurrentDistribution();