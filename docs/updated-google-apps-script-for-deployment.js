/**
 * UPDATED Google Apps Script for ReCircle Transportation Receipt Review
 * Updated for new deployment - January 2025
 */

// ReCircle webhook URL - NEW DEPLOYMENT
const WEBHOOK_URL = 'https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/api/receipt-approved';

/**
 * Handle GET requests - show the review form
 */
function doGet() {
  return HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
<head>
    <title>ReCircle Transportation Receipt Review</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px; 
            background: #f5f5f5;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h2 { 
            color: #2196F3; 
            margin-bottom: 20px; 
            text-align: center;
        }
        .form-group { 
            margin-bottom: 15px; 
        }
        label { 
            display: block; 
            margin-bottom: 5px; 
            font-weight: bold; 
            color: #333;
        }
        input, select, textarea { 
            width: 100%; 
            padding: 10px; 
            border: 1px solid #ddd; 
            border-radius: 4px; 
            font-size: 14px;
            box-sizing: border-box;
        }
        button { 
            background: #4CAF50; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 16px;
            width: 100%;
        }
        button:hover { 
            background: #45a049; 
        }
        .required { 
            color: red; 
        }
        .status { 
            padding: 10px; 
            margin: 10px 0; 
            border-radius: 4px; 
            display: none;
        }
        .success { 
            background: #d4edda; 
            color: #155724; 
            border: 1px solid #c3e6cb;
        }
        .error { 
            background: #f8d7da; 
            color: #721c24; 
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>🚲 ReCircle Transportation Receipt Review</h2>
        <div id="status" class="status"></div>
        
        <form id="reviewForm">
            <div class="form-group">
                <label>Receipt ID <span class="required">*</span></label>
                <input type="text" name="receiptId" required placeholder="e.g., receipt_123">
            </div>
            
            <div class="form-group">
                <label>User ID <span class="required">*</span></label>
                <input type="number" name="userId" required placeholder="e.g., 103">
            </div>
            
            <div class="form-group">
                <label>User Wallet Address <span class="required">*</span></label>
                <input type="text" name="userWallet" placeholder="0x..." required>
            </div>
            
            <div class="form-group">
                <label>Transportation Service <span class="required">*</span></label>
                <input type="text" name="service" required placeholder="e.g., Uber, Lyft, Metro">
            </div>
            
            <div class="form-group">
                <label>Amount ($) <span class="required">*</span></label>
                <input type="number" step="0.01" name="amount" required placeholder="e.g., 25.50">
            </div>
            
            <div class="form-group">
                <label>Review Decision <span class="required">*</span></label>
                <select name="decision" required>
                    <option value="">Choose decision...</option>
                    <option value="✅ Approve Receipt">✅ Approve Receipt</option>
                    <option value="❌ Reject Receipt">❌ Reject Receipt</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Admin Notes</label>
                <textarea name="notes" rows="3" placeholder="Optional review notes..."></textarea>
            </div>
            
            <button type="submit">Submit Review</button>
        </form>
    </div>

    <script>
        document.getElementById('reviewForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Show loading state
            const button = e.target.querySelector('button');
            const status = document.getElementById('status');
            button.disabled = true;
            button.textContent = 'Processing...';
            
            // Send to Apps Script
            fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    status.className = 'status success';
                    status.textContent = '✅ ' + result.message;
                    status.style.display = 'block';
                    e.target.reset();
                } else {
                    status.className = 'status error';
                    status.textContent = '❌ Error: ' + (result.error || 'Unknown error');
                    status.style.display = 'block';
                }
            })
            .catch(error => {
                status.className = 'status error';
                status.textContent = '❌ Error: ' + error.message;
                status.style.display = 'block';
            })
            .finally(() => {
                button.disabled = false;
                button.textContent = 'Submit Review';
            });
        });
    </script>
</body>
</html>
  `);
}

/**
 * Handle POST requests - process form submissions
 */
function doPost(e) {
  try {
    console.log('📝 Manual review request received...');
    
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    
    console.log(`Processing: Receipt ${data.receiptId} for User ${data.userId}`);
    console.log(`Decision: ${data.decision}`);
    
    // Only send webhook if approved
    if (data.decision && data.decision.includes('Approve')) {
      console.log('✅ Receipt approved - sending to ReCircle...');
      
      // Create webhook payload matching ReCircle's expected format
      const payload = {
        receipt_id: data.receiptId,
        user_id: parseInt(data.userId),
        user_wallet: data.userWallet,
        store_name: data.service,
        purchase_amount: parseFloat(data.amount),
        estimated_reward: Math.round(parseFloat(data.amount) * 0.7), // 70% reward rate
        status: "approved",
        admin_notes: data.notes || 'Approved via Google Apps Script manual review'
      };
      
      // Send to ReCircle with improved error handling
      const response = UrlFetchApp.fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'ReCircle-Manual-Review/1.0'
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      console.log(`Webhook response: ${responseCode}`);
      console.log(`Response body: ${responseText}`);
      
      if (responseCode === 200) {
        console.log('✅ Successfully sent to ReCircle!');
        return ContentService.createTextOutput(JSON.stringify({
          success: true, 
          message: 'Receipt approved! Tokens distributed to user wallet.'
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        console.error('❌ Webhook failed:', responseText);
        return ContentService.createTextOutput(JSON.stringify({
          success: false, 
          error: `Webhook failed with status ${responseCode}: ${responseText}`
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
    } else {
      console.log('❌ Receipt rejected - no webhook sent');
      return ContentService.createTextOutput(JSON.stringify({
        success: true, 
        message: 'Receipt rejected - no tokens distributed'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('❌ Error processing request:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify setup
 */
function testSetup() {
  console.log('Testing ReCircle Apps Script setup...');
  console.log('Webhook URL:', WEBHOOK_URL);
  console.log('Setup complete!');
}

/**
 * Test webhook connection
 */
function testWebhook() {
  const testPayload = {
    receipt_id: 'test_' + Date.now(),
    user_id: 999,
    user_wallet: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
    store_name: 'Test Service',
    purchase_amount: 25.00,
    estimated_reward: 17.5,
    status: 'approved',
    admin_notes: 'Test from Google Apps Script'
  };
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    });
    
    console.log('Test webhook response:', response.getResponseCode());
    console.log('Response body:', response.getContentText());
    
    return response.getResponseCode() === 200;
  } catch (error) {
    console.error('Test webhook failed:', error);
    return false;
  }
}