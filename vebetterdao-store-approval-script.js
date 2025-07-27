/**
 * STORE SUBMISSION & APPROVAL SYSTEM - VeBetterDAO Version
 * Google Apps Script for Recircle Rewards Store Approvals
 * Version: 1.0.0 - New Store Approval System with VeBetterDAO Integration
 * Date: May 25, 2025
 */

// Global configuration
const CONFIG = {
  // API Endpoints
  API_BASE_URL: "https://recircle-app.replit.app",  // VeBetterDAO system endpoint
  STORE_APPROVAL_ENDPOINT: "/api/store-approved",
  
  // Sheet names
  STORE_SUBMISSIONS_SHEET_NAME: "Store Submissions",
  STORE_APPROVALS_SHEET_NAME: "Store Approvals",
  
  // Default reward for store submissions
  DEFAULT_STORE_REWARD: 5,
  
  // Column name variations (case-insensitive)
  COLUMN_NAMES: {
    STORE_NAME: ["storename", "store name", "store", "store_name", "business name"],
    STORE_ADDRESS: ["storeaddress", "store address", "address", "store_address", "location"],
    STORE_TYPE: ["storetype", "store type", "type", "store_type", "category"],
    USER_WALLET: ["userwallet", "wallet", "wallet address", "user_wallet", "submitter wallet"],
    USER_ID: ["userid", "user id", "user_id", "submitter id"],
    SUBMISSION_DATE: ["submissiondate", "submission date", "date submitted", "submission_date", "timestamp"],
    STATUS: ["status", "approval status", "approved"],
    REWARD: ["reward", "store reward", "tokens", "submission reward"],
    NOTES: ["notes", "admin notes", "comments", "admin_notes", "review notes"],
    APPROVAL_DATE: ["approvaldate", "approval date", "approved date", "approval_date"],
    CONTACT_INFO: ["contact", "contact info", "email", "phone", "contact_info"]
  },
  
  // VeBetterDAO Distribution Model for Store Submissions
  DISTRIBUTION_MODEL: {
    USER_PERCENTAGE: 70,    // 70% to user who submitted store
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
    ui.createMenu('🏪 Store Approvals - VeBetterDAO')
      .addItem('📋 Test API Connection', 'testApiConnection')
      .addItem('✅ Approve Stores from Submissions', 'approveStoresFromSubmissions')
      .addItem('🔍 Find Pending Stores', 'findPendingStores')
      .addItem('📊 View Logs', 'viewLogs')
      .addToUi();
    
    debugLog('✅ VeBetterDAO Store Approval menu created successfully');
  } catch (error) {
    debugLog('❌ Error creating store menu:', error.toString());
  }
}

// Test API connection to VeBetterDAO system
function testApiConnection() {
  try {
    debugLog('🔍 Testing VeBetterDAO Store API connection...');
    
    const testUrl = `${CONFIG.API_BASE_URL}/api/wallet-addresses`;
    
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Google-Apps-Script-Store-VeBetterDAO/1.0'
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
      debugLog('✅ VeBetterDAO Store API connection successful!');
      debugLog('Creator Fund Wallet:', data.creatorFundWallet);
      debugLog('App Fund Wallet:', data.appFundWallet);
      
      SpreadsheetApp.getUi().alert(
        '✅ VeBetterDAO Store System Connected!\n\n' +
        `Creator Fund: ${data.creatorFundWallet}\n` +
        `App Fund: ${data.appFundWallet}\n\n` +
        '70/30 Distribution Model Active for Store Rewards'
      );
    } else {
      debugLog('❌ Store API connection failed');
      SpreadsheetApp.getUi().alert(`❌ Store API Connection Failed\nStatus: ${statusCode}\nResponse: ${responseText}`);
    }
    
  } catch (error) {
    debugLog('❌ Error testing store API connection:', error.toString());
    SpreadsheetApp.getUi().alert(`❌ Store Connection Error: ${error.toString()}`);
  }
}

// View execution logs
function viewLogs() {
  const logs = Logger.getLog();
  if (logs) {
    SpreadsheetApp.getUi().alert(`📋 Store Approval Logs:\n\n${logs}`);
  } else {
    SpreadsheetApp.getUi().alert('📋 No store logs available');
  }
}

// Get column indexes from header row
function getColumnIndexes(headerRow) {
  const indexes = {};
  
  Object.keys(CONFIG.COLUMN_NAMES).forEach(key => {
    indexes[key] = findColumnIndex(headerRow, CONFIG.COLUMN_NAMES[key]);
  });
  
  debugLog('📊 Store column mapping:', indexes);
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

// Make API call to approve store with VeBetterDAO distribution
function approveStoreViaApi(payload) {
  debugLog('🚀 Sending VeBetterDAO store approval request with payload:', JSON.stringify(payload, null, 2));
  
  const url = `${CONFIG.API_BASE_URL}${CONFIG.STORE_APPROVAL_ENDPOINT}`;
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Google-Apps-Script-Store-VeBetterDAO/1.0'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    debugLog(`📡 VeBetterDAO Store API Response - Status: ${statusCode}`);
    debugLog(`📡 Store Response Text: ${responseText}`);
    
    if (statusCode === 200) {
      const result = JSON.parse(responseText);
      debugLog('✅ VeBetterDAO store approval successful:', result);
      
      // Log distribution details
      if (result.distribution) {
        debugLog('💰 Store Reward Distribution:');
        debugLog(`  User (70%): ${result.distribution.userAmount} B3TR`);
        debugLog(`  Creator Fund (15%): ${result.distribution.creatorAmount} B3TR`);
        debugLog(`  App Fund (15%): ${result.distribution.appAmount} B3TR`);
      }
      
      return { success: true, data: result };
    } else {
      debugLog('❌ VeBetterDAO Store API call failed:', responseText);
      return { success: false, error: responseText, statusCode: statusCode };
    }
    
  } catch (error) {
    debugLog('❌ Exception during VeBetterDAO Store API call:', error.toString());
    return { success: false, error: error.toString() };
  }
}

// Find stores pending approval
function findPendingStores() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(CONFIG.STORE_SUBMISSIONS_SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.getSheetByName(CONFIG.STORE_APPROVALS_SHEET_NAME);
    }
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Store sheet not found. Please ensure you have either "Store Submissions" or "Store Approvals" sheet.');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      SpreadsheetApp.getUi().alert('❌ No store data found in sheet');
      return;
    }
    
    const headerRow = data[0];
    const columnIndexes = getColumnIndexes(headerRow);
    
    let pendingStores = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const statusIndex = columnIndexes.STATUS;
      const storeNameIndex = columnIndexes.STORE_NAME;
      
      if (statusIndex !== -1 && storeNameIndex !== -1) {
        const status = String(row[statusIndex]).toLowerCase().trim();
        const storeName = String(row[storeNameIndex]).trim();
        
        if (!status || status === 'pending' || status === 'submitted' || status === '') {
          pendingStores.push(`Row ${i + 1}: ${storeName}`);
        }
      }
    }
    
    if (pendingStores.length > 0) {
      SpreadsheetApp.getUi().alert(`🔍 Found ${pendingStores.length} pending stores:\n\n${pendingStores.join('\n')}`);
    } else {
      SpreadsheetApp.getUi().alert('✅ No pending stores found - all stores have been processed!');
    }
    
  } catch (error) {
    debugLog('❌ Error finding pending stores:', error.toString());
    SpreadsheetApp.getUi().alert(`❌ Error: ${error.toString()}`);
  }
}

// Main function to approve stores from submissions sheet
function approveStoresFromSubmissions() {
  try {
    debugLog('🎯 Starting VeBetterDAO store approval process...');
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(CONFIG.STORE_SUBMISSIONS_SHEET_NAME);
    
    if (!sheet) {
      sheet = spreadsheet.getSheetByName(CONFIG.STORE_APPROVALS_SHEET_NAME);
    }
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Store sheet not found. Please ensure you have either "Store Submissions" or "Store Approvals" sheet.');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      SpreadsheetApp.getUi().alert('❌ No store data found in sheet');
      return;
    }
    
    const headerRow = data[0];
    const columnIndexes = getColumnIndexes(headerRow);
    
    // Validate required columns exist
    if (columnIndexes.STORE_NAME === -1) {
      SpreadsheetApp.getUi().alert('❌ Store Name column not found. Please check column headers.');
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
          const storeName = row[columnIndexes.STORE_NAME];
          const storeAddress = columnIndexes.STORE_ADDRESS !== -1 ? row[columnIndexes.STORE_ADDRESS] : '';
          const storeType = columnIndexes.STORE_TYPE !== -1 ? row[columnIndexes.STORE_TYPE] : 'thrift_store';
          const userId = columnIndexes.USER_ID !== -1 ? row[columnIndexes.USER_ID] : null;
          const userWallet = columnIndexes.USER_WALLET !== -1 ? row[columnIndexes.USER_WALLET] : null;
          const reward = columnIndexes.REWARD !== -1 ? row[columnIndexes.REWARD] : CONFIG.DEFAULT_STORE_REWARD;
          
          if (storeName) {
            debugLog(`🎯 Processing store "${storeName}" for VeBetterDAO approval...`);
            
            const payload = {
              store_name: storeName,
              store_address: storeAddress,
              store_type: storeType,
              user_id: userId,
              user_wallet: userWallet,
              reward_amount: reward || CONFIG.DEFAULT_STORE_REWARD,
              approved_by: 'Google Sheets Admin',
              approval_source: 'google_sheets_store_vebetterdao',
              distribution_model: CONFIG.DISTRIBUTION_MODEL
            };
            
            const result = approveStoreViaApi(payload);
            
            if (result.success) {
              // Update status to "Processed" and add approval date
              if (statusIndex !== -1) {
                sheet.getRange(i + 1, statusIndex + 1).setValue('Processed ✅');
              }
              if (columnIndexes.APPROVAL_DATE !== -1) {
                sheet.getRange(i + 1, columnIndexes.APPROVAL_DATE + 1).setValue(new Date());
              }
              if (columnIndexes.NOTES !== -1) {
                const distributionNote = `VeBetterDAO Store: 70% User, 15% Creator, 15% App`;
                sheet.getRange(i + 1, columnIndexes.NOTES + 1).setValue(distributionNote);
              }
              
              approvedCount++;
              debugLog(`✅ Store "${storeName}" approved successfully with VeBetterDAO distribution`);
            } else {
              errorCount++;
              debugLog(`❌ Failed to approve store "${storeName}":`, result.error);
              
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
    const message = `🎉 VeBetterDAO Store Approval Complete!\n\n✅ Approved: ${approvedCount} stores\n❌ Errors: ${errorCount} stores\n\n💰 All approved stores use 70/30 distribution model`;
    SpreadsheetApp.getUi().alert(message);
    debugLog(message);
    
  } catch (error) {
    debugLog('❌ Error in approveStoresFromSubmissions:', error.toString());
    SpreadsheetApp.getUi().alert(`❌ Error: ${error.toString()}`);
  }
}