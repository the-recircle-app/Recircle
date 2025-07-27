/**
 * Test script for on-chain B3TR token distribution via VeBetterDAO
 * 
 * This script verifies that rewards can be distributed through the blockchain
 * using the 70/30 distribution model across all wallets.
 */

const API_URL = 'http://localhost:5000';

// Make sure these values match your test environment:
const TEST_USER_ID = 102;
const TEST_WALLET = "0x7dE3085b3190B3a787822Ee16F23be010f5F8686"; // Update this to your test wallet

/**
 * Test simple on-chain reward distribution
 */
async function testBlockchainReward() {
  console.log('🧪 Testing blockchain B3TR token distribution\n');
  
  try {
    // First, get wallet addresses from the API
    console.log('Fetching wallet addresses from API...');
    const walletResponse = await fetch(`${API_URL}/api/wallet-addresses`);
    const walletData = await walletResponse.json();
    
    console.log(`Creator Fund Wallet: ${walletData.creatorFundWallet}`);
    console.log(`App Fund Wallet: ${walletData.appFundWallet}`);
    
    if (!walletData.creatorFundWallet || !walletData.appFundWallet) {
      console.error('❌ ERROR: Fund wallet addresses not configured.');
      return;
    }
    
    // Create test payload with a small reward amount for testing
    const testReward = 1; // 1 B3TR (small amount for testing)
    
    console.log(`\nTesting reward distribution with ${testReward} B3TR`);
    console.log('Sending request to /api/debug/reward-test endpoint...');
    
    const response = await fetch(`${API_URL}/api/debug/reward-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: TEST_USER_ID,
        wallet_address: TEST_WALLET,
        reward_amount: testReward,
        proof_type: "test"
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('\n✅ Blockchain distribution test result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check user balance after distribution
    console.log('\nChecking token balance update...');
    const userResponse = await fetch(`${API_URL}/api/users/${TEST_USER_ID}`);
    const user = await userResponse.json();
    
    console.log(`Token balance after distribution: ${user.tokenBalance}`);
    
    // Check status of blockchain transactions
    if (result.txHash) {
      console.log(`\nUser transaction hash: ${result.txHash}`);
      console.log(`View transaction on VeChain explorer: https://${result.network === 'mainnet' ? '' : 'testnet.'}vechain.org/tx/${result.txHash}`);
    }
    
    if (result.creatorHash) {
      console.log(`Creator fund transaction hash: ${result.creatorHash}`);
    }
    
    if (result.appHash) {
      console.log(`App fund transaction hash: ${result.appHash}`);
    }
    
    console.log('\nTransaction details:');
    console.log(`Network: ${result.network || 'testnet'}`);
    console.log(`Distribution:
      - User (70%): ${result.distribution?.user || testReward * 0.7} B3TR
      - Creator (15%): ${result.distribution?.creator || testReward * 0.15} B3TR
      - App (15%): ${result.distribution?.app || testReward * 0.15} B3TR
    `);
    
  } catch (error) {
    console.error('\n❌ Error during blockchain test:', error);
  }
}

// Run the test
testBlockchainReward();