/**
 * Test fund transaction visibility in transaction history
 * This script creates a receipt and checks if creator/app fund transactions appear
 */

const API_BASE_URL = 'http://localhost:5000';

async function testFundTransactions() {
  console.log('🧪 Testing fund transaction visibility in transaction history\n');

  try {
    // Update user wallet address
    console.log('Updating user 1 wallet address...');
    const updateResponse = await fetch(`${API_BASE_URL}/api/users/1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686'
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update user wallet: ${updateResponse.statusText}`);
    }

    console.log('✅ User wallet address updated\n');

    // Submit receipt to trigger fund distributions
    console.log('Submitting receipt to trigger fund distributions...');
    const receiptData = {
      userId: 1,
      storeId: 1,
      amount: 45.20,
      category: 'ride-share',
      tokenReward: 16,
      purchaseDate: '2025-06-02',
      hasImage: false,
      isTestMode: true,
      analysisResult: {
        confidence: 0.95,
        isAcceptable: true,
        estimatedReward: 16,
        storeName: 'Uber',
        testMode: true,
        sentForManualReview: false,
        timeoutFallback: false,
        needsManualReview: false
      }
    };

    const submitResponse = await fetch(`${API_BASE_URL}/api/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });

    if (!submitResponse.ok) {
      throw new Error(`Failed to submit receipt: ${submitResponse.statusText}`);
    }

    const receiptResult = await submitResponse.json();
    console.log(`Receipt submitted successfully - ID: ${receiptResult.id}`);
    console.log('✅ Receipt submitted\n');

    // Wait for processing
    console.log('Waiting 3 seconds for processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check transaction history
    console.log('Checking transaction history...');
    const transactionsResponse = await fetch(`${API_BASE_URL}/api/users/1/transactions`);
    
    if (!transactionsResponse.ok) {
      throw new Error(`Failed to fetch transactions: ${transactionsResponse.statusText}`);
    }

    const transactions = await transactionsResponse.json();
    
    console.log(`\nTransaction history (${transactions.length} total):`);
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.type} - ${tx.amount} B3TR - ${tx.description || 'No description'}`);
    });

    // Check for fund transactions
    const creatorTxs = transactions.filter(tx => tx.type === 'sustainability_creator');
    const appTxs = transactions.filter(tx => tx.type === 'sustainability_app');
    const userTxs = transactions.filter(tx => tx.userId === 1);

    console.log('\n📊 Transaction Summary:');
    console.log(`- User transactions: ${userTxs.length}`);
    console.log(`- Creator fund transactions: ${creatorTxs.length}`);
    console.log(`- App fund transactions: ${appTxs.length}`);

    if (creatorTxs.length > 0 && appTxs.length > 0) {
      console.log('\n✅ SUCCESS: Creator and app fund transactions are visible in transaction history');
      
      console.log('\nMost recent fund transactions:');
      if (creatorTxs.length > 0) {
        const latestCreator = creatorTxs[0];
        console.log(`- Creator Fund: ${latestCreator.amount} B3TR (${latestCreator.description})`);
      }
      if (appTxs.length > 0) {
        const latestApp = appTxs[0];
        console.log(`- App Fund: ${latestApp.amount} B3TR (${latestApp.description})`);
      }
    } else {
      console.log('\n❌ ISSUE: Fund transactions are not appearing in transaction history');
      console.log('This may indicate the blockchain distribution or transaction recording is not working properly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFundTransactions();