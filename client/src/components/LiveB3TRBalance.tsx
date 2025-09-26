import React, { useState, useEffect } from 'react';
import { useWallet as useVeChainKitWallet } from '@vechain/vechain-kit';

/**
 * LiveB3TRBalance - Gets real B3TR balance directly from VeChainKit (same source as wallet modal)
 * This bypasses the database and shows the actual blockchain balance that VeChainKit displays
 */
interface LiveB3TRBalanceProps {
  fallbackBalance?: number;
  onBalanceChange?: (balance: number) => void;
}

export default function LiveB3TRBalance({ fallbackBalance = 0, onBalanceChange }: LiveB3TRBalanceProps) {
  const { account } = useVeChainKitWallet();
  const [liveBalance, setLiveBalance] = useState<number>(fallbackBalance);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!account?.address) {
      setLiveBalance(fallbackBalance);
      return;
    }

    const fetchLiveBalance = async () => {
      try {
        setIsLoading(true);
        console.log(`[LIVE-BALANCE] Fetching live B3TR balance for ${account.address}`);
        
        // Use the same testnet RPC and B3TR contract that the wallet modal uses
        const TESTNET_RPC = 'https://vethor-node-test.vechaindev.com';
        const B3TR_CONTRACT_ADDRESS = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';
        
        // Call balanceOf function on B3TR contract (same as wallet modal)
        const balanceOfSignature = '0x70a08231'; // balanceOf(address)
        const paddedAddress = account.address.slice(2).padStart(64, '0');
        
        const response = await fetch(`${TESTNET_RPC}/accounts/${B3TR_CONTRACT_ADDRESS}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            value: '0x0',
            data: balanceOfSignature + paddedAddress,
            caller: account.address
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

    // Refresh balance every 30 seconds to keep it up to date
    const interval = setInterval(fetchLiveBalance, 30000);
    
    return () => clearInterval(interval);
  }, [account?.address, fallbackBalance, onBalanceChange]);

  return (
    <span className={isLoading ? 'opacity-50' : ''}>
      {liveBalance.toFixed(1)}
    </span>
  );
}