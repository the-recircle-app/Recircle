/**
 * Mobile Connex initialization for VeWorld app
 * Fixes the missing Connex injection in VeWorld mobile browser
 */

declare global {
  interface Window {
    vechain?: any;
    connex?: any;
  }
}

export class MobileConnexInitializer {
  private static instance: MobileConnexInitializer;
  private initAttempted = false;
  private initSuccess = false;

  static getInstance(): MobileConnexInitializer {
    if (!MobileConnexInitializer.instance) {
      MobileConnexInitializer.instance = new MobileConnexInitializer();
    }
    return MobileConnexInitializer.instance;
  }

  /**
   * Initialize Connex for mobile VeWorld app
   * This fixes the missing Connex injection issue
   */
  async initializeMobileConnex(): Promise<boolean> {
    if (this.initAttempted) {
      return this.initSuccess;
    }

    this.initAttempted = true;
    console.log('[MOBILE-CONNEX] Initializing Connex for mobile VeWorld app...');

    try {
      // Check if we're in VeWorld mobile app
      const isVeWorldApp = this.isVeWorldMobileApp();
      console.log('[MOBILE-CONNEX] VeWorld app detected:', isVeWorldApp);

      if (!isVeWorldApp) {
        console.log('[MOBILE-CONNEX] Not in VeWorld app - skipping mobile Connex init');
        return false;
      }

      // Check if real Connex already exists and is working
      if (window.connex && window.connex.vendor && window.connex.vendor.sign) {
        console.log('[MOBILE-CONNEX] Real Connex already exists - not overriding');
        const connexWorking = await this.verifyConnex();
        this.initSuccess = connexWorking;
        return connexWorking;
      }

      // VeWorld mobile doesn't auto-inject Connex - create it manually!
      await this.createConnexForVeWorldMobile();

      // Verify Connex is working
      const connexWorking = await this.verifyConnex();
      console.log('[MOBILE-CONNEX] Connex verification result:', connexWorking);

      this.initSuccess = connexWorking;
      return connexWorking;

    } catch (error) {
      console.error('[MOBILE-CONNEX] Initialization failed:', error);
      this.initSuccess = false;
      return false;
    }
  }

  /**
   * Check if we're in VeWorld mobile app
   */
  private isVeWorldMobileApp(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Check if user agent contains VeWorld
    const isVeWorldUserAgent = userAgent.includes('veworld');
    
    // Check if mobile device
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // ALWAYS try to initialize in development mode to help VeWorld work
    // This helps both desktop and mobile VeWorld browsers
    console.log('[MOBILE-CONNEX] User agent check:', {
      userAgent: userAgent,
      isVeWorldUserAgent,
      isMobile,
      isDevelopment: import.meta.env.DEV
    });
    
    // In development, always try to help VeWorld inject Connex
    if (import.meta.env.DEV) {
      return true; // Always wait for VeWorld in development
    }
    
    return isVeWorldUserAgent || isMobile;
  }

  /**
   * Create Connex manually for VeWorld mobile
   * VeWorld mobile doesn't auto-inject Connex - we must create it ourselves
   */
  private async createConnexForVeWorldMobile(): Promise<void> {
    console.log('[MOBILE-CONNEX] Creating Connex manually for VeWorld mobile...');
    
    // Check if Connex is already available (desktop/extension)
    if (window.connex && window.connex.vendor && window.connex.vendor.sign) {
      console.log('[MOBILE-CONNEX] ✅ Connex already exists (desktop/extension)');
      return;
    }
    
    try {
      // Import Connex library (default export)
      const Connex = (await import('@vechain/connex')).default;
      
      // Create Connex instance with testnet configuration
      const connex = new Connex({
        node: 'https://vethor-node-test.vechaindev.com', // Testnet node
        network: 'test', // Testnet
      });
      
      // Inject it into window for compatibility
      window.connex = connex;
      
      console.log('[MOBILE-CONNEX] ✅ Connex created successfully!', {
        version: connex.version,
        hasVendor: !!connex.vendor,
        hasSign: !!connex.vendor?.sign,
        hasThor: !!connex.thor
      });
    } catch (error) {
      console.error('[MOBILE-CONNEX] Failed to create Connex:', error);
      throw error;
    }
  }

  /**
   * Create Connex from VeChain provider
   */
  private async createConnexFromVeChain(): Promise<void> {
    const vechain = window.vechain;
    
    if (!vechain) {
      throw new Error('VeChain provider not available');
    }

    // Create a minimal Connex-compatible object
    const connex = {
      version: '2.0.0',
      thor: {
        genesis: {
          id: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a' // VeChain testnet genesis
        },
        status: {
          head: {
            id: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
            number: 0,
            timestamp: Date.now()
          }
        }
      },
      vendor: {
        sign: (type: string, payload?: any) => {
          return {
            request: async () => {
              console.log('[MOBILE-CONNEX] Vendor sign request:', type, payload);
              
              if (type === 'cert') {
                // Certificate signing for authentication
                if (typeof vechain.request === 'function') {
                  try {
                    const accounts = await vechain.request({ method: 'eth_accounts' });
                    if (accounts && accounts.length > 0) {
                      return {
                        annex: {
                          signer: accounts[0]
                        }
                      };
                    }
                  } catch (error) {
                    console.log('[MOBILE-CONNEX] eth_accounts failed, trying enable...');
                  }
                }
                
                // Fallback to enable method
                if (typeof vechain.enable === 'function') {
                  try {
                    await vechain.enable();
                    const address = vechain.selectedAddress || vechain.accounts?.[0];
                    if (address) {
                      return {
                        annex: {
                          signer: address
                        }
                      };
                    }
                  } catch (error) {
                    console.log('[MOBILE-CONNEX] enable method failed');
                  }
                }
              } else if (type === 'tx') {
                // Don't create mock transactions - throw error to force real VeWorld
                console.log('[MOBILE-CONNEX] Transaction signing requested but VeWorld not available');
                throw new Error('Real VeWorld wallet required for transactions');
              }
              
              throw new Error('Mobile wallet signing not available');
            }
          };
        }
      }
    };

    // Inject Connex into window
    window.connex = connex;
    console.log('[MOBILE-CONNEX] Connex object created and injected');
  }

  /**
   * Verify that Connex is working properly
   */
  private async verifyConnex(): Promise<boolean> {
    try {
      if (!window.connex) {
        console.log('[MOBILE-CONNEX] Verification failed: Connex not found');
        return false;
      }

      const connex = window.connex;
      
      // Check basic structure
      if (!connex.vendor || !connex.thor) {
        console.log('[MOBILE-CONNEX] Verification failed: Missing vendor or thor');
        return false;
      }

      // Check sign method
      if (typeof connex.vendor.sign !== 'function') {
        console.log('[MOBILE-CONNEX] Verification failed: Sign method not available');
        return false;
      }

      console.log('[MOBILE-CONNEX] Verification passed: Connex is working');
      return true;

    } catch (error) {
      console.error('[MOBILE-CONNEX] Verification error:', error);
      return false;
    }
  }

  /**
   * Get current initialization status
   */
  getStatus(): { attempted: boolean; success: boolean } {
    return {
      attempted: this.initAttempted,
      success: this.initSuccess
    };
  }
}

// Export singleton instance
export const mobileConnexInit = MobileConnexInitializer.getInstance();