import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '../context/WalletContext';
import VeChainKitWalletButton from './VeChainKitWalletButton';
import { useLocation } from 'wouter';

interface SmartWalletConnectProps {
  onConnect?: (address: string) => void;
}

export default function SmartWalletConnect({ onConnect }: SmartWalletConnectProps) {
  const { address, connect, disconnect, isConnecting } = useWallet();
  const [isMobileVeWorld, setIsMobileVeWorld] = useState(false);
  const [showMobileKit, setShowMobileKit] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // More precise VeWorld mobile app detection - only true mobile VeWorld app
    const userAgent = navigator.userAgent?.toLowerCase() || '';
    const isActualVeWorldMobile = userAgent.includes('veworld') && 
                                 (userAgent.includes('android') || userAgent.includes('iphone'));
    
    // For development/desktop - default to false (desktop mode)
    setIsMobileVeWorld(isActualVeWorldMobile);
    
    console.log('[SMART-WALLET] Detection results:', {
      userAgent: userAgent.substring(0, 50),
      isActualVeWorldMobile,
      windowWidth: window.innerWidth,
      finalDecision: isActualVeWorldMobile
    });
  }, []);

  const handleDesktopConnect = async () => {
    console.log('[SMART-WALLET] Using desktop wallet connection');
    try {
      // Use the standard VeChain connection method
      const connex = (window as any).connex;
      const provider = (window as any).vechain;
      
      if (!provider && !connex) {
        throw new Error('VeWorld wallet not detected. Please install VeWorld extension or use VeWorld browser.');
      }

      let walletAddress: string | null = null;

      // Try Connex authentication first (mobile/browser)
      if (connex && connex.vendor && connex.vendor.sign) {
        try {
          console.log('[SMART-WALLET] Attempting Connex authentication...');
          const cert = await connex.vendor.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'ReCircle Authentication'
            }
          }).request();
          
          if (cert && cert.annex && cert.annex.signer) {
            walletAddress = cert.annex.signer;
            console.log('[SMART-WALLET] Connex authentication success:', walletAddress);
          }
        } catch (err) {
          console.log('[SMART-WALLET] Connex authentication failed:', err);
        }
      }

      // Try modern VeWorld extension if Connex failed
      if (!walletAddress && provider && provider.request) {
        try {
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          walletAddress = accounts[0];
          console.log('[SMART-WALLET] VeWorld extension connection success:', walletAddress);
        } catch (err) {
          console.log('[SMART-WALLET] VeWorld extension failed:', err);
        }
      }

      if (!walletAddress) {
        throw new Error('Failed to connect to VeWorld wallet. Please make sure VeWorld is unlocked.');
      }

      // Connect using the wallet context with the retrieved address
      await connect('desktop', walletAddress, { skipCelebration: true });
      
      if (onConnect) {
        onConnect(walletAddress);
      }
    } catch (error) {
      console.error('[SMART-WALLET] Desktop connection failed:', error);
    }
  };

  const handleMobileConnect = () => {
    console.log('[SMART-WALLET] Switching to VeChain Kit for mobile');
    // Clear any existing connection state when switching to mobile kit
    if (address) {
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("userId");
      localStorage.removeItem("connectedWallet");
    }
    setShowMobileKit(true);
  };

  // If user is connected, show connected state with disconnect option
  if (address) {
    return (
      <div className="space-y-2">
        <Button variant="outline" disabled className="w-full">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={async () => {
            // Use proper disconnect function instead of reloading
            const success = await disconnect();
            if (success) {
              setLocation('/');
            }
          }}
          className="text-xs w-full"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // If user specifically wants to show mobile kit
  if (showMobileKit) {
    return (
      <div className="space-y-4">
        <VeChainKitWalletButton />
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowMobileKit(false)}
            className="text-xs flex-1"
          >
            Back to desktop mode
          </Button>
          {address && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={async () => {
                // Use proper disconnect function
                const success = await disconnect();
                if (success) {
                  setShowMobileKit(false);
                  setLocation('/');
                }
              }}
              className="text-xs flex-1"
            >
              Disconnect & Reset
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default: show VeChain Kit with improved social login options
  return (
    <div className="space-y-4">
      {/* Primary option: Full VeChain Kit (social login + wallets) */}
      <div className="space-y-2">
        <VeChainKitWalletButton />
        <p className="text-xs text-gray-500 text-center">
          Includes Google, email login + VeWorld, WalletConnect
        </p>
      </div>
      
      {/* Alternative: Direct wallet connection (no popups) */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or connect directly</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <VeChainKitWalletButton useDirectModal={true} />
        <p className="text-xs text-gray-500 text-center">
          Direct wallet connection (VeWorld, Sync2) - no popups
        </p>
      </div>
      
      {/* Desktop-only fallback */}
      <div className="text-center pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDesktopConnect}
          disabled={isConnecting}
          className="text-xs text-gray-400"
        >
          {isConnecting ? 'Connecting...' : 'Desktop Extension Only'}
        </Button>
      </div>
    </div>
  );
}