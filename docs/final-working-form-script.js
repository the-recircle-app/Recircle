/**
 * FINAL WORKING Google Apps Script for Form Approval Processing
 * This version handles form submissions from spreadsheet triggers correctly
 */

const RECIRCLE_WEBHOOK_URL = 'https://www.recirclerewards.app/api/receipt-approved';

function onFormSubmit(e) {
  try {
    console.log('📝 Form submission received');
    console.log('Event object:', e);
    
    // Handle both form response and spreadsheet row events
    let formData = {};
    
    if (e && e.response) {
      // Direct form response event
      const response = e.response;
      const itemResponses = response.getItemResponses();
      
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
    } else {
      // Spreadsheet row event - get the latest row data
      console.log('Processing spreadsheet row event');
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const lastRow = sheet.getLastRow();
      const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      
      // Map the row data to form fields
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const value = data[i];
        
        if (header.includes('Receipt ID')) {
          formData.receiptId = value;
        } else if (header.includes('User ID')) {
          formData.userId = value;
        } else if (header.includes('User Wallet') || header.includes('Wallet Address')) {
          formData.userWallet = value;
        } else if (header.includes('Service') || header.includes('Store')) {
          formData.service = value;
        } else if (header.includes('Amount')) {
          formData.amount = parseFloat(value);
        } else if (header.includes('Decision')) {
          formData.decision = value;
        } else if (header.includes('Notes') || header.includes('Admin')) {
          formData.notes = value;
        }
      }
    }
    
    console.log('Extracted form data:', formData);
    
    if (!formData.receiptId || !formData.userId || !formData.decision) {
      console.error('❌ Missing required fields:', formData);
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
      
      console.log('Sending webhook payload:', webhookPayload);
      
      const webhookResponse = UrlFetchApp.fetch(RECIRCLE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify(webhookPayload)
      });
      
      const responseCode = webhookResponse.getResponseCode();
      console.log(`Webhook response: ${responseCode}`);
      
      if (responseCode === 200) {
        console.log('✅ Approval sent successfully');
        const responseText = webhookResponse.getContentText();
        console.log('Response content:', responseText);
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
    console.error('❌ Error processing form submission:', error);
    console.error('Error details:', error.toString());
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
    
    if (!responseSheet) {
      console.log('No form responses sheet found');
      return;
    }
    
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
    console.error('Error updating approval status:', error);
  }
}

function testLatestFormSubmission() {
  console.log('🧪 Testing latest form submission...');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    console.log('Latest row data:', data);
    console.log('Headers:', headers);
    
    // Simulate the form submission event
    onFormSubmit(null);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}