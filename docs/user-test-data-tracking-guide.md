# User Test Data Tracking Guide

## Current Issue Identified
Your database shows only fund distribution transactions but no actual receipt records. This means:
- Auto-approved receipts aren't being stored in the receipts table
- Manual approvals via Google Sheets bypass receipt creation
- No comprehensive tracking of user submissions

## What Should Be Tracked

### 1. Auto-Approved Receipts
When users submit receipts through your app that get auto-approved:
- Should create entry in `receipts` table
- Should create `receipt_verification` transaction
- Should show in user's transaction history

### 2. Manual Review Receipts
When receipts require manual review:
- Should create entry in `receipts` table with `needs_manual_review: true`
- Should be sent to Google Sheets
- When approved, should update `verified: true` and create transaction

### 3. Google Sheets Direct Approvals
Current webhook approvals create transactions but no receipt records.

## Recommended Tracking Structure

### Database Tables to Monitor:
1. **receipts** - All submitted receipts (auto & manual)
2. **transactions** - All token distributions
3. **users** - User balances and activity

### Key Tracking Queries:

#### Recent Receipt Submissions
```sql
SELECT 
  r.id,
  r.user_id,
  u.username,
  r.verified,
  r.needs_manual_review,
  r.amount,
  r.category,
  r.token_reward,
  r.created_at,
  CASE 
    WHEN r.needs_manual_review THEN 'Manual Review'
    WHEN r.verified THEN 'Auto-Approved'
    ELSE 'Pending'
  END as status
FROM receipts r
LEFT JOIN users u ON r.user_id = u.id
ORDER BY r.created_at DESC;
```

#### User Transaction History
```sql
SELECT 
  t.id,
  t.user_id,
  u.username,
  t.type,
  t.amount,
  t.description,
  t.created_at
FROM transactions t
LEFT JOIN users u ON t.user_id = u.id
WHERE t.user_id IS NOT NULL
ORDER BY t.created_at DESC;
```

#### User Token Balances
```sql
SELECT 
  id,
  username,
  wallet_address,
  token_balance,
  current_streak,
  last_activity_date
FROM users
ORDER BY token_balance DESC;
```

## Testing Recommendations

### 1. Test Auto-Approval Flow
- Submit a receipt through your app
- Verify it creates a receipt record
- Check transaction is created
- Confirm user balance updates

### 2. Test Manual Review Flow
- Submit a receipt that requires manual review
- Verify it appears in Google Sheets
- Approve via Google Sheets
- Check receipt is marked verified
- Confirm tokens are distributed

### 3. Monitor Fund Distribution
- Track app fund and creator fund transactions
- Verify 70/30 distribution is working
- Check actual blockchain transactions

## Dashboard Queries for Monitoring

### Daily Activity Summary
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_receipts,
  COUNT(CASE WHEN verified THEN 1 END) as approved,
  COUNT(CASE WHEN needs_manual_review THEN 1 END) as manual_review,
  SUM(token_reward) as total_tokens_distributed
FROM receipts 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### User Engagement
```sql
SELECT 
  u.username,
  u.token_balance,
  COUNT(t.id) as total_transactions,
  MAX(t.created_at) as last_activity
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.username, u.token_balance
ORDER BY u.token_balance DESC;
```

## Current Data Gap
Your receipts table is empty but transactions show fund distributions. This suggests receipts are being processed but not stored properly. The Google Sheets webhook should create receipt records, not just transactions.