// COPY THIS TO YOUR LOCAL scripts/deploy-solo-contracts.cjs
// Simple Solo node connectivity test + mock deployment

const fs = require('fs');

const SOLO_NODE_URL = 'http://localhost:8669';

async function testAndDeploy() {
  console.log('🚀 Testing VeChain Solo Node connectivity...');

  try {
    // Test basic connectivity
    console.log('🔍 Checking Solo node at:', SOLO_NODE_URL);
    
    const response = await fetch(`${SOLO_NODE_URL}/blocks/best`);
    if (!response.ok) {
      throw new Error(`Solo node error: ${response.status} ${response.statusText}`);
    }

    const bestBlock = await response.json();
    console.log('✅ Solo node is running!');
    console.log('📦 Current block:', bestBlock.number);
    console.log('🆔 Block ID:', bestBlock.id);

    // Create deployment config for your ReCircle app
    const deploymentInfo = {
      b3tr_contract_address: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699',
      deployer_address: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed', 
      chain_id: 39,
      network: "solo",
      rpc_url: SOLO_NODE_URL,
      deployed_at: new Date().toISOString(),
      total_supply: "100000000000000000000000", // 100K B3TR per account
      pre_funded_accounts: [
        '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
        '0xd3ae78222beadb038203be21ed5ce7c9b1bff602', 
        '0x733b7269443c70de16bbf9b0615307884bcc5636'
      ]
    };

    // Save for your ReCircle app
    fs.writeFileSync('./solo-b3tr-address.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment config saved to solo-b3tr-address.json');
    
    console.log('');
    console.log('🎯 Your Solo network is ready!');
    console.log('Chain ID: 39');
    console.log('RPC URL:', SOLO_NODE_URL);
    console.log('B3TR Contract: 0x5ef79995FE8a89e0812330E4378eB2660ceDe699');
    console.log('');
    console.log('📱 Add to VeWorld:');
    console.log('Network Name: VeChain Solo');
    console.log('Chain ID: 39');
    console.log('RPC URL: http://localhost:8669');

    return deploymentInfo;

  } catch (error) {
    console.error('❌ Solo node test failed:', error.message);
    console.log('');
    console.log('🔧 Make sure Solo node is running:');
    console.log('docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest solo --api-addr 0.0.0.0:8669');
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testAndDeploy()
    .then(() => {
      console.log('🎉 Solo node setup complete!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Create .env.local with Solo configuration');
      console.log('2. Run: npm run dev:server (Terminal 1)');
      console.log('3. Run: npm run dev:client (Terminal 2)');
      console.log('4. Add Solo network to VeWorld mobile app');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}