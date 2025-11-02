"use client";
import React, { useState, useEffect } from "react";
import { WalletButton } from "@vechain/vechain-kit";
import { AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * VeChainKitWalletButton - Wrapper for VeChain Kit's WalletButton
 * Shows "Coming Soon" message for non-VeWorld users
 */
export default function VeChainKitWalletButton() {
  const [hasConnex, setHasConnex] = useState<boolean | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  useEffect(() => {
    // Check for Connex - trigger lazy getter
    const checkConnex = () => {
      const connex = typeof window !== 'undefined' ? (window as any).connex : undefined;
      setHasConnex(Boolean(connex));
    };
    
    checkConnex();
    
    // Poll for Connex in case it loads after initial check
    const interval = setInterval(checkConnex, 500);
    setTimeout(() => clearInterval(interval), 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // If we haven't checked yet, show loading
  if (hasConnex === null) {
    return (
      <div className="text-center py-4">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }
  
  // If no Connex, show coming soon message
  if (!hasConnex) {
    return (
      <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
              Social Login Coming Soon
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ReCircle currently works exclusively through the VeWorld mobile wallet for secure blockchain transactions.
            </p>
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Social login (Google, Twitter, etc.) will be available in 2-4 weeks!
            </p>
          </div>
        </div>
        
        <div className="space-y-3 pt-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            How to get started now:
          </p>
          <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 pl-4">
            <li>1. Download VeWorld from your app store</li>
            <li>2. Create or import your VeChain wallet</li>
            <li>3. Open ReCircle in the VeWorld browser</li>
            <li>4. Start earning B3TR for sustainable rides!</li>
          </ol>
          
          <div className="flex gap-2 pt-2">
            <a 
              href="https://apps.apple.com/app/veworld/id1633719593" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="default" className="w-full bg-purple-600 hover:bg-purple-700">
                <Download className="w-4 h-4 mr-2" />
                App Store
              </Button>
            </a>
            <a 
              href="https://play.google.com/store/apps/details?id=com.vechain.veworld" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="default" className="w-full bg-purple-600 hover:bg-purple-700">
                <Download className="w-4 h-4 mr-2" />
                Play Store
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // VeWorld user - show normal wallet button
  return <WalletButton />;
}