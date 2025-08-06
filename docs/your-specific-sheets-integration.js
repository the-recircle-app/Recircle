/**
 * Google Apps Script for Your Specific ReCircle Sheets Integration
 * Pending Reviews: https://docs.google.com/spreadsheets/d/1Hp1nJ9v5wj2QvmdRWnUohfa4i9QPbq-BwrrInSoxQCI/edit?gid=1094452639#gid=1094452639
 * Approval Responses: https://docs.google.com/spreadsheets/d/1ORQysNrco7u04UyoG9FyekqMsFSGQ-A_WYhYGhcMtuM/edit?gid=636184662#gid=636184662
 */

// Your Google Sheets Configuration
const PENDING_REVIEWS_SHEET_ID = '1Hp1nJ9v5wj2QvmdRWnUohfa4i9QPbq-BwrrInSoxQCI';
const APPROVAL_RESPONSES_SHEET_ID = '1ORQysNrco7u04UyoG9FyekqMsFSGQ-A_WYhYGhcMtuM';
const PENDING_REVIEWS_GID = '1094452639';
const APPROVAL_RESPONSES_GID = '636184662';

// ReCircle webhook URL - NEW DEPLOYMENT
const WEBHOOK_URL = 'https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/api/receipt-approved';

/**
 * Script 1: For Pending Reviews Sheet
 * This receives receipt data from ReCircle when manual review is needed
 */
function doPost(e) {
  try {
    console.log('📋 Receipt data received for manual review...');
    
    // Parse the incoming receipt data from ReCircle
    const data = JSON.parse(e.postData.contents);
    
    // Open your specific pending reviews sheet
    const sheet = SpreadsheetApp.openById(PENDING_REVIEWS_SHEET_ID).getSheetByName('Sheet1') || 
                  SpreadsheetApp.openById(PENDING_REVIEWS_SHEET_ID).getActiveSheet();
    
    // Add receipt data to your pending reviews sheet
    const row = [
      new Date().toISOString(), // Timestamp
      data.receipt_id || 'N/A',
      data.user_id || 'N/A', 
      data.user_wallet || 'N/A',
      data.store_name || 'N/A',
      data.purchase_amount || 0,
      data.ai_confidence_score || 'N/A',
      data.validation_notes || 'Needs manual review',
      data.receipt_image_url || 'N/A',
      'PENDING', // Status
      '', // Admin notes (empty for you to fill)
      '' // Decision (empty for you to fill)
    ];
    
    sheet.appendRow(row);
    
    console.log(`✅ Added receipt ${data.receipt_id} to pending reviews sheet`);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Receipt added to pending reviews'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('❌ Error adding to pending reviews:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Script 2: For Approval Responses Sheet
 * This processes your manual approval decisions and sends them to ReCircle
 */
function processApprovalResponses() {
  try {
    console.log('🔄 Processing approval responses...');
    
    // Open your approval responses sheet
    const sheet = SpreadsheetApp.openById(APPROVAL_RESPONSES_SHEET_ID).getSheetByName('Form Responses 1') ||
                  SpreadsheetApp.openById(APPROVAL_RESPONSES_SHEET_ID).getActiveSheet();
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find unprocessed rows (assuming you have a "Processed" column)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const processedIndex = headers.indexOf('Processed');
      
      // Skip if already processed
      if (processedIndex !== -1 && row[processedIndex] === 'YES') {
        continue;
      }
      
      // Extract approval data (adjust column indices based on your form)
      const receiptId = row[headers.indexOf('Receipt ID')] || row[1];
      const userId = row[headers.indexOf('User ID')] || row[2];
      const userWallet = row[headers.indexOf('User Wallet')] || row[3];
      const service = row[headers.indexOf('Service')] || row[4];
      const amount = row[headers.indexOf('Amount')] || row[5];
      const decision = row[headers.indexOf('Decision')] || row[6];
      const notes = row[headers.indexOf('Notes')] || row[7];
      
      // Only process approvals
      if (decision && decision.includes('Approve')) {
        console.log(`✅ Processing approval for receipt ${receiptId}`);
        
        // Send to ReCircle
        const payload = {
          receipt_id: receiptId,
          user_id: parseInt(userId),
          user_wallet: userWallet,
          store_name: service,
          purchase_amount: parseFloat(amount),
          estimated_reward: Math.round(parseFloat(amount) * 0.7), // 70% reward
          status: "approved",
          admin_notes: notes || 'Approved via Google Sheets manual review'
        };
        
        const response = UrlFetchApp.fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'ReCircle-Sheets-Integration/1.0'
          },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
        
        const responseCode = response.getResponseCode();
        console.log(`Webhook response for ${receiptId}: ${responseCode}`);
        
        // Mark as processed
        if (processedIndex !== -1) {
          sheet.getRange(i + 1, processedIndex + 1).setValue('YES');
        }
        
        // Add processing timestamp
        const timestampIndex = headers.indexOf('Processed At');
        if (timestampIndex !== -1) {
          sheet.getRange(i + 1, timestampIndex + 1).setValue(new Date().toISOString());
        }
      }
    }
    
    console.log('✅ Approval processing complete');
    
  } catch (error) {
    console.error('❌ Error processing approvals:', error);
  }
}

/**
 * Set up automatic approval processing (run every 5 minutes)
 */
function setupTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Create new trigger to check for approvals every 5 minutes
  ScriptApp.newTrigger('processApprovalResponses')
    .timeBased()
    .everyMinutes(5)
    .create();
    
  console.log('✅ Auto-processing trigger set up (every 5 minutes)');
}

/**
 * Test the integration
 */
function testIntegration() {
  console.log('🧪 Testing ReCircle integration...');
  
  // Test pending reviews sheet access
  try {
    const pendingSheet = SpreadsheetApp.openById(PENDING_REVIEWS_SHEET_ID);
    console.log('✅ Pending reviews sheet accessible');
  } catch (error) {
    console.error('❌ Cannot access pending reviews sheet:', error);
  }
  
  // Test approval responses sheet access  
  try {
    const approvalSheet = SpreadsheetApp.openById(APPROVAL_RESPONSES_SHEET_ID);
    console.log('✅ Approval responses sheet accessible');
  } catch (error) {
    console.error('❌ Cannot access approval responses sheet:', error);
  }
  
  // Test webhook connection
  const testPayload = {
    receipt_id: 'test_' + Date.now(),
    user_id: 999,
    user_wallet: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
    store_name: 'Test Integration',
    purchase_amount: 25.00,
    estimated_reward: 17.5,
    status: 'approved',
    admin_notes: 'Test from sheets integration'
  };
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    });
    
    console.log('Test webhook response:', response.getResponseCode());
    console.log('✅ Integration test complete');
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
  }
}