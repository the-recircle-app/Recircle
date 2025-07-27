// Simple Solo node test - COPY THIS OVER YOUR OLD FILE
const fs = require('fs');

const SOLO_NODE_URL = 'http://localhost:8669';

async function testSoloNode() {
  console.log('🚀 Testing VeChain Solo Node...');

  try {
    const response = await fetch(`${SOLO_NODE_URL}/blocks/best`);
    if (!response.ok) {
      throw new Error(`Solo node error: ${response.status}`);
    }

    const bestBlock = await response.json();
    console.log('✅ Solo node is running!');
    console.log('📦 Current block:', bestBlock.number);

    // Create config for your ReCircle app
    const config = {
      b3tr_contract_address: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699',
      chain_id: 39,
      rpc_url: SOLO_NODE_URL,
      network: "solo",
      deployed_at: new Date().toISOString()
    };

    fs.writeFileSync('./solo-b3tr-address.json', JSON.stringify(config, null, 2));
    console.log('💾 Config saved to solo-b3tr-address.json');
    
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Create .env.local file');
    console.log('2. Start backend: npm run dev:server');
    console.log('3. Start frontend: npm run dev:client');

    return config;

  } catch (error) {
    console.error('❌ Solo node test failed:', error.message);
    console.log('');
    console.log('🔧 Make sure Solo node is running:');
    console.log('docker ps | grep vechain-solo');
    throw error;
  }
}

testSoloNode()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));