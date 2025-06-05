import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '../context/WalletContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { vechain } from '../lib/vechain';
import ConnectionCelebration from '../components/ConnectionCelebration';

export default function TestAutoConnectPage() {
  const { connect, disconnect, address, isConnected, tokenBalance } = useWallet();
  const [connecting, setConnecting] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Try to auto-connect with VeWorld wallet type
      const success = await connect('VeWorld');
      
      if (success) {
        console.log('Auto-connected successfully!');
        setCelebrationVisible(true);
      } else {
        console.error('Auto-connect failed');
      }
    } catch (error) {
      console.error('Error during auto-connect:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleCelebrationComplete = () => {
    setCelebrationVisible(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-white text-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Wallet Auto-Connection Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Wallet Status</CardTitle>
          <CardDescription>Test the auto-connect functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold">Connection Status:</p>
              <p className={`text-lg ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            
            {isConnected && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold">Wallet Address:</p>
                  <p className="text-gray-700 font-mono break-all">{address}</p>
                  <p className="text-sm mt-1 text-gray-500">({vechain.formatAddress(address)})</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold">Token Balance:</p>
                  <p className="text-lg font-bold text-indigo-600">{tokenBalance.toFixed(2)} B3TR</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          {!isConnected ? (
            <Button 
              onClick={handleConnect} 
              disabled={connecting}
              className="w-full sm:w-auto"
            >
              {connecting ? 'Connecting...' : 'Auto-Connect Wallet'}
            </Button>
          ) : (
            <Button 
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              Disconnect Wallet
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              This page demonstrates the auto-connect functionality. When you click the 
              "Auto-Connect Wallet" button, it will:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Automatically connect to a VeWorld wallet</li>
              <li>Show the confetti celebration animation</li>
              <li>Display the connected wallet information</li>
            </ol>
            <p className="text-sm text-gray-500 mt-4">
              Note: In production, this would connect to the actual VeWorld wallet. 
              For development purposes, it connects to a mock wallet.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {celebrationVisible && (
        <ConnectionCelebration
          isVisible={celebrationVisible}
          onComplete={handleCelebrationComplete}
        />
      )}
    </div>
  );
}