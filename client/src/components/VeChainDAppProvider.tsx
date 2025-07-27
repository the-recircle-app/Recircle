import { DAppKitProvider } from "@vechain/dapp-kit-react";
import { type ReactNode } from "react";

export function VeChainDAppProvider({ children }: { children: ReactNode }) {
  console.log("[VECHAIN-PROVIDER] 🚀 INITIALIZING VeChain DApp Kit Provider v1.0.12");
  console.log("[VECHAIN-PROVIDER] 🔍 Component loaded and executing...");
  
  // Check if we should use solo node for development testing
  const isDevelopment = import.meta.env.MODE === 'development';
  const soloNodeUrl = import.meta.env.VITE_SOLO_NETWORK_URL || 'http://localhost:8669';
  const soloEnabled = import.meta.env.VITE_SOLO_MODE_ENABLED === 'true';
  
  // Use solo node if available, otherwise fall back to testnet
  const nodeUrl = isDevelopment && soloEnabled ? soloNodeUrl : "https://testnet.vechain.org/";
  
  console.log(`[VECHAIN-PROVIDER] Solo Mode Enabled: ${soloEnabled}`);
  console.log(`[VECHAIN-PROVIDER] Development Mode: ${isDevelopment}`);
  console.log(`[VECHAIN-PROVIDER] Using node: ${nodeUrl}`);
  console.log(`[VECHAIN-PROVIDER] Environment variables:`, {
    VITE_SOLO_MODE_ENABLED: import.meta.env.VITE_SOLO_MODE_ENABLED,
    VITE_SOLO_NETWORK_URL: import.meta.env.VITE_SOLO_NETWORK_URL,
    MODE: import.meta.env.MODE
  });
  console.log(`[VECHAIN-PROVIDER] 🎯 PIERRE MODE: Frontend configured for solo node at ${nodeUrl}`);
  
  return (
    <DAppKitProvider
      node={nodeUrl}
      usePersistence={true}
      requireCertificate={false}
      logLevel="DEBUG"
      feeDelegation={{
        delegatorUrl: isDevelopment && soloEnabled ? '' : 'https://sponsor-testnet.vechain.org/by/90',
        delegateAllTransactions: !soloEnabled,
      }}
      dappKit={{
        allowedWallets: ['veworld', 'wallet-connect'],
      }}
    >
      {children}
    </DAppKitProvider>
  );
}