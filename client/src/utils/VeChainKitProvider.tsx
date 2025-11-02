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
  
  console.log('[PRIVY-DEBUG] Configuration check:', {
    appId: privyAppId ? 'present' : 'missing',
    clientId: privyClientId ? 'present' : 'missing',
    appIdPrefix: privyAppId?.substring(0, 4),
    readyForSocialLogin: !!(privyAppId && privyClientId)
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
      loginMethods={
        (privyAppId && privyClientId)
          ? [
              { method: "vechain", gridColumn: 4 }, // VeChain ecosystem login - shows all Privy social options + VeWorld mobile
            ]
          : [
              { method: "vechain", gridColumn: 4 }, // VeChain ecosystem login
            ]
      }
      dappKit={{
        allowedWallets: ["veworld", "sync2"],
        // VeWorld mobile app and Sync2 wallet support
      }}
      // Privy DISABLED for phased launch - VeWorld only
      // Social login coming in 2-4 weeks
      privy={undefined}
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