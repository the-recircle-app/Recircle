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
      await connect('veworld', undefined, { skipCelebration: true });
      if (address && onConnect) {
        onConnect(address);
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