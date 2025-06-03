# ReCircle - Sustainable Transportation Rewards Platform

[![VeBetterDAO](https://img.shields.io/badge/VeBetterDAO-Integrated-green)](https://www.vebetterdao.org/)
[![VeChain](https://img.shields.io/badge/VeChain-Thor-blue)](https://www.vechain.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚗 Overview

ReCircle is a blockchain-powered rewards platform that incentivizes sustainable transportation choices through B3TR token distribution. Users earn rewards by submitting receipts from ride-share services, electric vehicle rentals, and public transit, contributing to reduced carbon emissions and promoting eco-friendly mobility solutions.

## 🚀 Features

### Core Functionality
- **Transportation Receipt Validation**: AI-powered receipt scanning for ride-share, electric vehicles, and public transit
- **Multi-Tier Processing**: Auto-approval for ride-share services, manual review for public transit accuracy
- **Blockchain Rewards**: Automated B3TR token distribution via VeBetterDAO smart contracts (70/30 model)
- **Carbon Impact Tracking**: Real-time CO₂ emissions saved through sustainable transportation choices
- **Transportation Network**: Comprehensive database of sustainable mobility services
- **Smart Validation**: OpenAI Vision API with fraud detection and duplicate prevention

### Technical Highlights
- **Multi-Tier Validation**: Auto-approval for ride-share (Uber, Lyft, Waymo), manual review for public transit
- **VeChain Integration**: Native VeWorld wallet connection with Connex framework
- **Smart Contract Integration**: VeBetterDAO 70/30 distribution model implementation
- **Transportation Categories**: Ride-share, electric vehicle rentals, public transit with specialized handling
- **Google Sheets Automation**: Manual review workflow for public transit receipt verification
- **Advanced Rate Limiting**: Comprehensive API protection against abuse and fraud
- **Mobile-First Design**: Optimized for on-the-go transportation receipt submission

## 🏗️ Architecture

### Frontend Stack
- **React** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** + shadcn/ui for modern, accessible UI components
- **Wouter** for client-side routing
- **TanStack Query** for efficient data fetching and caching

### Backend Stack
- **Node.js** with Express server
- **PostgreSQL** with Drizzle ORM for type-safe database operations
- **OpenAI Vision API** for intelligent receipt analysis
- **VeChain Thor** blockchain integration

### Blockchain Integration
- **VeBetterDAO Smart Contracts** for transparent token distribution
- **VeChain Thor Network** for sustainable blockchain operations
- **70/30 Distribution Model**: 70% to users, 15% each to creator and app funds

## 📊 Transportation Impact Metrics

The platform tracks comprehensive transportation sustainability metrics:

- **Carbon Emissions Saved**: CO₂ reduction through shared and electric mobility
- **Transportation Modes**: Ride-share usage, electric vehicle adoption, public transit utilization
- **Token Economics**: B3TR distribution across transportation categories
- **Mobility Patterns**: User engagement with sustainable transportation options

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- VeChain wallet (VeWorld recommended)

### Environment Variables
```bash
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
CREATOR_FUND_WALLET=your_creator_wallet_address
APP_FUND_WALLET=your_app_fund_wallet_address
```

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/recircle.git
cd recircle

# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

## 🛡️ Security & Fraud Prevention

ReCircle implements advanced fraud detection to protect against sophisticated attacks experienced by other VeBetterDAO applications:

### Rate Limiting & Abuse Prevention
- **Enterprise Rate Limiting**: Comprehensive protection across all API endpoints
- **Receipt Validation**: 5 requests per 10 minutes to prevent AI API abuse
- **Receipt Submission**: 3 requests per 5 minutes to stop spam submissions
- **Authentication**: 10 requests per 15 minutes to prevent account creation abuse
- **Admin Protection**: 20 requests per hour for administrative functions
- **General API**: 100 requests per 15 minutes for overall system protection

### Fraud Detection Features
- **Receipt Image Storage**: SHA-256 hashing for duplicate detection and verification
- **Suspicious Pattern Recognition**: Automatic detection of handwritten receipts, unusual file sizes, and editing traces
- **Visual Verification**: Manual reviewers can view actual receipt images through Google Sheets integration
- **Admin Interface**: Dedicated fraud detection dashboard at `/admin/fraud-detection` for high-risk submissions
- **Metadata Analysis**: File size, compression patterns, and editing software detection
- **Real-time Alerts**: Automatic flagging of suspicious submissions for manual review

### Security Measures
- **Cryptographic Hashing**: Prevents duplicate image submissions
- **Image Metadata Extraction**: Detects signs of manipulation or editing
- **Manual Review Workflow**: Human verification for flagged submissions
- **Audit Trail**: Complete logging of all receipt submissions and approvals
- **Protected API Endpoints**: Secure access controls for sensitive operations

## 🔗 VeBetterDAO Integration

ReCircle implements the VeBetterDAO standard for transparent, sustainable token distribution:

### Technical Proof
- **Distribution Model**: 70% user rewards, 15% creator fund, 15% app fund
- **Smart Contract**: Integrated with VeBetterDAO's verified contract system
- **Transaction Transparency**: All distributions publicly verifiable on VeChain Explorer
- **Sustainability Focus**: Aligned with VeBetterDAO's environmental impact mission

### Verified Transactions
All token distributions are publicly verifiable on VeChain Explorer. Transaction hashes are provided in the application's Impact Explorer for full transparency.

## 📱 Mobile Experience

ReCircle is designed mobile-first for on-the-go transportation receipt submission:
- **Progressive Web App** capabilities for seamless mobile access
- **Native camera integration** for quick transportation receipt capture
- **Real-time validation** for immediate ride-share receipt processing
- **Offline functionality** for receipt storage until network connection

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌍 Transportation & Environmental Impact

ReCircle promotes sustainable mobility solutions:
- **Carbon Reduction**: Incentivizing shared transportation and electric vehicles
- **Sustainable Mobility**: Promoting public transit, ride-sharing, and electric vehicle adoption
- **Community Impact**: Empowering users to choose eco-friendly transportation
- **Transparent Tracking**: Real-time carbon emissions saved through sustainable transportation choices

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/the-recircle-app/Recircle/issues)
- **Community**: Join our Discord server
- **Email**: recircleapp@gmail.com

---

Built with ❤️ for a sustainable future | Powered by VeChain & VeBetterDAO
