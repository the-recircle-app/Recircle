'use client';
import { VeChainKitProvider } from "@vechain/vechain-kit";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export function VeChainKitProviderWrapper({ children }: Props) {
  return (
    <VeChainKitProvider
      feeDelegation={{
        delegatorUrl: "https://sponsor-testnet.vechain.energy/by/441",
        // set to false if you want to delegate ONLY social login transactions
        // social login transactions sponsorship is currently mandatory
        delegateAllTransactions: false,
      }}
      loginMethods={[
        { method: "vechain", gridColumn: 4 },
        { method: "dappkit", gridColumn: 4 },
      ]}
      dappKit={{
        allowedWallets: ["veworld", "sync2"],
        // Removed WalletConnect for simplicity - VeWorld mobile app should work directly
      }}
      darkMode={true}
      language="en"
      network={{
        type: "test",
      }}
    >
      {children}
    </VeChainKitProvider>
  );
}