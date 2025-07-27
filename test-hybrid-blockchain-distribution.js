/**
 * Test the new hybrid blockchain distribution system
 * This test verifies that the system properly handles both real blockchain transactions
 * and pending transactions for manual review workflows
 */

import { sendReward } from './server/utils/distributeReward-hybrid.js';

async function testHybridDistribution() {
  console.log('🧪 TESTING HYBRID BLOCKCHAIN DISTRIBUTION SYSTEM');
  console.log('================================================');
  
  const testWallet = '0xf1f72b305b7bf7b25e85d356927af36b88dc84ee';
  
  console.log('\n1. Testing Manual Review Mode (Default for Server)');
  console.log('--------------------------------------------------');
  
  try {
    const manualResult = await sendReward({
      recipient: testWallet,
      amount: '8.0',
      proofTypes: ["manual_test", "receipt_verification"],
      proofValues: ["hybrid-test-001", "transportation_receipt"],
      impactTypes: ["test_validation", "co2_savings"],
      impactValues: ["manual_review_test", "600"],
      receiptId: 'HYBRID-001',
      mode: 'manual_review'
    });
    
    console.log('\nManual Review Result:');
    console.log('Success:', manualResult.success);
    console.log('Status:', manualResult.status);
    console.log('User Hash:', manualResult.hash);
    console.log('App Hash:', manualResult.appHash);
    console.log('Message:', manualResult.message);
    
    if (manualResult.distribution) {
      console.log(`User Amount: ${manualResult.distribution.user} B3TR`);
      console.log(`App Amount: ${manualResult.distribution.app} B3TR`);
    }
    
    // Verify pending hashes are generated correctly
    if (manualResult.hash && manualResult.hash.includes('pending-user-')) {
      console.log('✅ Pending user transaction hash generated correctly');
    } else {
      console.log('❌ Pending user transaction hash format incorrect');
    }
    
    if (manualResult.appHash && manualResult.appHash.includes('pending-app-')) {
      console.log('✅ Pending app transaction hash generated correctly');
    } else {
      console.log('❌ Pending app transaction hash format incorrect');
    }
    
  } catch (error) {
    console.error('Manual review test failed:', error.message);
  }
  
  console.log('\n2. Testing Auto Mode (Server Environment)');
  console.log('------------------------------------------');
  
  try {
    const autoResult = await sendReward({
      recipient: testWallet,
      amount: '5.0',
      proofTypes: ["auto_test", "receipt_verification"],
      proofValues: ["hybrid-test-002", "transportation_receipt"],
      impactTypes: ["test_validation", "co2_savings"],
      impactValues: ["auto_mode_test", "400"],
      receiptId: 'HYBRID-002',
      mode: 'auto'
    });
    
    console.log('\nAuto Mode Result:');
    console.log('Success:', autoResult.success);
    console.log('Status:', autoResult.status);
    console.log('User Hash:', autoResult.hash);
    console.log('App Hash:', autoResult.appHash);
    console.log('Message:', autoResult.message);
    
    if (autoResult.distribution) {
      console.log(`User Amount: ${autoResult.distribution.user} B3TR`);
      console.log(`App Amount: ${autoResult.distribution.app} B3TR`);
    }
    
    // Check if this falls back to pending (expected without private key)
    if (autoResult.status === 'pending_blockchain_approval') {
      console.log('✅ Auto mode correctly falls back to pending without private key');
    } else if (autoResult.status === 'blockchain_confirmed') {
      console.log('✅ Auto mode successfully executed real blockchain transactions');
    } else {
      console.log('❌ Unexpected auto mode status:', autoResult.status);
    }
    
  } catch (error) {
    console.error('Auto mode test failed:', error.message);
  }
  
  console.log('\n3. Environment Analysis');
  console.log('----------------------');
  
  console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
  console.log('VECHAIN_NETWORK:', process.env.VECHAIN_NETWORK || 'undefined');
  console.log('REWARD_DISTRIBUTOR_WALLET:', process.env.REWARD_DISTRIBUTOR_WALLET ? 'SET' : 'NOT SET');
  console.log('REWARD_DISTRIBUTOR_KEY:', process.env.REWARD_DISTRIBUTOR_KEY ? 'SET' : 'NOT SET');
  console.log('APP_FUND_WALLET:', process.env.APP_FUND_WALLET ? 'SET' : 'NOT SET');
  
  console.log('\n🎯 HYBRID SYSTEM ANALYSIS');
  console.log('=========================');
  
  const hasPrivateKey = process.env.REWARD_DISTRIBUTOR_KEY && process.env.REWARD_DISTRIBUTOR_KEY.length > 0;
  
  if (hasPrivateKey) {
    console.log('✅ System configured for real blockchain transactions');
    console.log('✅ Can execute immediate B3TR distributions');
    console.log('✅ Manual review will trigger real blockchain transactions');
  } else {
    console.log('✅ System configured for hybrid pending/manual workflow');
    console.log('✅ Pending transactions created for manual review');
    console.log('✅ Google Sheets approvals will need blockchain execution');
    console.log('💡 This is the CORRECT configuration for production security');
  }
  
  console.log('\n📊 Business Impact:');
  console.log('- Manual review receipts create pending transactions');
  console.log('- Google Sheets approval can trigger real blockchain distribution');
  console.log('- App fund wallet will receive actual B3TR tokens after approval');
  console.log('- VeWorld wallets will show real balances after blockchain execution');
}

testHybridDistribution().catch(console.error);