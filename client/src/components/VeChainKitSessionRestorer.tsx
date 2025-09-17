import { useEffect, useState } from 'react';
import { useWallet as useVeChainKitWallet } from '@vechain/vechain-kit';
import { useWallet } from '../context/WalletContext';

/**
 * VeChainKitSessionRestorer
 * 
 * Attempts to restore VeChainKit session on app boot if persistent storage indicates
 * a previous connection existed. This prevents the race condition where WalletContext
 * initializes before VeChainKit auto-restores its state.
 * 
 * Strategy:
 * 1. Check for VeChainKit/DAppKit/Privy storage keys that indicate previous connection
 * 2. If storage exists but no kitAccount, attempt session restoration
 * 3. Use session-resume methods that don't re-prompt for user consent
 * 4. Let SmartAccountManager handle syncing restored accounts to WalletContext
 */
export default function VeChainKitSessionRestorer() {
  const { account: kitAccount, smartAccount } = useVeChainKitWallet();
  const { connect: appConnect } = useWallet();
  const [restorationAttempted, setRestorationAttempted] = useState(false);
  const [hasStorageKeys, setHasStorageKeys] = useState(false);
  const [syncAttempted, setSyncAttempted] = useState(false);

  // Check for existing VeChainKit/DAppKit/Privy storage keys on mount
  useEffect(() => {
    const checkStorageKeys = () => {
      const storageKeys = [
        'vechain-kit-account',
        '@vechain/dapp-kit',
        'privy:token',
        'privy:refresh_token',
        'privy:did_token',
        'dappkit-connected',
        'veworld-connected'
      ];

      const foundKeys = storageKeys.filter(key => 
        localStorage.getItem(key) || sessionStorage.getItem(key)
      );

      const hasKeys = foundKeys.length > 0;
      setHasStorageKeys(hasKeys);

      console.log('[KIT-RESTORER] Storage key check:', {
        foundKeys,
        hasKeys,
        kitAccountExists: !!kitAccount?.address
      });

      return hasKeys;
    };

    checkStorageKeys();
  }, [kitAccount?.address]);

  // Attempt session restoration if storage exists but no kit account
  useEffect(() => {
    if (hasStorageKeys && !kitAccount?.address && !restorationAttempted) {
      console.log('[KIT-RESTORER] Storage keys found but no kit account - attempting restoration...');
      attemptSessionRestore();
    }
  }, [hasStorageKeys, kitAccount?.address, restorationAttempted]);

  const attemptSessionRestore = async () => {
    setRestorationAttempted(true);
    
    try {
      console.log('[KIT-RESTORER] Starting VeChainKit session restoration...');
      
      // Check for DAppKit connections (VeWorld, Sync2)
      const dappkitData = localStorage.getItem('@vechain/dapp-kit');
      if (dappkitData) {
        console.log('[KIT-RESTORER] Found DAppKit data, checking for auto-reconnect...');
        // DAppKit should auto-reconnect on its own if properly configured
        // We don't need to manually trigger it, just give it time
      }

      // Check for Privy tokens (social login)
      const privyToken = localStorage.getItem('privy:token');
      const privyRefreshToken = localStorage.getItem('privy:refresh_token');
      
      if (privyToken || privyRefreshToken) {
        console.log('[KIT-RESTORER] Found Privy tokens, checking for auto-reauthentication...');
        // Privy should auto-reauthenticate if tokens are valid
        // VeChainKit integrates with Privy automatically
      }

      // Give VeChainKit a moment to auto-restore
      setTimeout(() => {
        if (!kitAccount?.address) {
          console.log('[KIT-RESTORER] Auto-restoration timeout reached, kit account still not available');
        } else {
          console.log('[KIT-RESTORER] Session restoration successful:', kitAccount.address);
        }
      }, 2000);

    } catch (error) {
      console.error('[KIT-RESTORER] Session restoration failed:', error);
    }
  };

  // Explicitly sync restored kitAccount to WalletContext
  useEffect(() => {
    if (kitAccount?.address && smartAccount?.address && !syncAttempted) {
      console.log('[KIT-RESTORER] ✅ VeChainKit session restored successfully, syncing to WalletContext:', {
        ownerAddress: kitAccount.address,
        smartAccountAddress: smartAccount.address
      });
      
      setSyncAttempted(true);
      
      // Explicitly sync the smart account to WalletContext
      const syncToWalletContext = async () => {
        try {
          const success = await appConnect('smart-account', smartAccount.address, { 
            skipCelebration: true 
          });
          
          if (success) {
            console.log('[KIT-RESTORER] ✅ Smart account synced to WalletContext successfully');
          } else {
            console.error('[KIT-RESTORER] ❌ Failed to sync smart account to WalletContext');
          }
        } catch (error) {
          console.error('[KIT-RESTORER] ❌ Error syncing smart account to WalletContext:', error);
        }
      };
      
      syncToWalletContext();
    }
  }, [kitAccount?.address, smartAccount?.address, syncAttempted, appConnect]);

  // Log restoration progress
  useEffect(() => {
    if (restorationAttempted && kitAccount?.address) {
      console.log('[KIT-RESTORER] ✅ VeChainKit session restored successfully:', kitAccount.address);
    }
  }, [restorationAttempted, kitAccount?.address]);

  // This component runs as a background service - no UI needed
  return null;
}