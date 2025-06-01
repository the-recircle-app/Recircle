# ReCircle - Sustainability Rewards Platform

[![VeBetterDAO](https://img.shields.io/badge/VeBetterDAO-Integrated-green)](https://www.vebetterdao.org/)
[![VeChain](https://img.shields.io/badge/VeChain-Thor-blue)](https://www.vechain.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌱 Overview

ReCircle is a blockchain-powered circular economy platform that transforms sustainable consumption into an engaging, rewarding digital experience using VeChain Thor technology. Users earn B3TR tokens by scanning receipts from sustainable stores, contributing to environmental impact tracking, and building a community-driven marketplace for eco-friendly commerce.

## 🚀 Features

### Core Functionality
- **Receipt Validation**: AI-powered receipt scanning using OpenAI Vision API with fraud detection
- **Fraud Prevention**: Advanced image analysis, duplicate detection, and suspicious pattern identification
- **Blockchain Rewards**: Automated B3TR token distribution via VeBetterDAO smart contracts
- **Impact Tracking**: Real-time environmental impact metrics (CO₂ saved, sustainability score)
- **Store Network**: Community-driven sustainable store verification system
- **Gamification**: Achievement badges with blockchain verification

## 📱 Platform Screenshots

## Receipt Scanning Process
[Scan a receipt option on homepage |](https://github.com/user-attachments/assets/9cffdd7a-d134-4caf-866b-fcd1e2e45a83)Add commentMore actions
[Receipt upload Enable Camera and Upload from Gallery |](https://github.com/user-attachments/assets/f02ce7b1-0d42-4aff-8afe-839b2d568f2e)
[Receipt upload instructions |](https://github.com/user-attachments/assets/056ffe5b-a31c-4250-acd5-63b876234082)
[Success toast notification before receipt submission |](https://github.com/user-attachments/assets/4998342a-ab18-47b6-9663-ab7d07c2e227)
[Test receipt details |](https://github.com/user-attachments/assets/0161b930-d05c-4a92-a6d5-8a07c94e9174)
[Sustainable category options |](https://github.com/user-attachments/assets/c181bef9-15ec-4338-9037-82c89b6db032)
[Success screen after receipt submission](https://github.com/user-attachments/assets/d2ae6e45-85e2-4c0d-8c88-09e5f39443b0)

### VeChain Wallet Integration
[Wallet Connect Before |](https://github.com/user-attachments/assets/d3c9f2d6-6c78-4a7a-bd73-136509940d73)
[Wallet Connect After](https://github.com/user-attachments/assets/ea5bfa97-df72-485e-8b2f-c52422da7d11)

### Impact Tracking Dashboard
[impact-explorer-dashboard |](https://github.com/user-attachments/assets/eeef1c12-097a-4f1e-9fce-67e9b7fcf858)
[impact-explorer-dashboard with badge |](https://github.com/user-attachments/assets/5577b61e-6078-4a10-bf6e-de864a99f6b5)
[impact-explorer-dashboard badge progression](https://github.com/user-attachments/assets/379923d4-d9f2-4d43-a5f5-0db685bfffb8)

### Reward Distribution
[First Eco Purchase Achievement unlock notification with 70/30 split detailed info and streak/bonus info |](https://github.com/user-attachments/assets/ecde63c0-aa8b-44c9-afbe-eca834fb239a)
[Transaction history and transaction details |](https://github.com/user-attachments/assets/c993249a-533b-484c-86ce-f426ef6de964)
[blockchain integration with View on Vechain Ex](https://github.com/user-attachments/assets/115e54ac-5b1d-4b29-9413-2b0f1d4c248a)

### Technical Highlights
- **VeChain Integration**: Native VeWorld wallet connection with Connex framework
- **Smart Contract Integration**: VeBetterDAO 70/30 distribution model implementation
- **Advanced Fraud Detection**: Receipt image storage with SHA-256 hashing and duplicate prevention
- **Google Sheets Automation**: Enhanced receipt validation and approval workflow with image viewing
- **Admin Security Interface**: Manual review system for suspicious submissions
- **Impact Explorer**: Comprehensive sustainability achievement dashboard
- **Mobile-First Design**: Responsive interface optimized for mobile devices

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

## 📊 Impact Metrics

The platform tracks comprehensive sustainability metrics:

- **Environmental Impact**: CO₂ emissions saved, waste reduction
- **Community Growth**: Stores added, user engagement
- **Token Economics**: B3TR distribution, reward tracking
- **Achievement System**: Blockchain-verified sustainability badges

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

ReCircle is designed mobile-first with:
- **Progressive Web App** capabilities
- **Native camera integration** for receipt scanning
- **Offline functionality** for core features
- **Push notifications** for reward updates

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌍 Environmental Impact

ReCircle is committed to environmental sustainability:
- **Carbon Neutral**: Built on VeChain's energy-efficient blockchain
- **Circular Economy**: Promoting reuse and sustainable consumption
- **Community Driven**: Empowering users to make environmental impact
- **Transparent Tracking**: Real-time sustainability metrics

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/the-recircle-app/Recircle/issues)
- **Community**: Join our Discord server
- **Email**: recircleapp@gmail.com

---

Built with ❤️ for a sustainable future | Powered by VeChain & VeBetterDAO
