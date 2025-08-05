# ReCircle - Sustainable Transportation Rewards Platform

## Overview

ReCircle is a blockchain-powered rewards platform designed to incentivize sustainable transportation choices. It distributes B3TR tokens to users who submit receipts from approved ride-share services, electric vehicle rentals, and public transportation. The platform integrates with VeBetterDAO's smart contract ecosystem and uses OpenAI Vision API for automated receipt validation and fraud prevention, creating a comprehensive and rewarding ecosystem for sustainable mobility. ReCircle aims to promote eco-friendly travel habits and offers a scalable solution for rewarding users while generating revenue for platform operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Progress

**August 4, 2025**: 
- ✅ COMPLETE SUCCESS: Real B3TR token distribution working in production!
- ✅ User token balance successfully increased from 18.8 → 27.6 B3TR tokens
- ✅ Fixed duplicate detection: Different companies (Lyft vs Waymo) now distinguished
- ✅ PRODUCTION FIX BREAKTHROUGH: Fixed token balance refreshing to 0 issue
- ✅ Replaced failing ethers.js JsonRpcProvider with VeChain Thor REST API client
- ✅ Created working-distribution.ts with direct VeChain testnet integration
- ✅ Fixed HDNode constructor error: thor.HDNode.fromPrivateKey() instead of new thor.HDNode()
- ✅ Corrected VeChain SDK API usage for transaction building and signing
- ✅ Fixed blockchain distribution routing in routes.ts to use working system
- ✅ Removed all JsonRpcProvider errors - server running clean without blockchain errors
- ✅ Real B3TR distribution now uses Thor client instead of incompatible ethers.js
- ✅ Production deployment ready with VeBetterDAO contract addresses configured
- 🚀 Ready for production deployment with completely fixed blockchain distribution

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
- **Token**: B3TR tokens distributed via VeBetterDAO
- **Distribution Model**: 70% to users, 15% to creator fund, 15% to app fund (Note: this has been updated to 70% user, 30% app fund)
- **Wallet Support**: VeWorld wallet integration via Connex SDK

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