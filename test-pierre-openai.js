#!/usr/bin/env node
/**
 * Test Pierre VeBetterDAO OpenAI Integration with Real Lyft Receipt
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPierreOpenAI() {
  try {
    // Read the Lyft receipt image
    const imagePath = path.join(__dirname, 'attached_assets', 'IMG_0897_1754104317153.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log('🎯 Testing Pierre VeBetterDAO OpenAI Integration');
    console.log('📱 Using real Lyft receipt image');
    console.log(`📊 Image size: ${Math.round(base64Image.length / 1024)}KB`);
    
    // Create the submission request
    const submissionData = {
      address: "0x7567d83b7b8d80addcb281a71d54fc7b3364ffed",
      deviceID: "test_pierre_integration",
      image: base64Image
    };
    
    // Make the API request
    const response = await fetch('http://localhost:5000/api/pierre/submit-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });
    
    const result = await response.json();
    
    console.log('\n=== PIERRE VEBETTERDAO TEST RESULTS ===');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS: Pierre VeBetterDAO integration working!');
      console.log(`🤖 AI Validity Score: ${result.validation.validityFactor}`);
      console.log(`🎯 Tokens Distributed: ${result.tokenDistributed ? 'YES' : 'NO'}`);
      console.log(`💰 Reward Amount: ${result.validation.rewardAmount || 'N/A'}`);
    } else {
      console.log('\n❌ FAILED: Integration test failed');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('🚨 Test failed with error:', error.message);
  }
}

// Run the test
testPierreOpenAI();