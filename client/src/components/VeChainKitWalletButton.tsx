"use client";
import React, { useEffect } from "react";
import { WalletButton, useWallet as useVeChainKitWallet } from "@vechain/vechain-kit";
import { useWallet } from "../context/WalletContext";

export default function VeChainKitWalletButton() {
  const { account: kitAccount } = useVeChainKitWallet();
  const { connect: appConnect, address: appAddress } = useWallet();

  useEffect(() => {
    // When VeChain Kit connects, sync with our app's wallet context
    if (kitAccount && kitAccount.address && kitAccount.address !== appAddress) {
      console.log('[VECHAIN-KIT] Syncing connection to app context:', kitAccount.address);
      appConnect('vechain-kit', kitAccount.address, { skipCelebration: true });
    }
  }, [kitAccount, appAddress, appConnect]);

  return <WalletButton />;
}