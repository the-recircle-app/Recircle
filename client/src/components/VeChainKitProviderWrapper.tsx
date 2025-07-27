import { JsonRpcProvider } from "ethers";
import React from "react";
import { DAppKitProvider } from "@vechain/dapp-kit-react";

// — Force testnet chain override — 🚩
const provider = new JsonRpcProvider(
  import.meta.env.VITE_RPC_URL,
  {
    name:    "vechain-testnet",
    chainId: Number(import.meta.env.VITE_CHAIN_ID),
  }
);

export function VeChainKitProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DAppKitProvider
      genesis={{
        number: 0,
        id: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a'
      }}
      nodeUrl={import.meta.env.VITE_RPC_URL}
    >
      {children}
    </DAppKitProvider>
  );
}