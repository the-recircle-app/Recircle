/**
 * Quick test of the simple treasury distribution approach
 */

import { distributeTreasuryB3TR } from './server/utils/treasury-simple-distribution.js';

async function testSimpleTreasury() {
  console.log('🧪 Testing Simple Treasury Distribution...');
  console.log('This uses the PROVEN working-distribution.ts pattern');
  console.log('but sources tokens from VeBetterDAO treasury');
  console.log('');
  
  try {
    const result = await distributeTreasuryB3TR(
      '0x865306084235Bf804c8Bba8a8d56890940ca8F0b', // Your wallet
      10, // 10 B3TR test
      9999 // Test receipt ID
    );
    
    console.log('✅ SUCCESS!');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('');
    console.log('🔍 Verify transactions:');
    console.log(`User TX: https://explore.vechain.org/transactions/${result.transactions.user}`);
    console.log(`App TX: https://explore.vechain.org/transactions/${result.transactions.app}`);
    
  } catch (error) {
    console.error('❌ FAILED:', error.message);
  }
}

testSimpleTreasury();