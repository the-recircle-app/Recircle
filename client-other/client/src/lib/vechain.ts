import type { Transaction } from "../types";

// Add VeWorld wallet type definition to the Window interface
declare global {
  interface Window {
    vechain?: any;
  }
}

/**
 * VeChain wallet interface
 */
export interface VeChainWallet {
  address: string;
  balance: number;
}

// VeChain integration for wallet connection and blockchain interaction
export const vechain = {
  // Cache for wallet addresses
  cachedWalletAddresses: {
    creatorFundWallet: '0x0000000000000000000000000000000000000000',
    appFundWallet: '0x0000000000000000000000000000000000000000'
  },
  
  // Flag to track if we've tried to load addresses
  addressesLoaded: false,
  
  // Preload wallet addresses
  preloadWalletAddresses() {
    // Prevent multiple calls
    if (this.addressesLoaded) return;
    
    // Set flag to prevent multiple loads
    this.addressesLoaded = true;
    
    // Fetch the wallet addresses from the backend API
    fetch('/api/wallet-addresses')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch wallet addresses: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Wallet addresses loaded from API");
        this.cachedWalletAddresses = {
          creatorFundWallet: data.creatorFundWallet,
          appFundWallet: data.appFundWallet
        };
      })
      .catch(error => {
        console.error("Error preloading wallet addresses:", error);
      });
  },
  
  // Get wallet addresses from API
  async getWalletAddresses() {
    try {
      // Try to use cached addresses if we've already loaded them
      if (this.addressesLoaded && 
          this.cachedWalletAddresses.creatorFundWallet !== '0x0000000000000000000000000000000000000000') {
        return this.cachedWalletAddresses;
      }
      
      // Otherwise fetch from API
      const response = await fetch('/api/wallet-addresses');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wallet addresses: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update cache
      this.cachedWalletAddresses = {
        creatorFundWallet: data.creatorFundWallet,
        appFundWallet: data.appFundWallet
      };
      
      return this.cachedWalletAddresses;
    } catch (error) {
      console.error("Error fetching wallet addresses:", error);
      
      // If we have cached addresses, return those
      if (this.cachedWalletAddresses.creatorFundWallet !== '0x0000000000000000000000000000000000000000') {
        return this.cachedWalletAddresses;
      }
      
      // Otherwise return placeholder addresses
      return {
        creatorFundWallet: '0x0000000000000000000000000000000000000000',
        appFundWallet: '0x0000000000000000000000000000000000000000'
      };
    }
  },
  
  // Sync version for contexts where async isn't possible
  getWalletAddressesSync() {
    // If we have loaded addresses, use those
    if (this.cachedWalletAddresses.creatorFundWallet !== '0x0000000000000000000000000000000000000000') {
      return this.cachedWalletAddresses;
    }
    
    // Addresses aren't loaded yet, trigger a load for future use
    // (This won't help the current call but will help future calls)
    if (!this.addressesLoaded) {
      this.preloadWalletAddresses();
    }
    
    console.log("WARNING: Using placeholder wallet addresses until API data is loaded");
    
    // Return placeholder addresses for now
    // Subsequent calls will get the real addresses once loaded
    return this.cachedWalletAddresses;
  },
  
  // Keep track of QR code connection sessions
  activeSessions: new Map<string, { connectionId: string, callback: (address: string) => void }>(),
  
  // Create a new QR code connection session
  createConnectionSession(connectionId: string, callback: (address: string) => void) {
    this.activeSessions.set(connectionId, { connectionId, callback });
    
    // Set up a timeout to remove the session after 5 minutes
    setTimeout(() => {
      this.activeSessions.delete(connectionId);
    }, 5 * 60 * 1000);
    
    return connectionId;
  },
  
  // Handle incoming connection from VeWorld mobile wallet
  handleVeWorldConnection(connectionId: string, address: string) {
    const session = this.activeSessions.get(connectionId);
    if (session) {
      session.callback(address);
      this.activeSessions.delete(connectionId);
      return true;
    }
    return false;
  },
  
  // Connect to the VeChain Thor wallet
  async connectWallet(walletType: string): Promise<VeChainWallet | null> {
    try {
      // For development environment, return a consistent mock wallet
      if (process.env.NODE_ENV === 'development') {
        console.log(`Connecting to ${walletType} (development mode)...`);
        
        // Use the sync version since this context can't be async
        const { appFundWallet } = this.getWalletAddressesSync();
        
        return {
          address: appFundWallet,
          balance: 100.0
        };
      }
      
      // Production code path
      console.log(`Connecting to ${walletType}...`);
      
      if (walletType === 'VeWorld' && window.vechain) {
        try {
          await window.vechain.connect();
          const cert = await window.vechain.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Login to B3tr app'
            }
          });
          
          if (cert && cert.annex && cert.annex.signer) {
            return {
              address: cert.annex.signer,
              balance: 0
            };
          }
        } catch (e) {
          console.error("VeWorld connection error:", e);
        }
      }
      
      throw new Error("Wallet connection failed");
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      return null;
    }
  },

  // Disconnect from the wallet
  async disconnectWallet(): Promise<boolean> {
    if (window.vechain) {
      try {
        await window.vechain.disconnect();
      } catch (error) {
        console.warn("Error disconnecting from VeWorld:", error);
      }
    }
    
    return true;
  },

  // Format a wallet address for display (truncate middle)
  formatAddress(address: string): string {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  // Get transaction details from the blockchain
  async getTransaction(txHash: string): Promise<any> {
    try {
      // In development mode, return mock transaction data
      if (process.env.NODE_ENV === 'development') {
        const hashNum = parseInt(txHash.slice(-8), 16) || 0;
        const { appFundWallet, creatorFundWallet } = this.getWalletAddressesSync();
        
        return {
          hash: txHash,
          blockNumber: 12345000 + (hashNum % 1000),
          timestamp: Date.now() - (hashNum % 10000) * 60000,
          from: appFundWallet,
          to: hashNum % 2 ? creatorFundWallet : "0x9876543210fedcba9876543210fedcba98765432",
          value: (hashNum % 10 * 1e17).toString(),
          data: "0x0",
          status: hashNum % 5 === 0 ? "pending" : "confirmed"
        };
      }
      
      throw new Error("Blockchain connection not available");
    } catch (error) {
      console.error("Error getting transaction:", error);
      
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        const { appFundWallet, creatorFundWallet } = this.getWalletAddressesSync();
        
        return {
          hash: txHash,
          blockNumber: 12345678,
          timestamp: Date.now() - 3600000, // 1 hour ago
          from: appFundWallet,
          to: creatorFundWallet,
          value: "1000000000000000000", // 1 ETH in wei
          data: "0x0",
          status: "confirmed"
        };
      }
      
      return null;
    }
  },

  // Submit a transaction for receipt verification
  async verifyReceipt(receipt: any): Promise<string> {
    try {
      // In development mode, generate a mock transaction hash
      if (process.env.NODE_ENV === 'development') {
        const receiptString = `${receipt.id || 0}-${receipt.storeId || 0}-${receipt.amount || 0}`;
        const mockTxHash = '0x' + Array.from(receiptString).reduce((hash, char) => {
          return (((hash << 5) - hash) + char.charCodeAt(0)) & 0xFFFFFFFF;
        }, 0).toString(16).padStart(64, '0');
        
        return mockTxHash;
      }
      
      if (window.vechain) {
        try {
          // Mock the actual transaction response for now
          return `0x${Math.random().toString(16).substring(2).padEnd(64, '0')}`;
        } catch (error) {
          console.error("VeChain transaction error:", error);
        }
      }
      
      throw new Error("No wallet available for transaction signing");
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return `0x${Date.now().toString(16).padStart(12, '0')}${'0'.repeat(52)}`;
      }
      
      throw new Error("Failed to verify receipt on blockchain");
    }
  },

  // Submit a transaction for store verification
  async verifyStore(store: any): Promise<string> {
    try {
      // In development mode, generate a mock transaction hash
      if (process.env.NODE_ENV === 'development') {
        const storeString = `${store.id || 0}-${store.name || ''}-${store.latitude || 0}-${store.longitude || 0}`;
        const mockTxHash = '0x' + Array.from(storeString).reduce((hash, char) => {
          return (((hash << 5) - hash) + char.charCodeAt(0)) & 0xFFFFFFFF;
        }, 0).toString(16).padStart(64, '0');
        
        return mockTxHash;
      }
      
      if (window.vechain) {
        try {
          // Mock transaction response for now
          return `0x${Math.random().toString(16).substring(2).padEnd(64, '0')}`;
        } catch (error) {
          console.error("VeChain transaction error:", error);
        }
      }
      
      throw new Error("No wallet available for transaction signing");
    } catch (error) {
      // Fallback for development
      if (process.env.NODE_ENV === 'development') {
        return `0x${Date.now().toString(16).padStart(12, '0')}${'0'.repeat(52)}`;
      }
      
      throw new Error("Failed to verify store on blockchain");
    }
  },

  // Format transaction data for UI display
  formatTransactionForDisplay(tx: Transaction): any {
    const typeIcons: Record<string, string> = {
      receipt_verification: "fa-receipt",
      store_addition: "fa-store",
      token_redemption: "fa-certificate"
    };

    return {
      ...tx,
      formattedAmount: tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2),
      icon: typeIcons[tx.type] || "fa-circle",
      amountClass: tx.amount > 0 ? "text-green-500" : "text-red-500",
      explorerUrl: tx.txHash ? `https://explore.vechain.org/transactions/${tx.txHash}` : null
    };
  }
};
