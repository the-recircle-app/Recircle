import { useEffect } from 'react';
import { useWallet as useAppWallet } from '../context/WalletContext';

/**
 * Bridges VeChain wallet state with app wallet context
 * Detects connected VeChain wallets and syncs with app state
 */
export function VeChainStateBridge() {
  const { connect, disconnect, isConnected: appConnected } = useAppWallet();

  useEffect(() => {
    // TEMPORARILY DISABLED: This was causing connect/disconnect loops with manual VeWorld connections
    // The bridge was auto-detecting VeWorld connections and triggering app connects
    // while user was manually connecting, creating conflicts
    
    console.log('[BRIDGE] VeChainStateBridge temporarily disabled to fix desktop connection loops');
    return;
    
    const checkVeChainConnection = async () => {
      try {
        console.log('[BRIDGE] Checking VeChain wallet connection state...');
        console.log('[BRIDGE] App connected state:', appConnected);

        // Force check of actual wallet state regardless of app connection status
        console.log('[BRIDGE] Checking actual wallet state...');

        // Check VeChain Kit connection state
        let connectedAddress = null;

        // Method 1: Check multiple localStorage keys that VeChain Kit might use
        try {
          const possibleKeys = [
            'vechain-wallet-address',
            'wallet-connect-address', 
            'dappkit-wallet-address',
            'vechain-kit-address',
            'connected-wallet-address'
          ];
          
          for (const key of possibleKeys) {
            const stored = localStorage.getItem(key);
            if (stored) {
              connectedAddress = stored;
              console.log(`[BRIDGE] Found stored connection in ${key}:`, connectedAddress);
              break;
            }
          }
        } catch (error) {
          console.log('[BRIDGE] No stored VeChain connection found');
        }

        // Method 2: Check VeWorld browser and extension
        if (!connectedAddress && typeof window !== 'undefined') {
          // Check for VeWorld extension (desktop Chrome)
          const vechainProvider = (window as any).vechain;
          console.log('[BRIDGE] Checking window.vechain provider:', !!vechainProvider);
          
          if (vechainProvider) {
            console.log('[BRIDGE] VeChain provider available, checking properties...');
            console.log('[BRIDGE] selectedAddress:', vechainProvider.selectedAddress);
            console.log('[BRIDGE] accounts:', vechainProvider.accounts);
            console.log('[BRIDGE] has request function:', typeof vechainProvider.request === 'function');
            
            // Check for already connected account
            if (vechainProvider.selectedAddress) {
              connectedAddress = vechainProvider.selectedAddress;
              console.log('[BRIDGE] Found VeWorld selectedAddress:', connectedAddress);
            } else if (vechainProvider.accounts && vechainProvider.accounts.length > 0) {
              connectedAddress = vechainProvider.accounts[0];
              console.log('[BRIDGE] Found VeWorld accounts[0]:', connectedAddress);
            } else if (typeof vechainProvider.request === 'function') {
              try {
                console.log('[BRIDGE] Attempting eth_accounts request...');
                const accounts = await vechainProvider.request({ method: 'eth_accounts' });
                console.log('[BRIDGE] eth_accounts response:', accounts);
                if (accounts && accounts.length > 0) {
                  connectedAddress = accounts[0];
                  console.log('[BRIDGE] Found VeWorld via eth_accounts:', connectedAddress);
                }
              } catch (requestError) {
                console.log('[BRIDGE] VeWorld request failed:', requestError);
              }
            }
          } else {
            console.log('[BRIDGE] No window.vechain provider found');
          }
        }

        // Method 3: Check Connex
        if (!connectedAddress && typeof window !== 'undefined' && (window as any).connex) {
          try {
            const connex = (window as any).connex;
            if (connex.vendor && connex.vendor.sign) {
              // Connex is available, but we need to check if there's an active session
              console.log('[BRIDGE] Connex available but checking session state');
            }
          } catch (connexError) {
            console.log('[BRIDGE] Connex check failed:', connexError);
          }
        }

        // If we found a connected address, sync it with app context
        if (connectedAddress && !appConnected) {
          console.log('[BRIDGE] Syncing VeChain connection to app context:', connectedAddress);
          
          // Use VeWorld as the wallet type since that's most common
          const success = await connect('VeWorld', connectedAddress, { skipCelebration: true });
          
          if (success) {
            console.log('[BRIDGE] Successfully synced VeChain wallet state');
          } else {
            console.warn('[BRIDGE] Failed to sync VeChain wallet state');
          }
        } else if (!connectedAddress && appConnected) {
          // Check if user just connected via VeWorldConnector
          const recentConnection = localStorage.getItem('veworld-connected');
          if (recentConnection === 'true') {
            console.log('[BRIDGE] Recent VeWorld connection detected, preserving app state');
            return; // Don't disconnect if user just connected
          }
          
          console.log('[BRIDGE] App thinks it\'s connected but no VeChain wallet found - forcing disconnect');
          // Force disconnect since there's no actual wallet connection
          try {
            await disconnect();
            console.log('[BRIDGE] Successfully disconnected false connection state');
          } catch (disconnectError) {
            console.warn('[BRIDGE] Disconnect failed:', disconnectError);
          }
        } else if (!connectedAddress) {
          console.log('[BRIDGE] No VeChain wallet connection detected');
        }

      } catch (error) {
        console.error('[BRIDGE] Error checking VeChain connection:', error);
      }
    };

    // Check connection state on mount
    checkVeChainConnection();

    // Set up listeners for VeChain connection events
    if (typeof window !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('[BRIDGE] VeChain accounts changed:', accounts);
        if (accounts.length > 0 && !appConnected) {
          connect('VeWorld', accounts[0], { skipCelebration: true });
        }
      };

      const handleConnect = (connectInfo: any) => {
        console.log('[BRIDGE] VeChain connect event:', connectInfo);
        checkVeChainConnection();
      };

      // Listen for VeChain provider events
      const vechainProvider = (window as any).vechain;
      if (vechainProvider) {
        vechainProvider.on?.('accountsChanged', handleAccountsChanged);
        vechainProvider.on?.('connect', handleConnect);
        
        // Cleanup listeners
        return () => {
          vechainProvider.removeListener?.('accountsChanged', handleAccountsChanged);
          vechainProvider.removeListener?.('connect', handleConnect);
        };
      }
    }
  }, [connect, appConnected]);

  // This component doesn't render anything
  return null;
}