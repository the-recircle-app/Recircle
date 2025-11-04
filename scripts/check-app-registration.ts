import dotenv from 'dotenv';
import * as thor from 'thor-devkit';

dotenv.config();

const TESTNET_NODE = 'https://testnet.vechain.org';
const X2EARN_APPS_ADDRESS = '0xcB23Eb1bBD5c07553795b9538b1061D0f4ABA153';
const APP_ID = process.env.APP_ID || '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1';

// Get distributor address from private key
let DISTRIBUTOR = '0xF1f72b305b7bf7b25e85D356927aF36b88dC84Ee';
if (process.env.DISTRIBUTOR_PRIVATE_KEY) {
  const cleanKey = process.env.DISTRIBUTOR_PRIVATE_KEY.startsWith('0x') 
    ? process.env.DISTRIBUTOR_PRIVATE_KEY.slice(2) 
    : process.env.DISTRIBUTOR_PRIVATE_KEY;
  const pkBuffer = Buffer.from(cleanKey, 'hex');
  const pubKey = thor.secp256k1.derivePublicKey(pkBuffer);
  DISTRIBUTOR = thor.address.fromPublicKey(pubKey);
}

// X2EarnApps ABI for checking app status
const X2EARN_APPS_ABI = [
  {
    "inputs": [{"name": "appId", "type": "bytes32"}],
    "name": "app",
    "outputs": [
      {"name": "teamWalletAddress", "type": "address"},
      {"name": "appAdmin", "type": "address"},
      {"name": "name", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "appId", "type": "bytes32"},
      {"name": "distributor", "type": "address"}
    ],
    "name": "isRewardDistributor",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Encode function call for contract reads
function encodeFunctionCall(abi: any, params: any[]): string {
  const fn = new thor.abi.Function(abi);
  return '0x' + fn.encode(...params).toString('hex');
}

async function checkAppRegistration() {
  console.log('🔍 Checking ReCircle App Registration Status\n');
  console.log(`App ID: ${APP_ID}`);
  console.log(`X2EarnApps Contract: ${X2EARN_APPS_ADDRESS}`);
  console.log(`Distributor Address: ${DISTRIBUTOR}\n`);

  try {
    // Check if app exists
    console.log('1️⃣ Checking if app is registered...');
    const appCallData = encodeFunctionCall(X2EARN_APPS_ABI[0], [APP_ID]);
    
    const appResponse = await fetch(`${TESTNET_NODE}/accounts/*`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clauses: [{ to: X2EARN_APPS_ADDRESS, value: '0x0', data: appCallData }]
      })
    });

    const responseText = await appResponse.text();
    console.log('Response status:', appResponse.status);
    console.log('Response:', responseText.substring(0, 500));
    
    const appResult = JSON.parse(responseText);
    console.log('App Result:', JSON.stringify(appResult, null, 2));

    if (appResult && appResult[0] && appResult[0].data && appResult[0].data !== '0x') {
      const decoded = thor.abi.decodeParameter('(address,address,string)', appResult[0].data);
      console.log('✅ App IS registered!');
      console.log(`   Team Wallet: ${decoded[0]}`);
      console.log(`   App Admin: ${decoded[1]}`);
      console.log(`   App Name: ${decoded[2]}\n`);
    } else {
      console.log('❌ App NOT registered in X2EarnApps!\n');
      console.log('⚠️  You need to register your app first by calling:');
      console.log(`   X2EarnApps.addApp(teamWallet, appAdmin, "ReCircle")\n`);
      return;
    }

    // Check if distributor is authorized
    console.log('2️⃣ Checking if distributor is authorized...');
    const isDistributorCallData = encodeFunctionCall(X2EARN_APPS_ABI[1], [APP_ID, DISTRIBUTOR]);
    
    const distResponse = await fetch(`${TESTNET_NODE}/accounts/${X2EARN_APPS_ADDRESS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clauses: [{ to: X2EARN_APPS_ADDRESS, value: '0x0', data: isDistributorCallData }]
      })
    });

    const distResult = await distResponse.json();
    console.log('IsRewardDistributor Result:', JSON.stringify(distResult, null, 2));

    if (distResult && distResult[0] && distResult[0].data) {
      const isAuthorized = thor.abi.decodeParameter('bool', distResult[0].data);
      if (isAuthorized) {
        console.log('✅ Distributor IS authorized!');
        console.log('   Your setup looks correct!\n');
      } else {
        console.log('❌ Distributor NOT authorized!\n');
        console.log('⚠️  This is why VeWorld shows "Receive" instead of "VeBetter action on ReCircle"!\n');
        console.log('🔧 To fix this, you need to call:');
        console.log(`   X2EarnApps.addRewardDistributor(${APP_ID}, ${DISTRIBUTOR})\n`);
        console.log('💡 This requires the app admin to sign the transaction.');
      }
    }

  } catch (error) {
    console.error('❌ Error checking registration:', error);
  }
}

checkAppRegistration();
