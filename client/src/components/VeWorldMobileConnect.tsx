import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useWallet } from "../context/WalletContext";

/**
 * VeWorld Mobile Browser Connection Component
 * Specifically designed for VeWorld mobile browser environment
 */
const VeWorldMobileConnect: React.FC = () => {
  const { connect, isConnected, address, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVeWorldMobile, setIsVeWorldMobile] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Detect VeWorld mobile browser
    const userAgent = navigator.userAgent;
    const isMobile = userAgent.includes('VeWorld') || userAgent.includes('veworld');
    setIsVeWorldMobile(isMobile);
    
    if (isMobile) {
      console.log('[VEWORLD-MOBILE] VeWorld mobile browser detected');
    }
  }, []);

  const connectVeWorldMobile = async () => {
    if (!isVeWorldMobile) {
      setConnectionError('Please use VeWorld mobile browser to connect');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Wait a moment for VeWorld providers to be available
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const connex = (window as any).connex;
      const vechain = (window as any).vechain;
      
      let walletAddress = null;

      // Method 1: Try Connex vendor API (most common in VeWorld mobile)
      if (connex && connex.vendor && connex.vendor.sign) {
        try {
          console.log('[VEWORLD-MOBILE] Attempting Connex vendor connection');
          
          const certResult = await connex.vendor.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Connect to ReCircle - Sustainable Transportation Rewards'
            }
          }).request();
          
          if (certResult && certResult.annex && certResult.annex.signer) {
            walletAddress = certResult.annex.signer;
            console.log('[VEWORLD-MOBILE] Connected via Connex vendor:', walletAddress);
          }
        } catch (error) {
          console.log('[VEWORLD-MOBILE] Connex vendor failed:', error);
        }
      }

      // Method 2: Try VeChain direct request (alternative mobile method)
      if (!walletAddress && vechain && vechain.request) {
        try {
          console.log('[VEWORLD-MOBILE] Attempting VeChain direct request');
          
          const accounts = await vechain.request({
            method: 'eth_requestAccounts'
          });
          
          if (accounts && accounts.length > 0) {
            walletAddress = accounts[0];
            console.log('[VEWORLD-MOBILE] Connected via VeChain request:', walletAddress);
          }
        } catch (error) {
          console.log('[VEWORLD-MOBILE] VeChain request failed:', error);
        }
      }

      // Method 3: Try legacy VeChain sign method
      if (!walletAddress && vechain && vechain.sign) {
        try {
          console.log('[VEWORLD-MOBILE] Attempting VeChain sign method');
          
          const signResult = await vechain.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Connect to ReCircle'
            }
          });
          
          if (signResult && signResult.annex && signResult.annex.signer) {
            walletAddress = signResult.annex.signer;
            console.log('[VEWORLD-MOBILE] Connected via VeChain sign:', walletAddress);
          }
        } catch (error) {
          console.log('[VEWORLD-MOBILE] VeChain sign failed:', error);
        }
      }

      if (walletAddress) {
        // Connect to the app with the wallet address
        const success = await connect('VeWorld', walletAddress, { skipCelebration: false });
        
        if (!success) {
          throw new Error('Failed to register wallet with app');
        }
        
        console.log('[VEWORLD-MOBILE] Successfully connected:', walletAddress);
      } else {
        throw new Error('No connection method worked. VeWorld providers may not be available.');
      }

    } catch (error) {
      console.error('[VEWORLD-MOBILE] Connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setConnectionError(`VeWorld connection failed: ${errorMessage}`);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isVeWorldMobile) {
    return (
      <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="text-amber-800 font-medium mb-2">VeWorld Mobile Required</div>
        <div className="text-amber-700 text-sm">
          Please open this app in the VeWorld mobile browser to connect your wallet.
        </div>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="text-green-800 font-medium mb-2">Wallet Connected</div>
        <div className="text-green-700 text-sm mb-3">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button 
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      <div className="mb-4">
        <div className="text-lg font-semibold mb-2">Connect VeWorld Wallet</div>
        <div className="text-gray-600 text-sm">
          VeWorld mobile browser detected. Ready to connect.
        </div>
      </div>

      {connectionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 text-sm">{connectionError}</div>
        </div>
      )}

      <Button 
        onClick={connectVeWorldMobile}
        disabled={isConnecting}
        className="w-full bg-blue-600 hover:bg-blue-700 py-3"
      >
        {isConnecting ? 'Connecting to VeWorld...' : 'Connect VeWorld Wallet'}
      </Button>

      <div className="mt-3 text-xs text-gray-500">
        Make sure you have a wallet selected in VeWorld
      </div>
    </div>
  );
};

export default VeWorldMobileConnect;