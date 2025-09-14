"use client";
import React, { useEffect } from "react";
import { WalletButton, useWallet as useVeChainKitWallet } from "@vechain/vechain-kit";
import { useWallet } from "../context/WalletContext";
import { useLocation } from "wouter";

export default function VeChainKitWalletButton() {
  const { account: kitAccount } = useVeChainKitWallet();
  const { connect: appConnect, address: appAddress } = useWallet();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // When VeChain Kit connects, sync with our app's wallet context and navigate
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

  return <WalletButton />;
}