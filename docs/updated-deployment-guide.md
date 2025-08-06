# Updated Google Apps Script Deployment Guide
## For New ReCircle Deployment - January 2025

### 🎯 Quick Update Steps

If you already have Google Apps Scripts set up, just update the webhook URL:

1. **Open your existing Apps Script** at script.google.com
2. **Find this line**: `const WEBHOOK_URL = 'https://www.recirclerewards.app/api/receipt-approved';`
3. **Replace with**: `const WEBHOOK_URL = 'https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/api/receipt-approved';`
4. **Save and deploy** new version

### 🆕 Complete New Setup

If you need to create new Apps Scripts:

#### Step 1: Create Manual Review Script
1. Go to **script.google.com**
2. Click **"New project"**
3. Copy code from `docs/updated-google-apps-script-for-deployment.js`
4. Save project as **"ReCircle Manual Review"**

#### Step 2: Deploy as Web App
1. Click **"Deploy" > "New deployment"**
2. Type: **Web app**
3. Execute as: **Me**
4. Access: **Anyone**
5. Click **"Deploy"**
6. Copy the **Web App URL** (bookmark this!)

#### Step 3: Test the Setup
1. Open the Web App URL
2. Fill out a test receipt:
   - Receipt ID: `test_123`
   - User ID: `103`
   - User Wallet: `0xAbEf6032B9176C186F6BF984f548bdA53349f70a`
   - Service: `Test Uber`
   - Amount: `25.50`
   - Decision: **✅ Approve Receipt**
3. Submit and verify success message

### 🔧 Updated Webhook URLs

**Manual Review**: `https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/api/receipt-approved`

**Help Forms**: `https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/api/contact`

**Feedback Forms**: `https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/api/feedback`

### ✅ What This Updates

- ✅ Manual receipt review form
- ✅ Real B3TR token distribution to user wallets
- ✅ Improved error handling and user feedback
- ✅ Updated for new deployment domain
- ✅ Enhanced form design and validation

### 🚀 Ready to Use

Your manual review system will now:
1. **Connect to the new deployment**
2. **Distribute real B3TR tokens** (70% to user, 30% to app fund)
3. **Show clear success/error messages**
4. **Work reliably with the updated endpoints**

All Google Apps Scripts are now deployment-ready!