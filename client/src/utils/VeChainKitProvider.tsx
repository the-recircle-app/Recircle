'use client';
import { VeChainKitProvider } from "@vechain/vechain-kit";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export function VeChainKitProviderWrapper({ children }: Props) {
  // Get Privy credentials from environment variables
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
  const privyClientId = import.meta.env.VITE_PRIVY_CLIENT_ID;
  
  // Current credentials are not from Privy (cmeh... / ht53rpd... vs app_... / client_...)


  return (
    <VeChainKitProvider
      feeDelegation={{
        delegatorUrl: "https://sponsor-testnet.vechain.energy/by/441",
        // Enable fee delegation for better user experience
        delegateAllTransactions: true,
      }}
      loginMethods={[
        { method: "vechain", gridColumn: 4 }, // VeChain ecosystem login
        { method: "dappkit", gridColumn: 4 }, // Native wallets (VeWorld, Sync2)
        // Social login disabled - need actual Privy credentials (app_... and client_...)
      ]}
      dappKit={{
        allowedWallets: ["veworld", "sync2"],
        // VeWorld mobile app and Sync2 wallet support
      }}
      // Privy configuration disabled - current credentials are not from Privy
      // Need: App ID starting with "app_..." and Client ID starting with "client_..."
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