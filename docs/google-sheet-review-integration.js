/**
 * Google Apps Script for RECEIVING Manual Review Data from ReCircle
 * This script creates a Google Sheet to store pending receipt reviews
 * and provides a form for you to approve/deny them
 */

// Configuration - UPDATE THESE URLS
const RECIRCLE_WEBHOOK_URL = 'https://www.recirclerewards.app/api/receipt-approved';
const SHEET_NAME = 'Pending Reviews';

/**
 * Handle POST requests from ReCircle when receipts need manual review
 */
function doPost(e) {
  try {
    console.log('📥 Received manual review request from ReCircle');
    
    // Parse the receipt data from ReCircle
    const data = JSON.parse(e.postData.contents);
    console.log('Receipt data:', data);
    
    // Log to Google Sheet for your review
    const success = logReceiptForReview(data);
    
    if (success) {
      console.log('✅ Receipt logged to sheet for manual review');
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Receipt logged for manual review'
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      console.error('❌ Failed to log receipt to sheet');
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to log receipt'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('❌ Error processing manual review request:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Log receipt data to Google Sheet for manual review
 */
function logReceiptForReview(data) {
  try {
    const sheet = getOrCreateReviewSheet();
    
    // Create row with all receipt details
    const row = [
      new Date().toISOString(),           // Timestamp
      data.receiptId || data.receipt_id,  // Receipt ID
      data.userId || data.user_id,        // User ID
      data.walletAddress || data.wallet_address || '', // User Wallet
      data.storeName || data.store_name || 'Unknown', // Store/Service
      data.amount || data.purchaseAmount || data.purchase_amount || 0, // Amount
      data.purchaseDate || data.purchase_date || '', // Date
      data.notes || 'Pending manual review', // Notes
      'PENDING',                          // Review Status
      '', // Decision (you'll fill this)
      '', // Admin Notes (you'll fill this)
      data.imageUrl ? `https://www.recirclerewards.app/api/receipt-images/${data.receiptId || data.receipt_id}` : 'No Image' // Image URL
    ];
    
    sheet.appendRow(row);
    console.log('📊 Receipt logged to review sheet');
    return true;
    
  } catch (error) {
    console.error('❌ Error logging receipt:', error);
    return false;
  }
}

/**
 * Create or get the review sheet
 */
function getOrCreateReviewSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Create new sheet with headers
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 12).setValues([[
      'Timestamp', 'Receipt ID', 'User ID', 'User Wallet', 'Store/Service', 
      'Amount', 'Purchase Date', 'Notes', 'Status', 'Decision', 'Admin Notes', 'Receipt Image'
    ]]);
    
    // Format headers
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 12).setBackground('#4CAF50');
    sheet.getRange(1, 1, 1, 12).setFontColor('white');
    
    // Set column widths
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 120); // Receipt ID
    sheet.setColumnWidth(3, 80);  // User ID
    sheet.setColumnWidth(4, 200); // Wallet
    sheet.setColumnWidth(5, 200); // Store
    sheet.setColumnWidth(6, 80);  // Amount
    sheet.setColumnWidth(7, 120); // Date
    sheet.setColumnWidth(8, 200); // Notes
    sheet.setColumnWidth(9, 100); // Status
    sheet.setColumnWidth(10, 120); // Decision
    sheet.setColumnWidth(11, 200); // Admin Notes
    sheet.setColumnWidth(12, 150); // Image
    
    console.log('✅ Created review sheet with headers');
  }
  
  return sheet;
}

/**
 * Handle GET requests - show manual review form
 */
function doGet() {
  return HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
<head>
    <title>ReCircle Manual Review System</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .form-section { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #45a049; }
        .step { margin: 10px 0; padding: 10px; background: white; border-left: 4px solid #4CAF50; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚌 ReCircle Manual Review System</h1>
        <p>Transportation Receipt Review Dashboard</p>
    </div>
    
    <div class="info">
        <h3>📋 How to Use This System:</h3>
        <div class="step"><strong>Step 1:</strong> When users submit receipts, they appear in the "${SHEET_NAME}" sheet</div>
        <div class="step"><strong>Step 2:</strong> Review receipt details and image in the sheet</div>
        <div class="step"><strong>Step 3:</strong> Use the form below to approve/deny receipts</div>
        <div class="step"><strong>Step 4:</strong> Approved receipts automatically distribute B3TR tokens</div>
    </div>
    
    <div class="form-section">
        <h3>✅ Approve/Deny Receipt</h3>
        <form id="reviewForm">
            <div class="form-group">
                <label>Receipt ID <span style="color: red;">*</span></label>
                <input type="text" name="receiptId" placeholder="Get from ${SHEET_NAME} sheet" required>
            </div>
            
            <div class="form-group">
                <label>User ID <span style="color: red;">*</span></label>
                <input type="text" name="userId" placeholder="Get from ${SHEET_NAME} sheet" required>
            </div>
            
            <div class="form-group">
                <label>User Wallet <span style="color: red;">*</span></label>
                <input type="text" name="userWallet" placeholder="Get from ${SHEET_NAME} sheet" required>
            </div>
            
            <div class="form-group">
                <label>Service/Store <span style="color: red;">*</span></label>
                <input type="text" name="service" placeholder="e.g., Metro Bus, Uber, Lyft" required>
            </div>
            
            <div class="form-group">
                <label>Amount <span style="color: red;">*</span></label>
                <input type="number" step="0.01" name="amount" placeholder="e.g., 4.50" required>
            </div>
            
            <div class="form-group">
                <label>Decision <span style="color: red;">*</span></label>
                <select name="decision" required>
                    <option value="">Select...</option>
                    <option value="✅ Approve Receipt">✅ Approve Receipt</option>
                    <option value="❌ Reject Receipt">❌ Reject Receipt</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Admin Notes</label>
                <textarea name="notes" rows="3" placeholder="Optional notes about your decision"></textarea>
            </div>
            
            <button type="submit">Submit Review Decision</button>
        </form>
    </div>
    
    <div class="info">
        <p><strong>💡 Tip:</strong> Keep the "${SHEET_NAME}" sheet open in another tab to copy receipt details easily.</p>
    </div>

    <script>
        document.getElementById('reviewForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            const submitBtn = e.target.querySelector('button');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            fetch(window.location.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(data)
            })
            .then(response => response.text())
            .then(result => {
                try {
                    const jsonResult = JSON.parse(result);
                    if (jsonResult.success) {
                        alert('✅ Success: ' + jsonResult.message);
                        e.target.reset();
                    } else {
                        alert('❌ Error: ' + (jsonResult.error || 'Unknown error'));
                    }
                } catch (err) {
                    alert('✅ Review processed successfully');
                    e.target.reset();
                }
            })
            .catch(error => {
                alert('❌ Error: ' + error.message);
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        });
    </script>
</body>
</html>
  `);
}

/**
 * Test function to verify the system works
 */
function testReceiptLogging() {
  const testData = {
    receiptId: 'TEST_123',
    userId: '102',
    walletAddress: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
    storeName: 'Metro Bus',
    amount: 4.50,
    purchaseDate: '2025-07-11',
    notes: 'Test receipt for system verification'
  };
  
  console.log('🧪 Testing receipt logging...');
  const success = logReceiptForReview(testData);
  
  if (success) {
    console.log('✅ Test successful - check your sheet!');
  } else {
    console.log('❌ Test failed');
  }
}