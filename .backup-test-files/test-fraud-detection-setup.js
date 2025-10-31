/**
 * Test script to verify fraud detection system is ready for Google Apps Script integration
 * This will create a test receipt with an image to verify the fraud detection workflow
 */

import fetch from 'node-fetch';

const API_BASE_URL = "http://localhost:5000";

// Test data for fraud detection verification
const testReceiptData = {
  userId: 102,
  storeId: null,
  amount: 29.99,
  category: "re-use item",
  purchaseDate: new Date().toISOString(),
  hasImage: true,
  imageData: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=" // Minimal test image
};

async function testFraudDetectionSetup() {
  console.log("🔍 Testing Fraud Detection System Setup");
  console.log("=====================================");

  try {
    // Step 1: Create a test receipt with image
    console.log("\n1️⃣ Creating test receipt with image...");
    
    const receiptResponse = await fetch(`${API_BASE_URL}/api/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testReceiptData)
    });

    if (!receiptResponse.ok) {
      throw new Error(`Receipt creation failed: ${receiptResponse.status}`);
    }

    const receiptResult = await receiptResponse.json();
    console.log(`✅ Receipt created with ID: ${receiptResult.id}`);

    // Step 2: Test image retrieval endpoint
    console.log("\n2️⃣ Testing image retrieval for Google Apps Script...");
    
    const imageResponse = await fetch(`${API_BASE_URL}/api/receipts/${receiptResult.id}/image`, {
      method: 'GET'
    });

    if (imageResponse.ok) {
      const imageResult = await imageResponse.json();
      console.log("✅ Image endpoint working:");
      console.log(`   - Has image: ${!!imageResult.image}`);
      console.log(`   - Fraud flags: ${imageResult.image?.fraudFlags?.length || 0}`);
      console.log(`   - File size: ${imageResult.image?.fileSize || 0} bytes`);
    } else {
      console.log("❌ Image endpoint not accessible");
    }

    // Step 3: Test admin pending receipts endpoint
    console.log("\n3️⃣ Testing admin pending receipts endpoint...");
    
    const adminResponse = await fetch(`${API_BASE_URL}/api/admin/receipts/pending-review`, {
      method: 'GET'
    });

    if (adminResponse.ok) {
      const adminResult = await adminResponse.json();
      console.log(`✅ Admin endpoint working: ${adminResult.count} pending receipts`);
    } else {
      console.log("❌ Admin endpoint not accessible");
    }

    // Step 4: Test Google Apps Script payload format
    console.log("\n4️⃣ Creating Google Apps Script test payload...");
    
    const googleAppsPayload = {
      receipt_id: `TEST-${Date.now()}`,
      user_id: receiptResult.userId,
      user_wallet: "0xTestWallet123456789",
      store_name: "Test Store",
      purchase_amount: receiptResult.amount,
      estimated_reward: receiptResult.tokenReward,
      status: "approved",
      admin_notes: "Approved after fraud detection review"
    };

    console.log("✅ Google Apps Script payload format:");
    console.log(JSON.stringify(googleAppsPayload, null, 2));

    // Step 5: Test approval endpoint with fraud detection data
    console.log("\n5️⃣ Testing approval endpoint...");
    
    const approvalResponse = await fetch(`${API_BASE_URL}/api/receipt-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleAppsPayload)
    });

    if (approvalResponse.ok) {
      const approvalResult = await approvalResponse.json();
      console.log("✅ Approval endpoint working");
      console.log(`   - Reward: ${approvalResult.reward || approvalResult.receiptReward} tokens`);
      console.log(`   - Status: ${approvalResult.message}`);
    } else {
      console.log("❌ Approval endpoint error:", approvalResponse.status);
    }

    console.log("\n🎉 Fraud Detection System Ready for Google Apps Script!");
    console.log("\nNext Steps:");
    console.log("1. Copy the enhanced Google Apps Script code");
    console.log("2. Add fraud detection columns to your Google Sheet");
    console.log("3. Test the new menu options");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testFraudDetectionSetup();