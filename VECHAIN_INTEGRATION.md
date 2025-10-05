# VeChain Integration Guide

## 🔗 Overview

ReCircle is built using VeChain Builders Academy standards and integrates deeply with the VeChain Thor blockchain for secure, transparent reward distribution. This guide covers the complete VeChain integration architecture.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   VeChain       │
│   (Connex SDK)  │◄──►│   (Thor API)    │◄──►│   Thor Network  │
│                 │    │                 │    │                 │
│ • VeWorld       │    │ • Reward        │    │ • Smart         │
│   Connection    │    │   Distribution  │    │   Contracts     │
│ • Transaction   │    │ • Balance       │    │ • B3TR Tokens   │
│   Signing       │    │   Tracking      │    │ • VeBetterDAO   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 VeChain Configuration

### Network Configuration
```typescript
// Development (Testnet)
const testnetConfig = {
  node: 'https://testnet.veblocks.net',
  network: 'test',
  genesis: {
    number: 0,
    id: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
    timestamp: 1530316800
  }
};

// Production (Mainnet)
const mainnetConfig = {
  node: 'https://mainnet.veblocks.net',
  network: 'main',
  genesis: {
    number: 0,
    id: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
    timestamp: 1530316800
  }
};
```

### Wallet Addresses
```typescript
// Core system wallets
export const WALLETS = {
  REWARD_DISTRIBUTOR: '0x15D009B3A5811fdE66F19b2db1D40172d53E5653',
  APP_FUND: '0x119761865b79bea9e7924edaa630942322ca09d1',
  CREATOR_FUND: '0x87c844e3314396ca43e5a6065e418d26a09db02b' // Legacy
};
```

## 📱 Frontend Integration

### VeWorld Wallet Connection
```typescript
// Initialize Connex for VeWorld integration
import { Connex } from '@vechain/connex';

class VeWorldConnector {
  private connex: Connex | null = null;
  
  async connect(): Promise<string> {
    try {
      // Check for VeWorld availability
      if (typeof window !== 'undefined' && window.vechain) {
        this.connex = new Connex({
          node: process.env.VECHAIN_NETWORK === 'mainnet' 
            ? 'https://mainnet.veblocks.net'
            : 'https://testnet.veblocks.net',
          network: process.env.VECHAIN_NETWORK || 'test'
        });
        
        // Request account access
        const accounts = await this.connex.vendor.sign('cert', {
          purpose: 'identification',
          payload: {
            type: 'text',
            content: 'Connect to ReCircle for sustainable transportation rewards'
          }
        });
        
        return accounts.annex.signer;
      } else {
        throw new Error('VeWorld wallet not found');
      }
    } catch (error) {
      console.error('VeWorld connection failed:', error);
      throw error;
    }
  }
  
  async signTransaction(clauses: any[]): Promise<string> {
    if (!this.connex) throw new Error('Wallet not connected');
    
    const tx = await this.connex.vendor.sign('tx', clauses);
    return tx.txid;
  }
}
```

### React Wallet Context
```typescript
// WalletContext.tsx
export const WalletContext = createContext<{
  isConnected: boolean;
  walletAddress: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (clauses: any[]) => Promise<string>;
}>({
  isConnected: false,
  walletAddress: null,
  connect: async () => {},
  disconnect: () => {},
  signTransaction: async () => ''
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const connector = new VeWorldConnector();
  
  const connect = async () => {
    try {
      const address = await connector.connect();
      setWalletAddress(address);
      setIsConnected(true);
      
      // Store in session
      sessionStorage.setItem('wallet_address', address);
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  };
  
  return (
    <WalletContext.Provider value={{
      isConnected,
      walletAddress,
      connect,
      disconnect: () => {
        setIsConnected(false);
        setWalletAddress(null);
        sessionStorage.removeItem('wallet_address');
      },
      signTransaction: connector.signTransaction.bind(connector)
    }}>
      {children}
    </WalletContext.Provider>
  );
};
```

## 🔙 Backend Integration

### VeChain Client Setup
```typescript
// server/utils/vechain-client.ts
import { Connex } from '@vechain/connex';
import { Framework } from '@vechain/connex-framework';
import { Driver, SimpleNet } from '@vechain/connex-driver';

export class VeChainClient {
  private connex: Connex;
  
  constructor() {
    const network = new SimpleNet(
      process.env.VECHAIN_NETWORK === 'mainnet'
        ? 'https://mainnet.veblocks.net'
        : 'https://testnet.veblocks.net'
    );
    
    const driver = await Driver.connect(network);
    this.connex = new Framework(driver);
  }
  
  async getBalance(address: string): Promise<string> {
    const account = this.connex.thor.account(address);
    const balance = await account.get();
    return balance.balance;
  }
  
  async getB3TRBalance(address: string): Promise<string> {
    // B3TR token contract interaction
    const method = this.connex.thor
      .account(B3TR_CONTRACT_ADDRESS)
      .method(ERC20_ABI.find(m => m.name === 'balanceOf'));
    
    const result = await method.call(address);
    return result.decoded[0];
  }
  
  async sendTransaction(
    clauses: Connex.VM.Clause[],
    privateKey: string
  ): Promise<string> {
    const signingService = this.connex.vendor.sign('tx', clauses);
    
    // For server-side transactions, use private key signing
    const tx = await this.signWithPrivateKey(clauses, privateKey);
    return tx.id;
  }
}
```

### B3TR Token Distribution
```typescript
// server/utils/distributeReward-connex.ts
import { VeChainClient } from './vechain-client';

export class RewardDistributor {
  private vechain: VeChainClient;
  
  constructor() {
    this.vechain = new VeChainClient();
  }
  
  async distributeReward(
    userAddress: string,
    totalAmount: number,
    metadata: {
      receiptId: number;
      transportationType: string;
      store: string;
    }
  ): Promise<{
    userTxId: string;
    appFundTxId: string;
    distribution: {
      userAmount: number;
      appFundAmount: number;
    };
  }> {
    const userAmount = totalAmount * 0.7; // 70% to user
    const appFundAmount = totalAmount * 0.3; // 30% to app fund
    
    try {
      // Transaction 1: Distribute to user
      const userTxId = await this.sendB3TRTokens(
        userAddress,
        userAmount,
        `Transportation reward: ${metadata.store}`
      );
      
      // Transaction 2: Distribute to app fund
      const appFundTxId = await this.sendB3TRTokens(
        WALLETS.APP_FUND,
        appFundAmount,
        `App fund allocation: Receipt ${metadata.receiptId}`
      );
      
      console.log(`✅ Reward distributed:`, {
        user: `${userAmount} B3TR (${userTxId})`,
        appFund: `${appFundAmount} B3TR (${appFundTxId})`
      });
      
      return {
        userTxId,
        appFundTxId,
        distribution: {
          userAmount,
          appFundAmount
        }
      };
    } catch (error) {
      console.error('❌ Reward distribution failed:', error);
      throw error;
    }
  }
  
  private async sendB3TRTokens(
    to: string,
    amount: number,
    memo: string
  ): Promise<string> {
    const clauses = [{
      to: B3TR_CONTRACT_ADDRESS,
      value: '0',
      data: this.encodeTransfer(to, amount)
    }];
    
    return await this.vechain.sendTransaction(
      clauses,
      process.env.REWARD_DISTRIBUTOR_PRIVATE_KEY
    );
  }
  
  private encodeTransfer(to: string, amount: number): string {
    // Encode ERC20 transfer function call
    const iface = new ethers.Interface(ERC20_ABI);
    return iface.encodeFunctionData('transfer', [
      to,
      ethers.parseUnits(amount.toString(), 18)
    ]);
  }
}
```

## 🏦 VeBetterDAO Integration

### Smart Contract Integration
```typescript
// VeBetterDAO B3TR token distribution
export const VEBETTERDAO_CONFIG = {
  APP_ID: process.env.VEBETTERDAO_APP_ID,
  CONTRACT_ADDRESS: '0x...', // VeBetterDAO main contract
  B3TR_TOKEN_ADDRESS: '0x...', // B3TR token contract
  DISTRIBUTION_METHOD: 'allocateToApp', // VeBetterDAO function
};

export class VeBetterDAOClient {
  async allocateRewards(
    userAddress: string,
    amount: number,
    metadata: any
  ): Promise<string> {
    const clauses = [{
      to: VEBETTERDAO_CONFIG.CONTRACT_ADDRESS,
      value: '0',
      data: this.encodeAllocation(userAddress, amount, metadata)
    }];
    
    return await this.vechain.sendTransaction(
      clauses,
      process.env.VEBETTERDAO_PRIVATE_KEY
    );
  }
  
  private encodeAllocation(
    user: string,
    amount: number,
    metadata: any
  ): string {
    // Encode VeBetterDAO allocation function
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    return abiCoder.encode(
      ['address', 'uint256', 'bytes'],
      [user, ethers.parseUnits(amount.toString(), 18), metadata]
    );
  }
}
```

### Fund Distribution Model
```typescript
// 70/30 distribution model implementation
export const DISTRIBUTION_MODEL = {
  USER_PERCENTAGE: 0.7,    // 70% to user
  APP_FUND_PERCENTAGE: 0.3, // 30% to app sustainability fund
};

export function calculateDistribution(baseReward: number): {
  userAmount: number;
  appFundAmount: number;
  total: number;
} {
  const userAmount = baseReward * DISTRIBUTION_MODEL.USER_PERCENTAGE;
  const appFundAmount = baseReward * DISTRIBUTION_MODEL.APP_FUND_PERCENTAGE;
  
  return {
    userAmount,
    appFundAmount,
    total: userAmount + appFundAmount
  };
}
```

## 🔐 Security Implementation

### Transaction Security
```typescript
// Secure transaction validation
export class TransactionValidator {
  static validateClauses(clauses: Connex.VM.Clause[]): boolean {
    return clauses.every(clause => {
      // Validate recipient addresses
      if (!this.isValidAddress(clause.to)) return false;
      
      // Validate transaction value
      if (clause.value && !this.isValidAmount(clause.value)) return false;
      
      // Validate data payload
      if (clause.data && !this.isValidData(clause.data)) return false;
      
      return true;
    });
  }
  
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  static isValidAmount(amount: string): boolean {
    try {
      const value = ethers.BigNumber.from(amount);
      return value.gte(0) && value.lte(ethers.constants.MaxUint256);
    } catch {
      return false;
    }
  }
}
```

### Wallet Authentication
```typescript
// Certificate-based authentication
export async function authenticateWallet(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    const cert = Connex.Cert.decode(signature);
    
    // Verify certificate signature
    const isValid = await Connex.Cert.verify(cert, message);
    
    // Verify signer address matches
    const signerAddress = cert.signer.toLowerCase();
    return isValid && signerAddress === address.toLowerCase();
  } catch (error) {
    console.error('Authentication failed:', error);
    return false;
  }
}
```

## 📊 Monitoring & Analytics

### Transaction Monitoring
```typescript
// Real-time transaction tracking
export class VeChainMonitor {
  async trackTransaction(txId: string): Promise<TransactionStatus> {
    const receipt = await this.vechain.thor.transaction(txId).getReceipt();
    
    return {
      txId,
      status: receipt ? 'confirmed' : 'pending',
      blockNumber: receipt?.meta.blockNumber,
      gasUsed: receipt?.gasUsed,
      reverted: receipt?.reverted || false,
      timestamp: receipt?.meta.blockTimestamp
    };
  }
  
  async getNetworkStats(): Promise<NetworkStats> {
    const bestBlock = await this.vechain.thor.status.head;
    
    return {
      latestBlock: bestBlock.number,
      blockTime: bestBlock.timestamp,
      networkId: await this.vechain.thor.genesis.id,
      peers: await this.vechain.thor.status.progress
    };
  }
}
```

### Performance Metrics
```typescript
// VeChain operation performance tracking
export class VeChainMetrics {
  private metrics = new Map<string, number[]>();
  
  recordOperationTime(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);
  }
  
  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
  
  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    
    try {
      await this.vechain.thor.status.head;
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
}
```

## 🚀 Deployment Configuration

### Environment Variables
```env
# VeChain Network Configuration
VECHAIN_NETWORK=testnet|mainnet
VECHAIN_NODE_URL=https://testnet.veblocks.net

# Wallet Configuration
REWARD_DISTRIBUTOR_WALLET=0x15D009B3A5811fdE66F19b2db1D40172d53E5653
REWARD_DISTRIBUTOR_PRIVATE_KEY=0x...
APP_FUND_WALLET=0x119761865b79bea9e7924edaa630942322ca09d1

# VeBetterDAO Configuration
VEBETTERDAO_APP_ID=your-app-id
VEBETTERDAO_CONTRACT_ADDRESS=0x...
B3TR_TOKEN_ADDRESS=0x...

# Security
TRANSACTION_GAS_LIMIT=21000
MAX_DAILY_REWARD_PER_USER=100
```

### Production Checklist
- [ ] Mainnet configuration verified
- [ ] Wallet addresses funded with VET for gas
- [ ] Private keys securely stored
- [ ] Transaction limits configured
- [ ] Monitoring systems active
- [ ] Error handling implemented
- [ ] Backup wallet procedures established

This VeChain integration provides a robust, secure foundation for ReCircle's blockchain-powered reward system while maintaining compliance with VeChain Builders Academy standards.