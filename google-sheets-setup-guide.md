# Google Sheets Manual Review Setup Guide

## Step 1: Create Google Sheet

1. **Create a new Google Sheet** named "ReCircle Manual Reviews"
2. **Add these column headers** in Row 1:
   - A1: `receiptId`
   - B1: `userId` 
   - C1: `userWallet`
   - D1: `storeName`
   - E1: `purchaseAmount`
   - F1: `estimatedReward`
   - G1: `status`
   - H1: `confidence`
   - I1: `notes`
   - J1: `approvalDate`

## Step 2: Add Google Apps Script

1. **In your Google Sheet**, go to `Extensions > Apps Script`
2. **Delete the default code** and paste the content from `vebetterdao-receipt-approval-script.js`
3. **Save the project** with name "ReCircle Reviewer"

## Step 3: Deploy Web App

1. **Click Deploy** button (top right)
2. **Choose "New deployment"**
3. **Settings:**
   - Type: Web app
   - Description: "ReCircle Manual Review System"
   - Execute as: Me
   - Who has access: Anyone
4. **Click Deploy**
5. **Copy the Web app URL** (this is your webhook URL)

## Step 4: Configure Environment Variables

Add these secrets in Replit:
- `MANUAL_REVIEW_WEBHOOK_URL`: [Your Web app URL from step 3]
- `RECEIPT_APPROVAL_WEBHOOK_URL`: [Your Web app URL from step 3]

## Step 5: Test Reviewer Workflow

1. **Submit a receipt** that triggers manual review
2. **Check your Google Sheet** - new row should appear
3. **In the Status column**, type "approved"
4. **Use the Custom Menu**: "🔄 Recircle Rewards > ✅ Approve Receipt from Submissions"
5. **Check VeWorld wallet** for B3TR tokens

## Webhook URLs to Use:
- Your app: `https://65a0c091-f8b5-4b02-ae8f-04ce476a7181-00-yhmbve5mpso9.worf.replit.dev`
- Webhook endpoint: `https://65a0c091-f8b5-4b02-ae8f-04ce476a7181-00-yhmbve5mpso9.worf.replit.dev/api/receipt-approved`

## Why This URL is Required:
- Google Sheets needs to call your webhook from the internet
- `localhost:5000` is NOT accessible to Google Sheets
- Replit provides a public development URL for external access
- This is the URL Google Sheets must use to reach your app