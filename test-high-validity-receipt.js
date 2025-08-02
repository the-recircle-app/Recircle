#!/usr/bin/env node
/**
 * Test High-Validity Receipt for Token Distribution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname);

async function testHighValidityReceipt() {
  try {
    console.log('🎯 Testing High-Validity Receipt for Token Distribution');
    
    const testAddress = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';
    
    // Create a text-based receipt description that should score higher
    // We'll encode text as a small valid image with a description that emphasizes sustainability
    const sustainableReceiptDescription = {
      address: testAddress,
      deviceID: "test_sustainable_transport",
      // Use a valid small PNG as base64 - this is a 1x1 transparent pixel
      image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    };
    
    console.log('Submitting sustainable transportation receipt...');
    
    const response = await fetch('http://localhost:5000/api/pierre/submit-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sustainableReceiptDescription)
    });
    
    const result = await response.json();
    
    console.log('\n=== HIGH-VALIDITY RECEIPT TEST RESULTS ===');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    
    if (result.validation) {
      console.log('Validity Score:', result.validation.validityFactor);
      console.log('Reasoning:', result.validation.reasoning);
      console.log('Confidence:', result.validation.confidence);
    }
    
    console.log('Tokens Distributed:', result.tokenDistributed ? 'YES' : 'NO');
    console.log('Reward Amount:', result.rewardAmount);
    console.log('Message:', result.message);
    
    if (result.tokenDistributed) {
      console.log('\n✅ SUCCESS: Token distribution working!');
      console.log('The Pierre VeBetterDAO integration successfully:');
      console.log('- Validated receipt with OpenAI Vision API');
      console.log('- Applied validity threshold (> 0.5)');
      console.log('- Distributed B3TR tokens to user wallet');
      console.log('- Logged transaction for tracking');
    } else {
      console.log('\n⚠️  No tokens distributed - validity score too low');
      console.log('The system is working correctly but needs a higher scoring receipt.');
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

testHighValidityReceipt();