// Simple test using solo node that's already working
import fetch from 'node-fetch';

async function testB3TRDistribution() {
  console.log('🧪 Testing B3TR distribution using working solo node...');
  
  // Use the Pierre-style endpoint that already works
  const response = await fetch('http://localhost:5000/api/test/pierre-distribution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'test-user',
      walletAddress: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
      amount: 100
    })
  });
  
  const result = await response.json();
  console.log('📄 Distribution result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\n✅ Distribution successful!');
    console.log(`💰 User received: ${result.results.user.amount} B3TR`);
    console.log(`📋 Transaction hash: ${result.results.user.txHash}`);
    console.log('\n📱 To see B3TR in VeWorld:');
    console.log('1. Open VeWorld mobile app');
    console.log('2. Connect to localhost:8669 (solo network)');
    console.log('3. Check "My tokens" section');
    console.log('4. The transaction hash proves distribution occurred');
  }
}

testB3TRDistribution().catch(console.error);