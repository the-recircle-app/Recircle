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
        { method: "social", gridColumn: 2 }, // Google, Apple, Email login
        { method: "vechain", gridColumn: 2 }, // VeWorld wallet
        { method: "dappkit", gridColumn: 4 }, // Mobile wallet integration
        { method: "walletconnect", gridColumn: 4 }, // WalletConnect support
      ]}
      dappKit={{
        allowedWallets: ["veworld", "sync2"],
        walletConnect: {
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "fallback-project-id",
          metadata: {
            name: "ReCircle - Sustainable Transportation Rewards",
            description: "Earn B3TR tokens for sustainable transportation choices",
            url: "https://recirclerewards.app",
            icons: ["https://recirclerewards.app/favicon.ico"],
          },
        },
      }}
      darkMode={false} // Light mode to match ReCircle branding
      language="en"
      network={{
        type: "test", // Using testnet for development
      }}
      customCSS={`
        /* ReCircle Green Branding */
        .vechain-kit-modal {
          --primary-color: #22c55e;
          --primary-hover: #16a34a;
          --success-color: #10b981;
          --background: #f8fafc;
          --surface: #ffffff;
          --border: #e2e8f0;
          --text-primary: #1e293b;
          --text-secondary: #64748b;
        }
        
        .vechain-kit-button-primary {
          background: linear-gradient(135deg, #22c55e, #16a34a) !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        
        .vechain-kit-button-primary:hover {
          background: linear-gradient(135deg, #16a34a, #15803d) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3) !important;
        }
        
        .vechain-kit-wallet-info {
          border-radius: 12px !important;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7) !important;
          border: 1px solid #bbf7d0 !important;
        }
        
        .vechain-kit-balance {
          color: #16a34a !important;
          font-weight: 700 !important;
        }
        
        .vechain-kit-address {
          background: #f1f5f9 !important;
          border-radius: 6px !important;
          padding: 8px 12px !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
        }
      `}
    >
      {children}
    </VeChainKitProvider>
  );
}