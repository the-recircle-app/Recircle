# ReCircle - Sustainable Transportation Rewards Platform

## Overview
ReCircle is a blockchain-powered rewards platform designed to incentivize sustainable transportation. It distributes B3TR tokens for approved ride-share, EV rental, and public transport receipts. The platform integrates with VeBetterDAO's smart contracts and utilizes OpenAI Vision API for receipt validation. Its core purpose is to promote eco-friendly travel while offering a scalable, revenue-generating solution for rewarding users. The project aims to contribute to a greener future by making sustainable choices more rewarding.

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
- **Wallet Support**: Primarily VeWorld wallet. Universal app access is enabled, allowing VeWorld mobile users to connect via VeWorld wallet and desktop/mobile browser users to use Privy social login.
- **Platform Detection**: Removed VeWorld platform detection for universal app access.
- **Smart Fee Delegation**: Strategic transaction sponsoring via VeChain Energy with conditional VTHO balance checks.

### Key Features
- **Receipt Validation**: Multi-tier system using OpenAI Vision API (GPT-4o) for content analysis, fraud detection (SHA-256 hashing, duplicate prevention), and auto-approval.
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
- **Privy**: For social login authentication (for non-VeWorld users).