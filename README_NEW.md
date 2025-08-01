# ReCircle - Sustainable Transportation Rewards Platform

<div align="center">
  <img src="client/public/mascot.png" alt="ReCircle Mascot" width="120" height="120">
  
  **🌍 Rewarding Sustainable Transportation Choices with Blockchain Technology**
  
  [![VeChain](https://img.shields.io/badge/VeChain-Thor-blue)](https://vechain.org)
  [![B3TR](https://img.shields.io/badge/Token-B3TR-green)](https://vebetterdao.org)
  [![VeBetterDAO](https://img.shields.io/badge/Powered%20by-VeBetterDAO-orange)](https://vebetterdao.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org)
  [![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
  
</div>

## 🚀 Overview

ReCircle is a blockchain-powered rewards platform that incentivizes sustainable transportation choices through B3TR token distribution. Users earn rewards by submitting receipts from ride-share services, electric vehicle rentals, and public transportation, creating a comprehensive ecosystem for sustainable mobility.

Built with VeChain Builders Academy standards and integrated with VeBetterDAO's smart contract ecosystem, ReCircle provides automated receipt validation using OpenAI Vision API while maintaining robust fraud prevention mechanisms.

## ✨ Key Features

### 🎯 Transportation Rewards
- **Ride-Share Integration**: Uber, Lyft, Waymo receipts with auto-approval
- **Electric Vehicle Rentals**: Tesla, EV car-sharing services
- **Public Transit**: Metro, bus systems, regional transportation
- **Micro-Mobility**: E-scooters, bike-sharing programs

### 🔗 Blockchain Integration
- **VeChain Thor Network**: Testnet and mainnet support
- **B3TR Token Distribution**: Automatic rewards via VeBetterDAO
- **70/30 Fund Model**: 70% to users, 30% to app sustainability fund
- **VeWorld Wallet**: Seamless mobile wallet integration

### 🧠 AI-Powered Validation
- **OpenAI Vision API**: GPT-4o model for receipt analysis
- **Auto-Approval System**: High-confidence transportation services
- **Manual Review Workflow**: Google Sheets integration for verification
- **Fraud Detection**: SHA-256 hashing and duplicate prevention

### 🎮 Gamification
- **Achievement System**: Transportation milestones and streaks
- **Daily Bonuses**: Progressive rewards for consistent use
- **Environmental Impact**: CO₂ savings tracking
- **First Receipt Bonus**: +10 B3TR for new users

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build System**: Vite for optimized development and production
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack React Query
- **Routing**: Wouter for lightweight navigation
- **Blockchain**: VeChain Connex SDK integration

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with express-session
- **Security**: Multi-tier rate limiting and fraud detection
- **AI Integration**: OpenAI Vision API for receipt validation

### Smart Contracts
- **Network**: VeChain Thor blockchain
- **Token Standard**: B3TR via VeBetterDAO infrastructure
- **Distribution**: Automated 70/30 reward allocation
- **Compliance**: VeChain Builders Academy standards

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- VeWorld wallet (for users)
- API keys: OpenAI, Google Sheets (optional)

### Environment Setup
```bash
# Clone the repository
git clone https://github.com/your-username/recircle.git
cd recircle

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:push

# Start development server
npm run dev
```

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/recircle

# OpenAI (for receipt validation)
OPENAI_API_KEY=your_openai_api_key

# VeChain Configuration
VECHAIN_NETWORK=testnet
REWARD_DISTRIBUTOR_WALLET=0x...
APP_FUND_WALLET=0x...

# Google Sheets (optional - for manual review)
GOOGLE_SHEETS_WEBHOOK_URL=https://...
```

## 📱 User Experience

### Getting Started
1. **Connect VeWorld Wallet**: Download VeWorld mobile app
2. **Professional Onboarding**: Welcome page with clear instructions
3. **Submit First Receipt**: Transportation receipt for validation
4. **Earn B3TR Tokens**: Automatic distribution upon approval
5. **Track Progress**: View achievements and environmental impact

### Supported Transportation Types
- **Ride-Share**: Uber, Lyft, Waymo (auto-approved)
- **Car Rentals**: Hertz, Enterprise, Tesla
- **Public Transit**: Metro, bus, train systems
- **Micro-Mobility**: Lime, Bird, bike-sharing

## 🔧 Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # 70+ React components
│   │   ├── pages/          # Application pages
│   │   ├── context/        # React Context providers
│   │   ├── lib/            # Utilities and configurations
│   │   └── assets/         # Images and branding
├── server/                 # Express backend
│   ├── utils/              # Business logic utilities
│   ├── middlewares/        # Express middlewares
│   ├── db/                 # Database schema
│   └── routes/             # API endpoints
├── shared/                 # Shared TypeScript types
└── contracts/              # Smart contracts
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run db:push      # Push database schema changes
npm run db:studio    # Open Drizzle Studio
npm test             # Run test suite
```

### Testing
The project includes comprehensive testing with 40+ test scripts:
```bash
# Test blockchain distribution
npm run test:blockchain

# Test receipt validation
npm run test:receipts

# Test Google Forms integration
npm run test:google-forms
```

## 🚀 Deployment

### Replit Deployment (Recommended)
1. Import project to Replit
2. Configure environment variables
3. Run `npm install`
4. Click "Deploy" button
5. Application auto-scales with traffic

### Production Environment
- **Hosting**: Replit Autoscale (4 vCPU / 8 GiB RAM)
- **Database**: PostgreSQL with connection pooling
- **Security**: HTTPS, rate limiting, fraud detection
- **Monitoring**: Real-time error logging

## 🔐 Security

### Fraud Prevention
- **Receipt Validation**: AI-powered content analysis
- **Duplicate Detection**: SHA-256 hashing system
- **Rate Limiting**: Multi-tier request protection
- **Wallet Verification**: VeChain signature validation

### Data Protection
- **Session Security**: Secure cookie configuration
- **API Protection**: Request validation and sanitization
- **Database Security**: Parameterized queries with Drizzle ORM

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use ESLint and Prettier configurations
3. Write tests for new features
4. Update documentation
5. Follow VeChain Builders Academy standards

### Getting Involved
- 🐛 **Bug Reports**: Use GitHub issues
- 💡 **Feature Requests**: Discuss in GitHub discussions
- 🔧 **Pull Requests**: Follow contribution guidelines
- 📧 **Contact**: Use in-app feedback forms

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [VeChain Integration](./VECHAIN_INTEGRATION.md)
- [Changelog](./CHANGELOG.md)

## 🌟 Roadmap

### Current (Q1 2025)
- ✅ Transportation receipt validation
- ✅ VeWorld wallet integration
- ✅ Google Forms manual review
- ✅ Professional UI/UX

### Upcoming (Q2 2025)
- 🔄 Multi-language support
- 🔄 Enhanced analytics dashboard
- 🔄 Carbon footprint calculator
- 🔄 Corporate partnerships

### Future (Q3+ 2025)
- 🔮 NFT achievement system
- 🔮 Social sharing features
- 🔮 Advanced ML fraud detection
- 🔮 Cross-chain compatibility

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- **VeChain Foundation**: For blockchain infrastructure and VeChain Builders Academy
- **VeBetterDAO**: For B3TR token distribution platform
- **OpenAI**: For advanced receipt validation capabilities
- **Community**: For feedback and continuous improvement

---

<div align="center">
  <strong>Building a Sustainable Future, One Receipt at a Time</strong><br>
  Made with ❤️ for the environment and powered by VeChain
</div>