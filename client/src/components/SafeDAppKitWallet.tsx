import React from 'react';
import { Button } from "@/components/ui/button";
import { useWallet as useAppWallet } from "../context/WalletContext";
import VeChainWalletConnect from "./VeChainWalletConnect";

// Safe DAppKit wrapper with error boundary
const SafeDAppKitWallet: React.FC = () => {
  const { connect, disconnect, tokenBalance, isConnected: appConnected } = useAppWallet();
  const [dappKitError, setDappKitError] = React.useState<boolean>(false);
  const [wallet, setWallet] = React.useState<any>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Attempt to load DAppKit safely
    let mounted = true;
    
    const loadDAppKit = async () => {
      try {
        const { useWallet } = await import('@vechain/dapp-kit-react');
        
        if (mounted) {
          // This will only work if DAppKit loads successfully
          console.log('[DAPPKIT] Successfully loaded, attempting to use wallet hook');
        }
      } catch (error) {
        console.log('[DAPPKIT] Failed to load DAppKit:', error);
        if (mounted) {
          setDappKitError(true);
        }
      }
    };

    loadDAppKit();
    
    return () => {
      mounted = false;
    };
  }, []);

  // If DAppKit failed to load, use fallback VeWorld connector
  if (dappKitError) {
    console.log('[DAPPKIT] Using fallback VeWorld connector due to DAppKit errors');
    return <VeChainWalletConnect />;
  }

  // Sync wallet state
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
          Loading DAppKit wallet connector...
        </p>
        
        <div className="mb-4">
          <Button 
            onClick={() => setDappKitError(true)}
            variant="outline"
            size="sm"
          >
            Use Alternative Connector
          </Button>
        </div>
        
        <p className="text-gray-400 text-xs mt-4">
          Supports VeWorld mobile, VeWorld extension, Sync2, and WalletConnect
        </p>
      </div>
    </div>
  );
};

export default SafeDAppKitWallet;