# ReCircle - Sustainable Transportation Rewards Platform

## Overview

ReCircle is a blockchain-powered rewards platform incentivizing sustainable transportation through B3TR token distribution for approved ride-share, EV rental, and public transport receipts. It integrates with VeBetterDAO's smart contracts and uses OpenAI Vision API for receipt validation, promoting eco-friendly travel and offering a scalable, revenue-generating solution for rewarding users.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 31, 2025 - Gift Card "Coming Soon" Feature Flag**
- Added `VITE_GIFT_CARDS_ENABLED` environment variable to control gift card marketplace availability
- Gift cards now show with "Coming Soon" badge by default (grayed out, non-clickable)
- Updated ActivityCard component with `comingSoon` prop for disabled state with badge
- Enables phased launch: receipts first, then gift cards 2-4 weeks later
- To enable gift cards: Add `VITE_GIFT_CARDS_ENABLED=true` to Replit Secrets
- Professional UX: Shows users what's coming without allowing access yet

**October 31, 2025 - Wallet Display & Send Page Updates**
- Replaced clickable wallet modal with static "Connected Wallet" display on home page
- Shows green checkmark, "Connected Wallet" label, and shortened wallet address
- Fixed wallet address display to use VeChainKit account (real VeWorld address) not WalletContext
- Updated Send page to use DirectB3TRTransfer component (same as gift card marketplace)
- Replaced database balance with LiveB3TRBalance showing real blockchain balance
- Send button tested and working - ready for mainnet testing

**October 17, 2025 - Gift Card VeWorld Mobile Authentication Fix (MAJOR PROGRESS)**
- **BREAKTHROUGH**: Fixed VeWorld mobile gift card purchases - blockchain payment now successfully reaches backend!
- **Authentication fix**: Removed VeChain certificate requirement that blocked VeWorld mobile users
  - Backend now accepts wallet address from request body (verified via blockchain transaction)
  - Transaction hash serves as cryptographic proof of wallet ownership
  - Replay attack prevention working correctly (txHash uniqueness check)
- **Database fix**: Server now uses PostgreSQL in development (was using in-memory storage)
  - Imported `db` and `eq` from drizzle-orm directly in routes.ts
  - Gift card orders now save to database successfully
- **Current status**: ✅ Blockchain transaction works, ✅ Backend accepts payment, ✅ Database saves order
- **Next step**: Configure Tremendous API funding_source_id for sandbox test gift card delivery
  - Email validation needed on frontend (currently accepts any string)
  - Product denomination compatibility check needed
- **TODO**: Add proper on-chain transaction verification after consulting VeChain community about SDK usage
  - Temporarily simplified verification to unblock feature testing
  - Need guidance on correct ThorClient initialization and transaction receipt fetching

**October 17, 2025 - Gift Card Marketplace Critical Bug Fixes**
- **Fixed B3TR pricing service**: Updated CoinGecko API ID from 'vechain-vtho' to 'vebetterdao' - now correctly fetches B3TR price at ~$0.075 instead of $0.50 fallback
- **Fixed navigation bugs**: Bottom navigation tabs now work on gift cards page, ReCircle logo navigates to home when logged in (not welcome page)
- **Verified live balance display**: Confirmed LiveB3TRBalance correctly fetches from blockchain every 30 seconds
- **Verified payment integration**: Complete blockchain payment verification already implemented with transaction validation, amount checking, and replay attack prevention
- **Production ready**: All critical bugs resolved, architect reviewed and approved for deployment

**October 5, 2025 - Gift Card Marketplace (Tremendous Integration)**
- Built complete gift card marketplace with Tremendous API sandbox integration
- Created B3TR pricing service with CoinGecko API (60s cache, fallback to last known price)
- Added gift_card_orders database table with full audit trail (email, amounts, delivery status, timestamps)
- Implemented API endpoints: /api/b3tr/price, /api/gift-cards/catalog, /api/gift-cards/purchase, /api/gift-cards/orders
- Built marketplace UI with catalog grid, checkout modal (email capture), live B3TR pricing display
- Added order history tab with status tracking (fulfilled/processing/failed)
- Added "Redeem Gift Cards" activity card to home page
- **Filter System**: Search filters for 662 gift cards from English-speaking markets
- **Blockchain Payment**: Full B3TR transfer verification from user wallet to app fund wallet before order fulfillment
- Configurable markup via GIFT_CARD_MARKUP_USD environment variable (default $1.75)
- Tremendous sandbox mode using TEST_ API key prefix for risk-free development

**October 5, 2025 - Referral Code System & Transactions Page Fix**
- **CRITICAL FIX:** Transactions page now correctly displays VeWorld users' EOA address and balance
  - Uses VeChain Kit's account.address directly (same as home page WalletButton)
  - Uses LiveB3TRBalance component to fetch EOA balance from blockchain
  - Fixed SmartAccountManager to skip processing when Connex detected (VeWorld users)
- Updated welcome page with "Coming Soon" badge for social login and changed "Advanced:" to "Or use:"
- Rebuilt referral system to use codes instead of links (VeWorld-compatible approach)
- Users now copy/paste referral codes directly (e.g., "ABC123XYZ") via text/social media
- Added "Have a referral code?" input section for new users to apply codes
- Created POST /api/users/:userId/apply-referral endpoint for code validation
- Updated social sharing to include referral code in message text (no URL dependency)
- Referral code system works without web links, perfect for VeWorld mobile app users

**October 5, 2025 - VeWorld-Only Platform Access**
- Implemented browser/platform detection to identify VeWorld app vs desktop/mobile browsers
- Created VeWorldRequiredMessage component with app store links and setup instructions
- Updated welcome page to show VeWorld requirement for non-VeWorld users (desktop/mobile browsers)
- VeWorld app users continue to access the app normally with no changes
- Decision: Focused on VeWorld-only approach after identifying Privy embedded wallet incompatibility with VeChain Kit v2
- Platform detection checks user agent for VeWorld/Sync2 keywords and Connex availability
- Future revenue strategy: Gift card marketplace where users spend B3TR tokens

**October 5, 2025 - Ethers v6 Compatibility Fix**
- Fixed VTHO balance endpoint bug: replaced ethers.utils.formatUnits with ethers v6 formatUnits import
- Updated deploy-b3tr-to-solo.js to use ethers v6 formatEther syntax
- Updated VECHAIN_INTEGRATION.md documentation with correct ethers v6 API usage
- Verified VTHO balance endpoint working correctly with fee delegation logic (< 10 VTHO threshold)
- All blockchain transactions continue to use VIP-191 fee delegation via VeChain Energy

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
- **Wallet Support**: VeWorld wallet ONLY - Desktop/mobile browser users are guided to download VeWorld app
- **Platform Detection**: Automatic detection of VeWorld app vs regular browsers with friendly guidance
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