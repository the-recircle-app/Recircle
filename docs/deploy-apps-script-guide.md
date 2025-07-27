# Deploy Google Apps Script - Simple Steps

## Step 1: Create Apps Script

1. **Go to script.google.com**
2. **Click "New project"**
3. **Delete default code and paste the code from `docs/simple-google-apps-script.js`**
4. **Save the project** (give it a name like "ReCircle Review")

## Step 2: Test the Script

1. **Run the `setupScript` function** to verify it loads correctly
2. **Run the `testWebhook` function** to test connection to ReCircle
3. **Check the execution logs** to confirm no errors

## Step 3: Deploy as Web App

1. **Click "Deploy" > "New deployment"**
2. **Choose type: Web app**
3. **Execute as: Me (your email)**
4. **Who has access: Anyone**
5. **Click "Deploy"**
6. **Authorize permissions** when prompted
7. **Copy the Web app URL** (you'll need this)

## Step 4: Test the Review Form

1. **Open the Web app URL** in your browser
2. **You'll see a simple review form**
3. **Fill out a test receipt**:
   - Receipt ID: test_123
   - User ID: 999
   - Service: Test Uber
   - Amount: 25.50
   - Decision: ✅ Approve Receipt
   - Notes: Test review
4. **Submit the form**
5. **Check Apps Script execution logs** to see if webhook was sent

## Step 5: Use for Real Reviews

Now you have a simple web form where you can:
- Enter receipt details manually
- Choose to approve or reject
- Automatically send approved receipts to ReCircle
- Users get B3TR tokens immediately

## What This Creates:

- A web form for manual receipt review
- Automatic webhook to ReCircle when receipts are approved
- 70/30 token distribution (user gets 70%, app fund gets 30%)
- Simple, reliable process without complex Google Form setup

The Web app URL is your review dashboard - bookmark it!