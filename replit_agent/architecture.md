# Architecture Overview

## Overview

ReCircle is a web application that rewards users for sustainable shopping behaviors, particularly at thrift stores and other eco-friendly establishments. The application allows users to:

1. Connect their VeChain wallets
2. Scan receipts from sustainable stores to earn B3TR tokens
3. Find nearby sustainable stores on a map
4. Add new sustainable stores to the database
5. Track achievements and streaks
6. Redeem tokens for rewards
7. Invite friends using a referral system

The application is built with a modern stack using React for the frontend, Express for the backend, and PostgreSQL for data storage. It leverages blockchain technology through the VeChain platform for token management.

## System Architecture

The system follows a client-server architecture with a clear separation between frontend and backend:

```
┌─────────────────┐      ┌────────────────┐      ┌────────────────┐
│                 │      │                │      │                │
│  React Client   │◄────►│  Express API   │◄────►│  PostgreSQL DB │
│                 │      │                │      │                │
└─────────────────┘      └────────────────┘      └────────────────┘
        │                        │                       
        │                        │                       
        ▼                        ▼                       
┌─────────────────┐      ┌────────────────┐              
│                 │      │                │              
│ VeChain Wallet  │      │   OpenAI API   │              
│                 │      │                │              
└─────────────────┘      └────────────────┘              
```

### Key Architectural Decisions

1. **Full-Stack TypeScript**: The entire application uses TypeScript for type safety and improved developer experience.

2. **Monorepo Structure**: The project is organized as a monorepo with client, server, and shared code all in one repository.

3. **API-First Design**: Clear API boundaries are established between frontend and backend.

4. **Blockchain Integration**: VeChain blockchain is used for token management, providing transparency and security.

5. **Serverless Database**: The application uses Neon PostgreSQL, a serverless Postgres solution, for data storage.

6. **AI-Powered Receipt Validation**: OpenAI's API is used to validate receipts from sustainable stores.

7. **Progressive Web App**: The application is designed to work well on mobile devices, with features like camera access for receipt scanning.

## Key Components

### Frontend Architecture

The frontend is built with React and uses the following key libraries:

- **React**: Core UI library
- **TailwindCSS**: Utility-first CSS framework for styling
- **Radix UI**: Accessible UI primitives
- **Wouter**: Lightweight routing library
- **React Query**: Data fetching and state management
- **Framer Motion**: Animation library

The frontend follows a component-based architecture with:

- **Pages**: Full-page components that represent routes
- **Components**: Reusable UI elements
- **Context**: Global state management for authentication and wallet connection
- **Hooks**: Custom React hooks for shared functionality
- **Lib**: Utility functions and API clients

### Backend Architecture

The backend is built with Express and provides RESTful APIs for:

- User authentication and management
- Receipt validation and reward calculation
- Store management and discovery
- Transaction tracking and history
- Achievement tracking and rewards

Key backend components include:

- **Routes**: API endpoint definitions
- **Storage**: Database access layer
- **Utils**: Utility functions for business logic
- **Middleware**: Request processing and error handling

### Data Storage

The application uses PostgreSQL via the Neon serverless platform with the following schema structure:

1. **users**: User accounts, wallet addresses, and balances
2. **sustainable_stores**: Information about sustainable shopping locations
3. **receipts**: Validated purchase receipts
4. **transactions**: Token transactions and rewards
5. **referrals**: Referral system data

Data access is managed through Drizzle ORM, which provides type-safe database operations.

### External Integrations

1. **VeChain Blockchain**:
   - Wallet connection using Connex.js
   - B3TR token implementation using VIP-180 standard
   - Fee delegation through Multi-Party Payment (MPP)

2. **OpenAI**:
   - Receipt validation and analysis
   - Store category identification
   - Purchase amount extraction

3. **Google Maps**:
   - Store location display
   - Proximity search
   - Directions to stores

## Data Flow

### Receipt Verification Flow

1. User uploads a receipt image
2. Backend sends image to OpenAI for analysis
3. OpenAI returns store name, amount, and sustainability classification
4. Backend validates the receipt and calculates token rewards
5. Tokens are credited to user's account
6. Transaction is recorded in database
7. Parallel sustainability rewards are issued to ecosystem wallets

### Store Addition Flow

1. User submits a new store with location details
2. Store is added to database with unverified status
3. Admin approves store through webhook or admin interface
4. User receives token reward for adding a verified store
5. Store becomes available for all users to see

### Wallet Connection Flow

1. User initiates wallet connection
2. VeChain wallet (VeWorld) connection is established
3. Wallet address is associated with user account
4. Token balance is synchronized between database and blockchain

## External Dependencies

### Core Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: Type-safe ORM for database access
- **express**: Backend web framework
- **react**: Frontend UI library
- **@tanstack/react-query**: Data fetching and state management
- **@vechain/connex**: VeChain blockchain connection library
- **openai**: OpenAI API client for receipt validation
- **@react-google-maps/api**: Google Maps integration

### Development Dependencies

- **typescript**: Static type checking
- **vite**: Frontend build tool
- **tsx**: TypeScript execution environment
- **tailwindcss**: Utility-first CSS framework
- **esbuild**: JavaScript bundler for server code

## Deployment Strategy

The application is deployed on Replit, a cloud development platform, with the following configuration:

1. **Environment**: Node.js 20 with PostgreSQL 16
2. **Build Process**:
   - `npm run build`: Builds both client and server code
   - Vite for frontend builds
   - esbuild for server-side code bundling

3. **Runtime Configuration**:
   - `npm run start`: Runs the production server
   - Server serves both API endpoints and static frontend assets

4. **Environment Variables**:
   - `DATABASE_URL`: Connection string for Neon PostgreSQL
   - `OPENAI_API_KEY`: API key for OpenAI services
   - `VITE_GOOGLE_MAPS_API_KEY`: API key for Google Maps
   - `CREATOR_WALLET_ADDRESS`: VeChain wallet for sustainability rewards
   - `APP_SUSTAINABILITY_WALLET_ADDRESS`: VeChain wallet for app ecosystem

5. **Port Configuration**:
   - Local port 5000 maps to external port 80

This deployment strategy allows for continuous integration and deployment directly from the Replit environment.

## Security Considerations

1. **Wallet Security**: User wallet connections are established client-side only, with no private keys stored on the server.

2. **API Protection**: Backend validates all requests and implements proper CORS and rate limiting.

3. **Image Validation**: Receipt images are validated both client-side and server-side before processing.

4. **Environment Variables**: Sensitive credentials are stored as environment variables, not in the code.

5. **Daily Action Limits**: The system implements maximum daily action limits to prevent abuse.