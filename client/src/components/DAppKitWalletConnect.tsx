import React from 'react';
// BUILD_TEMP: import { WalletButton, useWallet } from '../VeChainStubs';
import { Button } from "@/components/ui/button";
import { useWallet as useAppWallet } from "../context/WalletContext";
import DAppKitErrorBoundary from "./DAppKitErrorBoundary";
import VeChainWalletConnect from "./VeChainWalletConnect";

const DAppKitWalletConnect: React.FC = () => {
  const { connect, disconnect, tokenBalance, isConnected: appConnected } = useAppWallet();
  
  // Attempt to use DAppKit with error handling
  let wallet: any = null;
  let isConnected = false;
  let address: string | null = null;
  
  try {
    wallet = useWallet();
    isConnected = !!wallet.account;
    address = wallet.account;
  } catch (error) {
    console.log('[DAPPKIT] Error accessing wallet:', error);
    // Fall back to manual VeWorld connection
    return <VeChainWalletConnect />;
  }

  // Sync DAppKit wallet state with app wallet context
  React.useEffect(() => {
    if (isConnected && address && !appConnected) {
      console.log("[DAPPKIT] Wallet connected, syncing with app context:", address);
      connect(address);
    } else if (!isConnected && appConnected) {
      console.log("[DAPPKIT] Wallet disconnected, clearing app context");
      disconnect();
    }
  }, [isConnected, address, appConnected, connect, disconnect]);

  if (appConnected && address) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-bold text-green-400 mb-2">✅ Wallet Connected</h3>
          <p className="text-gray-300 text-sm mb-2">Address: {address}</p>
          <p className="text-gray-300 text-sm mb-4">Balance: {tokenBalance} B3TR</p>
          <Button onClick={disconnect} variant="outline" size="sm">
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-100 mb-4">VeChain Wallet Connection</h3>
        <p className="text-gray-300 text-sm mb-4">
          Connect your VeWorld, Sync2, or WalletConnect wallet
        </p>
        
        {/* Official VeChain DAppKit Wallet Button */}
        <div className="mb-4">
          <WalletButton />
        </div>
        
        {isConnected && address && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <p className="text-green-400 text-sm">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        )}
        
        <p className="text-gray-400 text-xs mt-4">
          Supports VeWorld mobile, VeWorld extension, Sync2, and WalletConnect
        </p>
      </div>
    </div>
  );
};

export default DAppKitWalletConnect;