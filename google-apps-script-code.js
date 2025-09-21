/**
 * ReCircle Manual Review - Google Apps Script
 * This script handles approval/rejection of transportation receipts and sends webhooks back to ReCircle
 */

// Your ReCircle webhook URL - UPDATE THIS
const REPLIT_WEBHOOK_URL = 'https://your-replit-app.replit.dev/api/receipt-approved';

/**
 * Automatically triggered when the sheet is edited
 */
function onEdit(e) {
  const range = e.range;
  const sheet = e.source.getActiveSheet();
  const row = range.getRow();
  const column = range.getColumn();
  
  // Skip if editing header row
  if (row <= 1) return;
  
  // Check if Status column (J) was edited
  if (column === 10) { // Column J = Status
    const status = range.getValue().toString().toUpperCase();
    
    if (status === 'APPROVED' || status === 'REJECTED') {
      // Get all row data
      const rowData = sheet.getRange(row, 1, 1, 11).getValues()[0];
      
      // Send webhook
      sendApprovalWebhook(rowData, status, row);
      
      // Add timestamp
      sheet.getRange(row, 12).setValue(new Date().toLocaleString());
    }
  }
}

/**
 * Send approval webhook back to ReCircle
 */
function sendApprovalWebhook(rowData, status, sheetRow) {
  try {
    const payload = {
      receipt_id: rowData[0], // Receipt ID
      user_id: rowData[1], // User ID
      user_wallet: rowData[2], // Wallet Address
      store_name: rowData[3], // Store Name
      purchase_amount: rowData[4], // Purchase Amount
      purchase_date: rowData[5], // Purchase Date
      status: status.toLowerCase(), // approved/rejected
      admin_notes: `Reviewed in Google Sheet row ${sheetRow}. Status: ${status}`,
      reviewer: Session.getActiveUser().getEmail(),
      review_timestamp: new Date().toISOString()
    };
    
    const options = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    console.log('Sending webhook to ReCircle:', payload);
    
    const response = UrlFetchApp.fetch(REPLIT_WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      console.log('Webhook sent successfully:', responseText);
      // Update status with checkmark
      SpreadsheetApp.getActiveSheet().getRange(sheetRow, 10).setValue(`✅ ${status}`);
    } else {
      console.error('Webhook failed:', responseCode, responseText);
      // Update status with error
      SpreadsheetApp.getActiveSheet().getRange(sheetRow, 10).setValue(`❌ ERROR`);
    }
    
  } catch (error) {
    console.error('Webhook error:', error);
    SpreadsheetApp.getActiveSheet().getRange(sheetRow, 10).setValue(`❌ ERROR`);
  }
}

/**
 * Manual approval functions (can be triggered by buttons)
 */
function approveRow(row) {
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(row, 10).setValue('APPROVED');
  SpreadsheetApp.getUi().alert('Receipt approved! Webhook sent to ReCircle.');
}

function rejectRow(row) {
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(row, 10).setValue('REJECTED'); 
  SpreadsheetApp.getUi().alert('Receipt rejected! Webhook sent to ReCircle.');
}

/**
 * Web app endpoint to receive new manual review requests from ReCircle
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Add new row with receipt data
    sheet.appendRow([
      data.receiptId || data.receipt_id || '',
      data.userId || data.user_id || '',
      data.walletAddress || data.wallet_address || '',
      data.storeName || data.store_name || '',
      data.purchaseAmount || data.purchase_amount || '',
      data.purchaseDate || data.purchase_date || '',
      data.receiptCategory || data.receipt_category || 'transportation',
      data.imageUrl || data.receipt_image || '', // Receipt image URL
      data.notes || data.admin_notes || 'Needs manual review',
      'PENDING', // Status
      '=HYPERLINK("#gid=0&range=J' + (sheet.getLastRow()) + '", "Click to Review")' // Actions
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Review request added to sheet'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing request:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function - can be run manually
 */
function testWebhook() {
  const testData = [
    'TEST-123', 'USER-456', '0x1234...', 'Eco Transit', 15.50, 
    '2025-09-21', 'public-transit', 'http://test-image.jpg', 
    'Test review', 'PENDING', 'Review'
  ];
  
  sendApprovalWebhook(testData, 'APPROVED', 2);
}