import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useWallet } from "../context/WalletContext";

interface VeChainProvider {
  request?: (args: { method: string; params?: any[] }) => Promise<any>;
  enable?: () => Promise<void>;
  selectedAddress?: string;
  accounts?: string[];
  isVeWorld?: boolean;
  chainId?: string;
}

const VeChainWalletConnect: React.FC = () => {
  const { isConnected, connect, disconnect, address, tokenBalance } = useWallet();
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<VeChainProvider | null>(null);

  useEffect(() => {
    // Detect VeChain provider
    const vechainProvider = (window as any).vechain;
    if (vechainProvider) {
      setProvider(vechainProvider);
      
      // Check if already connected
      if (vechainProvider.selectedAddress) {
        setConnectionState('connected');
      }
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      setError('VeWorld wallet not detected. Please use VeWorld browser or install VeWorld extension.');
      return;
    }

    setConnectionState('connecting');
    setError(null);

    try {
      let walletAddress: string | null = null;

      // Method 1: Modern VeWorld (desktop extension)
      if (provider.request) {
        try {
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          walletAddress = accounts[0];
        } catch (err) {
          console.log('eth_requestAccounts failed, trying enable method');
        }
      }

      // Method 2: Mobile VeWorld enable method
      if (!walletAddress && provider.enable) {
        try {
          await provider.enable();
          
          // Wait for selectedAddress to be populated
          let attempts = 0;
          while (!provider.selectedAddress && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
          }
          
          walletAddress = provider.selectedAddress || null;
        } catch (err) {
          console.log('enable method failed');
        }
      }

      // Method 3: Check direct address properties
      if (!walletAddress) {
        walletAddress = provider.selectedAddress || provider.accounts?.[0] || null;
      }

      if (walletAddress) {
        await connect(walletAddress);
        setConnectionState('connected');
        setError(null);
      } else {
        throw new Error('Unable to retrieve wallet address. Please ensure VeWorld is unlocked and try again.');
      }

    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
      setConnectionState('disconnected');
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setConnectionState('disconnected');
    setError(null);
  };

  if (isConnected && address) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-green-400 mb-2">Wallet Connected</h3>
          <p className="text-gray-300 text-sm mb-2">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <p className="text-gray-300 text-sm mb-6">Balance: {tokenBalance} B3TR</p>
          <Button onClick={disconnectWallet} variant="outline" className="border-gray-600 hover:bg-gray-700">
            Disconnect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-gray-100 mb-2">Connect VeWorld Wallet</h3>
        <p className="text-gray-400 text-sm mb-6">
          Connect your VeWorld wallet to start earning B3TR rewards for sustainable transportation
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <Button 
          onClick={connectWallet} 
          disabled={connectionState === 'connecting'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {connectionState === 'connecting' ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </div>
          ) : (
            'Connect VeWorld'
          )}
        </Button>

        <p className="text-gray-500 text-xs mt-4">
          Supports VeWorld mobile app and browser extension
        </p>
      </div>
    </div>
  );
};

export default VeChainWalletConnect;