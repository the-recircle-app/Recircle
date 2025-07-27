/**
 * Direct VeWorld connection utility for mobile VeWorld browser
 * Based on actual VeWorld browser implementation
 */

export interface VeWorldConnection {
  address: string;
  connected: boolean;
}

export class VeWorldDirect {
  private static instance: VeWorldDirect;
  private connection: VeWorldConnection | null = null;

  static getInstance(): VeWorldDirect {
    if (!VeWorldDirect.instance) {
      VeWorldDirect.instance = new VeWorldDirect();
    }
    return VeWorldDirect.instance;
  }

  async connect(): Promise<VeWorldConnection> {
    console.log('VeWorld Direct: Starting connection...');
    
    if (!window.vechain) {
      throw new Error('VeWorld browser required');
    }

    // Method 1: Try request-based connection (most common in mobile VeWorld)
    if (typeof window.vechain.request === 'function') {
      try {
        console.log('VeWorld Direct: Trying request method...');
        const accounts = await window.vechain.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts && accounts.length > 0) {
          this.connection = {
            address: accounts[0],
            connected: true
          };
          console.log('VeWorld Direct: Connected via request method:', accounts[0]);
          return this.connection;
        }
      } catch (error) {
        console.warn('VeWorld Direct: Request method failed:', error);
      }
    }

    // Method 2: Try enable method (alternative mobile approach)
    if (typeof window.vechain.enable === 'function') {
      try {
        console.log('VeWorld Direct: Trying enable method...');
        const accounts = await window.vechain.enable();
        
        if (accounts && accounts.length > 0) {
          this.connection = {
            address: accounts[0],
            connected: true
          };
          console.log('VeWorld Direct: Connected via enable method:', accounts[0]);
          return this.connection;
        }
      } catch (error) {
        console.warn('VeWorld Direct: Enable method failed:', error);
      }
    }

    // Method 3: Try sign method with certificate request
    if (typeof window.vechain.sign === 'function') {
      try {
        console.log('VeWorld Direct: Trying sign certificate method...');
        const signRequest = window.vechain.sign('cert', {
          purpose: 'identification',
          payload: {
            type: 'text',
            content: `ReCircle wallet connection - ${Date.now()}`
          }
        });

        let result;
        if (signRequest && typeof signRequest.request === 'function') {
          result = await signRequest.request();
        } else {
          result = await signRequest;
        }

        if (result && result.annex && result.annex.signer) {
          this.connection = {
            address: result.annex.signer,
            connected: true
          };
          console.log('VeWorld Direct: Connected via sign method:', result.annex.signer);
          return this.connection;
        }
      } catch (error) {
        console.warn('VeWorld Direct: Sign method failed:', error);
      }
    }

    // Method 4: Try any available connect method
    if (typeof window.vechain.connect === 'function') {
      try {
        console.log('VeWorld Direct: Trying connect method...');
        await window.vechain.connect();
        
        if (window.vechain.selectedAddress) {
          this.connection = {
            address: window.vechain.selectedAddress,
            connected: true
          };
          console.log('VeWorld Direct: Connected via connect method:', window.vechain.selectedAddress);
          return this.connection;
        }
      } catch (error) {
        console.warn('VeWorld Direct: Connect method failed:', error);
      }
    }

    throw new Error('No working VeWorld connection method found');
  }

  getConnection(): VeWorldConnection | null {
    return this.connection;
  }

  disconnect(): void {
    this.connection = null;
    console.log('VeWorld Direct: Disconnected');
  }

  isConnected(): boolean {
    return this.connection?.connected || false;
  }

  getAddress(): string | null {
    return this.connection?.address || null;
  }
}

// Export singleton instance
export const veWorldDirect = VeWorldDirect.getInstance();