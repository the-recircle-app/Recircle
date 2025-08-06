# Complete Google Sheets Integration Setup Guide
## For Your Specific ReCircle Sheets

### 📊 Your Sheet URLs
- **Pending Reviews**: https://docs.google.com/spreadsheets/d/1Hp1nJ9v5wj2QvmdRWnUohfa4i9QPbq-BwrrInSoxQCI/edit?gid=1094452639#gid=1094452639
- **Approval Responses**: https://docs.google.com/spreadsheets/d/1ORQysNrco7u04UyoG9FyekqMsFSGQ-A_WYhYGhcMtuM/edit?gid=636184662#gid=636184662

### 🎯 Setup Process

#### Step 1: Set Up Pending Reviews Sheet Script
1. **Open your Pending Reviews sheet**
2. **Go to Extensions > Apps Script**
3. **Replace all code** with the script from `docs/your-specific-sheets-integration.js`
4. **Save the project** as "ReCircle Pending Reviews"
5. **Deploy as Web App**:
   - Type: Web app
   - Execute as: Me
   - Access: Anyone
   - Copy the Web App URL

#### Step 2: Update ReCircle Server
1. **Add the Web App URL** to your environment variables:
   ```
   MANUAL_REVIEW_WEBHOOK_URL=your_pending_reviews_web_app_url
   ```

#### Step 3: Set Up Approval Responses Processing
1. **Open your Approval Responses sheet**
2. **Go to Extensions > Apps Script** 
3. **Create new script** with the approval processing code
4. **Run the `setupTrigger()` function** to enable auto-processing
5. **Test with `testIntegration()` function**

#### Step 4: Configure Your Approval Form
Make sure your approval form has these fields (in this order):
- **Timestamp** (automatic)
- **Receipt ID** (text)
- **User ID** (number)
- **User Wallet** (text)
- **Service** (text)
- **Amount** (number)
- **Decision** (multiple choice: ✅ Approve Receipt / ❌ Reject Receipt)
- **Notes** (paragraph text)
- **Processed** (automatic - will be filled by script)
- **Processed At** (automatic - timestamp when processed)

### 🔄 Complete Workflow

#### When Receipt Needs Manual Review:
1. **ReCircle sends receipt data** → Your Pending Reviews sheet
2. **You review receipt details** in the sheet
3. **You fill out approval form** with your decision
4. **Apps Script auto-processes** approvals every 5 minutes
5. **Approved receipts trigger** → B3TR token distribution
6. **Status updated** in both sheets

#### Auto-Processing Features:
- ✅ **Every 5 minutes** checks for new approvals
- ✅ **Only processes approvals** (ignores rejections)  
- ✅ **Marks rows as processed** to avoid duplicates
- ✅ **Sends webhook to ReCircle** for token distribution
- ✅ **Logs all actions** in Apps Script console

### 🧪 Testing Your Setup

#### Test Pending Reviews:
1. **Submit a test receipt** in ReCircle that needs manual review
2. **Check your Pending Reviews sheet** for the new row
3. **Verify all data** is populated correctly

#### Test Approval Processing:
1. **Fill out your approval form** with test data
2. **Wait 5 minutes** or run `processApprovalResponses()` manually
3. **Check ReCircle logs** for successful token distribution
4. **Verify "Processed" column** is marked "YES"

### 🔧 Configuration Notes

#### Sheet Column Mapping:
Your scripts are configured to work with these exact column headers:
- Receipt ID, User ID, User Wallet, Service, Amount, Decision, Notes

#### Webhook URL:
All scripts point to: `https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/api/receipt-approved`

#### Auto-Processing:
- Trigger runs every 5 minutes
- Only processes rows where "Processed" ≠ "YES"
- Only sends webhooks for "Approve" decisions

### ✅ Final Result

You'll have a complete manual review system:
1. **Automatic receipt collection** in your sheets
2. **User-friendly approval form** with validation
3. **Automatic token distribution** for approved receipts
4. **Complete audit trail** of all decisions
5. **Real-time integration** with ReCircle deployment

All configured for your specific sheet URLs and ready for production use!