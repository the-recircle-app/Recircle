# ReCircle - Sustainable Transportation Rewards Platform

## Overview

ReCircle is a blockchain-powered rewards platform incentivizing sustainable transportation through B3TR token distribution for approved ride-share, EV rental, and public transport receipts. It integrates with VeBetterDAO's smart contracts and uses OpenAI Vision API for receipt validation, promoting eco-friendly travel and offering a scalable, revenue-generating solution for rewarding users.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 4, 2025 - Send/Receive Features & Settings Implementation**
- Built B3TR transfer component using VeChain Kit V2 useSendTransaction hook with proper amount conversion (parseUnits)
- Updated SmartAccountManager to correctly use smart account addresses for Privy users and EOA addresses for VeWorld users
- Created /send page with Mugshot-style UI (warnings, percentage buttons 25%/50%/75%/100%, form validation)
- Added "Connected Wallet" card to Transactions page with Send/Receive buttons matching Mugshot design
- Built Receive modal with address display and copy-to-clipboard functionality  
- Added Settings gear icon to Profile page
- Created Settings menu with Support/Developer/Privacy sections and Log out functionality
- Fixed critical bug: replaced float math with ethers.js parseUnits for accurate B3TR amount conversion

**October 4, 2025 - Project Import Setup**
- Created PostgreSQL database and pushed schema using Drizzle ORM
- Fixed npm script paths to use direct node_modules references for tsx and drizzle-kit
- Configured Vite dev server with proper Replit proxy settings (host: 0.0.0.0, allowedHosts: true)
- Removed corrupted source map file and disabled sourcemaps to prevent build errors
- Set up Server workflow running on port 5000
- Configured deployment for Autoscale with npm build and start commands
- Application successfully running with VeChain testnet integration

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
- **Distribution Model**: 70% to users, 30% to app fund (both via VeBetterDAO treasury system)
- **Wallet Support**: VeWorld wallet integration via Connex SDK
- **Smart Fee Delegation**: Strategic transaction sponsoring via VeChain Energy with conditional VTHO balance checks based on user VTHO balance thresholds (e.g., newcomers < 5 VTHO, low balance < 10 VTHO).

### Key Features
- **Receipt Validation**: Multi-tier system using OpenAI Vision API (GPT-4o) for content analysis, fraud detection (SHA-256 hashing, duplicate prevention), and auto-approval.
- **Transportation Services Database**: Comprehensive database of sustainable transport options.
- **Achievement System**: Gamified progression with blockchain-verified milestones and CO₂ savings tracking.
- **Referral System**: Rewards inviters with 15 B3TR upon invitee's first valid receipt, featuring automatic processing, concurrency protection, and on-chain distribution. Invitee receives ~18 B3TR total (8 B3TR base + 10 B3TR achievement).
- **Admin Dashboard**: Google Sheets integration for manual review, flagging suspicious receipts, and approval workflows.
- **Deployment Ready**: Configured for Replit Autoscale with health checks and proper port binding.
- **Verified Token Distribution**: Confirmed real B3TR token flow to user VeWorld wallets.

### Deployment Configuration
- **Health Check**: `/health` endpoint.
- **Port Configuration**: External port 80 → Internal port 5000.
- **Environment Variables**: Fallback values for blockchain addresses.

### Critical Deployment Requirements
- **Database Schema Updates**:
    1. `referrals.status` column migration to support 'pending' | 'processing' | 'rewarded'.
    2. `transactions.userId` column to allow NULLs for system/app-fund transactions.
    3. Unique constraint on `referrals` table and unique index on `(type, referenceId)` for `transactions` to prevent duplicates.
- **Reconciliation & Monitoring**: Implement monitoring for stuck referrals and periodic reconciliation.

## External Dependencies

- **VeChain Thor**: Primary blockchain network.
- **VeBetterDAO**: Smart contract ecosystem for B3TR token distribution.
- **Connex Framework**: VeChain wallet integration library.
- **OpenAI Vision API (GPT-4o)**: For AI-powered receipt content analysis and validation.
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: For type-safe database operations.
- **Google Sheets API**: For manual review workflow integration.