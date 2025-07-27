# Complete Google Form Manual Review Workflow

## The Proper Setup You Want:

### **Part 1: Receipt Data Collection Sheet**
1. **Create Google Sheet**: "ReCircle Pending Reviews" 
2. **Deploy Apps Script**: Receives receipt data from ReCircle when manual review needed
3. **Sheet gets populated**: With receipt details, user info, images for your review

### **Part 2: Real Google Form for Approvals**
1. **Create Google Form**: "Transportation Receipt Approval"
2. **Form fields**:
   - Receipt ID (text)
   - User ID (text)  
   - User Wallet (text)
   - Service/Store (text)
   - Amount (number)
   - Decision (multiple choice: Approve/Reject)
   - Admin Notes (paragraph text)
3. **Form responses**: Go to separate "Approval Decisions" sheet
4. **Apps Script**: Processes form submissions and sends webhooks to ReCircle

### **Complete Workflow:**
1. **User submits receipt** → ReCircle processes
2. **Manual review needed** → Data goes to "Pending Reviews" sheet
3. **You review receipt details** → See all info including receipt image
4. **You fill out Google Form** → Real form with dropdown menus
5. **Form submission triggers** → Apps Script sends approval to ReCircle
6. **Tokens distributed automatically** → 70/30 split

### **What You Need to Create:**
1. **Google Sheet** with receiving script (I already provided this)
2. **Google Form** connected to approval processing script
3. **Form response sheet** to log your approval decisions

This gives you:
- Professional Google Form interface
- Automatic data collection in sheets
- Complete audit trail
- Real form validation and required fields