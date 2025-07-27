# Simple VeWorld Network Fix

## The Problem
VeWorld can't access port 8669 through Replit's public URL because ports aren't properly exposed.

## Simple Solution
Try this URL instead, using the main app port:

### VeWorld Network Configuration:
- **Network Name**: `Solo Node`
- **RPC URL**: `https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev/solo`
- **Chain ID**: `39`
- **Symbol**: `VET`

This routes through the main app (port 5000) which is properly exposed, then proxies to the solo node internally.

## Alternative: Use HTTP without Port
If the above doesn't work, try:
- **RPC URL**: `https://ba885181-7e95-4972-b432-aff26f9a0d30-00-1owy7uwyvgyc6.picard.replit.dev`
- All other settings the same

The key issue is that mobile networks often block non-standard ports. Using the main app port should resolve the CORS and connectivity issues.