/**
 * Test script to create a receipt with image for manual review
 * This will show you how images work in the manual review workflow
 */

const API_BASE_URL = 'http://localhost:5000';

// Sample receipt image (small base64 image for testing)
const TEST_IMAGE_BASE64 = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`;

async function createReceiptWithImage() {
  try {
    console.log("🚀 Creating receipt with image for manual review...");
    
    // Create user if doesn't exist
    const userData = {
      username: "imagetest",
      password: "test123",
      walletAddress: "0x7dE3085b3190B3a787822Ee16F23be010f5F8686"
    };

    let userResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!userResponse.ok && userResponse.status !== 409) { // 409 = user exists
      throw new Error(`Failed to create user: ${userResponse.status}`);
    }

    let userId = 3; // Use existing test user

    console.log(`✅ Using user ID: ${userId}`);

    // Use Waymo store (ID 1) for testing manual review
    const storeId = 1; // Waymo - this will likely trigger manual review

    // Submit receipt with image that will trigger manual review
    const receiptData = {
      userId: userId,
      storeId: storeId,
      amount: 15.99,
      purchaseDate: new Date().toISOString(),
      image: TEST_IMAGE_BASE64,
      metadata: {
        submissionMethod: "upload",
        location: "Test Location"
      }
    };

    console.log("📤 Submitting receipt with image...");

    const receiptResponse = await fetch(`${API_BASE_URL}/api/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });

    if (!receiptResponse.ok) {
      const errorText = await receiptResponse.text();
      throw new Error(`Receipt submission failed: ${receiptResponse.status} - ${errorText}`);
    }

    const receiptResult = await receiptResponse.json();
    console.log(`✅ Receipt created with ID: ${receiptResult.receipt.id}`);

    // Check if image was stored
    const imageResponse = await fetch(`${API_BASE_URL}/api/receipts/${receiptResult.receipt.id}/image`);
    
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      console.log(`✅ Receipt image available at: /api/receipts/${receiptResult.receipt.id}/image`);
      console.log(`📊 Fraud flags: ${imageData.image.fraudFlags.join(', ') || 'none'}`);
      console.log(`📷 Image size: ${imageData.image.fileSize} bytes`);
    } else {
      console.log("❌ No image found for this receipt");
    }

    // Check pending receipts for manual review
    const pendingResponse = await fetch(`${API_BASE_URL}/api/admin/receipts/pending-review`);
    
    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      console.log(`\n📋 Total pending receipts: ${pendingData.count}`);
      
      const thisReceipt = pendingData.receipts.find(r => r.id === receiptResult.receipt.id);
      if (thisReceipt) {
        console.log(`✅ Your receipt is in manual review queue`);
        console.log(`🖼️ Image URL: https://www.recirclerewards.app${thisReceipt.imageUrl}`);
        console.log(`⚠️ Fraud flags: ${thisReceipt.fraudFlags.join(', ') || 'none'}`);
      }
    }

    return receiptResult.receipt.id;

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

// Run the test
createReceiptWithImage();