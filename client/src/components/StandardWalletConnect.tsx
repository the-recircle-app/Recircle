import { useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import ReCircleLogoEarth from './ReCircleLogoEarth';
import { Button } from './ui/button';
import { Wallet, Loader2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useVeWorldWallet } from '../hooks/useVeWorldWallet';

// ✅ PRODUCTION-READY WALLET CONNECTOR (FINAL VERSION)
// No auto-connect: guarantees signer popup works in iPhone in-app browser
// Shows loading and error states with friendly retry options
interface StandardWalletConnectProps {
  onConnect?: () => void;
}

export default function StandardWalletConnect({ onConnect }: StandardWalletConnectProps) {
  const { connect, isConnected } = useWallet();
  const {
    walletAddress,
    isConnexReady,
    isConnecting,
    connectionError,
    isCheckingConnex,
    checkForConnex,
    connectWallet: veWorldConnect
  } = useVeWorldWallet();

  // Connect through wallet context when wallet address changes (including on initial load from localStorage)
  useEffect(() => {
    const connectThroughContext = async () => {
      if (walletAddress && !isConnected) {
        // Connect through context with the loaded address
        console.log('Connecting through context with stored wallet:', walletAddress);
        const success = await connect('VeWorld', walletAddress);
        if (success && onConnect) {
          onConnect();
        }
      }
    };
    
    connectThroughContext();
  }, [walletAddress, connect, isConnected, onConnect]);

  // Connect through our app context when wallet is connected
  const handleWalletConnected = async () => {
    if (walletAddress) {
      // Connect through context
      const success = await connect('VeWorld', walletAddress);
      if (success && onConnect) {
        onConnect();
      }
    }
  };

  // Handle wallet connection
  const connectWallet = async () => {
    await veWorldConnect();
    if (walletAddress) {
      await handleWalletConnected();
    }
  };

  // Force a re-check for VeWorld wallet
  const handleRetryDetection = () => {
    checkForConnex();
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
        
        {/* Show error message if connection failed */}
        {connectionError && (
          <div className="p-4 bg-red-900/20 rounded-lg border border-red-800 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-sm">{connectionError}</p>
              <p className="text-gray-400 text-xs mt-1">
                Make sure you're using the VeWorld in-app browser and have a wallet selected.
              </p>
            </div>
          </div>
        )}
        
        {/* Different states for the wallet connection button */}
        {isCheckingConnex ? (
          // Still checking for Connex provider
          <Button
            disabled={true}
            className="w-full py-6 bg-gray-700 text-white rounded-lg flex items-center justify-center relative overflow-hidden"
          >
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Looking for VeWorld Wallet...
          </Button>
        ) : !isConnexReady ? (
          // Connex provider not found after timeout
          <div className="space-y-3">
            <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-800 mb-2">
              <p className="text-amber-300 text-sm font-medium">VeWorld wallet not detected</p>
              <p className="text-gray-400 text-xs mt-1">
                This app requires the VeWorld wallet. Please make sure you're using the VeWorld in-app browser.
              </p>
            </div>
            <Button
              onClick={handleRetryDetection}
              className="w-full py-4 bg-amber-700 hover:bg-amber-600 text-white rounded-lg flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Detection
            </Button>
            <a 
              href="https://www.vechain.org/developer-resources/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button
                variant="outline"
                className="w-full py-4 border-gray-700 text-gray-300 hover:text-white rounded-lg flex items-center justify-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get VeWorld Wallet
              </Button>
            </a>
          </div>
        ) : (
          /* Ready to connect button */
          <Button
            onClick={connectWallet}
            disabled={isConnecting || (isConnected && !connectionError)}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center relative overflow-hidden group"
          >
            {isConnecting ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Wallet className="h-5 w-5 mr-2" />
            )}
            {isConnecting ? 'Connecting...' : 
             connectionError ? 'Retry Connection' : 
             isConnected ? 'Connected' : 'Connect VeWorld Wallet'}
            <div className="absolute bottom-0 left-0 h-1 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform bg-blue-300/30"></div>
          </Button>
        )}
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>If you don't have a wallet, download VeWorld from the <a href="https://www.vechain.org/developer-resources/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">official website</a></p>
        </div>
      </div>
    </div>
  );
}