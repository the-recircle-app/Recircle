'use client';
import { VeChainKitProvider } from "@vechain/vechain-kit";
import { ReactNode } from "react";

type Props = { 
  children: ReactNode;
};

export function VeChainKitProviderWrapper({ children }: Props) {
  return (
    <VeChainKitProvider
      feeDelegation={{
        delegatorUrl: "https://sponsor-testnet.vechain.energy/by/441",
        // Set to false if you want to delegate ONLY social login transactions
        // Social login transactions sponsorship is currently mandatory
        delegateAllTransactions: false,
      }}
      loginMethods={[
        { method: "vechain", gridColumn: 4 },
        { method: "dappkit", gridColumn: 4 },
      ]}
      dappKit={{
        allowedWallets: ["veworld", "wallet-connect", "sync2"],
        walletConnectOptions: {
          projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "demo-project-id",
          metadata: {
            name: "ReCircle",
            description: "Sustainable transportation rewards platform that incentivizes eco-friendly travel choices through B3TR token rewards.",
            url: typeof window !== "undefined" ? window.location.origin : "",
            icons: ["https://www.recirclerewards.app/favicon.ico"],
          },
        },
      }}
      darkMode={false}
      language="en"
      network={{
        type: "test", // VeChain testnet
      }}
    >
      {children}
    </VeChainKitProvider>
  );
}