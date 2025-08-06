import React from 'react';
import { WalletButton } from "@vechain/vechain-kit";

/**
 * Official VeChain Kit wallet connection component
 * Replaces custom wallet connection logic with official implementation
 * Supports VeWorld mobile app, social login, and multiple wallets
 */
export function VeChainKitWalletConnect() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-300">Connect to start earning B3TR tokens</p>
      </div>
      
      {/* Official VeChain Kit Wallet Button */}
      <WalletButton />
      
      <div className="text-xs text-gray-400 text-center max-w-md">
        By connecting your wallet you are agreeing to our terms of service
      </div>
    </div>
  );
}