# ReCircle - Sustainable Transportation Rewards Platform

## Overview

ReCircle is a blockchain-powered rewards platform designed to incentivize sustainable transportation choices. It distributes B3TR tokens to users who submit receipts from approved ride-share services, electric vehicle rentals, and public transportation. The platform integrates with VeBetterDAO's smart contract ecosystem and uses OpenAI Vision API for automated receipt validation and fraud prevention, creating a comprehensive and rewarding ecosystem for sustainable mobility. ReCircle aims to promote eco-friendly travel habits and offers a scalable solution for rewarding users while generating revenue for platform operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Progress

**August 6, 2025**:
- ✅ MAJOR BREAKTHROUGH: Implemented real VeWorld wallet balance reading like Mugshot
- ✅ Token balance now reads actual B3TR from user's VeWorld wallet instead of database
- ✅ Following official VeChain documentation patterns for Connex balanceOf calls
- ✅ Added intelligent caching (30s) to prevent excessive blockchain calls
- ✅ CLEANUP COMPLETE: Removed all legacy redeem components and endpoints
  - Deleted redeem.tsx, redeem-modern.tsx, VeChainKitRedeemButton.tsx
  - Removed /api/redeem-pending-tokens endpoint from server
  - Eliminated "Redeem Pending Tokens" button and all redeem routes
- ✅ Clean navigation flow: Welcome page only shows when wallet disconnected
- ✅ Fixed visual alignment issues on welcome page (transportation icons & bullet points)
- ✅ Backend VeChain Thor REST API endpoint for balance reading fallback
- 🎯 Result: Complete parity with Mugshot's real wallet balance system + eliminated unnecessary manual redemption

**August 5, 2025**: 
- ✅ COMPLETE SUCCESS: Real B3TR blockchain distribution working in production!
- ✅ Fixed HDNode creation error using thor.secp256k1 + thor.address approach
- ✅ Fixed ethers.parseEther import error that was terminating the server
- ✅ Frontend properly calls both validation AND submission endpoints
- ✅ Production deployment successful with real VeChain testnet integration
- ✅ VERIFIED: Real transactions submitted to VeChain testnet
  - User TX: 0x501a9ab1d69e9d1e3e72588f2508559338f5be9316dcd0cef6cb0f1c8ac3b66d
  - App TX: 0xccb4e45d18db254eb57e9176f2d92863cceaf85f91a06f8820e420e9bc970225
- ✅ B3TR tokens successfully distributed to user wallet: 0xAbEf6032B9176C186F6BF984f548bdA53349f70a
- 🎉 MISSION ACCOMPLISHED: ReCircle blockchain distribution fully operational!

**August 4, 2025**: 
- ✅ CRITICAL FIX: Eliminated JsonRpcProvider errors causing production token distribution failures
- ✅ Created simple-real-distribution.ts using VeChain Thor REST API instead of ethers.js JSON-RPC
- ✅ Fixed the root cause: VeChain requires Thor client, not Ethereum JsonRpcProvider
- ✅ Implemented direct B3TR token transfers with proper 70/30 split to user and app fund wallets
- ✅ Production secrets configured: B3TR_CONTRACT_ADDRESS and X2EARNREWARDSPOOL_ADDRESS available
- ✅ Server logs show successful local testing: token balance increases from 18.5 → 24 tokens
- ✅ Eliminated syntax errors in routes.ts preventing server startup
- ✅ Real blockchain distribution now bypasses broken VeBetterDAO rewards system
- 🚀 Ready for production deployment with working VeChain testnet distribution
- 📊 VeBetterDAO allocation: 24,166 B3TR tokens confirmed available for distribution

**August 2, 2025**: 
- ✅ PRODUCTION READY: Pierre VeBetterDAO patterns fully integrated into main ReCircle app
- ✅ Real OpenAI Vision API validation system working (GPT-4o model)
- ✅ Automatic B3TR token distribution for valid receipts (threshold: score > 0.5)
- ✅ Smart Upload component with drag-and-drop receipt processing
- ✅ Complete backend integration: /api/receipts/validate uses Pierre's validation system
- ✅ Production scan page updated with Smart Upload mode
- ✅ Enhanced upload debugging for troubleshooting receipt validation issues
- ✅ VeChain transaction validation following Cooper's guidance (receipt polling + reverted flag check)
- B3TR token deployed at: 0x5ef79995fe8a89e0812330e4378eb2660cede699
- Server running on port 5000 with full blockchain functionality

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build System**: Vite
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Blockchain Integration**: VeChain Connex framework for wallet connectivity

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication
- **API Design**: RESTful endpoints with error handling
- **Security**: Multi-tier rate limiting

### Blockchain Integration
- **Network**: VeChain Thor blockchain (testnet/mainnet ready)
- **Token**: B3TR tokens (VIP-180 standard) distributed via VeBetterDAO
- **Distribution Model**: 70% to users, 30% to app fund
- **Wallet Support**: VeWorld wallet integration via Connex SDK
- **Token Standard**: VIP-180 (VeChain's enhanced version of ERC-20)

### Key Features
- **Receipt Validation**: Multi-tier system with auto-approval (e.g., ride-share) and manual review for others. Leverages OpenAI Vision API (GPT-4o) for content analysis and fraud detection (SHA-256 hashing, duplicate prevention).
- **Transportation Services Database**: Comprehensive database covering various sustainable transport options.
- **Achievement System**: Gamified progression with blockchain-verified milestones and CO₂ savings tracking.
- **Admin Dashboard**: Google Sheets integration for manual review workflow, including flagging suspicious receipts, image verification, and streamlined approval processes.
- **Deployment Ready**: Configured for Replit Autoscale with health checks, proper port binding, and blockchain initialization.

### Deployment Configuration
- **Health Check**: /health endpoint monitors system status and blockchain configuration
- **Port Configuration**: External port 80 → Internal port 5000 for Autoscale compatibility
- **Environment Variables**: Fallback values for blockchain addresses ensure deployment stability
- **Production Script**: Custom start.sh handles environment setup and graceful startup

## External Dependencies

- **VeChain Thor**: Primary blockchain network.
- **VeBetterDAO**: Smart contract ecosystem for B3TR token distribution.
- **Connex Framework**: VeChain wallet integration library.
- **OpenAI Vision API (GPT-4o)**: For AI-powered receipt content analysis and validation.
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: For type-safe database operations.
- **Google Sheets API**: For manual review workflow integration.