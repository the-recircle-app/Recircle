/**
 * Google Apps Script for ReCircle Feedback Form
 * Updated for new deployment - January 2025
 */

// ReCircle feedback endpoint - NEW DEPLOYMENT
const FEEDBACK_WEBHOOK_URL = 'https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/api/feedback';

/**
 * Handle GET requests - show the feedback form
 */
function doGet() {
  return HtmlService.createHtmlOutput(`
<!DOCTYPE html>
<html>
<head>
    <title>ReCircle Feedback</title>
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
            color: #4CAF50; 
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
        .info { 
            background: #e7f3ff; 
            color: #004085; 
            border: 1px solid #b3d7ff;
            margin-bottom: 20px;
        }
        .rating { 
            display: flex; 
            gap: 10px; 
            align-items: center;
        }
        .rating input[type="radio"] { 
            width: auto; 
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>💬 ReCircle Feedback</h2>
        
        <div class="status info">
            <strong>Help us improve ReCircle!</strong><br>
            Your feedback helps us make sustainable transportation rewards better for everyone.
        </div>
        
        <div id="status" class="status"></div>
        
        <form id="feedbackForm">
            <div class="form-group">
                <label>Your Name</label>
                <input type="text" name="name" placeholder="Enter your name (optional)">
            </div>
            
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="your.email@example.com (optional)">
            </div>
            
            <div class="form-group">
                <label>User ID (if known)</label>
                <input type="number" name="userId" placeholder="e.g., 103">
            </div>
            
            <div class="form-group">
                <label>Overall Experience <span class="required">*</span></label>
                <div class="rating">
                    <input type="radio" name="rating" value="1" required id="r1">
                    <label for="r1">😞 Poor</label>
                    <input type="radio" name="rating" value="2" required id="r2">
                    <label for="r2">😐 Fair</label>
                    <input type="radio" name="rating" value="3" required id="r3">
                    <label for="r3">🙂 Good</label>
                    <input type="radio" name="rating" value="4" required id="r4">
                    <label for="r4">😊 Great</label>
                    <input type="radio" name="rating" value="5" required id="r5">
                    <label for="r5">🤩 Excellent</label>
                </div>
            </div>
            
            <div class="form-group">
                <label>Feedback Category <span class="required">*</span></label>
                <select name="category" required>
                    <option value="">Select category...</option>
                    <option value="user_interface">User Interface/Design</option>
                    <option value="wallet_connection">Wallet Connection</option>
                    <option value="receipt_upload">Receipt Upload Process</option>
                    <option value="token_rewards">Token Rewards System</option>
                    <option value="referral_system">Referral System</option>
                    <option value="sustainable_transport">Transportation Options</option>
                    <option value="performance">App Performance/Speed</option>
                    <option value="feature_request">New Feature Idea</option>
                    <option value="bug_report">Bug Report</option>
                    <option value="general">General Feedback</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>What do you like most about ReCircle?</label>
                <textarea name="likes" rows="3" placeholder="Tell us what's working well..."></textarea>
            </div>
            
            <div class="form-group">
                <label>What could we improve? <span class="required">*</span></label>
                <textarea name="improvements" rows="3" required placeholder="Share your suggestions for making ReCircle better..."></textarea>
            </div>
            
            <div class="form-group">
                <label>Any specific features you'd like to see?</label>
                <textarea name="features" rows="3" placeholder="Describe new features or capabilities you'd find useful..."></textarea>
            </div>
            
            <div class="form-group">
                <label>How likely are you to recommend ReCircle to others?</label>
                <div class="rating">
                    <input type="radio" name="nps" value="0" id="n0">
                    <label for="n0">0</label>
                    <input type="radio" name="nps" value="5" id="n5">
                    <label for="n5">5</label>
                    <input type="radio" name="nps" value="10" id="n10">
                    <label for="n10">10 (Very likely)</label>
                </div>
            </div>
            
            <button type="submit">Submit Feedback</button>
        </form>
    </div>

    <script>
        document.getElementById('feedbackForm').addEventListener('submit', function(e) {
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
                button.textContent = 'Submit Feedback';
            });
        });
    </script>
</body>
</html>
  `);
}

/**
 * Handle POST requests - process feedback form submissions
 */
function doPost(e) {
  try {
    console.log('💬 Feedback received...');
    
    // Parse the request data
    const data = JSON.parse(e.postData.contents);
    
    console.log(`Feedback from: ${data.name || 'Anonymous'} (${data.email || 'No email'})`);
    console.log(`Rating: ${data.rating}/5, Category: ${data.category}`);
    
    // Create feedback payload
    const payload = {
      type: 'user_feedback',
      name: data.name || 'Anonymous',
      email: data.email || null,
      user_id: data.userId ? parseInt(data.userId) : null,
      rating: parseInt(data.rating),
      category: data.category,
      likes: data.likes || null,
      improvements: data.improvements,
      feature_requests: data.features || null,
      nps_score: data.nps ? parseInt(data.nps) : null,
      timestamp: new Date().toISOString(),
      source: 'google_apps_script'
    };
    
    // Send to ReCircle
    const response = UrlFetchApp.fetch(FEEDBACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'ReCircle-Feedback-Form/1.0'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log(`Feedback webhook response: ${responseCode}`);
    console.log(`Response body: ${responseText}`);
    
    if (responseCode === 200) {
      console.log('✅ Feedback sent successfully!');
      return ContentService.createTextOutput(JSON.stringify({
        success: true, 
        message: 'Thank you for your feedback! We appreciate your input and will use it to improve ReCircle.'
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      console.error('❌ Feedback webhook failed:', responseText);
      return ContentService.createTextOutput(JSON.stringify({
        success: false, 
        error: `Failed to submit feedback. Please try again later.`
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('❌ Error processing feedback:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: 'Error processing your feedback. Please try again.'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test feedback webhook connection
 */
function testFeedbackWebhook() {
  const testPayload = {
    type: 'user_feedback',
    name: 'Test User',
    email: 'test@example.com',
    rating: 5,
    category: 'general',
    improvements: 'Test feedback from Google Apps Script',
    timestamp: new Date().toISOString(),
    source: 'google_apps_script_test'
  };
  
  try {
    const response = UrlFetchApp.fetch(FEEDBACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    });
    
    console.log('Test feedback webhook response:', response.getResponseCode());
    console.log('Response body:', response.getContentText());
    
    return response.getResponseCode() === 200;
  } catch (error) {
    console.error('Test feedback webhook failed:', error);
    return false;
  }
}