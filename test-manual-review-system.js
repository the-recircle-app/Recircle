/**
 * Test Manual Review System
 * Tests the complete manual review workflow including Google Sheets integration
 */

import fetch from 'node-fetch';

const TEST_USER_ID = 103;
const TEST_WALLET = '0x9FE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

async function testManualReviewWorkflow() {
  console.log('🧪 Testing Manual Review System...\n');
  
  try {
    // Test 1: Submit invalid receipt that should trigger manual review
    console.log('--- Test 1: Submit Invalid Receipt (Should trigger manual review) ---');
    
    const invalidReceiptResponse = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        walletAddress: TEST_WALLET,
        image: 'invalid_base64_that_will_cause_low_confidence', // Invalid image to trigger manual review
        storeHint: 'Suspicious Transportation Receipt',
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: 15.50
      }),
    });

    console.log(`Response Status: ${invalidReceiptResponse.status}`);
    const invalidData = await invalidReceiptResponse.json();
    console.log('Invalid Receipt Response:', JSON.stringify(invalidData, null, 2));
    
    if (invalidData.sentForManualReview) {
      console.log('✅ SUCCESS: Receipt was sent for manual review!');
    } else {
      console.log('❌ FAILED: Receipt was not sent for manual review');
    }
    
    console.log('\n--- Test 2: Submit Valid Receipt (Should auto-approve) ---');
    
    // Test 2: Submit a receipt that should auto-approve (using OpenAI test mode)
    const validReceiptResponse = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
        walletAddress: TEST_WALLET,
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/Z', // Valid base64 image
        storeHint: 'Uber Transportation Receipt',
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: 22.75
      }),
    });

    console.log(`Response Status: ${validReceiptResponse.status}`);
    const validData = await validReceiptResponse.json();
    console.log('Valid Receipt Response:', JSON.stringify(validData, null, 2));
    
    if (!validData.sentForManualReview && validData.tokenDistributed) {
      console.log('✅ SUCCESS: Receipt was auto-approved and tokens distributed!');
    } else if (validData.sentForManualReview) {
      console.log('ℹ️  INFO: Receipt was sent for manual review (may be due to low OpenAI confidence)');
    } else {
      console.log('❌ FAILED: Unexpected result for valid receipt');
    }
    
    console.log('\n🎯 Manual Review Test Summary:');
    console.log('1. Invalid receipt should trigger manual review');
    console.log('2. Valid receipt should auto-approve or go to manual review based on AI confidence');
    console.log('3. Check Google Sheets for manual review entries');
    console.log('\n📋 Next steps:');
    console.log('- Check Google Sheets for new manual review entries');
    console.log('- Test the webhook approval system');
    console.log('- Verify token distribution after manual approval');
    
  } catch (error) {
    console.error('❌ Error during manual review test:', error);
  }
}

testManualReviewWorkflow();