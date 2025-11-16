"use client";
import React, { useEffect, useRef } from "react";
import { useWallet as useVeChainKitWallet } from "@vechain/vechain-kit";
import { useWallet } from "../context/WalletContext";
import { useLocation } from "wouter";

/**
 * VeChainKitAuthBridge - Top-level authentication router
 * 
 * Centralizes all VeChain Kit login/logout detection and navigation.
 * Mounted once at app root to eliminate component-specific routing races.
 */
export default function VeChainKitAuthBridge() {
  // 🔥 CRITICAL FIX: Skip VeChainKitAuthBridge ENTIRELY for VeWorld users
  // VeWorld users have window.connex and should NEVER have their address overridden
  // This check MUST happen BEFORE calling useVeChainKitWallet() to prevent duplicate hook instances
  if (typeof window !== 'undefined' && (window as any).connex) {
    console.log('[AUTH-BRIDGE] Connex detected - this is a VeWorld user, AuthBridge disabled');
    return null;
  }
  
  const { account: kitAccount } = useVeChainKitWallet();
  const { isConnected, disconnect: appDisconnect } = useWallet();
  const [location, setLocation] = useLocation();
  
  // Track previous kit account state
  const previousKitAddress = useRef<string | null>(null);
  const wasAppConnected = useRef<boolean>(false);

  useEffect(() => {
    const currentKitAddress = kitAccount?.address || null;
    const hadPreviousKit = previousKitAddress.current !== null;
    const hasCurrentKit = currentKitAddress !== null;
    const wasConnected = wasAppConnected.current;

    // LOGOUT DETECTION: Kit account disappeared
    if (hadPreviousKit && !hasCurrentKit && isConnected) {
      console.log('[AUTH-BRIDGE] Logout detected - cleaning up app state and redirecting');
      
      // First disconnect app state, then navigate
      appDisconnect().then(() => {
        if (location !== '/') {
          console.log('[AUTH-BRIDGE] Navigating to welcome page after logout');
          setLocation('/');
        }
      });
    }

    // LOGIN NAVIGATION: App became connected (rising edge)
    if (!wasConnected && isConnected && location === '/') {
      console.log('[AUTH-BRIDGE] App connected - navigating to home');
      setLocation('/home');
    }

    // Update tracking refs
    previousKitAddress.current = currentKitAddress;
    wasAppConnected.current = isConnected;
  }, [kitAccount?.address, isConnected, location, appDisconnect, setLocation]);

  // This component only provides routing logic, no UI
  return null;
}