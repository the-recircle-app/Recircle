#!/usr/bin/env node

/**
 * Test script to verify production bypass functionality
 * Tests both duplicate receipt checking and daily limit bypasses
 */

const baseUrl = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
  : 'http://localhost:5000';

console.log(`Testing production bypasses at: ${baseUrl}`);

async function testProductionBypasses() {
  console.log('\n🧪 Testing Production Bypass Functionality');
  console.log('===========================================\n');

  // Test 1: Duplicate Receipt Bypass
  console.log('--- Test 1: Duplicate Receipt Bypass ---');
  
  const createUniqueReceiptData = (amount, suffix = '') => ({
    userId: 1,
    storeId: 1,
    amount: amount,
    purchaseDate: new Date().toISOString().split('T')[0],
    imageUrl: `data:image/jpeg;base64,unique-test-image-${Date.now()}${suffix}`,
    tokenReward: 6.2,
    category: 'ride_share',
    paymentMethod: 'Digital Payment',
    isTestMode: true  // This should bypass duplicate checking
  });

  try {
    // Submit the exact same receipt twice to test duplicate bypass
    const testReceiptData = createUniqueReceiptData(25.50, '-duplicate-test');
    
    for (let i = 1; i <= 2; i++) {
      const response = await fetch(`${baseUrl}/api/receipts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testReceiptData)
      });
      
      const result = await response.json();
      console.log(`Receipt ${i}: ${response.status} - ${response.ok ? 'SUCCESS' : 'FAILED'}`);
      
      if (response.ok) {
        console.log(`  ✅ Receipt processed: Balance now ${result.updatedUser?.tokenBalance || 'unknown'} B3TR`);
      } else {
        console.log(`  ❌ Error: ${result.message || 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Duplicate receipt test failed:', error.message);
  }

  // Test 2: Daily Limit Bypass via Query Parameter
  console.log('\n--- Test 2: Daily Limit Bypass (Query Parameter) ---');
  
  try {
    // This should bypass daily limits even in production
    const testData = createUniqueReceiptData(30.75, '-daily-limit-test');
    const response = await fetch(`${baseUrl}/api/receipts?skipDailyLimit=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log(`Daily limit bypass: ${response.status} - ${response.ok ? 'SUCCESS' : 'FAILED'}`);
    
    if (response.ok) {
      console.log(`  ✅ Daily limit bypassed successfully - Balance: ${result.updatedUser?.tokenBalance || 'unknown'} B3TR`);
    } else {
      console.log(`  ❌ Error: ${result.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Daily limit bypass test failed:', error.message);
  }

  // Test 3: Duplicate Receipt Bypass via Header
  console.log('\n--- Test 3: Duplicate Receipt Bypass (Header) ---');
  
  try {
    const testData = createUniqueReceiptData(28.99, '-header-test');
    const response = await fetch(`${baseUrl}/api/receipts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-skip-duplicate-check': 'true'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log(`Header bypass: ${response.status} - ${response.ok ? 'SUCCESS' : 'FAILED'}`);
    
    if (response.ok) {
      console.log(`  ✅ Header bypass working - Balance: ${result.updatedUser?.tokenBalance || 'unknown'} B3TR`);
    } else {
      console.log(`  ❌ Error: ${result.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Header bypass test failed:', error.message);
  }

  // Test 4: Check User Balance
  console.log('\n--- Test 4: Check User Balance ---');
  
  try {
    const response = await fetch(`${baseUrl}/api/users/1`);
    const user = await response.json();
    console.log(`User balance: ${user.tokenBalance} B3TR`);
    console.log(`Current streak: ${user.currentStreak}`);
  } catch (error) {
    console.error('Balance check failed:', error.message);
  }

  console.log('\n✅ Production bypass tests completed!');
}

testProductionBypasses().catch(console.error);