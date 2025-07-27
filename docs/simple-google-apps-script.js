/**
 * Simple Google Apps Script for ReCircle Transportation Receipt Review
 * This works with the Google Form structure we just created
 */

// Configuration
const WEBHOOK_URL = 'https://www.recirclerewards.app/api/receipt-approved';

/**
 * Web App function - handles POST requests from manual form submissions
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
        user_wallet: data.userWallet || "0x7dE3085b3190B3a787822Ee16F23be010f5F8686", // Default for testing
        store_name: data.service,
        purchase_amount: parseFloat(data.amount),
        estimated_reward: Math.round(parseFloat(data.amount) * 0.5), // 50% reward rate
        status: "approved",
        admin_notes: data.notes || 'Approved via Google Apps Script manual review'
      };
      
      // Send to ReCircle
      const response = UrlFetchApp.fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify(payload)
      });
      
      const responseCode = response.getResponseCode();
      console.log(`Webhook response: ${responseCode}`);
      
      if (responseCode === 200) {
        console.log('✅ Successfully sent to ReCircle!');
        return ContentService.createTextOutput(JSON.stringify({success: true, message: 'Receipt approved and tokens distributed'}))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        console.error('❌ Webhook failed:', response.getContentText());
        return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Webhook failed'}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
    } else {
      console.log('❌ Receipt rejected - no webhook sent');
      return ContentService.createTextOutput(JSON.stringify({success: true, message: 'Receipt rejected'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('❌ Error processing request:', error);
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests - returns a simple form for manual review
 */
function doGet() {
  return HtmlService.createHtmlOutput(`
    <html>
      <head><title>ReCircle Receipt Review</title></head>
      <body>
        <h2>Transportation Receipt Review</h2>
        <form id="reviewForm">
          <p><label>Receipt ID: <input type="text" name="receiptId" required></label></p>
          <p><label>User ID: <input type="number" name="userId" required></label></p>
          <p><label>User Wallet: <input type="text" name="userWallet" placeholder="0x..." required></label></p>
          <p><label>Service: <input type="text" name="service" required></label></p>
          <p><label>Amount: <input type="number" step="0.01" name="amount" required></label></p>
          <p><label>Decision: 
            <select name="decision" required>
              <option value="">Select...</option>
              <option value="✅ Approve Receipt">✅ Approve Receipt</option>
              <option value="❌ Reject Receipt">❌ Reject Receipt</option>
            </select>
          </label></p>
          <p><label>Notes: <textarea name="notes"></textarea></label></p>
          <p><button type="submit">Submit Review</button></p>
        </form>
        
        <script>
          document.getElementById('reviewForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            fetch(window.location.href, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(data)
            })
            .then(response => response.text())
            .then(result => {
              try {
                const jsonResult = JSON.parse(result);
                if (jsonResult.success) {
                  alert('✅ Success: ' + jsonResult.message);
                } else {
                  alert('❌ Error: ' + jsonResult.error);
                }
              } catch (err) {
                alert('✅ Success: Receipt processed');
              }
              e.target.reset();
            })
            .catch(error => alert('Error: ' + error));
          });
        </script>
      </body>
    </html>
  `);
}

/**
 * Setup function - run this once after creating the script
 */
function setupScript() {
  console.log('✅ ReCircle Transportation Review Script Ready!');
  console.log('Deploy as Web App to get the review form URL');
  console.log('Webhook URL:', WEBHOOK_URL);
}

/**
 * Test function - run this to test the webhook connection
 */
function testWebhook() {
  const testPayload = {
    receipt_id: 'test_manual_123',
    user_id: 102,
    user_wallet: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
    store_name: 'Test Uber Ride',
    purchase_amount: 25.50,
    estimated_reward: 12.75,
    status: 'approved',
    admin_notes: 'Test webhook from Google Apps Script'
  };
  
  console.log('🧪 Testing webhook connection...');
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(testPayload)
    });
    
    console.log(`Test response: ${response.getResponseCode()}`);
    console.log('✅ Webhook test successful!');
  } catch (error) {
    console.error('❌ Webhook test failed:', error);
  }
}