'use client';
import { VeChainKitProvider } from "@vechain/vechain-kit";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export function VeChainKitProviderWrapper({ children }: Props) {
  // Get Privy credentials from environment variables
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
  const privyClientId = import.meta.env.VITE_PRIVY_CLIENT_ID;

  console.log('[VECHAIN-KIT] Privy credentials check:', {
    hasAppId: !!privyAppId,
    hasClientId: !!privyClientId
  });

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
        // NOTE: Social login temporarily disabled - need correct Privy OAuth App Client ID
        // { method: "email", gridColumn: 2 }, // Social login via Privy
        // { method: "google", gridColumn: 4 }, // Social login via Privy
      ]}
      dappKit={{
        allowedWallets: ["veworld", "sync2"],
        // VeWorld mobile app and Sync2 wallet support
      }}
      // Privy configuration temporarily disabled - need correct OAuth App Client ID
      // privy={{
      //   appId: privyAppId,
      //   clientId: privyClientId,
      //   loginMethods: ['email', 'google'],
      //   appearance: {
      //     accentColor: '#8B5CF6', // Purple to match ReCircle branding
      //     loginMessage: 'Connect with social media or email to start earning B3TR tokens',
      //     logo: '/mascot.png', // Use ReCircle mascot
      //   },
      //   embeddedWallets: {
      //     createOnLogin: 'users-without-wallets', // Create embedded wallets for social users
      //   },
      // }}
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