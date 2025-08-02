#!/usr/bin/env node
/**
 * Test Real B3TR Token Distribution with Pierre Integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testTokenDistribution() {
  try {
    console.log('🎯 Testing Real B3TR Token Distribution');
    
    // Step 1: Check initial balance
    const testAddress = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';
    console.log('\n=== STEP 1: Check Initial Balance ===');
    
    const balanceResponse = await fetch(`http://localhost:5000/api/balance/${testAddress}`);
    const initialBalance = await balanceResponse.json();
    console.log('Initial Balance:', initialBalance);
    
    // Step 2: Submit a high-validity receipt (simulate a public transit receipt)
    console.log('\n=== STEP 2: Submit High-Validity Receipt ===');
    
    // Create a mock public transit receipt that should score high
    const publicTransitImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
    
    const submissionData = {
      address: testAddress,
      deviceID: "test_token_distribution",
      image: publicTransitImage
    };
    
    const submitResponse = await fetch('http://localhost:5000/api/pierre/submit-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    });
    
    const submitResult = await submitResponse.json();
    console.log('Submission Result:', JSON.stringify(submitResult, null, 2));
    
    // Step 3: Check final balance
    console.log('\n=== STEP 3: Check Final Balance After Submission ===');
    
    // Wait a moment for transaction to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const finalBalanceResponse = await fetch(`http://localhost:5000/api/balance/${testAddress}`);
    const finalBalance = await finalBalanceResponse.json();
    console.log('Final Balance:', finalBalance);
    
    // Compare balances
    console.log('\n=== BALANCE COMPARISON ===');
    if (initialBalance.balance && finalBalance.balance) {
      const initialAmount = parseFloat(initialBalance.balance);
      const finalAmount = parseFloat(finalBalance.balance);
      const difference = finalAmount - initialAmount;
      
      console.log(`Initial: ${initialAmount} B3TR`);
      console.log(`Final: ${finalAmount} B3TR`);
      console.log(`Difference: ${difference} B3TR`);
      
      if (difference > 0) {
        console.log('✅ SUCCESS: Tokens were distributed!');
      } else {
        console.log('❌ NO TOKENS: No change in balance');
      }
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

testTokenDistribution();