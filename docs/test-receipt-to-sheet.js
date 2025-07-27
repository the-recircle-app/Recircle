/**
 * Test script to verify receipt data is sent to Google Sheet for manual review
 * This simulates a user submitting a receipt that needs manual review
 */

const API_URL = 'http://localhost:5000';

async function testReceiptToSheet() {
  console.log('🧪 Testing receipt submission that should go to Google Sheet...');
  
  try {
    // Submit a receipt that will trigger manual review
    const receiptData = {
      userId: 102,
      storeId: null, // No store ID to trigger manual review
      storeName: "Metro Bus Transit", // Public transit = manual review required
      amount: 4.50,
      purchaseDate: new Date().toISOString().split('T')[0],
      receiptId: `SHEET_TEST_${Date.now()}`,
      status: "pending_review",
      confidence: 0.6, // Low confidence to trigger manual review
      requiresManualReview: true,
      reviewReason: "Public transit receipt requires manual verification",
      estimatedReward: 3,
      walletAddress: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686",
      hasImage: true,
      image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/test" // Mock receipt image
    };
    
    console.log('Submitting receipt data:', receiptData);
    
    const response = await fetch(`${API_URL}/api/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(receiptData)
    });
    
    const result = await response.json();
    console.log('Receipt submission result:', result);
    
    if (result.needsManualReview) {
      console.log('✅ Receipt correctly flagged for manual review');
      console.log('🔍 Check your Google Sheet - receipt data should appear for review');
      console.log('📋 Expected data in sheet:');
      console.log(`   - Receipt ID: ${receiptData.receiptId}`);
      console.log(`   - User ID: ${receiptData.userId}`);
      console.log(`   - Store: ${receiptData.storeName}`);
      console.log(`   - Amount: $${receiptData.amount}`);
      console.log(`   - Date: ${receiptData.purchaseDate}`);
      console.log(`   - Wallet: ${receiptData.walletAddress}`);
    } else {
      console.log('❌ Receipt was not flagged for manual review - check logic');
    }
    
  } catch (error) {
    console.error('❌ Error testing receipt to sheet:', error.message);
  }
}

// Run the test
testReceiptToSheet();