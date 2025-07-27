/**
 * Test VeChain testnet connectivity and VeBetterDAO contract access
 * Diagnoses network issues that could prevent wallet connection
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// VeChain testnet endpoints to test
const TESTNET_ENDPOINTS = [
  'https://testnet.vechain.org',
  'https://sync-testnet.vechain.org',
  'https://testnet.veblocks.net'
];

// Expected testnet genesis block
const TESTNET_GENESIS = '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127';

async function testVeChainConnectivity() {
  console.log('Testing VeChain Testnet Connectivity...\n');

  for (const endpoint of TESTNET_ENDPOINTS) {
    console.log(`Testing endpoint: ${endpoint}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(endpoint);
      
      // Test basic connectivity
      const network = await provider.getNetwork();
      console.log(`  Network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Test latest block
      const latestBlock = await provider.getBlockNumber();
      console.log(`  Latest block: ${latestBlock}`);
      
      // Test genesis block
      const genesisBlock = await provider.getBlock(0);
      const isCorrectTestnet = genesisBlock?.hash === TESTNET_GENESIS;
      console.log(`  Genesis correct: ${isCorrectTestnet ? 'YES' : 'NO'}`);
      console.log(`  Genesis hash: ${genesisBlock?.hash}\n`);
      
    } catch (error) {
      console.log(`  ERROR: ${error.message}\n`);
    }
  }
}

async function testVeBetterDAOContracts() {
  console.log('Testing VeBetterDAO Contract Accessibility...\n');
  
  // Test with working endpoint
  const provider = new ethers.JsonRpcProvider('https://sync-testnet.vechain.org');
  
  // VeBetterDAO contract addresses (these may need updating)
  const contracts = {
    'X2EarnApps': '0x8f9c9d5460b8b6d35eb76ff4b2e99e9647d12ae1',
    'B3TR Token': '0x0dd62dac6abb12bd62a58469b34f4d986697ef19'
  };
  
  for (const [name, address] of Object.entries(contracts)) {
    try {
      const code = await provider.getCode(address);
      const hasContract = code !== '0x';
      console.log(`${name} (${address}): ${hasContract ? 'CONTRACT FOUND' : 'NO CONTRACT'}`);
    } catch (error) {
      console.log(`${name} (${address}): ERROR - ${error.message}`);
    }
  }
}

async function checkAppIdCalculation() {
  console.log('\nChecking APP_ID Calculation...\n');
  
  const appName = 'ReCircle';
  const adminWallet = process.env.CREATOR_FUND_WALLET || '0x87c844e3314396ca43e5a6065e418d26a09db02b';
  
  // Calculate APP_ID using VeBetterDAO method
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ['string', 'string'],
    [appName, adminWallet]
  );
  const appId = ethers.keccak256(encoded);
  
  console.log(`App Name: ${appName}`);
  console.log(`Admin Wallet: ${adminWallet}`);
  console.log(`Calculated APP_ID: ${appId}`);
  console.log(`Environment APP_ID: ${process.env.VITE_TESTNET_APP_ID}`);
  console.log(`Match: ${appId === process.env.VITE_TESTNET_APP_ID ? 'YES' : 'NO'}`);
}

async function runAllTests() {
  console.log('VeChain Testnet Diagnostic Report');
  console.log('=================================\n');
  
  await testVeChainConnectivity();
  await testVeBetterDAOContracts();
  await checkAppIdCalculation();
  
  console.log('\nDiagnostic Complete');
  console.log('If all tests pass but wallet still fails to connect:');
  console.log('1. Verify using VeWorld in-app browser');
  console.log('2. Check VeWorld is set to testnet');
  console.log('3. Ensure HTTPS deployment is accessible');
  console.log('4. Try clearing VeWorld app cache');
}

runAllTests().catch(console.error);