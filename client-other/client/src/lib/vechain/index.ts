/**
 * VeChain Thor Blockchain Integration
 * 
 * This file exports all VeChain blockchain functionality for the B3TR application.
 * It includes testnet configuration, VIP-180 token standard implementation,
 * and Fee Delegation (MPP) for gas-free user experience.
 */

// Export testnet configuration
export * from './testnet-config';

// Export VIP-180 token implementation
export * from './vip180-token';

// Export fee delegation functionality
export * from './fee-delegation';

// Export helper functions for wallet connection and transaction viewing

/**
 * Format an address to show a shortened version (0x123...789)
 * @param address - Full blockchain address
 * @returns Shortened address
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get the explorer URL for a transaction
 * @param txid - Transaction ID
 * @param network - 'main' for mainnet, 'test' for testnet
 * @returns Full URL to transaction on VeChain explorer
 */
export function getExplorerTxUrl(txid: string, network: 'main' | 'test' = 'test'): string {
  const baseUrl = network === 'main' 
    ? 'https://explore.vechain.org/transactions/' 
    : 'https://explore-testnet.vechain.org/transactions/';
  
  return `${baseUrl}${txid}`;
}

/**
 * Get the explorer URL for an address
 * @param address - Wallet or contract address
 * @param network - 'main' for mainnet, 'test' for testnet
 * @returns Full URL to address on VeChain explorer
 */
export function getExplorerAddressUrl(address: string, network: 'main' | 'test' = 'test'): string {
  const baseUrl = network === 'main' 
    ? 'https://explore.vechain.org/accounts/' 
    : 'https://explore-testnet.vechain.org/accounts/';
  
  return `${baseUrl}${address}`;
}

/**
 * VeChain wallet interface
 */
export interface VeChainWallet {
  address: string;
  balance: number;
}

// For development and testing
let currentWalletType: string | null = null;
let currentWalletAddress: string | null = null;

// Track active session for QR code connections
const activeSessions = new Map<string, { connectionId: string, callback: (address: string) => void }>();

/**
 * Create a new QR code connection session
 * @param connectionId - Unique ID for the session
 * @param callback - Function to call when wallet connects
 * @returns The connection ID
 */
export function createConnectionSession(
  connectionId: string, 
  callback: (address: string) => void
): string {
  activeSessions.set(connectionId, { connectionId, callback });
  
  // Set up a timeout to remove the session after 2 minutes
  setTimeout(() => {
    activeSessions.delete(connectionId);
  }, 2 * 60 * 1000);
  
  return connectionId;
}

/**
 * Handle incoming connection from VeWorld mobile wallet
 * @param connectionId - The connection ID from QR code
 * @param address - The connected wallet address
 * @returns Whether the connection was successful
 */
export function handleVeWorldConnection(
  connectionId: string, 
  address: string
): boolean {
  const session = activeSessions.get(connectionId);
  if (session) {
    session.callback(address);
    activeSessions.delete(connectionId);
    return true;
  }
  return false;
}

// Track simulations to avoid duplicates
const simulationRan = new Set<string>();

/**
 * Simulate VeWorld connection for development and production
 * @param connectionId - Unique session ID
 */
export function simulateVeWorldConnection(connectionId: string): void {
  // Only simulate once per connection ID to avoid multiple calls
  if (!simulationRan.has(connectionId)) {
    simulationRan.add(connectionId);
    
    // Use a consistent mock address for both development and production
    setTimeout(() => {
      const mockAddress = `0x7dE3085b3190B3a787822Ee16F23be010f5F8686`;
      console.log(`Simulating VeWorld mobile wallet connection with address: ${mockAddress}`);
      
      // Always use handleVeWorldConnection for consistent behavior in all environments
      console.log("Using handleVeWorldConnection with address:", mockAddress);
      handleVeWorldConnection(connectionId, mockAddress);
    }, 2000);
  } else {
    console.log("Simulation already ran for connection ID:", connectionId);
  }
}

/**
 * Connect to a VeChain wallet
 * @param walletType - Type of wallet to connect to (e.g., 'VeWorld', 'Sync2')
 * @returns Wallet information if connection successful
 */
export async function connectWallet(walletType: string): Promise<VeChainWallet | null> {
  try {
    console.log(`Attempting to connect to ${walletType}...`);
    
    // Always provide auto-connect functionality for VeWorld wallet type
    if (walletType === 'VeWorld') {
      console.log('Auto-connecting to VeWorld wallet...');
      
      // Set current wallet info
      currentWalletType = walletType;
      currentWalletAddress = '0x7dE3085b3190B3a787822Ee16F23be010f5F8686';
      
      // Return wallet info
      return {
        address: currentWalletAddress,
        balance: 0.0 // The actual balance will be fetched from the server
      };
    } 
    // For other wallet types (like when selected from the modal)
    else if (walletType === 'VeChainThor' || walletType === 'SyncApp' || walletType === 'VeChainX') {
      console.log(`Connecting to ${walletType} via modal selection...`);
      
      // For simplicity, we'll use the same address for all wallet types in this demo
      currentWalletType = walletType;
      currentWalletAddress = '0x7dE3085b3190B3a787822Ee16F23be010f5F8686';
      
      return {
        address: currentWalletAddress,
        balance: 0.0
      };
    }
    
    // If we get here, it's an unknown wallet type
    console.error(`Unknown wallet type: ${walletType}`);
    return null;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
}

/**
 * Disconnect the current wallet
 * @returns Whether disconnect was successful
 */
export function disconnectWallet(): boolean {
  try {
    currentWalletType = null;
    currentWalletAddress = null;
    return true;
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    return false;
  }
}