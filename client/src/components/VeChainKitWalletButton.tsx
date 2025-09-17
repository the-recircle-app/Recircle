"use client";
import React, { useEffect } from "react";
import { WalletButton, useWallet as useVeChainKitWallet, useDAppKitWalletModal } from "@vechain/vechain-kit";
import { useWallet } from "../context/WalletContext";
import { useLocation } from "wouter";

interface VeChainKitWalletButtonProps {
  useDirectModal?: boolean; // New prop to control which modal approach to use
}

export default function VeChainKitWalletButton({ useDirectModal = false }: VeChainKitWalletButtonProps) {
  const { account: kitAccount } = useVeChainKitWallet();
  const { connect: appConnect, address: appAddress } = useWallet();
  const [, setLocation] = useLocation();
  const { open: openWalletModal } = useDAppKitWalletModal();

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

  // Choose between default VeChain Kit modal (with social login) or direct wallet modal
  if (useDirectModal) {
    return (
      <button 
        onClick={openWalletModal}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
      >
        Connect Wallet (Direct)
      </button>
    );
  }

  return <WalletButton />;
}