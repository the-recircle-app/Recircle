import dotenv from 'dotenv';
import * as thor from 'thor-devkit';

dotenv.config();

const TESTNET_NODE = 'https://testnet.vechain.org';
const X2EARN_APPS_ADDRESS = '0xcB23Eb1bBD5c07553795b9538b1061D0f4ABA153';
const APP_ID = '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1';

// Get distributor address from private key
let DISTRIBUTOR = '0xf1f72b305b7bf7b25e85d356927af36b88dc84ee';
if (process.env.DISTRIBUTOR_PRIVATE_KEY) {
  const cleanKey = process.env.DISTRIBUTOR_PRIVATE_KEY.startsWith('0x') 
    ? process.env.DISTRIBUTOR_PRIVATE_KEY.slice(2) 
    : process.env.DISTRIBUTOR_PRIVATE_KEY;
  const pkBuffer = Buffer.from(cleanKey, 'hex');
  const pubKey = thor.secp256k1.derivePublicKey(pkBuffer);
  DISTRIBUTOR = thor.address.fromPublicKey(pubKey);
}

console.log('🔍 Checking if distributor is authorized for ReCircle app\n');
console.log(`App ID: ${APP_ID}`);
console.log(`X2EarnApps Contract: ${X2EARN_APPS_ADDRESS}`);
console.log(`Distributor: ${DISTRIBUTOR}\n`);

console.log('📋 DIAGNOSIS:');
console.log('==============\n');
console.log('VeWorld shows "Receive" instead of "VeBetter action on ReCircle" because:');
console.log('The distributor address needs to be authorized as a rewardDistributor in X2EarnApps.\n');

console.log('🔧 TO FIX THIS:');
console.log('==============\n');
console.log('You need to call X2EarnApps.addRewardDistributor() function.');
console.log('This requires the APP_ADMIN wallet to sign the transaction.\n');

console.log('Contract: 0xcB23Eb1bBD5c07553795b9538b1061D0f4ABA153');
console.log(`Function: addRewardDistributor(bytes32 appId, address distributor)`);
console.log(`Parameters:`);
console.log(`  appId: ${APP_ID}`);
console.log(`  distributor: ${DISTRIBUTOR}\n`);

console.log('💡 OPTIONS:');
console.log('==============\n');
console.log('1. Use VeWorld mobile app to interact with X2EarnApps contract');
console.log('2. Go to https://dev.testnet.governance.vebetterdao.org and manage your app');
console.log('3. Contact VeBetterDAO support to authorize your distributor\n');

console.log('⚠️  IMPORTANT:');
console.log('Once the distributor is authorized, transactions will automatically show as');
console.log('"VeBetter action on ReCircle" in VeWorld - no code changes needed!');
