"use client";
import React, { useState, useEffect } from "react";
import { WalletButton, useVechainModal } from "@vechain/vechain-kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * VeChainKitWalletButton - Wrapper that shows "Coming Soon" for non-VeWorld users
 */
export default function VeChainKitWalletButton() {
  const [hasConnex, setHasConnex] = useState<boolean | null>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
  useEffect(() => {
    // Check for Connex - trigger lazy getter
    const connex = typeof window !== 'undefined' ? (window as any).connex : undefined;
    setHasConnex(Boolean(connex));
    
    console.log('[WALLET-BUTTON] Connex check:', { hasConnex: Boolean(connex) });
  }, []);
  
  // Loading state
  if (hasConnex === null) {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    );
  }
  
  // No Connex - show custom button that opens "Coming Soon" modal
  if (!hasConnex) {
    return (
      <>
        <Button 
          onClick={() => setShowComingSoonModal(true)}
          className="w-full"
        >
          Login
        </Button>
        
        <Dialog open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log in or sign up</DialogTitle>
              <DialogDescription className="pt-4 text-center space-y-3">
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Social Login Coming Soon!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please download the VeWorld mobile app.
                </p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  // Has Connex - show normal VeChain Kit wallet button
  return <WalletButton />;
}