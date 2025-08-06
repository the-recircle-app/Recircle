/**
 * VeChain Connex Configuration for VeWorld Wallet Integration
 * Handles testnet and mainnet configurations for proper wallet connection
 */

export interface ConnexConfig {
  nodeUrl: string;
  network: 'test' | 'main';
  genesis: any;
}

// VeChain Testnet Configuration
export const TESTNET_CONFIG: ConnexConfig = {
  nodeUrl: 'https://testnet.vechain.org',
  network: 'test',
  genesis: {
    number: 0,
    id: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
    size: 170,
    parentID: '0xffffffff00000000000000000000000000000000000000000000000000000000',
    timestamp: 1530316800,
    gasLimit: 10000000,
    beneficiary: '0x0000000000000000000000000000000000000000',
    gasUsed: 0,
    totalScore: 0,
    txsRoot: '0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0',
    stateRoot: '0x4ec3af0acbad1ae467ad569337d2fe8576fe303928d35b8cdd91de47e9ac84bb',
    receiptsRoot: '0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0',
    signer: '0x0000000000000000000000000000000000000000',
    isTrunk: true,
    transactions: []
  }
};

// Check if we're running in HTTPS
export const isHTTPS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
};

// Check if we're in VeWorld in-app browser
export const isVeWorldBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof window.connex !== 'undefined';
};

// Check if we're in a proper testnet environment
export const isTestnetReady = (): boolean => {
  return isHTTPS() && isVeWorldBrowser();
};

// VeBetterDAO Configuration
export const VEBETTERDAO_CONFIG = {
  // Official APP_ID for ReCircle
  APP_ID: '0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1',
  
  // VeBetterDAO Contracts on Testnet
  X2EARN_APPS_CONTRACT: '0x8f9c9d5460b8b6d35eb76ff4b2e99e9647d12ae1',
  REWARD_POOL_CONTRACT: '0x1234567890abcdef1234567890abcdef12345678',
  
  // Required for wallet connection
  APP_METADATA: {
    name: 'ReCircle',
    description: 'Sustainable Transportation Rewards Platform',
    url: 'https://recircle-rewards.replit.app',
    icons: ['https://recircle-rewards.replit.app/favicon.ico']
  }
};