# Step-by-Step: Setting Up Approval Responses Processing

## What You Need to Do

### Step 1: Open Your Approval Responses Sheet
1. **Go to**: https://docs.google.com/spreadsheets/d/1ORQysNrco7u04UyoG9FyekqMsFSGQ-A_WYhYGhcMtuM/edit?gid=636184662#gid=636184662
2. **Click**: Extensions → Apps Script

### Step 2: Create the Processing Script
1. **In the Apps Script editor**: Delete any existing code
2. **Copy and paste**: All the code from `docs/approval-responses-processing-script.js`
3. **Save the project**: Give it a name like "ReCircle Approval Processing"

### Step 3: Test the Script
1. **Click the function dropdown**: Select `testProcessing`
2. **Click the Run button** (play icon)
3. **Authorize permissions** when prompted
4. **Check the logs**: You should see "✅ Sheet accessible" and webhook test results

### Step 4: Set Up Automatic Processing
1. **In the function dropdown**: Select `setupAutoProcessing`
2. **Click Run**: This creates a trigger to run every 5 minutes
3. **Check the logs**: Should show "✅ Auto-processing trigger set up"

### Step 5: Test with Real Data (Optional)
1. **Fill out your approval form** with test data:
   - Receipt ID: `test_123`
   - User ID: `103`
   - User Wallet: `0xAbEf6032B9176C186F6BF984f548bdA53349f70a`
   - Service: `Test Uber`
   - Amount: `25.50`
   - Decision: `✅ Approve Receipt`
2. **Wait 5 minutes** or run `processApprovalResponses` manually
3. **Check your sheet**: Should see "YES" in the "Processed" column

## What This Script Does

### Automatic Processing:
- ✅ **Every 5 minutes**: Checks for new form responses
- ✅ **Finds approvals**: Only processes "Approve" decisions
- ✅ **Sends webhooks**: To ReCircle for token distribution
- ✅ **Marks as processed**: Prevents duplicate processing
- ✅ **Logs everything**: View logs in Apps Script console

### Column Detection:
The script automatically finds these columns in your form responses:
- Receipt ID, User ID, User Wallet, Service, Amount, Decision, Notes
- Adds "Processed" and "Processed At" columns if missing

### Safety Features:
- ✅ **No duplicates**: Skips already processed rows
- ✅ **Error handling**: Marks failed attempts as "ERROR"
- ✅ **Validation**: Checks required fields before processing
- ✅ **Logging**: Detailed logs for troubleshooting

## Functions Available:

### `processApprovalResponses()`
- Main processing function
- Runs automatically every 5 minutes once trigger is set

### `setupAutoProcessing()`
- Creates the automatic trigger
- Run this once to enable auto-processing

### `testProcessing()`
- Tests sheet access and webhook connection
- Run this to verify everything works

### `runOnce()`
- Manually process responses one time
- Use this for immediate processing

## After Setup:

Your approval workflow will be:
1. **You fill out approval form** → Data goes to responses sheet
2. **Script runs every 5 minutes** → Finds new approvals
3. **Webhook sent to ReCircle** → Tokens distributed automatically
4. **Row marked "Processed"** → Won't be processed again

All automatic and hands-off after the initial setup!