import React, { useEffect, useState } from 'react';
import { 
  useWallet as useVeChainKitWallet,
  useGetAccountAddress,
  useIsSmartAccountDeployed,
  useUpgradeRequiredForAccount,
  useGetAccountVersion 
} from '@vechain/vechain-kit';
import { useWallet } from '../context/WalletContext';
import { useToast } from '@/hooks/use-toast';

/**
 * SmartAccountManager
 * 
 * Integrates VeChainKit smart account functionality with our app's WalletContext.
 * This component handles:
 * - Smart account address derivation from EOA/embedded wallet owners
 * - Smart account deployment status checking  
 * - Balance syncing from smart accounts (not EOA addresses)
 * - Upgrade prompts for V1 smart accounts
 */
export default function SmartAccountManager() {
  const { account: kitAccount, smartAccount } = useVeChainKitWallet();
  const { address: appAddress, connect: appConnect } = useWallet();
  const { toast } = useToast();
  
  // State for smart account management
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('');
  const [isProcessingSmartAccount, setIsProcessingSmartAccount] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState<string>(''); // Track which account has been set up
  
  // Get smart account address from VeChainKit (already available from useVeChainKitWallet)
  const derivedSmartAccountAddress = smartAccount?.address;
  
  // Check if smart account is deployed on-chain
  const { data: isSmartAccountDeployed } = useIsSmartAccountDeployed(
    derivedSmartAccountAddress || ''
  );
  
  // Check if upgrade is required (V1 to V3)  
  // Temporarily disabled due to hook signature uncertainty - can be re-enabled later
  const upgradeRequired = false; // useUpgradeRequiredForAccount signature needs verification
  
  // Get smart account version if deployed
  const { data: smartAccountVersion } = useGetAccountVersion(
    derivedSmartAccountAddress || '',
    kitAccount?.address || '' // owner address
  );

  // Enhanced debug logging
  useEffect(() => {
    console.log('[SMART-ACCOUNT] State update:', {
      hasKitAccount: !!kitAccount?.address,
      ownerAddress: kitAccount?.address,
      derivedSmartAccountAddress,
      appContextAddress: appAddress,
      isDeployed: isSmartAccountDeployed,
      setupCompleted,
      isProcessing: isProcessingSmartAccount,
      upgradeRequired,
      version: smartAccountVersion
    });
  }, [kitAccount, derivedSmartAccountAddress, appAddress, isSmartAccountDeployed, upgradeRequired, smartAccountVersion, setupCompleted, isProcessingSmartAccount]);

  // Reset setup state when wallet disconnects
  useEffect(() => {
    if (!kitAccount?.address) {
      console.log('[SMART-ACCOUNT] VeChainKit disconnected - clearing smart account state');
      setSetupCompleted('');
      setSmartAccountAddress('');
      setIsProcessingSmartAccount(false);
    }
  }, [kitAccount?.address]);

  // Handle smart account setup when VeChainKit connects
  useEffect(() => {
    // CRITICAL FIX: Skip SmartAccountManager entirely if Connex is available (VeWorld user)
    // VeWorld users have window.connex and should NEVER have their address overridden
    if (typeof window !== 'undefined' && (window as any).connex) {
      console.log('[SMART-ACCOUNT] Connex detected - this is a VeWorld user, skipping SmartAccountManager entirely');
      return;
    }
    
    if (kitAccount?.address && derivedSmartAccountAddress && 
        !isProcessingSmartAccount && 
        setupCompleted !== derivedSmartAccountAddress) {
      console.log('[SMART-ACCOUNT] Triggering smart account setup for:', derivedSmartAccountAddress);
      handleSmartAccountSetup();
    } else if (!kitAccount?.address && !isProcessingSmartAccount) {
      console.log('[SMART-ACCOUNT] No VeChainKit account - checking if we should restore connection...');
      
      // Check if we have a stored wallet address that should trigger VeChainKit restore
      const storedAddress = localStorage.getItem("walletAddress");
      const storedWalletType = localStorage.getItem("connectedWallet");
      
      if (storedAddress && (storedWalletType === 'smart-account' || storedWalletType === 'dappkit')) {
        console.log('[SMART-ACCOUNT] Found stored smart account, but VeChainKit not connected. Storage may need cleanup:', {
          storedAddress,
          storedWalletType,
          currentAppAddress: appAddress
        });
      }
    }
  }, [kitAccount?.address, derivedSmartAccountAddress, isProcessingSmartAccount, setupCompleted, appAddress]);

  const handleSmartAccountSetup = async () => {
    if (!kitAccount?.address || !derivedSmartAccountAddress || isProcessingSmartAccount) {
      return;
    }

    setIsProcessingSmartAccount(true);
    
    try {
      console.log('[SMART-ACCOUNT] Setting up smart account...');
      
      // Store the smart account address for balance queries
      setSmartAccountAddress(derivedSmartAccountAddress);
      
      // Check if upgrade is needed
      if (upgradeRequired) {
        toast({
          title: "Smart Account Upgrade Required",
          description: "Your smart account needs to be upgraded to V3. Please use the upgrade modal.",
          variant: "default",
          duration: 8000
        });
        
        console.log('[SMART-ACCOUNT] Upgrade required from V1 to V3');
        // Note: In production, you'd show the UpgradeSmartAccountModal here
        return;
      }
      
      // Smart account is ready - deployment happens automatically when needed
      if (!isSmartAccountDeployed) {
        console.log('[SMART-ACCOUNT] Smart account ready - has deterministic address, will deploy when needed');
        
        toast({
          title: "Smart Account Ready",
          description: "Your smart account is ready to receive B3TR tokens and make transactions.",
          duration: 5000
        });
      } else {
        console.log('[SMART-ACCOUNT] Smart account already deployed, version:', smartAccountVersion);
        
        toast({
          title: "Smart Account Connected",
          description: `Smart account V${typeof smartAccountVersion === 'object' ? smartAccountVersion?.version || 'latest' : smartAccountVersion || 'latest'} ready for transactions.`,
          duration: 3000
        });
      }
      
      // Determine which address to use based on wallet source
      const walletSource = (kitAccount as any)?.source || 'unknown';
      const smartAccountOwnerSource = (smartAccount as any)?.owner?.source || '';
      const isPrivyUser = walletSource === 'privy' || walletSource === 'embedded' || smartAccountOwnerSource === 'privy';
      
      console.log('[SMART-ACCOUNT] Wallet source detected:', walletSource);
      console.log('[SMART-ACCOUNT] Smart account owner source:', smartAccountOwnerSource);
      console.log('[SMART-ACCOUNT] Smart account address:', derivedSmartAccountAddress);
      console.log('[SMART-ACCOUNT] EOA address:', kitAccount?.address);
      console.log('[SMART-ACCOUNT] Is Privy user:', isPrivyUser);
      
      // CRITICAL: Only override the app address for Privy users
      // VeWorld users should keep their EOA address (already set by WalletProvider)
      if (isPrivyUser) {
        // Privy users MUST use smart account address (EOA can't sign transactions)
        const addressToUse = derivedSmartAccountAddress;
        const walletType = 'smart-account';
        
        if (addressToUse && addressToUse !== appAddress) {
          console.log('[SMART-ACCOUNT] Privy user detected - connecting with smart account address:', addressToUse);
          
          const success = await appConnect(walletType, addressToUse, {
            skipCelebration: true
          });
          
          if (!success) {
            console.error('[SMART-ACCOUNT] Failed to sync smart account to app context');
            
            toast({
              title: "Account Sync Failed",
              description: "Could not sync your account with the app. Please try reconnecting.",
              variant: "destructive"
            });
          } else {
            console.log('[SMART-ACCOUNT] Successfully synced smart account to app context');
          }
        }
      } else {
        // VeWorld users - DO NOT call appConnect here
        // They're already connected with their EOA via WalletProvider
        console.log('[SMART-ACCOUNT] VeWorld user detected - skipping address override, keeping EOA:', kitAccount?.address);
        console.log('[SMART-ACCOUNT] Current app address is correct:', appAddress);
      }
      
      // Mark setup as completed for this smart account address
      setSetupCompleted(derivedSmartAccountAddress);
      
    } catch (error) {
      console.error('[SMART-ACCOUNT] Setup error:', error);
      
      toast({
        title: "Smart Account Setup Failed", 
        description: "Could not set up smart account. Please try reconnecting.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingSmartAccount(false);
    }
  };

  // This component runs as a background service - no UI needed
  return null;
}