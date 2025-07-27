# Fix Google Apps Script Response Format

## Problem:
The script is returning HTML instead of clean JSON, causing messy responses.

## Solution:
Update your Google Apps Script with the corrected code from `docs/simple-google-apps-script.js`

## Key Changes:
1. **Added `.setMimeType(ContentService.MimeType.JSON)`** to all responses
2. **Changed `.then(response => response.text())` to `.then(response => response.json())`**
3. **Improved alert messages** to show success/error clearly

## Steps:
1. **Copy the updated code** from `docs/simple-google-apps-script.js`
2. **Replace all code** in your Google Apps Script editor
3. **Save and deploy** (create new deployment if needed)
4. **Test again** - you should get clean success messages

## Expected Result:
Instead of HTML, you'll get clean alerts like:
- ✅ Success: Receipt approved and tokens distributed
- ❌ Error: [specific error message]

This will make your review form much more user-friendly and professional.