/**
 * Direct test of blockchain distribution to verify real wallet transfers
 */

const { distributeRealB3TR } = require('./server/utils/working-distribution.ts');

async function testDirectDistribution() {
  console.log('🧪 Testing direct blockchain distribution to VeWorld wallet...');
  
  try {
    const result = await distributeRealB3TR(
      '0x865306084235Bf804c8Bba8a8d56890940ca8F0b', // user wallet
      3, // 3 B3TR tokens
      103 // user ID
    );
    
    console.log('✅ Distribution result:', result);
    
    if (result.success) {
      console.log('🎉 SUCCESS! Tokens distributed to real VeWorld wallet');
      console.log('User transaction:', result.transactions.user);
      console.log('App transaction:', result.transactions.app);
      console.log('Explorer URLs:', result.explorerUrls);
    } else {
      console.log('❌ Distribution failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDirectDistribution();