/**
 * Google Apps Script for Processing Approval Responses
 * Deploy this to your Approval Responses Sheet (1ORQysNrco7u04UyoG9FyekqMsFSGQ-A_WYhYGhcMtuM)
 */

// Configuration
const SHEET_ID = '1ORQysNrco7u04UyoG9FyekqMsFSGQ-A_WYhYGhcMtuM';
const WEBHOOK_URL = 'https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/api/receipt-approved';

/**
 * Main function that processes new approval form responses
 * Call this function manually or set up a trigger to run it automatically
 */
function processApprovalResponses() {
  try {
    console.log('🔄 Processing approval responses...');
    
    // Open your approval responses sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName('Form Responses 1') || spreadsheet.getActiveSheet();
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      console.log('No data to process');
      return;
    }
    
    const headers = data[0];
    console.log('Headers found:', headers);
    
    // Find column indices (adjust these based on your actual form structure)
    const timestampIndex = 0; // First column is usually timestamp
    const receiptIdIndex = findColumnIndex(headers, ['Receipt ID', 'ReceiptID', 'Receipt']);
    const userIdIndex = findColumnIndex(headers, ['User ID', 'UserID', 'User']);
    const userWalletIndex = findColumnIndex(headers, ['User Wallet', 'Wallet', 'User Wallet Address']);
    const serviceIndex = findColumnIndex(headers, ['Service', 'Transportation Service', 'Store']);
    const amountIndex = findColumnIndex(headers, ['Amount', 'Purchase Amount', 'Total']);
    const decisionIndex = findColumnIndex(headers, ['Decision', 'Review Decision', 'Approval']);
    const notesIndex = findColumnIndex(headers, ['Notes', 'Admin Notes', 'Comments']);
    
    // Add processed tracking columns if they don't exist
    let processedIndex = findColumnIndex(headers, ['Processed']);
    let processedAtIndex = findColumnIndex(headers, ['Processed At', 'ProcessedAt']);
    
    if (processedIndex === -1) {
      // Add Processed column
      processedIndex = headers.length;
      sheet.getRange(1, processedIndex + 1).setValue('Processed');
    }
    
    if (processedAtIndex === -1) {
      // Add Processed At column
      processedAtIndex = headers.length + (processedIndex === headers.length ? 1 : 0);
      sheet.getRange(1, processedAtIndex + 1).setValue('Processed At');
    }
    
    let processedCount = 0;
    
    // Process each row (skip header)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip if already processed
      if (row[processedIndex] === 'YES' || row[processedIndex] === true) {
        continue;
      }
      
      // Extract data from row
      const receiptId = row[receiptIdIndex];
      const userId = row[userIdIndex];
      const userWallet = row[userWalletIndex];
      const service = row[serviceIndex];
      const amount = row[amountIndex];
      const decision = row[decisionIndex];
      const notes = row[notesIndex];
      
      // Validate required fields
      if (!receiptId || !userId || !userWallet || !decision) {
        console.log(`Row ${i + 1}: Missing required fields, skipping`);
        continue;
      }
      
      // Only process approvals
      if (!decision.toString().toLowerCase().includes('approve')) {
        console.log(`Row ${i + 1}: Not an approval (${decision}), marking as processed`);
        sheet.getRange(i + 1, processedIndex + 1).setValue('YES');
        sheet.getRange(i + 1, processedAtIndex + 1).setValue(new Date().toISOString());
        continue;
      }
      
      console.log(`✅ Processing approval for receipt ${receiptId}`);
      
      // Create payload for ReCircle
      const payload = {
        receipt_id: receiptId.toString(),
        user_id: parseInt(userId),
        user_wallet: userWallet.toString(),
        store_name: service ? service.toString() : 'Manual Review',
        purchase_amount: parseFloat(amount) || 0,
        estimated_reward: Math.round((parseFloat(amount) || 0) * 0.7), // 70% reward
        status: "approved",
        admin_notes: notes ? notes.toString() : 'Approved via Google Sheets manual review'
      };
      
      // Send to ReCircle
      try {
        const response = UrlFetchApp.fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'ReCircle-Approval-Processing/1.0'
          },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
        
        const responseCode = response.getResponseCode();
        const responseText = response.getContentText();
        
        console.log(`Webhook response for ${receiptId}: ${responseCode}`);
        
        if (responseCode === 200) {
          // Mark as successfully processed
          sheet.getRange(i + 1, processedIndex + 1).setValue('YES');
          sheet.getRange(i + 1, processedAtIndex + 1).setValue(new Date().toISOString());
          processedCount++;
          console.log(`✅ Successfully processed ${receiptId}`);
        } else {
          console.error(`❌ Failed to process ${receiptId}: ${responseCode} - ${responseText}`);
          sheet.getRange(i + 1, processedIndex + 1).setValue('ERROR');
        }
        
      } catch (webhookError) {
        console.error(`❌ Webhook error for ${receiptId}:`, webhookError);
        sheet.getRange(i + 1, processedIndex + 1).setValue('ERROR');
      }
    }
    
    console.log(`✅ Processing complete. Processed ${processedCount} approvals.`);
    
  } catch (error) {
    console.error('❌ Error in processApprovalResponses:', error);
  }
}

/**
 * Helper function to find column index by possible header names
 */
function findColumnIndex(headers, possibleNames) {
  for (let name of possibleNames) {
    const index = headers.findIndex(header => 
      header && header.toString().toLowerCase().includes(name.toLowerCase())
    );
    if (index !== -1) return index;
  }
  return -1;
}

/**
 * Set up automatic trigger to process responses every 5 minutes
 */
function setupAutoProcessing() {
  // Delete existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'processApprovalResponses') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger
  ScriptApp.newTrigger('processApprovalResponses')
    .timeBased()
    .everyMinutes(5)
    .create();
    
  console.log('✅ Auto-processing trigger set up (every 5 minutes)');
}

/**
 * Test the processing function with current data
 */
function testProcessing() {
  console.log('🧪 Testing approval processing...');
  
  // Test sheet access
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    console.log(`✅ Sheet accessible. Found ${data.length} rows of data.`);
    console.log('Headers:', data[0]);
  } catch (error) {
    console.error('❌ Cannot access sheet:', error);
    return;
  }
  
  // Test webhook connection
  const testPayload = {
    receipt_id: 'test_' + Date.now(),
    user_id: 999,
    user_wallet: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
    store_name: 'Test Processing',
    purchase_amount: 25.00,
    estimated_reward: 17.5,
    status: 'approved',
    admin_notes: 'Test from approval processing script'
  };
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    });
    
    console.log('Test webhook response:', response.getResponseCode());
    console.log('Response text:', response.getContentText());
    
    if (response.getResponseCode() === 200) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('⚠️ Webhook test failed - check ReCircle server');
    }
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
  }
  
  console.log('🧪 Test complete');
}

/**
 * Manual run function - processes responses once
 */
function runOnce() {
  console.log('🔄 Manual processing run...');
  processApprovalResponses();
}