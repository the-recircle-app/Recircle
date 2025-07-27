# Correct Webhook URL for Google Apps Script

## Use Your Production Domain

**✅ CORRECT URL:**
```
https://www.recirclerewards.app/api/receipt-approved
```

**❌ WRONG URL:**
```
https://workspace.reign360.replit.app/api/receipt-approved
```

## Why Production Domain?

1. **Professional**: Users see your branded domain
2. **Reliable**: Production-grade SSL certificates
3. **Consistent**: Same URL users access your app from
4. **Secure**: Proper HTTPS encryption

## Update Your Google Apps Script

In your transportation Google Apps Script, ensure this line:
```javascript
const WEBHOOK_URL = "https://www.recirclerewards.app/api/receipt-approved";
```

## Verification

Test the webhook endpoint:
```bash
curl -X POST https://www.recirclerewards.app/api/receipt-approved \
  -H "Content-Type: application/json" \
  -d '{"test": "ping"}'
```

Should return JSON response, not HTML.