"use client";
import React, { useEffect } from "react";
import { WalletButton, useWallet as useVeChainKitWallet } from "@vechain/vechain-kit";
import { useWallet } from "../context/WalletContext";

export default function VeChainKitWalletButton() {
  const { account: kitAccount, connected: kitConnected } = useVeChainKitWallet();
  const { connect: appConnect, address: appAddress } = useWallet();

  useEffect(() => {
    // When VeChain Kit connects, sync with our app's wallet context
    if (kitConnected && kitAccount && kitAccount !== appAddress) {
      console.log('[VECHAIN-KIT] Syncing connection to app context:', kitAccount);
      appConnect('vechain-kit', kitAccount, { skipCelebration: true });
    }
  }, [kitConnected, kitAccount, appAddress, appConnect]);

  return <WalletButton />;
}