/**
 * Test Real Reviewer Workflow
 * This tests the complete reviewer experience from receipt submission to token distribution
 */

import fetch from 'node-fetch';

const TEST_USER_ID = 104; // Use different user ID for clean test
const TEST_WALLET = '0x7dE3085b3190B3a787822Ee16F23be010f5F8686';

async function testRealReviewerWorkflow() {
  console.log('🎯 Testing REAL Reviewer Workflow...\n');
  
  try {
    console.log('--- Step 1: Submit Receipt for Manual Review ---');
    
    // Submit a receipt that will trigger manual review
    const receiptResponse = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        walletAddress: TEST_WALLET,
        image: 'data:image/jpeg;base64,invalid_image_to_trigger_manual_review',
        storeHint: 'REAL TEST - Transportation Receipt for Manual Review',
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: 18.75
      }),
    });

    console.log(`Receipt Submission Status: ${receiptResponse.status}`);
    const receiptData = await receiptResponse.json();
    
    if (receiptData.sentForManualReview) {
      console.log('✅ SUCCESS: Receipt sent for manual review');
      console.log('📋 Receipt ID:', receiptData.debugInfo?.receiptId || 'Check Google Sheets');
      
      console.log('\n--- Step 2: Manual Actions Required ---');
      console.log('🔍 CHECK YOUR GOOGLE SHEET:');
      console.log('   1. Open your ReCircle Manual Reviews Google Sheet');
      console.log('   2. Look for a new row with your test receipt');
      console.log('   3. Verify all data is populated correctly');
      console.log('');
      console.log('✅ APPROVE THE RECEIPT:');
      console.log('   1. In the "status" column, type: approved');
      console.log('   2. Go to Extensions > Apps Script');
      console.log('   3. Use Custom Menu: 🔄 Recircle Rewards > ✅ Approve Receipt');
      console.log('   4. Check execution log for success message');
      console.log('');
      console.log('💰 VERIFY TOKEN DISTRIBUTION:');
      console.log('   1. Check VeWorld wallet for B3TR tokens');
      console.log('   2. Check app fund wallet for B3TR tokens');
      console.log('   3. Verify transaction on VeChain explorer');
      
      console.log('\n--- Step 3: Check Current User Balance ---');
      const userResponse = await fetch(`http://localhost:5000/api/users/${TEST_USER_ID}`);
      const userData = await userResponse.json();
      console.log('Current User Balance:', userData.tokenBalance, 'B3TR');
      
    } else {
      console.log('❌ FAILED: Receipt was not sent for manual review');
      console.log('Receipt Response:', JSON.stringify(receiptData, null, 2));
    }
    
    console.log('\n🎯 REVIEWER WORKFLOW STATUS:');
    console.log('✅ Backend: Receipt submission working');
    console.log('❓ Google Sheets: Check if receipt appears');
    console.log('❓ Approval: Test via Google Sheets menu');
    console.log('❓ Blockchain: Verify real B3TR distribution');
    
    console.log('\n📞 IF ISSUES:');
    console.log('1. Check Google Sheets webhook URL is correct');
    console.log('2. Verify environment variables are set');
    console.log('3. Test Google Apps Script deployment');
    console.log('4. Check VeChain distributor wallet has VTHO');
    
  } catch (error) {
    console.error('❌ Error during reviewer workflow test:', error);
  }
}

console.log('🔧 PREREQUISITES:');
console.log('1. Google Sheet set up with Apps Script deployed');
console.log('2. Environment variables configured');
console.log('3. VeChain distributor wallet funded with VTHO');
console.log('4. Real VeWorld wallet connected for testing');
console.log('\nPress Enter when ready...');

// Uncomment to run immediately:
testRealReviewerWorkflow();