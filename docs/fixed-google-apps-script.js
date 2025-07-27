/**
 * FIXED Google Apps Script for Transportation Receipt Reviews
 * This version properly handles both GET (form display) and POST (form submission)
 */

// ReCircle webhook URL - PRODUCTION
const WEBHOOK_URL = 'https://www.recirclerewards.app/api/receipt-approved';

/**
 * Handle GET requests - show the review form
 */
function doGet() {
  return HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
<head>
    <title>Transportation Receipt Review</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
        button { background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #45a049; }
        .required { color: red; }
    </style>
</head>
<body>
    <h2>Transportation Receipt Review</h2>
    <form id="reviewForm">
        <div class="form-group">
            <label>Receipt ID <span class="required">*</span></label>
            <input type="text" name="receiptId" required>
        </div>
        
        <div class="form-group">
            <label>User ID <span class="required">*</span></label>
            <input type="text" name="userId" required>
        </div>
        
        <div class="form-group">
            <label>User Wallet <span class="required">*</span></label>
            <input type="text" name="userWallet" placeholder="0x..." required>
        </div>
        
        <div class="form-group">
            <label>Service <span class="required">*</span></label>
            <input type="text" name="service" required>
        </div>
        
        <div class="form-group">
            <label>Amount <span class="required">*</span></label>
            <input type="text" name="amount" required>
        </div>
        
        <div class="form-group">
            <label>Decision <span class="required">*</span></label>
            <select name="decision" required>
                <option value="">Select...</option>
                <option value="✅ Approve Receipt">✅ Approve Receipt</option>
                <option value="❌ Reject Receipt">❌ Reject Receipt</option>
            </select>
        </div>
        
        <div class="form-group">
            <label>Notes</label>
            <textarea name="notes" rows="3"></textarea>
        </div>
        
        <button type="submit">Submit Review</button>
    </form>

    <script>
        document.getElementById('reviewForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Show loading state
            const submitBtn = e.target.querySelector('button');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Submit to the same script URL but as POST
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
                    // If not JSON, show the text result
                    alert('Response: ' + result);
                }
            })
            .catch(error => {
                alert('❌ Network Error: ' + error.message);
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
 * Handle POST requests - process form submissions
 */
function doPost(e) {
  console.log('📝 POST request received');
  
  try {
    // Get form data from POST parameters
    const params = e.parameter;
    console.log('Form data received:', params);
    
    const receiptId = params.receiptId;
    const userId = params.userId;
    const userWallet = params.userWallet;
    const service = params.service;
    const amount = params.amount;
    const decision = params.decision;
    const notes = params.notes || '';
    
    // Validate required fields
    if (!receiptId || !userId || !userWallet || !service || !amount || !decision) {
      console.error('❌ Missing required fields');
      return ContentService.createTextOutput(JSON.stringify({
        success: false, 
        error: 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log(`Processing: ${decision} for receipt ${receiptId}`);
    
    // Only send webhook if approved
    if (decision === '✅ Approve Receipt') {
      console.log('🚀 Sending approval webhook to ReCircle...');
      
      const webhookPayload = {
        receipt_id: receiptId,
        user_id: userId,
        user_wallet: userWallet,
        service: service,
        amount: parseFloat(amount),
        status: 'approved',
        notes: notes,
        approved_by: 'manual_review',
        approved_at: new Date().toISOString()
      };
      
      console.log('Webhook payload:', webhookPayload);
      
      const response = UrlFetchApp.fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(webhookPayload)
      });
      
      const responseCode = response.getResponseCode();
      console.log(`Webhook response: ${responseCode}`);
      
      if (responseCode === 200) {
        console.log('✅ Successfully sent to ReCircle!');
        return ContentService.createTextOutput(JSON.stringify({
          success: true, 
          message: 'Receipt approved and tokens distributed'
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        console.error('❌ Webhook failed:', response.getContentText());
        return ContentService.createTextOutput(JSON.stringify({
          success: false, 
          error: 'Webhook failed: ' + response.getContentText()
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
    } else {
      console.log('❌ Receipt rejected - no webhook sent');
      return ContentService.createTextOutput(JSON.stringify({
        success: true, 
        message: 'Receipt rejected'
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