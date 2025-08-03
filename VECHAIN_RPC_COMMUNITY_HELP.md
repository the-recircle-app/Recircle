# VeChain Testnet RPC Endpoint Help Needed

## Quick Summary
I've built a **ReCircle sustainable transportation rewards app** that integrates with **VeBetterDAO** to distribute real B3TR tokens on VeChain testnet. The integration is complete with all correct contract addresses and credentials, but I'm experiencing connectivity issues with VeChain testnet RPC endpoints.

## The Problem
All public VeChain testnet RPC endpoints are returning **HTTP 307/302 redirects** instead of functioning properly:

- `https://testnet.veblocks.net` → 307 Temporary Redirect
- `https://sync-testnet.veblocks.net` → 307 Temporary Redirect  
- `https://node-testnet.vechain.energy` → 302 Found
- `https://vethor-node-test.vechaindev.com` → 307 Temporary Redirect

## What I've Confirmed
✅ **VeBetterDAO integration is correct** - Using official contract addresses from docs:
- B3TR Token: `0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F`
- X2EarnRewardsPool: `0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38`
- Distributor wallet properly derived from mnemonic

✅ **VeBetterDAO testnet is active** - Confirmed via https://dev.testnet.governance.vebetterdao.org/ (17M+ B3TR in circulation)

✅ **Retry logic implemented** - Following VeChain Kit documentation patterns

## What I Need
🚀 **A working VeChain testnet RPC endpoint URL** that supports:
- Chain ID: 100010 (VeChain Testnet)
- Standard JSON-RPC calls
- Real blockchain transactions (not mock/simulation)

## The Question
**Does anyone know a currently functional VeChain testnet RPC endpoint that I can use for real VeBetterDAO B3TR token distribution?**

Alternative solutions welcome:
- Private RPC providers that work
- VeChain community nodes
- Alternative network configurations
- Any insights on why public endpoints are redirecting

## Technical Context
- Using ethers.js JsonRpcProvider
- Need for production dApp distributing real rewards
- Integration with VeBetterDAO smart contracts
- Built on Replit with Node.js/Express backend

Any help would be greatly appreciated! 🙏

---
*ReCircle: Rewarding sustainable transportation choices with blockchain technology*