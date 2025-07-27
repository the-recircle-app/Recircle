# Simple Google Form Setup for ReCircle

## Step 1: Create New Google Form

1. **Go to forms.google.com**
2. **Click "Blank" to create new form**
3. **Title**: "Transportation Receipt Review"
4. **Description**: "Manual review for transportation receipts"

## Step 2: Add These Form Fields (in order):

### Field 1: Receipt ID
- **Type**: Short answer
- **Question**: "Receipt ID"
- **Required**: Yes

### Field 2: User ID  
- **Type**: Short answer
- **Question**: "User ID"
- **Required**: Yes

### Field 3: Transportation Service
- **Type**: Short answer
- **Question**: "Transportation Service"
- **Required**: Yes

### Field 4: Amount
- **Type**: Short answer
- **Question**: "Amount"
- **Required**: Yes

### Field 5: Review Decision
- **Type**: Multiple choice
- **Question**: "Review Decision"
- **Options**:
  - ✅ Approve Receipt
  - ❌ Reject Receipt
- **Required**: Yes

### Field 6: Review Notes
- **Type**: Paragraph
- **Question**: "Review Notes (optional)"
- **Required**: No

## Step 3: Form Settings

1. **Click Settings (gear icon)**
2. **Responses tab**:
   - ✅ Collect email addresses: OFF
   - ✅ Limit to 1 response: OFF
   - ✅ Edit after submit: OFF

3. **Click "Create Spreadsheet" to link responses**

## What This Creates:

A clean Google Form that creates a spreadsheet with columns:
- Column A: Timestamp
- Column B: Receipt ID
- Column C: User ID
- Column D: Transportation Service
- Column E: Amount
- Column F: Review Decision
- Column G: Review Notes

Perfect for the Google Apps Script to process!