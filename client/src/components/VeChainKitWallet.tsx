import { useState, useEffect } from 'react';

export function VeChainKitWallet() {
  const [walletHooks, setWalletHooks] = useState<any>(null);
  const [WalletButton, setWalletButton] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadWalletComponents() {
      try {
        // Check if we're in development mode
        const isDev = import.meta.env.DEV;
        
        if (isDev) {
          // In development, load a functional wallet component
          const DAppKitComponent = (await import('./DAppKitWalletConnect')).default;
          if (mounted) {
            setWalletButton(() => DAppKitComponent);
            setLoading(false);
          }
          return;
        }

        // Load VeChain components dynamically
        const [dappKitReact, veChainKit] = await Promise.all([
          new Function('return import("@vechain/dapp-kit-react")')().catch(() => null),
          new Function('return import("@vechain/vechain-kit")')().catch(() => null)
        ]);
        
        if (mounted) {
          setWalletHooks({
            useWallet: dappKitReact.useWallet,
            useConnectModal: dappKitReact.useConnectModal
          });
          setWalletButton(() => veChainKit.WalletButton);
          setLoading(false);
        }
      } catch (err) {
        console.warn('[VeChain] Wallet components unavailable:', err);
        if (mounted) {
          setError('Wallet unavailable');
          setLoading(false);
        }
      }
    }

    loadWalletComponents();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
        <span>Loading wallet...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Wallet connection unavailable
      </div>
    );
  }

  // In development mode, use the DAppKitWalletConnect component
  if (import.meta.env.DEV && WalletButton) {
    return <WalletButton />;
  }

  // In production, use VeChain Kit hooks
  if (walletHooks && WalletButton) {
    const { useWallet, useConnectModal } = walletHooks;
    const { account } = useWallet();
    const { open } = useConnectModal();

    if (account) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      );
    }

    return <WalletButton onConnect={open} />;
  }

  return (
    <div className="text-gray-500 text-sm">
      Loading wallet connection...
    </div>
  );
}