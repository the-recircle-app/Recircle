import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Wallet } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

declare global {
  interface Window {
    vechain?: any;
    connex?: {
      vendor?: {
        sign: (type: string, payload: any) => { request: () => Promise<any> };
      };
      thor?: any;
      [key: string]: any;
    };
  }
}

export default function DirectVeWorldConnect() {
  const [isReady, setIsReady] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiInfo, setApiInfo] = useState<string>('');
  const { connect } = useWallet();

  useEffect(() => {
    const checkVeWorld = () => {
      if (typeof window.vechain !== 'undefined' || typeof window.connex !== 'undefined') {
        setIsReady(true);
        setError(null);
        
        const info = [];
        if (window.vechain) {
          const keys = Object.keys(window.vechain);
          info.push(`VeChain: ${keys.length} properties (${keys.slice(0, 3).join(', ')}...)`);
        }
        if (window.connex) {
          const keys = Object.keys(window.connex);
          info.push(`Connex: ${keys.length} properties (${keys.slice(0, 3).join(', ')}...)`);
        }
        setApiInfo(info.join(' | '));
      } else {
        setIsReady(false);
        setError('VeWorld not detected - use VeWorld in-app browser');
      }
    };

    checkVeWorld();
    const interval = setInterval(checkVeWorld, 1000);
    setTimeout(() => clearInterval(interval), 10000);
    
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    if (!isReady) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      let address: string | null = null;
      
      console.log('=== Direct VeWorld Connection ===');
      
      // Method 1: Try Connex API (most reliable for VeWorld)
      if (window.connex && window.connex.vendor) {
        console.log('Attempting Connex vendor connection...');
        try {
          const accounts = await window.connex.vendor.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'ReCircle App Authentication'
            }
          }).request();
          
          if (accounts && accounts.annex && accounts.annex.signer) {
            address = accounts.annex.signer;
            console.log('✅ Connex vendor success:', address);
          }
        } catch (err) {
          console.log('❌ Connex vendor failed:', err);
        }
      }
      
      // Method 2: Try direct VeChain object access
      if (!address && window.vechain) {
        console.log('Attempting direct VeChain access...');
        
        // Check for account properties
        if (window.vechain.account) {
          address = window.vechain.account;
          console.log('✅ Direct account property:', address);
        } else if (window.vechain.address) {
          address = window.vechain.address;
          console.log('✅ Direct address property:', address);
        } else if (window.vechain.selectedAddress) {
          address = window.vechain.selectedAddress;
          console.log('✅ Direct selectedAddress:', address);
        }
      }
      
      // Method 3: Try Connex thor account
      if (!address && window.connex && window.connex.thor) {
        console.log('Attempting Connex thor account...');
        try {
          // For read-only account access
          const genesis = await window.connex.thor.genesis;
          if (genesis && window.connex.thor.account) {
            // Try to get any available account info
            console.log('Thor genesis available, checking for account access...');
            // This is read-only, so we need user interaction for actual address
          }
        } catch (err) {
          console.log('❌ Connex thor failed:', err);
        }
      }
      
      // Method 4: Direct object inspection and user prompt
      if (!address) {
        console.log('No automatic address found, showing available properties...');
        
        if (window.vechain) {
          console.log('VeChain object properties:');
          Object.keys(window.vechain).forEach(key => {
            const value = window.vechain[key];
            console.log(`  ${key}: ${typeof value} = ${value}`);
          });
        }
        
        if (window.connex) {
          console.log('Connex object properties:');
          Object.keys(window.connex).forEach(key => {
            const value = window.connex[key];
            console.log(`  ${key}: ${typeof value}`);
          });
        }
        
        // Prompt user to manually connect in VeWorld
        setError('Please connect your wallet in VeWorld app first, then try again');
        return;
      }
      
      if (address && address.length === 42 && address.startsWith('0x')) {
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
        
        // Connect to app context
        await connect("vechain", address, { skipCelebration: true });
        console.log('🎉 Wallet connected successfully:', address);
      } else {
        setError('Invalid wallet address format received');
      }
      
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(`Connection failed: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Direct VeWorld Connect</CardTitle>
        <CardDescription>
          {walletAddress 
            ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : 'Direct VeChain testnet connection'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {apiInfo && (
          <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {apiInfo}
          </div>
        )}
        
        {isReady ? (
          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">VeWorld API Ready</span>
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
                Connect VeWorld Wallet
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Connected Address:</p>
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
          <p>• Direct VeChain/Connex API access</p>
          <p>• Requires VeWorld in-app browser</p>
          <p>• VeChain testnet for B3TR rewards</p>
        </div>
      </CardContent>
    </Card>
  );
}