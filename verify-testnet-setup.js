/**
 * Simple Testnet Setup Verification
 * Checks all configuration for VeChain testnet deployment
 */

// Load environment variables
require('dotenv').config();

console.log('🔍 TESTNET SETUP VERIFICATION');
console.log('==============================');

// Check environment variables
console.log('\n📋 Environment Configuration:');
console.log('VECHAIN_NETWORK:', process.env.VECHAIN_NETWORK || 'NOT SET');
console.log('VECHAIN_RPC_URL:', process.env.VECHAIN_RPC_URL || 'NOT SET');
console.log('TEST_MODE:', process.env.TEST_MODE || 'NOT SET');

console.log('\n🏗️ VeBetterDAO Configuration:');
console.log('APP_ID:', process.env.APP_ID ? `${process.env.APP_ID.slice(0, 10)}...` : 'NOT SET');
console.log('X2EARN_APPS:', process.env.X2EARN_APPS ? `${process.env.X2EARN_APPS.slice(0, 10)}...` : 'NOT SET');
console.log('X2EARN_REWARDS_POOL:', process.env.X2EARN_REWARDS_POOL ? `${process.env.X2EARN_REWARDS_POOL.slice(0, 10)}...` : 'NOT SET');
console.log('TOKEN_ADDRESS:', process.env.TOKEN_ADDRESS ? `${process.env.TOKEN_ADDRESS.slice(0, 10)}...` : 'NOT SET');
console.log('REWARD_DISTRIBUTOR_WALLET:', process.env.REWARD_DISTRIBUTOR_WALLET ? `${process.env.REWARD_DISTRIBUTOR_WALLET.slice(0, 10)}...` : 'NOT SET');

console.log('\n💼 Wallet Configuration:');
console.log('CREATOR_FUND_WALLET:', process.env.CREATOR_FUND_WALLET ? `${process.env.CREATOR_FUND_WALLET.slice(0, 10)}...` : 'NOT SET');
console.log('APP_FUND_WALLET:', process.env.APP_FUND_WALLET ? `${process.env.APP_FUND_WALLET.slice(0, 10)}...` : 'NOT SET');

console.log('\n🔑 External Services:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'CONFIGURED' : 'NOT SET');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT SET');

// Validation checks
console.log('\n✅ Validation Results:');

const requiredEnvs = [
  'VECHAIN_NETWORK',
  'APP_ID', 
  'X2EARN_APPS',
  'X2EARN_REWARDS_POOL',
  'TOKEN_ADDRESS',
  'REWARD_DISTRIBUTOR_WALLET',
  'CREATOR_FUND_WALLET',
  'APP_FUND_WALLET',
  'DATABASE_URL',
  'OPENAI_API_KEY'
];

let allConfigured = true;
let blockchainConfigured = true;

requiredEnvs.forEach(env => {
  const value = process.env[env];
  const isConfigured = value && value !== 'undefined' && value.length > 10;
  
  if (!isConfigured) {
    allConfigured = false;
    if (['APP_ID', 'X2EARN_APPS', 'X2EARN_REWARDS_POOL', 'TOKEN_ADDRESS', 'REWARD_DISTRIBUTOR_WALLET'].includes(env)) {
      blockchainConfigured = false;
    }
  }
  
  console.log(`${isConfigured ? '✅' : '❌'} ${env}`);
});

console.log('\n📊 SETUP STATUS:');
console.log('================');

if (process.env.VECHAIN_NETWORK === 'testnet') {
  console.log('✅ VeChain Network: TESTNET (ready for testing)');
} else {
  console.log('❌ VeChain Network: Not set to testnet');
}

if (process.env.TEST_MODE === 'false') {
  console.log('✅ Test Mode: OFF (real blockchain transactions)');
} else {
  console.log('⚠️  Test Mode: ON (simulated transactions)');
}

if (blockchainConfigured) {
  console.log('✅ VeBetterDAO Integration: READY');
} else {
  console.log('❌ VeBetterDAO Integration: INCOMPLETE');
}

if (process.env.DATABASE_URL && process.env.OPENAI_API_KEY) {
  console.log('✅ External Services: CONFIGURED');
} else {
  console.log('❌ External Services: INCOMPLETE');
}

console.log('\n🚀 DEPLOYMENT READINESS:');
console.log('========================');

if (allConfigured && process.env.VECHAIN_NETWORK === 'testnet' && process.env.TEST_MODE === 'false') {
  console.log('🎉 READY FOR TESTNET DEPLOYMENT!');
  console.log('');
  console.log('Next Steps:');
  console.log('1. Deploy app to get production URL');
  console.log('2. Get testnet VET from faucet.vechain.org'); 
  console.log('3. Test with VeWorld mobile browser');
  console.log('4. Submit real receipt to earn B3TR tokens!');
  console.log('');
  console.log('Your receipts will trigger real blockchain transactions');
  console.log('and distribute B3TR tokens via VeBetterDAO smart contracts.');
} else {
  console.log('⚠️  NOT READY - Issues to resolve:');
  
  if (process.env.VECHAIN_NETWORK !== 'testnet') {
    console.log('- Set VECHAIN_NETWORK=testnet');
  }
  if (process.env.TEST_MODE !== 'false') {
    console.log('- Set TEST_MODE=false for real blockchain');
  }
  if (!blockchainConfigured) {
    console.log('- Complete VeBetterDAO configuration');
  }
  if (!process.env.DATABASE_URL || !process.env.OPENAI_API_KEY) {
    console.log('- Configure external service API keys');
  }
}

console.log('\n💡 Simulation vs Real Testing:');
console.log('===============================');
console.log('You have two options for testing:');
console.log('');
console.log('1. SIMULATION MODE (TEST_MODE=true):');
console.log('   - Test receipt flow without blockchain');
console.log('   - Safe for development testing');
console.log('   - No real tokens distributed');
console.log('');
console.log('2. REAL TESTNET MODE (TEST_MODE=false):');
console.log('   - Real VeChain testnet transactions');
console.log('   - Actual B3TR token distribution');
console.log('   - Requires VeWorld wallet connection');
console.log('   - Need testnet VET for gas fees');
console.log('');
console.log('Both modes work on the production URL after deployment.');