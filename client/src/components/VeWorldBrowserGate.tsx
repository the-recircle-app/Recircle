import { useState, useEffect, ReactNode } from 'react';
import { Download, Smartphone } from 'lucide-react';

interface VeWorldBrowserGateProps {
  children: ReactNode;
  /** How long to wait for VeWorld injection before showing download page (ms) */
  detectionTimeout?: number;
  /** How often to check for VeWorld injection (ms) */
  pollInterval?: number;
}

export function VeWorldBrowserGate({ 
  children,
  detectionTimeout = 3000, // Wait 3 seconds for VeWorld to inject
  pollInterval = 100 // Check every 100ms
}: VeWorldBrowserGateProps) {
  const [isVeWorldBrowser, setIsVeWorldBrowser] = useState<boolean | null>(null);
  const [detectionReason, setDetectionReason] = useState<string>('');

  // Debug logging
  console.log('[VEWORLD-GATE] Component render - isVeWorldBrowser:', isVeWorldBrowser, 'reason:', detectionReason);

  useEffect(() => {
    console.log('[VEWORLD-GATE] useEffect starting detection...');
    
    // STEP 1: Check if mobile device (REQUIRED for camera features)
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (!isMobile) {
      console.log('[VEWORLD-GATE] Desktop browser detected - ReCircle is mobile-only (requires camera)', {
        userAgent: navigator.userAgent
      });
      setDetectionReason('Desktop browser - ReCircle requires mobile device for camera features');
      setIsVeWorldBrowser(false);
      return;
    }
    
    console.log('[VEWORLD-GATE] Mobile device detected, checking for VeWorld...');
    
    let pollCount = 0;
    const maxPolls = Math.floor(detectionTimeout / pollInterval);
    
    // STEP 2: Check for VeWorld-specific user agents as a fast path
    const isVeWorldUserAgent = userAgent.includes('veworld') || userAgent.includes('vechain');
    
    if (isVeWorldUserAgent) {
      console.log('[VEWORLD-GATE] VeWorld user-agent detected, allowing access immediately');
      setDetectionReason('VeWorld mobile browser detected');
      setIsVeWorldBrowser(true);
      return;
    }

    const checkVeWorldBrowser = () => {
      const hasVeChain = typeof window !== 'undefined' && 'vechain' in window;
      const hasConnex = typeof window !== 'undefined' && 'connex' in window;
      
      if (hasVeChain || hasConnex) {
        console.log('[VEWORLD-GATE] VeWorld injection detected:', {
          hasVeChain,
          hasConnex,
          pollCount,
          timeElapsed: `${pollCount * pollInterval}ms`
        });
        setDetectionReason(`VeWorld injection detected after ${pollCount * pollInterval}ms`);
        setIsVeWorldBrowser(true);
        return true;
      }
      
      return false;
    };

    // Check immediately
    if (checkVeWorldBrowser()) {
      return;
    }

    // Poll for VeWorld injection
    const pollInterval_id = setInterval(() => {
      pollCount++;
      
      if (checkVeWorldBrowser()) {
        clearInterval(pollInterval_id);
        return;
      }
      
      if (pollCount >= maxPolls) {
        console.log('[VEWORLD-GATE] VeWorld not detected after timeout:', {
          timeout: detectionTimeout,
          polls: pollCount,
          userAgent: navigator.userAgent
        });
        setDetectionReason(`No VeWorld injection after ${detectionTimeout}ms`);
        console.log('[VEWORLD-GATE] Setting isVeWorldBrowser to FALSE');
        setIsVeWorldBrowser(false);
        clearInterval(pollInterval_id);
      }
    }, pollInterval);

    return () => clearInterval(pollInterval_id);
  }, [detectionTimeout, pollInterval]);

  if (isVeWorldBrowser === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src="/mascot.png" alt="ReCircle" className="w-full h-full object-contain animate-pulse" />
          </div>
          <p className="text-sm text-gray-500">Checking for VeWorld...</p>
        </div>
      </div>
    );
  }

  if (!isVeWorldBrowser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-32 h-32 mx-auto mb-8">
            <img src="/mascot.png" alt="ReCircle" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Download VeWorld
          </h1>
          
          <p className="text-gray-600 mb-8">
            ReCircle is a mobile-only app that requires VeWorld wallet to upload receipts and earn B3TR tokens for sustainable transportation
          </p>

          <div className="space-y-4 mb-8">
            <a
              href="https://apps.apple.com/us/app/veworld/id6446854569"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download on the App Store
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=org.vechain.veworld.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download on Google Play
            </a>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Already have VeWorld?</p>
                <p className="text-blue-700">
                  Download the VeWorld app on your mobile device to get started with ReCircle.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-8">
            ReCircle - Sustainable Transportation Rewards
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
