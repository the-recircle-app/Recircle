# Google Apps Script Fraud Detection Setup Guide

## Step 1: Update Your Google Apps Script

1. **Open your Google Sheets** where you manage receipt approvals
2. **Go to Extensions > Apps Script** in your Google Sheet
3. **Replace your current script** with the enhanced version from `enhanced-google-apps-script-with-fraud-detection.js`
4. **Save the script** (Ctrl+S or Cmd+S)

## Step 2: Add New Columns to Your Google Sheet

Add these new columns to support fraud detection:

### Required New Columns:
- **Fraud Flags** - Shows suspicious indicators like "duplicate_image", "unusual_file_size", etc.
- **Image URL** - Contains the link to view the receipt image
- **Has Image** - Boolean indicating if receipt has an uploaded image

### Recommended Column Order:
```
Receipt ID | User ID | User Wallet | Store Name | Purchase Amount | Estimated Reward | Status | Fraud Flags | Has Image | Image URL | Admin Notes | Approval Date
```

## Step 3: Test the New Features

### A. Test API Connection
1. In your Google Sheet, go to the menu: **🔄 Recircle Rewards > 🧪 Test API Connection**
2. This should return a successful connection to `https://www.recirclerewards.app`

### B. Test Image Viewing
1. Select a receipt row that has an image
2. Go to: **🔄 Recircle Rewards > 🔍 View Receipt Image**
3. This will show the actual receipt image for fraud detection

### C. Test Fraud Flag Checking
1. Select a receipt row
2. Go to: **🔄 Recircle Rewards > ⚠️ Check Fraud Flags**
3. This will show any suspicious indicators detected

## Step 4: Enhanced Approval Process

When approving receipts with the new script:

1. **Fraud Warning System**: If a receipt has suspicious indicators, you'll see a warning before approval
2. **Image Review**: You can view the actual receipt image to verify authenticity
3. **Informed Decisions**: Make approval decisions based on visual inspection and fraud indicators

## Step 5: Common Fraud Indicators to Look For

The system automatically detects:
- **Duplicate Images**: Same receipt submitted multiple times
- **Unusual File Sizes**: Suspiciously large or small image files
- **Editing Software Traces**: Signs of image manipulation
- **Handwritten Receipts**: Often fraudulent
- **Photoshopped Elements**: Altered amounts or store names

## Troubleshooting

### If images don't load:
- Check that the receipt has `has_image: true`
- Verify the API connection is working
- Ensure the receipt ID is valid

### If fraud flags aren't showing:
- The receipt might not have any suspicious indicators
- Check that the fraud flags column is properly named
- Verify the receipt went through the fraud detection system

## Security Benefits

This enhanced system helps you:
- **Detect sophisticated fraud** that other VeBetterDAO apps are experiencing
- **Review actual receipt images** instead of relying only on extracted text
- **Make informed approval decisions** based on visual evidence
- **Prevent duplicate submissions** through image hashing
- **Identify manipulated receipts** through metadata analysis

## Support

If you encounter any issues:
1. Check the debug logs: **🔄 Recircle Rewards > 📊 View Debug Logs**
2. Test the API connection to ensure the server is responding
3. Verify your Google Sheet has the required columns