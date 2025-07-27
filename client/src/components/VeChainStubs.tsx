
// Build-time stubs for VeChain components
export function VeChainKitProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DAppKitProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function WalletButton({ className }: { className?: string }) {
  return <button className={className}>Connect Wallet</button>;
}

export function useWallet() {
  return { account: null, isConnected: false };
}

export function useWalletModal() {
  return { open: () => {}, close: () => {} };
}

export function useConnectModal() {
  return { open: () => {} };
}
