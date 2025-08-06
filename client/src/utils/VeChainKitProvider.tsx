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
        allowedWallets: ["veworld", "wallet-connect", "sync2"],
        walletConnectOptions: {
          projectId:
            // Using VeBetterDAO App ID as fallback for now
            import.meta.env.VITE_NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 
            import.meta.env.VITE_APP_ID || 
            "0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1",
          metadata: {
            name: "ReCircle",
            description: "Sustainable transportation rewards platform on VeChain",
            url: typeof window !== "undefined" ? window.location.origin : "",
            icons: ["https://path-to-logo.png"],
          },
        },
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