/**
 * VeChain Network Configuration
 * 
 * Centralizes all VeChain network settings for both client and server.
 * Automatically detects environment and switches between testnet/mainnet.
 */

export type VeChainNetwork = 'testnet' | 'mainnet';

export interface VeChainNetworkConfig {
  network: VeChainNetwork;
  chainTag: number;
  networkId: string;
  thorEndpoints: string[];
  explorerUrl: string;
  sponsorUrl: string;
  contracts: {
    b3trToken: string;
    x2earnRewardsPool: string;
  };
}

// Environment detection - defaults to testnet for safety
function getVeChainNetwork(): VeChainNetwork {
  // Check both client and server environment variables
  const network = (typeof window !== 'undefined' 
    ? import.meta.env.VITE_VECHAIN_NETWORK 
    : process.env.VECHAIN_NETWORK) || 'testnet';
  
  return network === 'mainnet' ? 'mainnet' : 'testnet';
}

// Get client-safe environment variables
function getClientEnvVar(key: string): string {
  if (typeof window !== 'undefined') {
    // Browser - use VITE_ prefixed variables
    return (import.meta.env as any)[`VITE_${key}`] || '';
  } else {
    // Server - use regular env variables
    return process.env[key] || '';
  }
}

// Network configurations
const NETWORK_CONFIGS: Record<VeChainNetwork, VeChainNetworkConfig> = {
  testnet: {
    network: 'testnet',
    chainTag: 0x27, // 39 in decimal
    networkId: '0x27',
    thorEndpoints: [
      'https://testnet.veblocks.net',
      'https://sync-testnet.veblocks.net'
    ],
    explorerUrl: 'https://explore-testnet.vechain.org',
    sponsorUrl: 'https://sponsor-testnet.vechain.energy/by/441',
    contracts: {
      b3trToken: process.env.B3TR_CONTRACT_ADDRESS || '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F',
      x2earnRewardsPool: process.env.X2EARNREWARDSPOOL_ADDRESS || '0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38'
    }
  },
  mainnet: {
    network: 'mainnet',
    chainTag: 0x4a, // 74 in decimal
    networkId: '0x4a',
    thorEndpoints: [
      'https://mainnet.veblocks.net',
      'https://sync-mainnet.veblocks.net'
    ],
    explorerUrl: 'https://explore.vechain.org',
    sponsorUrl: getClientEnvVar('VECHAIN_MAINNET_SPONSOR_URL'),
    contracts: {
      b3trToken: getClientEnvVar('B3TR_CONTRACT_ADDRESS_MAINNET'),
      x2earnRewardsPool: getClientEnvVar('X2EARNREWARDSPOOL_ADDRESS_MAINNET')
    }
  }
};

/**
 * Get current VeChain network configuration
 * Automatically switches based on VECHAIN_NETWORK environment variable
 */
export function getVeChainConfig(): VeChainNetworkConfig {
  const currentNetwork = getVeChainNetwork();
  const config = NETWORK_CONFIGS[currentNetwork];
  
  // Validate mainnet configuration
  if (currentNetwork === 'mainnet') {
    if (!config.contracts.b3trToken || !config.contracts.x2earnRewardsPool) {
      console.warn('⚠️  Mainnet contract addresses not configured, falling back to testnet');
      return NETWORK_CONFIGS.testnet;
    }
    
    if (!config.sponsorUrl) {
      console.warn('⚠️  Mainnet sponsor URL not configured, falling back to testnet');
      return NETWORK_CONFIGS.testnet;
    }
  }
  
  console.log(`🔗 VeChain Network: ${config.network.toUpperCase()}`);
  console.log(`🌐 Thor Endpoints: ${config.thorEndpoints.join(', ')}`);
  console.log(`🏛️  X2EarnRewardsPool: ${config.contracts.x2earnRewardsPool}`);
  console.log(`🪙 B3TR Token: ${config.contracts.b3trToken}`);
  
  return config;
}

/**
 * Check if we're running on mainnet
 */
export function isMainnet(): boolean {
  return getVeChainNetwork() === 'mainnet';
}

/**
 * Check if we're running on testnet
 */
export function isTestnet(): boolean {
  return getVeChainNetwork() === 'testnet';
}

/**
 * Get explorer URL for a transaction hash
 */
export function getTransactionUrl(txHash: string): string {
  const config = getVeChainConfig();
  return `${config.explorerUrl}/transactions/${txHash}`;
}

/**
 * Get explorer URL for an address
 */
export function getAddressUrl(address: string): string {
  const config = getVeChainConfig();
  return `${config.explorerUrl}/accounts/${address}`;
}

/**
 * Validate mainnet readiness - checks if all required mainnet configs are present
 */
export function validateMainnetReadiness(): { ready: boolean; missing: string[] } {
  const missing: string[] = [];
  
  // Check environment variables that are required for mainnet
  if (!process.env.B3TR_CONTRACT_ADDRESS_MAINNET) {
    missing.push('B3TR_CONTRACT_ADDRESS_MAINNET');
  }
  
  if (!process.env.X2EARNREWARDSPOOL_ADDRESS_MAINNET) {
    missing.push('X2EARNREWARDSPOOL_ADDRESS_MAINNET');
  }
  
  if (!process.env.VECHAIN_MAINNET_SPONSOR_URL) {
    missing.push('VECHAIN_MAINNET_SPONSOR_URL');
  }
  
  if (!process.env.DISTRIBUTOR_PRIVATE_KEY) {
    missing.push('DISTRIBUTOR_PRIVATE_KEY');
  }
  
  return {
    ready: missing.length === 0,
    missing
  };
}

export default {
  getVeChainConfig,
  isMainnet,
  isTestnet,
  getTransactionUrl,
  getAddressUrl,
  validateMainnetReadiness
};