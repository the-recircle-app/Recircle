"use client";
import React from "react";
import { WalletButton } from "@vechain/vechain-kit";

/**
 * VeChainKitWalletButton - Clean wrapper for VeChain Kit's WalletButton
 * 
 * Navigation logic removed and centralized in VeChainKitAuthBridge.
 * This component now only renders the UI button.
 */
export default function VeChainKitWalletButton() {
  return <WalletButton />;
}