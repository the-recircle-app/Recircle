import { useState, useEffect } from 'react';
import { useVeChain } from './VeChainProvider';

export function WalletConnector() {
  const { isConnected, account, connect, disconnect, isLoading } = useVeChain();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-mono">
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
    >
      Connect Wallet
    </button>
  );
}