/**
 * Test script to validate receipt image validation with real images
 * This performs a test with a sample GameStop receipt image
 */

import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

async function testReceiptImageValidation() {
  console.log('Testing receipt image validation with a real image...');

  try {
    // Use a sample receipt image from the attached assets if available
    let testImage;
    try {
      // Try to use an actual receipt image from the attached_assets folder if available
      testImage = fs.readFileSync('./attached_assets/IMG_0449.jpeg');
    } catch (e) {
      console.log('No sample image found in attached_assets, using test data instead');
      // If no image is available, we'll use test mode instead
      const testResponse = await fetch('http://localhost:5000/api/receipts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testMode: true,
          testType: 'thrift',
          userId: 102,
          walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
        }),
      });
      console.log(`Test mode response status: ${testResponse.status}`);
      const testData = await testResponse.json();
      console.log('Test mode response data:', JSON.stringify(testData, null, 2));
      return;
    }

    // Convert image to base64
    const base64Image = testImage.toString('base64');
    
    // Send the image for analysis
    console.log('Sending image for analysis...');
    const response = await fetch('http://localhost:5000/api/receipts/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        imageName: 'test_receipt.jpeg',
        userId: 102,
        walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
      }),
    });

    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    console.log('\nCheck the confidence score to see if our improved prompt is working better!');
    
  } catch (error) {
    console.error('Error testing receipt image validation:', error);
  }
}

testReceiptImageValidation();