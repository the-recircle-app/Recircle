import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { getVeChainConfig } from '../../../shared/vechain-config';

/**
 * LiveB3TRBalance - Gets real B3TR balance directly from blockchain
 * Network-aware: automatically uses mainnet or testnet based on VECHAIN_NETWORK env var
 * 
 * 🔥 CRITICAL: Uses WalletContext instead of useVeChainKitWallet to prevent duplicate hook instances
 */
interface LiveB3TRBalanceProps {
  fallbackBalance?: number;
  onBalanceChange?: (balance: number) => void;
}

export default function LiveB3TRBalance({ fallbackBalance = 0, onBalanceChange }: LiveB3TRBalanceProps) {
  const { address } = useWallet();
  const [liveBalance, setLiveBalance] = useState<number>(fallbackBalance);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setLiveBalance(fallbackBalance);
      return;
    }

    const fetchLiveBalance = async () => {
      try {
        setIsLoading(true);
        
        // Get network config dynamically (mainnet or testnet)
        const config = getVeChainConfig();
        const RPC_URL = config.thorEndpoints[0];
        const B3TR_CONTRACT = config.contracts.b3trToken;
        
        console.log(`[LIVE-BALANCE] Fetching ${config.network.toUpperCase()} B3TR balance for ${address}`);
        console.log(`[LIVE-BALANCE] RPC: ${RPC_URL}, Contract: ${B3TR_CONTRACT}`);
        
        // Call balanceOf function on B3TR contract
        const balanceOfSignature = '0x70a08231'; // balanceOf(address)
        const paddedAddress = address.slice(2).padStart(64, '0');
        
        const response = await fetch(`${RPC_URL}/accounts/${B3TR_CONTRACT}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            value: '0x0',
            data: balanceOfSignature + paddedAddress,
            caller: address
          })
        });
        
        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`);
        }
        
        const result = await response.json();
        const balanceHex = result.data;
        
        if (!balanceHex || balanceHex === '0x') {
          console.log(`[LIVE-BALANCE] No balance data returned`);
          setLiveBalance(0);
          onBalanceChange?.(0);
          return;
        }
        
        // Convert hex to number (B3TR has 18 decimals)
        const balanceWei = BigInt(balanceHex);
        const balanceB3TR = Number(balanceWei) / Math.pow(10, 18);
        
        console.log(`[LIVE-BALANCE] ✅ Live balance: ${balanceB3TR} B3TR (hex: ${balanceHex})`);
        setLiveBalance(balanceB3TR);
        onBalanceChange?.(balanceB3TR);
        
      } catch (error) {
        console.error('[LIVE-BALANCE] Error fetching live balance:', error);
        setLiveBalance(fallbackBalance);
        onBalanceChange?.(fallbackBalance);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch balance immediately
    fetchLiveBalance();

    // Refresh balance every 10 seconds to keep it up to date (faster than 30s for better UX after transactions)
    const interval = setInterval(fetchLiveBalance, 10000);
    
    return () => clearInterval(interval);
  }, [address, fallbackBalance, onBalanceChange]);

  return (
    <span className={isLoading ? 'opacity-50' : ''}>
      {liveBalance.toFixed(1)}
    </span>
  );
}