/**
 * Google Apps Script for ReCircle Help/Support Form
 * Updated for new deployment - January 2025
 */

// ReCircle help endpoint - NEW DEPLOYMENT
const HELP_WEBHOOK_URL = 'https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/api/contact';

/**
 * Handle GET requests - show the help form
 */
function doGet() {
  return HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
<head>
    <title>ReCircle Help Center</title>
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
            background: #2196F3; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 16px;
            width: 100%;
        }
        button:hover { 
            background: #1976D2; 
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
        .info { 
            background: #e7f3ff; 
            color: #004085; 
            border: 1px solid #b3d7ff;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>🆘 ReCircle Help Center</h2>
        
        <div class="status info">
            <strong>Need help with ReCircle?</strong><br>
            Use this form for wallet issues, receipt problems, token questions, or any other support needs.
        </div>
        
        <div id="status" class="status"></div>
        
        <form id="helpForm">
            <div class="form-group">
                <label>Your Name <span class="required">*</span></label>
                <input type="text" name="name" required placeholder="Enter your name">
            </div>
            
            <div class="form-group">
                <label>Email Address <span class="required">*</span></label>
                <input type="email" name="email" required placeholder="your.email@example.com">
            </div>
            
            <div class="form-group">
                <label>User ID (if known)</label>
                <input type="number" name="userId" placeholder="e.g., 103">
            </div>
            
            <div class="form-group">
                <label>Wallet Address (if relevant)</label>
                <input type="text" name="walletAddress" placeholder="0x...">
            </div>
            
            <div class="form-group">
                <label>Issue Category <span class="required">*</span></label>
                <select name="category" required>
                    <option value="">Select issue type...</option>
                    <option value="wallet">Wallet Connection Issues</option>
                    <option value="receipt">Receipt Upload Problems</option>
                    <option value="tokens">Token/Reward Issues</option>
                    <option value="validation">Receipt Validation Questions</option>
                    <option value="referral">Referral System</option>
                    <option value="technical">Technical Problems</option>
                    <option value="account">Account Issues</option>
                    <option value="other">Other</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Priority Level <span class="required">*</span></label>
                <select name="priority" required>
                    <option value="">Select priority...</option>
                    <option value="low">Low - General question</option>
                    <option value="medium">Medium - Need help soon</option>
                    <option value="high">High - Urgent issue</option>
                    <option value="critical">Critical - App not working</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Description <span class="required">*</span></label>
                <textarea name="description" rows="4" required placeholder="Please describe your issue in detail..."></textarea>
            </div>
            
            <div class="form-group">
                <label>Steps to Reproduce (if applicable)</label>
                <textarea name="steps" rows="3" placeholder="1. I did this... 2. Then this happened... 3. Expected result vs actual result..."></textarea>
            </div>
            
            <button type="submit">Submit Help Request</button>
        </form>
    </div>

    <script>
        document.getElementById('helpForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            
            // Show loading state
            const button = e.target.querySelector('button');
            const status = document.getElementById('status');
            button.disabled = true;
            button.textContent = 'Sending...';
            
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
                button.textContent = 'Submit Help Request';
            });
        });
    </script>
</body>
</html>
  `);
}

/**
 * Handle POST requests - process help form submissions
 */
function doPost(e) {
  try {
    console.log('🆘 Help request received...');
    
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    
    console.log(`Help request from: ${data.name} (${data.email})`);
    console.log(`Category: ${data.category}, Priority: ${data.priority}`);
    
    // Create help request payload
    const payload = {
      type: 'help_request',
      name: data.name,
      email: data.email,
      user_id: data.userId ? parseInt(data.userId) : null,
      wallet_address: data.walletAddress || null,
      category: data.category,
      priority: data.priority,
      description: data.description,
      steps_to_reproduce: data.steps || null,
      timestamp: new Date().toISOString(),
      source: 'google_apps_script'
    };
    
    // Send to ReCircle
    const response = UrlFetchApp.fetch(HELP_WEBHOOK_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'ReCircle-Help-Form/1.0'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log(`Help webhook response: ${responseCode}`);
    console.log(`Response body: ${responseText}`);
    
    if (responseCode === 200) {
      console.log('✅ Help request sent successfully!');
      return ContentService.createTextOutput(JSON.stringify({
        success: true, 
        message: 'Help request submitted! We will respond to your email within 24 hours.'
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      console.error('❌ Help webhook failed:', responseText);
      return ContentService.createTextOutput(JSON.stringify({
        success: false, 
        error: `Failed to submit help request. Please try again or email support directly.`
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('❌ Error processing help request:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: 'Error processing your request. Please try again.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test help webhook connection
 */
function testHelpWebhook() {
  const testPayload = {
    type: 'help_request',
    name: 'Test User',
    email: 'test@example.com',
    category: 'technical',
    priority: 'medium',
    description: 'Test help request from Google Apps Script',
    timestamp: new Date().toISOString(),
    source: 'google_apps_script_test'
  };
  
  try {
    const response = UrlFetchApp.fetch(HELP_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    });
    
    console.log('Test help webhook response:', response.getResponseCode());
    console.log('Response body:', response.getContentText());
    
    return response.getResponseCode() === 200;
  } catch (error) {
    console.error('Test help webhook failed:', error);
    return false;
  }
}