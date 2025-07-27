/**
 * Google Apps Script for Real Google Form Approval Processing
 * This script processes submissions from your actual Google Form
 * and sends approvals/rejections to ReCircle
 */

// Configuration
const RECIRCLE_WEBHOOK_URL = 'https://www.recirclerewards.app/api/receipt-approved';

/**
 * This function triggers when someone submits the Google Form
 * It automatically processes the approval and sends webhook to ReCircle
 */
function onFormSubmit(e) {
  try {
    console.log('📝 New form submission received');
    
    // Get the form response
    const response = e.response;
    const itemResponses = response.getItemResponses();
    
    // Extract data from form fields
    const formData = {};
    itemResponses.forEach(itemResponse => {
      const title = itemResponse.getItem().getTitle();
      const answer = itemResponse.getResponse();
      
      // Map form field titles to our data structure
      if (title.includes('Receipt ID')) {
        formData.receiptId = answer;
      } else if (title.includes('User ID')) {
        formData.userId = answer;
      } else if (title.includes('User Wallet') || title.includes('Wallet Address')) {
        formData.userWallet = answer;
      } else if (title.includes('Service') || title.includes('Store')) {
        formData.service = answer;
      } else if (title.includes('Amount')) {
        formData.amount = parseFloat(answer);
      } else if (title.includes('Decision')) {
        formData.decision = answer;
      } else if (title.includes('Notes') || title.includes('Admin')) {
        formData.notes = answer;
      }
    });
    
    console.log('Form data extracted:', formData);
    
    // Validate required fields
    if (!formData.receiptId || !formData.userId || !formData.decision) {
      console.error('❌ Missing required fields in form submission');
      return;
    }
    
    // Process the approval/rejection
    if (formData.decision.includes('Approve')) {
      console.log('✅ Processing approval...');
      
      // Create webhook payload for ReCircle
      const webhookPayload = {
        receipt_id: formData.receiptId,
        user_id: formData.userId,
        user_wallet: formData.userWallet || '',
        service: formData.service || 'Manual Review Service',
        amount: formData.amount || 0,
        status: 'approved',
        notes: formData.notes || 'Approved via Google Form manual review',
        approved_by: 'google_form_review',
        approved_at: new Date().toISOString()
      };
      
      console.log('Sending webhook payload:', webhookPayload);
      
      // Send to ReCircle
      const webhookResponse = UrlFetchApp.fetch(RECIRCLE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(webhookPayload)
      });
      
      const responseCode = webhookResponse.getResponseCode();
      console.log(`Webhook response: ${responseCode}`);
      
      if (responseCode === 200) {
        console.log('✅ Approval successfully sent to ReCircle');
        
        // Update the approval decisions sheet with status
        updateApprovalStatus(formData.receiptId, 'APPROVED', 'Tokens distributed');
      } else {
        console.error('❌ Webhook failed:', webhookResponse.getContentText());
        updateApprovalStatus(formData.receiptId, 'ERROR', 'Webhook failed');
      }
      
    } else {
      console.log('❌ Receipt rejected - no tokens will be distributed');
      updateApprovalStatus(formData.receiptId, 'REJECTED', 'No tokens distributed');
    }
    
  } catch (error) {
    console.error('❌ Error processing form submission:', error);
  }
}

/**
 * Update the approval status in the responses sheet
 */
function updateApprovalStatus(receiptId, status, notes) {
  try {
    // Find the form responses sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    // Look for the responses sheet (usually named with "Form Responses")
    let responseSheet = null;
    for (const sheet of sheets) {
      if (sheet.getName().includes('Form Responses')) {
        responseSheet = sheet;
        break;
      }
    }
    
    if (!responseSheet) {
      console.log('No form responses sheet found');
      return;
    }
    
    // Add status columns if they don't exist
    const lastCol = responseSheet.getLastColumn();
    const headers = responseSheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    let statusCol = -1;
    let notesCol = -1;
    
    // Check if status columns exist
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === 'Processing Status') statusCol = i + 1;
      if (headers[i] === 'Processing Notes') notesCol = i + 1;
    }
    
    // Add headers if needed
    if (statusCol === -1) {
      statusCol = lastCol + 1;
      responseSheet.getRange(1, statusCol).setValue('Processing Status');
    }
    if (notesCol === -1) {
      notesCol = lastCol + 2;
      responseSheet.getRange(1, notesCol).setValue('Processing Notes');
    }
    
    // Find the row with this receipt ID and update status
    const data = responseSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Look for receipt ID in any column
      if (row.some(cell => String(cell) === String(receiptId))) {
        responseSheet.getRange(i + 1, statusCol).setValue(status);
        responseSheet.getRange(i + 1, notesCol).setValue(notes);
        console.log(`Updated status for receipt ${receiptId}: ${status}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('Error updating approval status:', error);
  }
}

/**
 * Setup function - run this once to configure the form trigger
 */
function setupFormTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new form submit trigger
  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit')
    .onFormSubmit()
    .create();
  
  console.log('✅ Form submit trigger configured');
  console.log('Form submissions will now automatically process approvals');
}

/**
 * Test function to verify webhook connectivity
 */
function testWebhookConnection() {
  const testPayload = {
    receipt_id: 'FORM_TEST_001',
    user_id: '102',
    user_wallet: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
    service: 'Test Google Form Approval',
    amount: 25.0,
    status: 'approved',
    notes: 'Test from Google Form Apps Script',
    approved_by: 'google_form_test',
    approved_at: new Date().toISOString()
  };
  
  console.log('🧪 Testing webhook connection...');
  
  try {
    const response = UrlFetchApp.fetch(RECIRCLE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(testPayload)
    });
    
    console.log(`Test webhook response: ${response.getResponseCode()}`);
    console.log('Response content:', response.getContentText());
    
    if (response.getResponseCode() === 200) {
      console.log('✅ Webhook connection successful!');
    } else {
      console.log('❌ Webhook test failed');
    }
    
  } catch (error) {
    console.error('❌ Webhook test error:', error);
  }
}