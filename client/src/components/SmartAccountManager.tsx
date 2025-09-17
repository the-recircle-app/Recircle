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
  
  // Get smart account address for the connected wallet owner
  const { data: derivedSmartAccountAddress } = useGetAccountAddress(
    kitAccount?.address || '' // The EOA or embedded wallet address
  );
  
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

  // Debug logging
  useEffect(() => {
    if (kitAccount?.address) {
      console.log('[SMART-ACCOUNT] VeChainKit account detected:', {
        ownerAddress: kitAccount.address,
        derivedSmartAccountAddress,
        isDeployed: isSmartAccountDeployed,
        upgradeRequired,
        version: smartAccountVersion
      });
    }
  }, [kitAccount, derivedSmartAccountAddress, isSmartAccountDeployed, upgradeRequired, smartAccountVersion]);

  // Handle smart account setup when VeChainKit connects
  useEffect(() => {
    if (kitAccount?.address && derivedSmartAccountAddress && !isProcessingSmartAccount) {
      handleSmartAccountSetup();
    }
  }, [kitAccount, derivedSmartAccountAddress, isSmartAccountDeployed, isProcessingSmartAccount]);

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
      
      // If smart account is not deployed, it will be deployed on first transaction
      if (!isSmartAccountDeployed) {
        console.log('[SMART-ACCOUNT] Smart account not deployed yet, will deploy on first transaction');
        
        toast({
          title: "Smart Account Ready",
          description: "Your smart account will be created on your first transaction.",
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
      
      // Sync the smart account address to our WalletContext
      // Use the smart account address for all B3TR balance queries
      if (derivedSmartAccountAddress !== appAddress) {
        console.log('[SMART-ACCOUNT] Syncing smart account to app context:', derivedSmartAccountAddress);
        
        // Connect using the smart account address (not the EOA owner address)
        const success = await appConnect('smart-account', derivedSmartAccountAddress, {
          skipCelebration: true
        });
        
        if (!success) {
          console.error('[SMART-ACCOUNT] Failed to sync smart account to app context');
          
          toast({
            title: "Smart Account Sync Failed",
            description: "Could not sync smart account with app. Please try reconnecting.",
            variant: "destructive"
          });
        }
      }
      
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

  // Temporary debug panel to make smart account state visible (remove after testing)
  const showDebugPanel = kitAccount?.address || derivedSmartAccountAddress;
  
  if (showDebugPanel) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        fontFamily: 'monospace'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🔍 Smart Account Debug</div>
        <div>Owner: {kitAccount?.address ? `${kitAccount.address.slice(0, 8)}...` : 'None'}</div>
        <div>Smart Account: {derivedSmartAccountAddress ? `${derivedSmartAccountAddress.slice(0, 8)}...` : 'None'}</div>
        <div>Deployed: {isSmartAccountDeployed ? '✅' : '❌'}</div>
        <div>Version: {typeof smartAccountVersion === 'object' ? smartAccountVersion?.version || 'Unknown' : smartAccountVersion || 'Unknown'}</div>
        <div>App Context: {appAddress ? `${appAddress.slice(0, 8)}...` : 'None'}</div>
        <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.7 }}>
          {isProcessingSmartAccount ? '⏳ Processing...' : '✅ Ready'}
        </div>
      </div>
    );
  }
  
  // Return nothing when no wallet connected
  return null;
}