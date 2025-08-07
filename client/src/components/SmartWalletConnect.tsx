import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '../context/WalletContext';
import { WalletButton } from "@vechain/vechain-kit";
import { VeChainKitProviderWrapper } from '../utils/VeChainKitProvider';

interface SmartWalletConnectProps {
  onConnect?: (address: string) => void;
}

export default function SmartWalletConnect({ onConnect }: SmartWalletConnectProps) {
  const { address, connect, isConnecting } = useWallet();
  const [isMobileVeWorld, setIsMobileVeWorld] = useState(false);
  const [showMobileKit, setShowMobileKit] = useState(false);

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
            // Clear wallet state and allow reconnection
            localStorage.removeItem("walletAddress");
            localStorage.removeItem("userId");
            localStorage.removeItem("connectedWallet");
            window.location.reload();
          }}
          className="text-xs w-full"
        >
          Disconnect & Reconnect
        </Button>
      </div>
    );
  }

  // If user specifically wants to show mobile kit
  if (showMobileKit) {
    return (
      <VeChainKitProviderWrapper>
        <div className="space-y-4">
          <WalletButton />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowMobileKit(false)}
            className="text-xs"
          >
            Back to desktop mode
          </Button>
        </div>
      </VeChainKitProviderWrapper>
    );
  }

  // Default: show desktop connection for development/desktop, only show mobile for actual VeWorld mobile app
  return (
    <div className="space-y-2">
      {isMobileVeWorld ? (
        <Button 
          onClick={handleMobileConnect}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? 'Connecting...' : 'Connect Mobile Wallet'}
        </Button>
      ) : (
        <Button 
          onClick={handleDesktopConnect}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
      
      {/* Fallback option */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={isMobileVeWorld ? handleDesktopConnect : handleMobileConnect}
        className="text-xs w-full"
      >
        Try {isMobileVeWorld ? 'desktop' : 'mobile'} mode
      </Button>
    </div>
  );
}