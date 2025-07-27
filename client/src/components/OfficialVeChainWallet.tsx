'use client';

import { WalletButton, useWallet, useConnectModal, useAccountModal } from '@vechain/vechain-kit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WalletDisplayProps {
  showBalance?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function OfficialVeChainWallet({ showBalance = true, variant = 'default' }: WalletDisplayProps) {
  const { connection, account, connectedWallet } = useWallet();
  
  const {
    open: openConnectModal,
    close: closeConnectModal,
    isOpen: isConnectModalOpen,
  } = useConnectModal();

  const {
    open: openAccountModal,
    close: closeAccountModal,
    isOpen: isAccountModalOpen,
  } = useAccountModal();

  // Compact variant - just the button
  if (variant === 'compact') {
    return <WalletButton />;
  }

  // Detailed variant - custom implementation with full details
  if (variant === 'detailed') {
    if (!connection.isConnected) {
      return (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Connect your VeChain wallet to start earning B3TR rewards for sustainable transportation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openConnectModal} className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Wallet Connected
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {connectedWallet?.address ? 'VeWorld' : 'Connected'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {account?.address && `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openAccountModal} variant="outline" className="w-full">
            View Account Details
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default variant - standard wallet button
  return (
    <div className="flex flex-col items-center gap-4">
      <WalletButton />
      
      {connection.isConnected && account && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </p>
          {connectedWallet && (
            <Badge variant="secondary" className="mt-1">
              VeWorld
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// Custom hook for wallet connection state
export function useVeChainWallet() {
  const { connection, account, connectedWallet, disconnect } = useWallet();
  
  return {
    isConnected: connection.isConnected,
    address: account?.address,
    walletName: connectedWallet?.address ? 'VeWorld' : undefined,
    account,
    connectedWallet,
    disconnect,
  };
}

// Simple connection status component
export function WalletConnectionStatus() {
  const { isConnected, address, walletName } = useVeChainWallet();

  if (!isConnected) {
    return (
      <Badge variant="outline" className="text-gray-500">
        Not Connected
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        {walletName || 'Connected'}
      </Badge>
      {address && (
        <span className="text-xs text-gray-600">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      )}
    </div>
  );
}