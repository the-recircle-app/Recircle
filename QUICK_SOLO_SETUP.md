# Quick VeWorld Solo Network Setup

## For Mobile Testing (Recommended)

### VeWorld Mobile App Setup:
1. **Start Solo Node**: `node scripts/solo-node-simple.js`
2. **Add Custom Network in VeWorld**:
   - Network Name: `Solo Node`
   - RPC URL: `http://YOUR_REPLIT_URL:8669` (replace with your Replit domain)
   - Chain ID: `39`
   - Symbol: `VET`
3. **Switch to Solo Network** in VeWorld
4. **Connect to ReCircle** and test B3TR distributions

### Important Notes:
- Solo node must be accessible from mobile (use Replit public URL)
- You'll see real B3TR tokens appear in VeWorld wallet
- All transactions are fake/safe - no real money involved
- Solo node provides unlimited VET/VTHO for testing

## For Desktop Testing

### Network Configuration:
- RPC URL: `http://localhost:8669`
- Chain ID: `39`

This matches exactly what you saw in the X-2-Earn video - VeWorld connects to your solo node as a custom network, and you can watch B3TR tokens flow into the wallet during testing!