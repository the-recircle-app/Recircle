import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Wallet } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export default function SimpleVeWorldWallet() {
  const [isReady, setIsReady] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { connect } = useWallet();

  useEffect(() => {
    const checkWallet = () => {
      const hasVeChain = typeof (window as any).vechain !== 'undefined';
      const hasConnex = typeof (window as any).connex !== 'undefined';
      
      if (hasVeChain || hasConnex) {
        setIsReady(true);
        setError(null);
        
        let info = [];
        if (hasVeChain) {
          const keys = Object.keys((window as any).vechain || {});
          info.push(`VeChain API (${keys.length} props)`);
        }
        if (hasConnex) {
          const keys = Object.keys((window as any).connex || {});
          info.push(`Connex API (${keys.length} props)`);
        }
        setDebugInfo(info.join(' + '));
      } else {
        setIsReady(false);
        setError('VeWorld not detected - please use VeWorld in-app browser');
      }
    };

    checkWallet();
    const interval = setInterval(checkWallet, 2000);
    setTimeout(() => clearInterval(interval), 10000);
    
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    if (!isReady) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      let address: string | null = null;
      
      console.log('=== VeWorld Connection Attempt ===');
      
      // Try VeChain object first
      const vechain = (window as any).vechain;
      if (vechain) {
        console.log('VeChain object found:', Object.keys(vechain));
        
        // Look for address in various properties
        if (vechain.address && typeof vechain.address === 'string') {
          address = vechain.address;
          console.log('Found address in vechain.address:', address);
        } else if (vechain.account && typeof vechain.account === 'string') {
          address = vechain.account;
          console.log('Found address in vechain.account:', address);
        } else if (vechain.selectedAddress && typeof vechain.selectedAddress === 'string') {
          address = vechain.selectedAddress;
          console.log('Found address in vechain.selectedAddress:', address);
        }
      }
      
      // Try Connex if VeChain didn't work
      if (!address) {
        const connex = (window as any).connex;
        if (connex) {
          console.log('Connex object found:', Object.keys(connex));
          
          // Try vendor sign for authentication
          if (connex.vendor && connex.vendor.sign) {
            try {
              console.log('Attempting Connex vendor sign...');
              const cert = connex.vendor.sign('cert', {
                purpose: 'identification',
                payload: {
                  type: 'text',
                  content: 'Connect to ReCircle'
                }
              });
              
              const result = await cert.request();
              if (result && result.annex && result.annex.signer) {
                address = result.annex.signer;
                console.log('Connex vendor sign success:', address);
              }
            } catch (err) {
              console.log('Connex vendor sign failed:', err);
            }
          }
        }
      }
      
      // Manual address input as fallback
      if (!address) {
        const manualAddress = prompt('VeWorld auto-detection failed. Please enter your wallet address manually:');
        if (manualAddress && manualAddress.length === 42 && manualAddress.startsWith('0x')) {
          address = manualAddress;
          console.log('Manual address entered:', address);
        }
      }
      
      if (address && address.length === 42 && address.startsWith('0x')) {
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
        
        // Connect to app context
        await connect("vechain", address, { skipCelebration: true });
        console.log('Wallet connected successfully to app');
        
      } else {
        setError('No valid wallet address found. Ensure VeWorld is connected and try again.');
      }
      
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(`Connection failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
    setError(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>VeWorld Wallet</CardTitle>
        <CardDescription>
          {walletAddress 
            ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : 'Connect your VeChain wallet'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {debugInfo && (
          <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            Detected: {debugInfo}
          </div>
        )}
        
        {isReady ? (
          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">VeWorld Ready</span>
          </div>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>VeWorld not detected</AlertDescription>
          </Alert>
        )}

        {!walletAddress ? (
          <Button 
            onClick={connectWallet}
            disabled={!isReady || isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              "Connecting..."
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
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Use VeWorld in-app browser</p>
          <p>• VeChain testnet required</p>
          <p>• Connects to B3TR rewards system</p>
        </div>
      </CardContent>
    </Card>
  );
}