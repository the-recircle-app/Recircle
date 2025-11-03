import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Wallet } from 'lucide-react';
import { useWallet, useConnectModal } from '@vechain/vechain-kit';

interface VeWorldDetectionOverlayProps {
  /** Grace period in ms before showing overlay (default: 1000ms) */
  gracePeriod?: number;
}

export function VeWorldDetectionOverlay({ gracePeriod = 1000 }: VeWorldDetectionOverlayProps) {
  const { account } = useWallet();
  const { open } = useConnectModal();
  const [showOverlay, setShowOverlay] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or connected
    if (isDismissed || account) {
      setShowOverlay(false);
      return;
    }

    // Wait for grace period before checking for VeWorld injection
    const timer = setTimeout(() => {
      // Check if VeWorld has injected Connex
      const hasConnex = typeof window !== 'undefined' && (window as any).connex;
      const userAgentMatch = /veworld|sync2|vechain/i.test(navigator.userAgent);
      const isVeWorld = hasConnex || userAgentMatch;

      console.log('[OVERLAY] Detection after grace period:', {
        hasConnex: Boolean(hasConnex),
        userAgentMatch,
        isVeWorld,
        willShowOverlay: !isVeWorld && !account
      });

      // Only show overlay if not VeWorld AND not connected
      setShowOverlay(!isVeWorld && !account);
      setHasChecked(true);
    }, gracePeriod);

    return () => clearTimeout(timer);
  }, [account, isDismissed, gracePeriod]);

  // Auto-hide if user connects
  useEffect(() => {
    if (account && showOverlay) {
      setShowOverlay(false);
    }
  }, [account, showOverlay]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowOverlay(false);
  };

  const handleConnect = () => {
    // Trigger VeChain Kit connection modal
    // On VeWorld mobile, this will show WalletConnect which deep-links to VeWorld
    open();
  };

  // Don't render anything during grace period or if dismissed/connected
  if (!hasChecked || !showOverlay || isDismissed || account) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleDismiss}
      />
      
      {/* Overlay Card */}
      <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-4 relative">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center pt-2">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              For the best experience with ReCircle, connect your VeWorld wallet to earn and manage B3TR tokens.
            </p>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </button>

          {/* Or Download VeWorld */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
              Don't have VeWorld yet?
            </p>
            <div className="flex gap-2">
              <a
                href="https://apps.apple.com/app/veworld/id1633545210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>App Store</span>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.vechain.wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black text-white rounded-lg px-3 py-2 flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Play Store</span>
              </a>
            </div>
          </div>

          {/* Dismiss Link */}
          <button
            onClick={handleDismiss}
            className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Continue without connecting
          </button>
        </div>
      </div>
    </>
  );
}
