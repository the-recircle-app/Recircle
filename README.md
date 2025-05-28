# ReCircle - Sustainability Rewards Platform

[![VeBetterDAO](https://img.shields.io/badge/VeBetterDAO-Integrated-green)](https://www.vebetterdao.org/)
[![VeChain](https://img.shields.io/badge/VeChain-Thor-blue)](https://www.vechain.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌱 Overview

ReCircle is a blockchain-powered circular economy platform that transforms sustainable consumption into an engaging, rewarding digital experience using VeChain Thor technology. Users earn B3TR tokens by scanning receipts from second hand stores such as GoodWill and GameStop (preowned items) as well as electric vehicle rentals from companies like Hertz and rideshare trips from companies like Uber/Lyft/Waymo contributing to environmental impact tracking, and building a community-driven marketplace for eco-friendly commerce.

## 🚀 Features

### Core Functionality
- **Receipt Validation**: AI-powered receipt scanning using OpenAI Vision API
- **Blockchain Rewards**: Automated B3TR token distribution via VeBetterDAO smart contracts
- **Impact Tracking**: Real-time environmental impact metrics (CO₂ saved, sustainability score)
- **Store Network**: Community-driven sustainable store verification system
- **Gamification**: Achievement badges with blockchain verification

## 📱 Platform Screenshots

### Receipt Scanning & Validation
![Receipt Scanner Interface](screenshots/receipt-scanner.png)
*AI-powered receipt validation with real-time confidence scoring*

### VeChain Wallet Integration
[Wallet Connect Before](https://github.com/user-attachments/assets/d3c9f2d6-6c78-4a7a-bd73-136509940d73)
[Wallet Connect After](https://github.com/user-attachments/assets/ea5bfa97-df72-485e-8b2f-c52422da7d11)

*Seamless VeWorld wallet connection and B3TR token balance display*

### Impact Tracking Dashboard
![Impact Dashboard](screenshots/impact-dashboard.png)
*Environmental impact visualization with CO₂ savings and sustainability metrics*

### Reward Distribution
![Token Rewards](screenshots/token-rewards.png)
*VeBetterDAO 70/30 distribution model in action*

### Technical Highlights
- **VeChain Integration**: Native VeWorld wallet connection with Connex framework
- **Smart Contract Integration**: VeBetterDAO 70/30 distribution model implementation
- **Google Sheets Automation**: Seamless receipt validation and approval workflow
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
