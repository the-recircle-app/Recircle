import { useState } from 'react';
import { useLocation } from 'wouter';
import StandardWalletConnect from '@/components/StandardWalletConnect';
import { useWallet } from '@/context/WalletContext';
import { useVeWorldWallet } from '@/hooks/useVeWorldWallet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';

export default function TestWalletConnectPage() {
  const [, setLocation] = useLocation();
  const { isConnected, address, disconnect, tokenBalance } = useWallet();
  const { disconnectWallet } = useVeWorldWallet();

  // Handle successful connection
  const handleConnected = () => {
    console.log('Connection success in test page');
  };
  
  // Handle complete disconnect (both contexts)
  const handleFullDisconnect = async () => {
    // First, disconnect from the hook
    disconnectWallet();
    
    // Then disconnect from the main wallet context
    await disconnect();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        VeWorld Wallet Connection Test
      </h1>
      
      {isConnected ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Wallet Connected</CardTitle>
            <CardDescription>Your VeChain wallet is successfully connected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Wallet Address:</p>
                <p className="font-mono text-sm break-all">{address}</p>
              </div>
              
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Token Balance:</p>
                <p className="font-semibold">{tokenBalance} B3TR</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <Button 
                    className="flex-1"
                    variant="outline"
                    onClick={() => setLocation('/')}
                  >
                    Go Home
                  </Button>
                  <Button 
                    className="flex-1"
                    variant="destructive"
                    onClick={disconnect}
                  >
                    WalletContext Disconnect
                  </Button>
                </div>
                <Button 
                  className="w-full"
                  variant="destructive"
                  onClick={handleFullDisconnect}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Full Disconnect (Both Contexts)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <StandardWalletConnect onConnect={handleConnected} />
      )}
    </div>
  );
}