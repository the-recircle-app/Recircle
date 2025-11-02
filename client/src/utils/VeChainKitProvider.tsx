'use client';
import { VeChainKitProvider } from "@vechain/vechain-kit";
import { ReactNode } from "react";
import { getVeChainConfig } from "../../../shared/vechain-config";

type Props = { children: ReactNode };

export function VeChainKitProviderWrapper({ children }: Props) {
  // Get network configuration and Privy credentials
  const config = getVeChainConfig();
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
  const privyClientId = import.meta.env.VITE_PRIVY_CLIENT_ID;
  const socialLoginEnabled = import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === 'true';
  
  // Only enable Privy if: credentials exist AND feature flag is enabled
  const enablePrivy = !!(privyAppId && privyClientId && socialLoginEnabled);
  
  console.log('[PRIVY-DEBUG] Configuration check:', {
    appId: privyAppId ? 'present' : 'missing',
    clientId: privyClientId ? 'present' : 'missing',
    featureFlagEnabled: socialLoginEnabled,
    privyEnabled: enablePrivy,
    note: enablePrivy ? 'Social login ENABLED' : 'VeWorld-only mode'
  });


  console.log('[VIP-191] Fee Delegation Configuration:', {
    delegatorUrl: config.sponsorUrl,
    mode: 'AUTO - Social login users only',
    sponsor: 'VeChain Energy',
    note: 'VeWorld users pay their own gas; Privy users get sponsored'
  });

  return (
    <VeChainKitProvider
      feeDelegation={{
        delegatorUrl: config.sponsorUrl,
        delegateAllTransactions: false,
      }}
      loginMethods={[
        { method: "vechain", gridColumn: 4 },  // VeChain cross-app wallets
        { method: "dappkit", gridColumn: 4 },  // Self-custody wallets (VeWorld, Sync2)
        // Social login methods (email, passkey, google, more) excluded - VeWorld-only mode
      ]}
      dappKit={{
        allowedWallets: ["veworld", "sync2"],
        // VeWorld mobile app and Sync2 wallet support
      }}
      // Privy configuration - controlled by VITE_ENABLE_SOCIAL_LOGIN feature flag
      privy={enablePrivy ? {
        appId: privyAppId,
        clientId: privyClientId,
        loginMethods: [
          'email', 
          'google', 
          'apple', 
          'github', 
          'twitter',
          'discord',
          'instagram',
          'linkedin'
        ],
        appearance: {
          accentColor: '#8B5CF6',
          loginMessage: 'Sign up or log in to start earning B3TR tokens for sustainable transportation',
          logo: '/mascot.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      } : undefined}
      darkMode={false} // Light mode to match ReCircle branding
      language="en"
      network={{
        type: config.network === 'mainnet' ? "main" : "test",
      }}
    >
      {children}
    </VeChainKitProvider>
  );
}