import React from 'react';
import { useWallet } from '../context/WalletContext';
import { vechain } from '../lib/vechain';

/**
 * LiveWalletAddress - Gets wallet address from WalletContext (single source of truth)
 * 🔥 FIX: No longer calls useVeChainKitWallet() to avoid duplicate wallet connections
 */
interface LiveWalletAddressProps {
  fallbackAddress?: string;
  formatted?: boolean;
}

export default function LiveWalletAddress({ fallbackAddress = '', formatted = true }: LiveWalletAddressProps) {
  const { address } = useWallet();
  
  // Use WalletContext address or fallback
  const currentAddress = address || fallbackAddress;
  
  // Format address if requested
  const displayAddress = formatted && currentAddress ? 
    vechain.formatAddress(currentAddress) : 
    currentAddress;

  console.log(`[LIVE-ADDRESS] WalletContext: ${address}, Fallback: ${fallbackAddress}, Display: ${displayAddress}`);
  
  return <span>{displayAddress}</span>;
}