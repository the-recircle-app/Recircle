'use client';
import { VeChainKitProvider } from "@vechain/vechain-kit";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export function VeChainKitProviderWrapper({ children }: Props) {
  // Get Privy credentials from environment variables
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
  const privyClientId = import.meta.env.VITE_PRIVY_CLIENT_ID;
  
  console.log('[PRIVY-DEBUG] Configuration check:', {
    appId: privyAppId ? 'present' : 'missing',
    clientId: privyClientId ? 'present' : 'missing',
    appIdPrefix: privyAppId?.substring(0, 4),
    readyForSocialLogin: !!(privyAppId && privyClientId)
  });


  return (
    <VeChainKitProvider
      feeDelegation={{
        delegatorUrl: "https://sponsor-testnet.vechain.energy/by/441",
        // Enable fee delegation for better user experience
        delegateAllTransactions: true,
      }}
      loginMethods={
        (privyAppId && privyClientId)
          ? [
              { method: "dappkit", gridColumn: 4 }, // Native wallets (VeWorld extension) - required for "Use VeWorld Extension Only"
              { method: "vechain", gridColumn: 4 }, // VeChain ecosystem login - shows all Privy social options
            ]
          : [
              { method: "dappkit", gridColumn: 4 }, // Native wallets (VeWorld extension) 
              { method: "vechain", gridColumn: 4 }, // VeChain ecosystem login
            ]
      }
      dappKit={{
        allowedWallets: ["veworld", "sync2"],
        // VeWorld mobile app and Sync2 wallet support
      }}
      // Privy configuration for social login (requires both App ID and Client ID)
      privy={(privyAppId && privyClientId) ? {
        appId: privyAppId,
        clientId: privyClientId, // Required for mobile support
        loginMethods: [
          'email', 
          'google', 
          'apple', 
          'github', 
          'twitter',  // X (formerly Twitter)
          'discord',
          'instagram',
          'linkedin'
        ], // 🔥 EXPANDED: All available social login options
        appearance: {
          accentColor: '#8B5CF6', // Purple to match ReCircle branding
          loginMessage: 'Sign up or log in to start earning B3TR tokens for sustainable transportation',
          logo: '/mascot.png', // Use ReCircle mascot
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets', // Create embedded wallets for social users
        },
        // All social login methods configured in loginMethods above
      } : undefined}
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