import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Wallet, Loader2 } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import ReCircleLogoEarth from "./ReCircleLogoEarth";

export default function ProductionVeWorldConnect() {
  const [isReady, setIsReady] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connect, isConnected } = useWallet();

  // Check for VeWorld on component mount and periodically
  useEffect(() => {
    const checkVeWorld = () => {
      const vechain = (window as any).vechain;
      
      if (vechain && vechain.isVeWorld && vechain.newConnexSigner) {
        setIsReady(true);
        setError(null);
        
        // Check for cached wallet
        const cached = localStorage.getItem('walletAddress');
        if (cached && cached.length === 42 && !walletAddress) {
          setWalletAddress(cached);
        }
      } else {
        setIsReady(false);
        if (!vechain) {
          setError('VeWorld not detected - please use VeWorld in-app browser');
        }
      }
    };

    checkVeWorld();
    const interval = setInterval(checkVeWorld, 2000);
    setTimeout(() => clearInterval(interval), 10000);
    
    return () => clearInterval(interval);
  }, [walletAddress]);

  // Auto-connect with cached wallet
  useEffect(() => {
    const autoConnect = async () => {
      if (walletAddress && !isConnected) {
        await connect("vechain", walletAddress, { skipCelebration: true });
      }
    };
    autoConnect();
  }, [walletAddress, isConnected, connect]);

  const connectWallet = async () => {
    if (!isReady) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      const vechain = (window as any).vechain;
      console.log('Connecting via VeWorld newConnexSigner...');
      
      const connex = vechain.newConnexSigner();
      
      if (connex && connex.vendor && connex.vendor.sign) {
        const timestamp = Date.now();
        const cert = connex.vendor.sign('cert', {
          purpose: 'identification',
          payload: {
            type: 'text',
            content: `Connect to ReCircle for B3TR rewards - ${timestamp}`
          }
        });
        
        const result = await cert.request();
        
        if (result && result.annex && result.annex.signer) {
          const address = result.annex.signer;
          console.log('VeWorld connection successful:', address);
          
          setWalletAddress(address);
          localStorage.setItem('walletAddress', address);
          
          // Connect to app context
          await connect("vechain", address);
          
        } else {
          setError('VeWorld authentication failed - please try again');
        }
      } else {
        setError('VeWorld connection unavailable - please refresh and try again');
      }
      
    } catch (err: any) {
      console.error('VeWorld connection error:', err);
      setError(err.message || 'Connection failed - please ensure VeWorld is unlocked');
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
    <div className="flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-full max-w-md mx-auto bg-gray-900 rounded-2xl border border-gray-800 shadow-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <ReCircleLogoEarth size="lg" variant="gradient" className="mb-4" />
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
          Connect Your VeChain Wallet
        </h2>
        
        <p className="text-gray-400 text-center mb-6">
          Connect your wallet to start earning B3TR tokens for sustainable transportation
        </p>

        {/* Show wallet address if connected */}
        {walletAddress && (
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 mb-6">
            <p className="text-sm text-gray-400 mb-1">Connected Wallet:</p>
            <p className="text-blue-400 font-mono text-sm break-all">{walletAddress}</p>
          </div>
        )}

        {/* Show status indicators */}
        {isReady ? (
          <div className="flex items-center space-x-2 p-3 bg-green-900/20 rounded-lg border border-green-800 mb-4">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">VeWorld Ready</span>
          </div>
        ) : (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>VeWorld not detected - please use VeWorld in-app browser</AlertDescription>
          </Alert>
        )}

        {/* Connection button */}
        {!walletAddress ? (
          <Button 
            onClick={connectWallet}
            disabled={!isReady || isConnecting}
            className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Connecting to VeWorld...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-2" />
                Connect Mobile Wallet
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="text-center py-4">
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Wallet Connected</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Ready to earn B3TR rewards</p>
            </div>
            <Button 
              onClick={disconnect} 
              variant="outline" 
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="mt-6 text-xs text-gray-500 space-y-1 text-center">
          <p>• Requires VeWorld in-app browser</p>
          <p>• VeChain testnet for B3TR rewards</p>
          <p>• Earn tokens for sustainable transport</p>
        </div>
      </div>
    </div>
  );
}