import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface DynamicWalletButtonProps {
  onConnect?: (address: string) => void;
  className?: string;
}

export function DynamicWalletButton({ onConnect, className }: DynamicWalletButtonProps) {
  const [WalletButton, setWalletButton] = useState<any>(null);
  const [useWallet, setUseWallet] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const loadWalletComponents = async () => {
      try {
        const { WalletButton: WB, useWallet: uW } = await import('@vechain/dapp-kit-react');
        setWalletButton(() => WB);
        setUseWallet(() => uW);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load wallet components:', error);
        setIsLoaded(true);
      }
    };

    loadWalletComponents();
  }, []);

  useEffect(() => {
    if (useWallet) {
      const walletState = useWallet();
      setWallet(walletState);
      
      if (walletState?.account && onConnect) {
        onConnect(walletState.account);
      }
    }
  }, [useWallet, onConnect]);

  if (!isLoaded) {
    return (
      <Button disabled className={className}>
        <LoadingSpinner className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (!WalletButton) {
    // Fallback button for when VeChain libraries don't load
    return (
      <Button 
        className={className}
        onClick={() => {
          // Try to connect via window.vechain if available
          if (window.vechain) {
            window.vechain.request({ method: 'eth_accounts' })
              .then((accounts: string[]) => {
                if (accounts.length > 0 && onConnect) {
                  onConnect(accounts[0]);
                }
              })
              .catch(console.error);
          }
        }}
      >
        Connect Mobile Wallet
      </Button>
    );
  }

  return <WalletButton className={className} />;
}