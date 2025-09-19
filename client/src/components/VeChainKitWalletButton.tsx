"use client";
import React, { useEffect, useRef } from "react";
import { WalletButton, useWallet as useVeChainKitWallet } from "@vechain/vechain-kit";
import { useWallet } from "../context/WalletContext";
import { useLocation } from "wouter";

export default function VeChainKitWalletButton() {
  const { account: kitAccount } = useVeChainKitWallet();
  const { connect: appConnect, address: appAddress, isConnected } = useWallet();
  const [, setLocation] = useLocation();
  
  // Track previous kitAccount state to detect logout events
  const previousKitAccount = useRef<string | null>(null);

  useEffect(() => {
    // LOGIN NAVIGATION: When VeChain Kit connects, sync with our app's wallet context and navigate
    if (kitAccount && kitAccount.address && kitAccount.address !== appAddress) {
      console.log('[VECHAIN-KIT] Syncing connection to app context:', kitAccount.address);
      appConnect('vechain-kit', kitAccount.address, { skipCelebration: true }).then((success) => {
        if (success) {
          console.log('[VECHAIN-KIT] Connection successful, navigating to home');
          setLocation('/home');
        }
      });
    }
  }, [kitAccount, appAddress, appConnect, setLocation]);

  useEffect(() => {
    // LOGOUT NAVIGATION: Detect when VeChain Kit account disappears (logout event)
    const currentKitAddress = kitAccount?.address || null;
    const hadPreviousAccount = previousKitAccount.current !== null;
    const hasCurrentAccount = currentKitAddress !== null;

    // Only trigger navigation if:
    // 1. We HAD a VeChain Kit account before 
    // 2. We DON'T have a VeChain Kit account now
    // 3. App is still showing as connected (logout in progress)
    if (hadPreviousAccount && !hasCurrentAccount && isConnected) {
      console.log('[VECHAIN-KIT] Logout detected - navigating to welcome page');
      setLocation('/');
    }

    // Update previous state for next comparison
    previousKitAccount.current = currentKitAddress;
  }, [kitAccount?.address, isConnected, setLocation]);

  return <WalletButton />;
}