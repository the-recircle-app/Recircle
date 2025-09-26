import React from 'react';
import { useWallet as useVeChainKitWallet } from '@vechain/vechain-kit';
import { vechain } from '../lib/vechain';

/**
 * LiveWalletAddress - Gets real wallet address directly from VeChainKit
 * This ensures the address never gets stale like WalletContext.address can
 */
interface LiveWalletAddressProps {
  fallbackAddress?: string;
  formatted?: boolean;
}

export default function LiveWalletAddress({ fallbackAddress = '', formatted = true }: LiveWalletAddressProps) {
  const { account } = useVeChainKitWallet();
  
  // Use live VeChainKit address or fallback
  const currentAddress = account?.address || fallbackAddress;
  
  // Format address if requested
  const displayAddress = formatted && currentAddress ? 
    vechain.formatAddress(currentAddress) : 
    currentAddress;

  console.log(`[LIVE-ADDRESS] VeChainKit: ${account?.address}, Fallback: ${fallbackAddress}, Display: ${displayAddress}`);
  
  return <span>{displayAddress}</span>;
}