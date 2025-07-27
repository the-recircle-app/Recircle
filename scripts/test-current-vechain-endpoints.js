/**
 * Test current working VeChain testnet endpoints
 */

const testEndpoints = [
  'https://testnet.veblocks.net/',
  'https://sync-testnet.veblocks.net/',
  'https://testnet-explorer.vechain.org/api',
  'https://testnet.vechain.energy'
];

async function testEndpoint(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log(`${url}: ${response.status} ${response.statusText}`);
    return response.ok;
  } catch (error) {
    console.log(`${url}: ERROR - ${error.message}`);
    return false;
  }
}

async function findWorkingEndpoints() {
  console.log('Testing VeChain Testnet Endpoints...\n');
  
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
  }
}

findWorkingEndpoints();