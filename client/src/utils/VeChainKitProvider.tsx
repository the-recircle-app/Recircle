'use client';
import { VeChainKitProvider } from "@vechain/vechain-kit";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export function VeChainKitProviderWrapper({ children }: Props) {
  return (
    <VeChainKitProvider
      feeDelegation={{
        delegatorUrl: "https://sponsor-testnet.vechain.energy/by/441",
        // Enable fee delegation for better user experience
        delegateAllTransactions: true,
      }}
      loginMethods={[
        { method: "vechain", gridColumn: 4 }, // VeWorld wallet
        { method: "dappkit", gridColumn: 4 }, // Mobile wallet integration
      ]}
      dappKit={{
        allowedWallets: ["veworld", "sync2"],
        // Removed WalletConnect for simplicity - VeWorld mobile app should work directly
      }}
      darkMode={false} // Light mode to match ReCircle branding
      language="en"
      network={{
        type: "test", // Using testnet for development
      }}

    >
      {children}
    </VeChainKitProvider>
  );
}