# ReCircle - Sustainable Transportation Rewards Platform

## Overview
ReCircle is a mobile-only blockchain-powered rewards platform designed to incentivize sustainable transportation. It distributes B3TR tokens for approved ride-share, EV rental, and public transport receipts. The platform integrates with VeBetterDAO's smart contracts and utilizes OpenAI Vision API for receipt validation. Its core purpose is to promote eco-friendly travel while offering a scalable, revenue-generating solution for rewarding users. The project aims to contribute to a greener future by making sustainable choices more rewarding.

**Platform Requirements:**
- Mobile device required (iOS or Android) for camera-based receipt scanning
- VeWorld wallet required for blockchain interactions and B3TR token management
- Desktop browsers are blocked with a download page directing users to VeWorld mobile app

## Recent Changes

### December 30, 2025
- **Internal Ban List System**: Added admin-controlled ban system for wallet restrictions. Supports "hard" bans (block rewards entirely) and "soft" bans (force manual review). Admin endpoints: GET /api/admin/ban-list, POST /api/admin/ban-user, POST /api/admin/unban-user, GET /api/admin/ban-history/:wallet. Ban check runs after VePassport, before reward distribution.
- **Image Storage Cleanup**: Added automated cleanup for receipt images older than 30 days. Admin endpoints: GET /api/admin/storage-stats, POST /api/admin/cleanup-images. Includes storage statistics and retention management.
- **Fixed Analytics User Engagement Metrics**: Daily/weekly/monthly active user counts now correctly use lastActivityDate instead of non-existent lastLoginAt field. Also fixed newUsersThisWeek calculation to use first receipt date.

### December 26, 2025
- **VePassport Bot Signaling Integration**: Integrated VeBetterDAO's VePassport contract for bot detection. Before distributing rewards, the app checks if a wallet has been flagged by the community. Flagged wallets are blocked from receiving rewards with a friendly message. This is a READ-ONLY integration (no endorsement required) that demonstrates commitment to bot protection. The check only runs on mainnet - testnet development is unaffected.

### November 16, 2025
- **Treasury Depletion UX**: Added friendly messaging when VeBetterDAO treasury runs out of B3TR tokens. Instead of generic errors, users see encouraging messages celebrating the app's popularity and prompting them to vote for ReCircle on VeBetterDAO. Backend detects "Insufficient treasury funds" errors and passes `treasuryDepleted: true` flag to frontend, which displays custom positive messaging.

### November 5, 2025
- **Fixed AI Receipt Amount Bug**: OpenAI was confusing `totalAmount` (receipt dollar amount) with B3TR reward amount. Updated prompts to explicitly clarify that `totalAmount` should extract the USD dollar amount from the receipt (e.g., $26.67), not the estimated reward (e.g., 8.5 B3TR). This fixes incorrect CO2 calculations and proof strings.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Network**: VeChain Thor blockchain (mainnet ready)
- **Token**: B3TR tokens distributed via VeBetterDAO
- **Distribution Model**: 70% to users, 30% to app fund (both via VeBetterDAO treasury system)
- **Wallet Support**: VeWorld wallet only (mobile app or mobile browser with VeWorld)
- **Platform Detection**: Mobile-only access with VeWorld browser detection. Desktop browsers (including those with VeWorld extension) are blocked and shown a download page. Matches Greencart/Mugshot access pattern.
- **Access Control**: VeWorldBrowserGate component checks for mobile device first, then polls for VeWorld injection (window.vechain/connex) for up to 3 seconds before deciding access.
- **Smart Fee Delegation**: Strategic transaction sponsoring via VeChain Energy with conditional VTHO balance checks.

### Key Features
- **Receipt Validation**: Multi-tier system using OpenAI Vision API (GPT-4o) for content analysis, fraud detection (SHA-256 hashing, duplicate prevention), and auto-approval.
- **VePassport Integration**: Checks VeBetterDAO's VePassport contract before distributing rewards to block flagged/bot wallets (mainnet only).
- **Transportation Services Database**: Comprehensive database of sustainable transport options.
- **Achievement System**: Gamified progression with blockchain-verified milestones and CO₂ savings tracking.
- **Referral System**: Rewards inviters with B3TR upon invitee's first valid receipt, using referral codes for VeWorld-compatible sharing.
- **Admin Dashboard**: Google Sheets integration for manual review, flagging suspicious receipts, and approval workflows.
- **Gift Card Marketplace**: Integration with Tremendous API for B3TR token redemption against gift cards, featuring B3TR pricing service (CoinGecko API), order history, and configurable markup.
- **Send/Receive Functionality**: B3TR token transfers using VeChain Kit V2, with a dedicated UI for sending and receiving B3TR.

### Deployment Configuration
- **Health Check**: `/health` endpoint.
- **Port Configuration**: External port 80 → Internal port 5000.
- **Environment Variables**: Fallback values for blockchain addresses.
- **Deployment Platform**: Replit Autoscale.

## External Dependencies

- **VeChain Thor**: Primary blockchain network.
- **VeBetterDAO**: Smart contract ecosystem for B3TR token distribution.
- **Connex Framework**: VeChain wallet integration library.
- **OpenAI Vision API (GPT-4o)**: For AI-powered receipt content analysis and validation.
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: For type-safe database operations.
- **Google Sheets API**: For manual review workflow integration.
- **Tremendous API**: For gift card marketplace integration.
- **CoinGecko API**: For B3TR token pricing.
- **Privy**: Configured but not actively used (mobile-only + VeWorld-only access pattern).