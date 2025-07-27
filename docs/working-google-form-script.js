/**
 * WORKING Google Apps Script for Form Approval Processing
 * This version uses the correct trigger setup for spreadsheet-based scripts
 */

const RECIRCLE_WEBHOOK_URL = 'https://www.recirclerewards.app/api/receipt-approved';

function onFormSubmit(e) {
  try {
    console.log('📝 Form submission received');
    
    const response = e.response;
    const itemResponses = response.getItemResponses();
    
    const formData = {};
    itemResponses.forEach(itemResponse => {
      const title = itemResponse.getItem().getTitle();
      const answer = itemResponse.getResponse();
      
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
    
    console.log('Form data:', formData);
    
    if (!formData.receiptId || !formData.userId || !formData.decision) {
      console.error('❌ Missing required fields');
      return;
    }
    
    if (formData.decision.includes('Approve')) {
      console.log('✅ Processing approval...');
      
      const webhookPayload = {
        receipt_id: formData.receiptId,
        user_id: formData.userId,
        user_wallet: formData.userWallet || '',
        service: formData.service || 'Manual Review Service',
        amount: formData.amount || 0,
        status: 'approved',
        notes: formData.notes || 'Approved via Google Form',
        approved_by: 'google_form_review',
        approved_at: new Date().toISOString()
      };
      
      console.log('Sending webhook:', webhookPayload);
      
      const webhookResponse = UrlFetchApp.fetch(RECIRCLE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify(webhookPayload)
      });
      
      const responseCode = webhookResponse.getResponseCode();
      console.log(`Webhook response: ${responseCode}`);
      
      if (responseCode === 200) {
        console.log('✅ Approval sent successfully');
        updateApprovalStatus(formData.receiptId, 'APPROVED', 'Tokens distributed');
      } else {
        console.error('❌ Webhook failed:', webhookResponse.getContentText());
        updateApprovalStatus(formData.receiptId, 'ERROR', 'Webhook failed');
      }
      
    } else {
      console.log('❌ Receipt rejected');
      updateApprovalStatus(formData.receiptId, 'REJECTED', 'No tokens distributed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function updateApprovalStatus(receiptId, status, notes) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    let responseSheet = null;
    for (const sheet of sheets) {
      if (sheet.getName().includes('Form Responses')) {
        responseSheet = sheet;
        break;
      }
    }
    
    if (!responseSheet) return;
    
    const lastCol = responseSheet.getLastColumn();
    const headers = responseSheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    let statusCol = -1;
    let notesCol = -1;
    
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === 'Processing Status') statusCol = i + 1;
      if (headers[i] === 'Processing Notes') notesCol = i + 1;
    }
    
    if (statusCol === -1) {
      statusCol = lastCol + 1;
      responseSheet.getRange(1, statusCol).setValue('Processing Status');
    }
    if (notesCol === -1) {
      notesCol = lastCol + 2;
      responseSheet.getRange(1, notesCol).setValue('Processing Notes');
    }
    
    const data = responseSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.some(cell => String(cell) === String(receiptId))) {
        responseSheet.getRange(i + 1, statusCol).setValue(status);
        responseSheet.getRange(i + 1, notesCol).setValue(notes);
        console.log(`Updated status for receipt ${receiptId}: ${status}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

/**
 * ALTERNATIVE: Manual trigger setup using resources
 */
function setupFormTriggerCorrect() {
  try {
    console.log('Setting up form trigger...');
    
    // Clear existing triggers
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'onFormSubmit') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Use the Resources.triggers approach
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Create trigger via the TriggerBuilder correctly
    const trigger = ScriptApp.newTrigger('onFormSubmit')
      .timeBased()
      .everyMinutes(1)
      .create();
    
    // Delete the time-based trigger and create form trigger manually
    ScriptApp.deleteTrigger(trigger);
    
    console.log('✅ Please manually set up the trigger:');
    console.log('1. Click "Triggers" (clock icon) in left sidebar');
    console.log('2. Click "+ Add Trigger"');
    console.log('3. Function: onFormSubmit');
    console.log('4. Event source: From spreadsheet');
    console.log('5. Event type: On form submit');
    console.log('6. Save');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Test the approval process manually
 */
function testApprovalProcess() {
  const testData = {
    receiptId: 'SHEET_TEST_1752203518887',
    userId: '102',
    userWallet: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686',
    service: 'Metro Bus Transit',
    amount: 4.5,
    decision: 'Approve and Distribute Tokens',
    notes: 'Manual test of approval process'
  };
  
  console.log('🧪 Testing approval process manually...');
  
  const webhookPayload = {
    receipt_id: testData.receiptId,
    user_id: testData.userId,
    user_wallet: testData.userWallet,
    service: testData.service,
    amount: testData.amount,
    status: 'approved',
    notes: testData.notes,
    approved_by: 'manual_test',
    approved_at: new Date().toISOString()
  };
  
  try {
    const response = UrlFetchApp.fetch(RECIRCLE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(webhookPayload)
    });
    
    console.log(`Test response: ${response.getResponseCode()}`);
    console.log('Response content:', response.getContentText());
    
    if (response.getResponseCode() === 200) {
      console.log('✅ Manual approval test successful!');
      console.log('Check user 102 balance - it should have increased');
    } else {
      console.log('❌ Manual approval test failed');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}