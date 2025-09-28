/**
 * RECEIPT VALIDATION & APPROVAL SYSTEM - VeBetterDAO Version
 * Google Apps Script for Recircle Rewards with VeBetterDAO Integration
 * Version: 4.0.0 - Updated for 70/30 Distribution Model
 * Date: May 25, 2025
 */

// Global configuration
const CONFIG = {
  // API Endpoints
  API_BASE_URL: "https://workspace.reign360.replit.app",  // Updated for VeBetterDAO system
  RECEIPT_APPROVAL_ENDPOINT: "/api/receipt-approved",
  
  // Sheet names
  RECEIPT_SHEET_NAME: "Receipt Submissions",
  MANUAL_REVIEW_SHEET_NAME: "Manual Review",
  
  // Default values
  DEFAULT_REWARD: 8,
  
  // Column name variations (case-insensitive)
  COLUMN_NAMES: {
    RECEIPT_ID: ["receiptid", "receipt id", "id", "receipt_id"],
    USER_ID: ["userid", "user id", "user_id"],
    USER_WALLET: ["userwallet", "wallet", "wallet address", "user_wallet"],
    STORE_NAME: ["storename", "store name", "store", "store_name"],
    PURCHASE_AMOUNT: ["purchaseamount", "purchase amount", "amount", "price", "purchase_amount", "total"],
    REWARD: ["reward", "estimated reward", "finalreward", "final reward", "estimated_reward", "basereward", "base reward"],
    STATUS: ["status", "approval status"],
    CONFIDENCE: ["confidence", "confidence score", "score", "confidence_score"],
    NOTES: ["notes", "admin notes", "comments", "admin_notes"],
    APPROVAL_DATE: ["approvaldate", "approval date", "approved date", "approval_date"]
  },
  
  // VeBetterDAO Distribution Model
  DISTRIBUTION_MODEL: {
    USER_PERCENTAGE: 70,    // 70% to user
    CREATOR_PERCENTAGE: 15, // 15% to creator fund
    APP_PERCENTAGE: 15      // 15% to app fund
  }
};

// Debug flag
const DEBUG = true;

// Debug logging helper
function debugLog(...args) {
  if (DEBUG) {
    Logger.log(...args);
  }
}

// Creates a custom menu when the spreadsheet is opened
function onOpen(e) {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🔄 Recircle Rewards - VeBetterDAO')
      .addItem('📋 Test API Connection', 'testApiConnection')
      .addItem('✅ Approve Receipt from Submissions', 'approveReceiptFromSubmissions')
      .addItem('📊 View Logs', 'viewLogs')
      .addToUi();
    
    debugLog('✅ VeBetterDAO Receipt Approval menu created successfully');
  } catch (error) {
    debugLog('❌ Error creating menu:', error.toString());
  }
}

// Test API connection to VeBetterDAO system
function testApiConnection() {
  try {
    debugLog('🔍 Testing VeBetterDAO API connection...');
    
    const testUrl = `${CONFIG.API_BASE_URL}/api/wallet-addresses`;
    
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Google-Apps-Script-VeBetterDAO/1.0'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(testUrl, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    debugLog(`Status Code: ${statusCode}`);
    debugLog(`Response: ${responseText}`);
    
    if (statusCode === 200) {
      const data = JSON.parse(responseText);
      debugLog('✅ VeBetterDAO API connection successful!');
      debugLog('Creator Fund Wallet:', data.creatorFundWallet);
      debugLog('App Fund Wallet:', data.appFundWallet);
      
      SpreadsheetApp.getUi().alert(
        '✅ VeBetterDAO Connection Successful!\n\n' +
        `Creator Fund: ${data.creatorFundWallet}\n` +
        `App Fund: ${data.appFundWallet}\n\n` +
        '70/30 Distribution Model Active'
      );
    } else {
      debugLog('❌ API connection failed');
      SpreadsheetApp.getUi().alert(`❌ API Connection Failed\nStatus: ${statusCode}\nResponse: ${responseText}`);
    }
    
  } catch (error) {
    debugLog('❌ Error testing API connection:', error.toString());
    SpreadsheetApp.getUi().alert(`❌ Connection Error: ${error.toString()}`);
  }
}

// View execution logs
function viewLogs() {
  const logs = Logger.getLog();
  if (logs) {
    SpreadsheetApp.getUi().alert(`📋 Execution Logs:\n\n${logs}`);
  } else {
    SpreadsheetApp.getUi().alert('📋 No logs available');
  }
}

// Get column indexes from header row
function getColumnIndexes(headerRow) {
  const indexes = {};
  
  Object.keys(CONFIG.COLUMN_NAMES).forEach(key => {
    indexes[key] = findColumnIndex(headerRow, CONFIG.COLUMN_NAMES[key]);
  });
  
  debugLog('📊 Column mapping:', indexes);
  return indexes;
}

// Find column index by multiple possible names
function findColumnIndex(headerRow, possibleNamesArray) {
  for (let i = 0; i < headerRow.length; i++) {
    const cellValue = String(headerRow[i]).toLowerCase().trim();
    if (possibleNamesArray.some(name => cellValue === name.toLowerCase())) {
      return i;
    }
  }
  return -1;
}

// Make API call to approve receipt with VeBetterDAO distribution
function approveReceiptViaApi(payload) {
  debugLog('🚀 Sending VeBetterDAO approval request with payload:', JSON.stringify(payload, null, 2));
  
  const url = `${CONFIG.API_BASE_URL}${CONFIG.RECEIPT_APPROVAL_ENDPOINT}`;
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Google-Apps-Script-VeBetterDAO/1.0'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    debugLog(`📡 VeBetterDAO API Response - Status: ${statusCode}`);
    debugLog(`📡 Response Text: ${responseText}`);
    
    if (statusCode === 200) {
      const result = JSON.parse(responseText);
      debugLog('✅ VeBetterDAO receipt approval successful:', result);
      
      // Log distribution details
      if (result.distribution) {
        debugLog('💰 Token Distribution:');
        debugLog(`  User (70%): ${result.distribution.userAmount} B3TR`);
        debugLog(`  Creator Fund (15%): ${result.distribution.creatorAmount} B3TR`);
        debugLog(`  App Fund (15%): ${result.distribution.appAmount} B3TR`);
      }
      
      return { success: true, data: result };
    } else {
      debugLog('❌ VeBetterDAO API call failed:', responseText);
      return { success: false, error: responseText, statusCode: statusCode };
    }
    
  } catch (error) {
    debugLog('❌ Exception during VeBetterDAO API call:', error.toString());
    return { success: false, error: error.toString() };
  }
}

// Main function to approve receipt from submissions sheet
function approveReceiptFromSubmissions() {
  try {
    debugLog('🎯 Starting VeBetterDAO receipt approval process...');
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(CONFIG.RECEIPT_SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.getSheetByName(CONFIG.MANUAL_REVIEW_SHEET_NAME);
    }
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Sheet not found. Please ensure you have either "Receipt Submissions" or "Manual Review" sheet.');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      SpreadsheetApp.getUi().alert('❌ No data found in sheet');
      return;
    }
    
    const headerRow = data[0];
    const columnIndexes = getColumnIndexes(headerRow);
    
    // Validate required columns exist
    if (columnIndexes.RECEIPT_ID === -1) {
      SpreadsheetApp.getUi().alert('❌ Receipt ID column not found. Please check column headers.');
      return;
    }
    
    // Find rows marked for approval
    let approvedCount = 0;
    let errorCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const statusIndex = columnIndexes.STATUS;
      
      if (statusIndex !== -1) {
        const status = String(row[statusIndex]).toLowerCase().trim();
        
        if (status === 'approved' || status === 'approve' || status === 'yes') {
          const receiptId = row[columnIndexes.RECEIPT_ID];
          const userId = columnIndexes.USER_ID !== -1 ? row[columnIndexes.USER_ID] : null;
          const userWallet = columnIndexes.USER_WALLET !== -1 ? row[columnIndexes.USER_WALLET] : null;
          const reward = columnIndexes.REWARD !== -1 ? row[columnIndexes.REWARD] : CONFIG.DEFAULT_REWARD;
          
          if (receiptId) {
            debugLog(`🎯 Processing receipt ${receiptId} for VeBetterDAO approval...`);
            
            const payload = {
              receipt_id: receiptId,
              user_id: userId,
              user_wallet: userWallet,
              estimated_reward: reward || CONFIG.DEFAULT_REWARD,
              approved_by: 'Google Sheets Admin',
              approval_source: 'google_sheets_vebetterdao',
              distribution_model: CONFIG.DISTRIBUTION_MODEL
            };
            
            const result = approveReceiptViaApi(payload);
            
            if (result.success) {
              // Update status to "Processed" and add approval date
              if (statusIndex !== -1) {
                sheet.getRange(i + 1, statusIndex + 1).setValue('Processed ✅');
              }
              if (columnIndexes.APPROVAL_DATE !== -1) {
                sheet.getRange(i + 1, columnIndexes.APPROVAL_DATE + 1).setValue(new Date());
              }
              if (columnIndexes.NOTES !== -1) {
                const distributionNote = `VeBetterDAO: 70% User, 15% Creator, 15% App`;
                sheet.getRange(i + 1, columnIndexes.NOTES + 1).setValue(distributionNote);
              }
              
              approvedCount++;
              debugLog(`✅ Receipt ${receiptId} approved successfully with VeBetterDAO distribution`);
            } else {
              errorCount++;
              debugLog(`❌ Failed to approve receipt ${receiptId}:`, result.error);
              
              if (statusIndex !== -1) {
                sheet.getRange(i + 1, statusIndex + 1).setValue('Error ❌');
              }
              if (columnIndexes.NOTES !== -1) {
                sheet.getRange(i + 1, columnIndexes.NOTES + 1).setValue(`Error: ${result.error}`);
              }
            }
          }
        }
      }
    }
    
    // Show summary
    const message = `🎉 VeBetterDAO Approval Complete!\n\n✅ Approved: ${approvedCount} receipts\n❌ Errors: ${errorCount} receipts\n\n💰 All approved receipts use 70/30 distribution model`;
    SpreadsheetApp.getUi().alert(message);
    debugLog(message);
    
  } catch (error) {
    debugLog('❌ Error in approveReceiptFromSubmissions:', error.toString());
    SpreadsheetApp.getUi().alert(`❌ Error: ${error.toString()}`);
  }
}