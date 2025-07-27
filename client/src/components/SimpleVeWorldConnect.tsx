import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Wallet, ExternalLink } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

declare global {
  interface Window {
    vechain?: any;
    connex?: any;
  }
}

export default function SimpleVeWorldConnect() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connect } = useWallet();

  useEffect(() => {
    // Check environment and VeChain wallet availability
    const checkEnvironment = () => {
      const isHTTPS = window.location.protocol === 'https:';
      const hasVeChain = typeof window.vechain !== 'undefined';
      
      if (!isHTTPS) {
        setStatus('error');
        setError('HTTPS required for VeWorld wallet connection');
        return;
      }
      
      if (!hasVeChain) {
        setStatus('error');
        setError('VeWorld wallet not detected - please use VeWorld in-app browser');
        return;
      }
      
      setStatus('ready');
      setError(null);
      
      // Check for saved wallet
      const saved = localStorage.getItem('walletAddress');
      if (saved) {
        setWalletAddress(saved);
      }
    };

    checkEnvironment();
    
    // Retry VeChain detection for up to 10 seconds
    const interval = setInterval(checkEnvironment, 1000);
    setTimeout(() => clearInterval(interval), 10000);
    
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    if (status !== 'ready') return;
    
    setIsConnecting(true);
    setError(null);

    try {
      const vechain = window.vechain;
      console.log('=== VeWorld Debug v2 ===');
      console.log('VeWorld complete object:', vechain);
      console.log('VeWorld keys:', Object.keys(vechain));
      alert(`VeWorld Debug: Found ${Object.keys(vechain).length} properties: ${Object.keys(vechain).join(', ')}`);
      
      // VeWorld appears to be Connex-based, try direct access patterns
      let walletAddr: string | null = null;
      
      // Pattern 1: Check if it's Connex with thor
      if (vechain.thor && vechain.thor.account) {
        console.log('Trying Connex thor.account pattern...');
        try {
          const account = await vechain.thor.account.getSelected();
          if (account && account.address) {
            walletAddr = account.address;
            console.log('Connex account found:', walletAddr);
          }
        } catch (err) {
          console.log('Connex account error:', err);
        }
      }
      
      // Pattern 2: Direct property access
      if (!walletAddr && vechain.selectedAddress) {
        walletAddr = vechain.selectedAddress;
        console.log('Direct selectedAddress found:', walletAddr);
      }
      
      // Pattern 3: Check accounts array
      if (!walletAddr && vechain.accounts) {
        const accounts = Array.isArray(vechain.accounts) ? vechain.accounts : [vechain.accounts];
        if (accounts.length > 0) {
          walletAddr = accounts[0];
          console.log('Accounts array found:', walletAddr);
        }
      }
      
      // Pattern 4: Try enable if available (might prompt user)
      if (!walletAddr && typeof vechain.enable === 'function') {
        console.log('Trying enable method...');
        try {
          await vechain.enable();
          if (vechain.selectedAddress) {
            walletAddr = vechain.selectedAddress;
          }
        } catch (err) {
          console.log('Enable method error:', err);
        }
      }
      
      // Pattern 5: If still no wallet, show what's available for debugging
      if (!walletAddr) {
        console.log('No wallet found, showing available properties:');
        Object.keys(vechain).forEach(key => {
          console.log(`vechain.${key}:`, typeof vechain[key], vechain[key]);
        });
        setError('Unable to access wallet address. Please ensure VeWorld wallet is unlocked and connected.');
        return;
      }

      // Success - we have a wallet address
      console.log('VeWorld wallet connected:', walletAddr);
      setWalletAddress(walletAddr);
      localStorage.setItem('walletAddress', walletAddr);
      
      // Connect to main wallet context
      await connect("vechain", walletAddr, { skipCelebration: true });
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(`Connection failed: ${err.message || err}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
  };

  if (status === 'checking') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Checking VeWorld Wallet</CardTitle>
          <CardDescription>Detecting wallet environment...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>VeWorld Wallet Required</CardTitle>
          <CardDescription>Wallet connection not available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="space-y-2 text-sm">
            <p><strong>To connect your wallet:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Download the VeWorld app</li>
              <li>Open this URL in VeWorld's in-app browser</li>
              <li>Ensure you're on VeChain testnet</li>
              <li>Try connecting again</li>
            </ol>
          </div>
          
          <Button asChild className="w-full">
            <a href="https://www.veworld.net/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Download VeWorld
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>VeWorld Wallet</CardTitle>
        <CardDescription>
          {walletAddress ? 
            `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` :
            'Ready to connect to VeChain testnet'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">VeWorld Detected</span>
        </div>

        {!walletAddress ? (
          <Button 
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>Connecting...</>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Wallet Address:</p>
              <p className="font-mono text-sm break-all">{walletAddress}</p>
            </div>
            <Button onClick={disconnect} variant="outline" className="w-full">
              Disconnect
            </Button>
          </div>
        )}

        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}