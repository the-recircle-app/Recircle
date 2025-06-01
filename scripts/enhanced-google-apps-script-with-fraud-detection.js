/**
 * ENHANCED RECEIPT VALIDATION & APPROVAL SYSTEM WITH FRAUD DETECTION
 * Google Apps Script for Recircle Rewards - Enhanced Version
 * Version: 4.0.0
 * Date: June 1, 2025
 * 
 * NEW FEATURES:
 * - Receipt image viewing for fraud detection
 * - Fraud flag alerts
 * - Enhanced approval process with image verification
 */

// Global configuration
const CONFIG = {
  // API Endpoints
  API_BASE_URL: "https://www.recirclerewards.app",
  RECEIPT_APPROVAL_ENDPOINT: "/api/receipt-approved",
  RECEIPT_IMAGE_ENDPOINT: "/api/receipts",  // NEW: For viewing receipt images
  
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
    APPROVAL_DATE: ["approvaldate", "approval date", "approved date", "approval_date"],
    // NEW: Fraud detection columns
    FRAUD_FLAGS: ["fraudflags", "fraud flags", "fraud_flags", "suspicious"],
    IMAGE_URL: ["imageurl", "image url", "image_url", "receipt image"],
    HAS_IMAGE: ["hasimage", "has image", "has_image"]
  },
  
  // Special options
  HTML_MODE: true
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
    
    // Create main menu
    ui.createMenu('🔄 Recircle Rewards')
      .addItem('📋 Approve Selected Receipt', 'approveReceiptFromSubmissions')
      .addSeparator()
      .addItem('🔍 View Receipt Image', 'viewReceiptImage')  // NEW
      .addItem('⚠️ Check Fraud Flags', 'checkFraudFlags')    // NEW
      .addSeparator()
      .addItem('🧪 Test API Connection', 'testApiConnection')
      .addItem('📊 View Debug Logs', 'viewLogs')
      .addToUi();
    
    debugLog("Custom menu created successfully");
  } catch (error) {
    debugLog("Error creating menu: " + error.toString());
  }
}

// NEW: View receipt image for fraud detection
function viewReceiptImage() {
  try {
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSheet();
    const activeRange = sheet.getActiveRange();
    const row = activeRange.getRow();
    
    if (row <= 1) {
      ui.alert('Invalid Selection', 'Please select a receipt row (not the header)', ui.ButtonSet.OK);
      return;
    }
    
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const columnIndexes = getColumnIndexes(headerRow);
    
    if (!columnIndexes.receiptId) {
      ui.alert('Missing Data', 'Receipt ID column not found', ui.ButtonSet.OK);
      return;
    }
    
    const receiptId = sheet.getRange(row, columnIndexes.receiptId + 1).getValue();
    
    if (!receiptId) {
      ui.alert('No Receipt ID', 'Please select a row with a valid receipt ID', ui.ButtonSet.OK);
      return;
    }
    
    // Fetch receipt image
    const imageUrl = `${CONFIG.API_BASE_URL}${CONFIG.RECEIPT_IMAGE_ENDPOINT}/${receiptId}/image`;
    
    try {
      const response = UrlFetchApp.fetch(imageUrl, {
        method: 'GET',
        muteHttpExceptions: true,
        validateHttpsCertificates: false
      });
      
      if (response.getResponseCode() === 200) {
        const imageData = JSON.parse(response.getContentText());
        
        if (imageData.success && imageData.image) {
          // Show fraud flags if any
          let fraudAlert = '';
          if (imageData.image.fraudFlags && imageData.image.fraudFlags.length > 0) {
            fraudAlert = `\n\n⚠️ FRAUD ALERTS:\n${imageData.image.fraudFlags.join('\n')}`;
          }
          
          // Create HTML dialog with image
          const htmlContent = `
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .fraud-alert { background-color: #ffebee; border: 1px solid #f44336; padding: 10px; margin: 10px 0; border-radius: 4px; }
                  .image-container { text-align: center; margin: 20px 0; }
                  img { max-width: 100%; height: auto; border: 1px solid #ddd; }
                </style>
              </head>
              <body>
                <h2>Receipt #${receiptId} Image Review</h2>
                ${imageData.image.fraudFlags && imageData.image.fraudFlags.length > 0 ? 
                  `<div class="fraud-alert">
                    <strong>⚠️ FRAUD INDICATORS DETECTED:</strong><br>
                    ${imageData.image.fraudFlags.join('<br>')}
                  </div>` : ''}
                <div class="image-container">
                  <img src="${imageData.image.imageData}" alt="Receipt Image">
                </div>
                <p><strong>File Size:</strong> ${Math.round(imageData.image.fileSize / 1024)} KB</p>
                <p><strong>Uploaded:</strong> ${new Date(imageData.image.uploadedAt).toLocaleString()}</p>
              </body>
            </html>
          `;
          
          const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
            .setWidth(600)
            .setHeight(700);
          
          ui.showModalDialog(htmlOutput, `Receipt #${receiptId} Image`);
        } else {
          ui.alert('No Image', 'No image found for this receipt', ui.ButtonSet.OK);
        }
      } else {
        ui.alert('Image Not Found', `Could not retrieve image for receipt #${receiptId}`, ui.ButtonSet.OK);
      }
    } catch (fetchError) {
      ui.alert('Connection Error', `Could not fetch image: ${fetchError}`, ui.ButtonSet.OK);
    }
    
  } catch (error) {
    debugLog("Error in viewReceiptImage: " + error.toString());
  }
}

// NEW: Check fraud flags for selected receipt
function checkFraudFlags() {
  try {
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSheet();
    const activeRange = sheet.getActiveRange();
    const row = activeRange.getRow();
    
    if (row <= 1) {
      ui.alert('Invalid Selection', 'Please select a receipt row (not the header)', ui.ButtonSet.OK);
      return;
    }
    
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const columnIndexes = getColumnIndexes(headerRow);
    
    // Check if fraud flags column exists
    if (columnIndexes.fraudFlags) {
      const fraudFlags = sheet.getRange(row, columnIndexes.fraudFlags + 1).getValue();
      
      if (fraudFlags && fraudFlags.length > 0) {
        ui.alert(
          '⚠️ FRAUD ALERT',
          `Suspicious indicators detected:\n\n${Array.isArray(fraudFlags) ? fraudFlags.join('\n') : fraudFlags}`,
          ui.ButtonSet.OK
        );
      } else {
        ui.alert('No Fraud Flags', 'No suspicious indicators detected for this receipt', ui.ButtonSet.OK);
      }
    } else {
      ui.alert('Column Not Found', 'Fraud flags column not found in this sheet', ui.ButtonSet.OK);
    }
    
  } catch (error) {
    debugLog("Error in checkFraudFlags: " + error.toString());
  }
}

// Enhanced approval function with fraud detection warnings
function approveReceiptFromSubmissions() {
  try {
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSheet();
    const activeRange = sheet.getActiveRange();
    const row = activeRange.getRow();
    
    if (row <= 1) {
      ui.alert('Invalid Selection', 'Please select a receipt row to approve (not the header row)', ui.ButtonSet.OK);
      return;
    }
    
    // Get header row to map column names
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const columnIndexes = getColumnIndexes(headerRow);
    
    debugLog("Column mapping:", JSON.stringify(columnIndexes));
    
    // Validate required columns exist
    if (!columnIndexes.receiptId || !columnIndexes.userId) {
      ui.alert('Missing Required Columns', 'Receipt ID and User ID columns are required for approval', ui.ButtonSet.OK);
      return;
    }
    
    // Get row data
    const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Extract data using column mapping
    const receiptId = rowData[columnIndexes.receiptId];
    const userId = rowData[columnIndexes.userId];
    const userWallet = rowData[columnIndexes.userWallet] || "";
    const storeName = rowData[columnIndexes.storeName] || "";
    const purchaseAmount = rowData[columnIndexes.purchaseAmount] || 0;
    const estimatedReward = rowData[columnIndexes.reward] || CONFIG.DEFAULT_REWARD;
    const fraudFlags = rowData[columnIndexes.fraudFlags] || [];
    
    // NEW: Check for fraud flags before approval
    if (fraudFlags && fraudFlags.length > 0) {
      const fraudWarning = Array.isArray(fraudFlags) ? fraudFlags.join('\n') : fraudFlags;
      const confirmApproval = ui.alert(
        '⚠️ FRAUD WARNING',
        `This receipt has suspicious indicators:\n\n${fraudWarning}\n\nDo you still want to approve this receipt?`,
        ui.ButtonSet.YES_NO
      );
      
      if (confirmApproval !== ui.Button.YES) {
        ui.alert('Approval Cancelled', 'Receipt approval was cancelled due to fraud concerns', ui.ButtonSet.OK);
        return;
      }
    }
    
    // Validate required data
    if (!receiptId || !userId) {
      ui.alert('Missing Data', 'Receipt ID and User ID are required for approval', ui.ButtonSet.OK);
      return;
    }
    
    // Call the approval API
    const approvalResult = approveReceiptViaApi({
      receipt_id: receiptId,
      user_id: userId,
      user_wallet: userWallet,
      store_name: storeName,
      purchase_amount: purchaseAmount,
      estimated_reward: estimatedReward,
      admin_notes: `Approved from Google Sheet after fraud review`
    });
    
    if (approvalResult && approvalResult.success) {
      // Update the status column if it exists
      if (columnIndexes.status !== undefined) {
        sheet.getRange(row, columnIndexes.status + 1).setValue("approved");
      }
      
      // Update approval date if column exists
      if (columnIndexes.approvalDate !== undefined) {
        sheet.getRange(row, columnIndexes.approvalDate + 1).setValue(new Date());
      }
      
      ui.alert(
        '✅ Success',
        `Receipt approved successfully!\n\nReward: ${approvalResult.reward} tokens\nNew Balance: ${approvalResult.newBalance}`,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        '❌ Failed',
        `Failed to approve receipt: ${approvalResult ? approvalResult.message : 'Unknown error'}`,
        ui.ButtonSet.OK
      );
    }
    
  } catch (error) {
    debugLog("Error in approveReceiptFromSubmissions: " + error.toString());
    SpreadsheetApp.getUi().alert('Error', 'An error occurred: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// Rest of the functions remain the same as your current script
function testApiConnection() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    debugLog("Testing API connection to: " + CONFIG.API_BASE_URL);
    
    try {
      const testUrl = CONFIG.API_BASE_URL + "/api/wallet-addresses";
      const apiResponse = UrlFetchApp.fetch(testUrl, {
        method: "get",
        muteHttpExceptions: true,
        validateHttpsCertificates: false
      });
      
      const statusCode = apiResponse.getResponseCode();
      const responseText = apiResponse.getContentText().substring(0, 500);
      
      debugLog(`API response status: ${statusCode}`);
      debugLog(`Response text: ${responseText}`);
      
      ui.alert(
        `API Test Result (${statusCode})`,
        `Connection to ${CONFIG.API_BASE_URL} returned:\n\nStatus: ${statusCode}\n\nResponse: ${responseText}\n\nCheck the debug logs for more details.`,
        ui.ButtonSet.OK
      );
    } catch (fetchError) {
      debugLog("Fetch error: " + fetchError);
      
      ui.alert(
        '❌ Connection Failed',
        `Could not connect to ${CONFIG.API_BASE_URL}\n\nError: ${fetchError.toString()}\n\nPlease verify the URL is correct and the server is running.`,
        ui.ButtonSet.OK
      );
    }
  } catch (error) {
    debugLog("Error in testApiConnection: " + error.toString());
  }
}

function viewLogs() {
  try {
    const ui = SpreadsheetApp.getUi();
    const logs = Logger.getLog();
    
    if (!logs) {
      ui.alert("No logs found", "No logs have been generated yet. Try performing an action first.", ui.ButtonSet.OK);
      return;
    }
    
    const logLines = logs.split("\n");
    const recentLogs = logLines.slice(Math.max(0, logLines.length - 50)).join("\n");
    
    const htmlOutput = HtmlService
      .createHtmlOutput(`
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              pre { background-color: #f5f5f5; padding: 15px; border-radius: 4px; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h2>Debug Logs</h2>
            <pre>${recentLogs}</pre>
          </body>
        </html>
      `)
      .setWidth(800)
      .setHeight(600);
      
    ui.showModalDialog(htmlOutput, "Debug Logs");
  } catch (error) {
    debugLog("Error in viewLogs: " + error.toString());
  }
}

function getColumnIndexes(headerRow) {
  const indexes = {};
  
  for (let i = 0; i < headerRow.length; i++) {
    const header = String(headerRow[i]).toLowerCase().trim();
    
    // Map each column type
    Object.keys(CONFIG.COLUMN_NAMES).forEach(key => {
      const variations = CONFIG.COLUMN_NAMES[key];
      if (variations.includes(header)) {
        const keyName = key.toLowerCase().replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        indexes[keyName] = i;
      }
    });
  }
  
  return indexes;
}

function findColumnIndex(headerRow, possibleNamesArray) {
  for (let i = 0; i < headerRow.length; i++) {
    const header = String(headerRow[i]).toLowerCase().trim();
    for (const name of possibleNamesArray) {
      if (header === name.toLowerCase()) {
        return i;
      }
    }
  }
  return -1;
}

function approveReceiptViaApi(payload) {
  try {
    debugLog("Starting receipt approval process");
    debugLog("Input payload: " + JSON.stringify(payload));
    
    const formattedPayload = {
      receipt_id: String(payload.receipt_id || ""),
      user_id: Number(payload.user_id || 0),
      user_wallet: String(payload.user_wallet || ""),
      store_name: String(payload.store_name || ""),
      purchase_amount: Number(parseFloat(payload.purchase_amount || 0).toFixed(2)),
      estimated_reward: Number(parseFloat(payload.estimated_reward || CONFIG.DEFAULT_REWARD).toFixed(2)),
      status: "approved",
      admin_notes: String(payload.admin_notes || "Approved from Google Sheet with fraud review")
    };
    
    debugLog("Sending approval request with formatted payload: " + JSON.stringify(formattedPayload));
    
    const apiUrl = CONFIG.API_BASE_URL + CONFIG.RECEIPT_APPROVAL_ENDPOINT;
    debugLog("API URL: " + apiUrl);
    
    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(formattedPayload),
      muteHttpExceptions: true,
      validateHttpsCertificates: false,
      headers: {
        "Accept": "application/json"
      }
    };
    
    debugLog("Making API request to: " + apiUrl);
    
    const apiResponse = UrlFetchApp.fetch(apiUrl, options);
    const statusCode = apiResponse.getResponseCode();
    const responseText = apiResponse.getContentText();
    
    debugLog("API response status: " + statusCode);
    debugLog("API response text: " + responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""));
    
    if (statusCode >= 200 && statusCode < 300) {
      try {
        const jsonResponse = JSON.parse(responseText);
        return {
          success: true,
          message: jsonResponse.message || "Receipt approved successfully",
          reward: jsonResponse.reward || jsonResponse.receiptReward || jsonResponse.receipt_reward || formattedPayload.estimated_reward,
          newBalance: jsonResponse.newBalance || jsonResponse.new_balance || "updated"
        };
      } catch (parseError) {
        debugLog("Could not parse JSON response but status code indicates success: " + parseError);
        return {
          success: true,
          message: "Receipt approved successfully",
          reward: formattedPayload.estimated_reward,
          newBalance: "updated"
        };
      }
    } else {
      debugLog("API request failed with status: " + statusCode);
      return {
        success: false,
        message: "API request failed with status " + statusCode + ": " + responseText
      };
    }
    
  } catch (error) {
    debugLog("Error in approveReceiptViaApi: " + error.toString());
    return {
      success: false,
      message: "Error: " + error.toString()
    };
  }
}
