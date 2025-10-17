import type { Transaction } from "../types";

// Add VeChain wallet type definition to the Window interface
declare global {
  interface Window {
    vechain?: any;
    connex?: any;
    // VeWorld specific properties
    isVeWorld?: boolean;
    isInAppBrowser?: boolean;
    acceptLanguage?: string;
    integrity?: string;
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
  
  // Detect VeWorld browser environment
  isVeWorldBrowser(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('veworld') || 
           userAgent.includes('vechain') ||
           !!window.connex ||
           !!window.vechain ||
           window.isVeWorld === true;
  },

  // Get network configuration for VeWorld
  getNetworkConfig() {
    if (window.connex && window.connex.thor) {
      const genesis = window.connex.thor.genesis;
      console.log("[VECHAIN] Current network genesis:", genesis);
      
      // Check if we're on testnet
      if (genesis && genesis.id === '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127') {
        return { network: 'testnet', name: 'VeChain TestNet' };
      } else if (genesis && genesis.id === '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a') {
        return { network: 'mainnet', name: 'VeChain MainNet' };
      }
    }
    return { network: 'unknown', name: 'Unknown Network' };
  },

  // Connect to the VeChain Thor wallet
  async connectWallet(walletType: string): Promise<VeChainWallet | null> {
    try {
      console.log(`[VECHAIN] Attempting to connect to ${walletType}...`);
      console.log(`[VECHAIN] VeWorld browser detected:`, this.isVeWorldBrowser());
      console.log(`[VECHAIN] Window.connex available:`, !!window.connex);
      console.log(`[VECHAIN] Window.vechain available:`, !!window.vechain);
      
      // Check network configuration
      const networkConfig = this.getNetworkConfig();
      console.log(`[VECHAIN] Network detected:`, networkConfig);
      
      // VeWorld connection using proper Connex flow
      if (walletType === 'VeWorld') {
        if (!this.isVeWorldBrowser()) {
          throw new Error("Please open this app in VeWorld browser to connect your wallet");
        }

        // Modern Connex API (VeWorld 2.0+)
        if (window.connex && window.connex.vendor) {
          try {
            console.log("[VECHAIN] Using Connex vendor API for wallet connection");
            
            // First, try to get the current account without requiring signature
            const account = await window.connex.thor.account('0x0000000000000000000000000000000000000000').get();
            console.log("[VECHAIN] Thor account check:", account);
            
            // Request certificate for authentication
            const cert = await window.connex.vendor.sign('cert', {
              purpose: 'identification',
              payload: {
                type: 'text',
                content: `Connect to ReCircle\nNetwork: ${networkConfig.name}\nEarn B3TR tokens for sustainable transportation`
              }
            }).request();
            
            console.log("[VECHAIN] Certificate result:", cert);
            
            if (cert && cert.annex && cert.annex.signer) {
              const walletAddress = cert.annex.signer;
              console.log("[VECHAIN] Wallet connected successfully:", walletAddress);
              
              return {
                address: walletAddress,
                balance: 0
              };
            } else {
              throw new Error("Failed to get wallet address from certificate");
            }
          } catch (error) {
            console.error("[VECHAIN] Connex vendor error:", error);
            
            // Fallback: Try legacy vechain object
            if (window.vechain) {
              console.log("[VECHAIN] Falling back to legacy vechain API");
              const result = await window.vechain.sign('cert', {
                purpose: 'identification',
                payload: {
                  type: 'text',
                  content: 'Connect to ReCircle - Earn B3TR tokens'
                }
              });
              
              if (result && result.annex && result.annex.signer) {
                return {
                  address: result.annex.signer,
                  balance: 0
                };
              }
            }
            
            throw error;
          }
        } else if (window.vechain) {
          // Legacy VeWorld connection
          console.log("[VECHAIN] Using legacy vechain API");
          const cert = await window.vechain.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Connect to ReCircle - Sustainable Transportation Rewards'
            }
          });
          
          if (cert && cert.annex && cert.annex.signer) {
            return {
              address: cert.annex.signer,
              balance: 0
            };
          }
        }
        
        throw new Error("VeWorld APIs not available. Please ensure VeWorld is unlocked and try again.");
      }
      
      throw new Error("Unsupported wallet type");
    } catch (error) {
      console.error("[VECHAIN] Error connecting to wallet:", error);
      throw error;
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
  },

  // Development mode: Create mock VeWorld environment
  initializeDevelopmentMode() {
    // NEVER create mock in production
    if (!import.meta.env.DEV) {
      return;
    }

    // Check if we're in actual VeWorld browser first
    const userAgent = navigator.userAgent;
    const isVeWorldMobile = userAgent.includes('VeWorld') || userAgent.includes('veworld');
    
    // Don't create mocks if we're in real VeWorld browser
    if (isVeWorldMobile) {
      console.log("Real VeWorld browser detected - skipping mock creation");
      return;
    }
    
    // Wait longer (5 seconds) to give VeWorld time to inject Connex
    console.log("Development mode: Will check for mock creation in 5 seconds...");
    
    setTimeout(() => {
      // Double-check VeWorld isn't available before creating mocks
      // Need to check for vendor.sign specifically as that's what we use for transactions
      if ((window.connex && window.connex.vendor && window.connex.vendor.sign) || window.vechain) {
        console.log("Real VeWorld providers found - skipping mock creation");
        return;
      }
      
      console.log("No VeWorld detected after 5 seconds - creating mock Connex for development");
      
      // Mock Connex for development testing
      window.connex = {
        version: "2.0",
        thor: {
          genesis: {
            id: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127' // TestNet
          },
          account: (addr: string) => ({
            get: async () => ({
              balance: '0x56bc75e2d630eb20',
              energy: '0x56bc75e2d630eb20'
            })
          })
        },
        vendor: {
          sign: (kind: string, message: any) => ({
            request: async () => {
                console.log("=== VeWorld Connection Attempt ===");
                console.log("Sign request:", { kind, message });
                
                // Simulate user interaction
                const userConfirmed = confirm(
                  `VeWorld Connection Request\n\n${message.payload?.content || 'Connect to ReCircle'}\n\nConnect your wallet?`
                );
                
                if (userConfirmed) {
                  return {
                    annex: {
                      domain: window.location.origin,
                      timestamp: Math.floor(Date.now() / 1000),
                      signer: '0x9876543210fedcba9876543210fedcba98765432'
                    },
                    signature: '0x' + Array(130).fill('0').join('')
                  };
                } else {
                  throw new Error("User rejected the connection request");
                }
              }
            })
          }
        };
        
        // Also create comprehensive vechain object for compatibility
        window.vechain = {
          isVeWorld: true,
          newConnexSigner: () => ({
            sign: async (kind: string, message: any) => {
              const userConfirmed = confirm(
                `VeWorld Connection Request\n\n${message.payload?.content || 'Connect wallet'}\n\nConnect your wallet?`
              );
              
              if (userConfirmed) {
                return {
                  annex: {
                    signer: '0x9876543210fedcba9876543210fedcba98765432'
                  }
                };
              } else {
                throw new Error("Connection cancelled");
              }
            }
          }),
          sign: async (kind: string, message: any) => {
            const userConfirmed = confirm(
              `Legacy VeWorld Connection\n\n${message.payload?.content || 'Connect wallet'}\n\nProceed?`
            );
            
            if (userConfirmed) {
              return {
                annex: {
                  signer: '0x9876543210fedcba9876543210fedcba98765432'
                }
              };
            } else {
              throw new Error("Connection cancelled");
            }
          }
        };
        
        console.log("Mock VeWorld environment created for development");
      }, 5000); // Wait 5 seconds before creating mock
    }
  }
};
