import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReCircleLogoSVG from "@/components/ReCircleLogoSVG";
import { Loader2, AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { isHTTPS, isVeWorldBrowser, isTestnetReady, VEBETTERDAO_CONFIG } from "@/utils/connexConfig";

type ProductionWalletConnectProps = {
  onConnect?: () => void;
};

/**
 * Production-ready VeWorld wallet connection with proper environment detection
 * Handles HTTPS requirements, APP_ID validation, and VeBetterDAO integration
 */
export default function ProductionWalletConnect({ onConnect }: ProductionWalletConnectProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [environmentStatus, setEnvironmentStatus] = useState<{
    https: boolean;
    veworld: boolean;
    connex: boolean;
    ready: boolean;
  }>({
    https: false,
    veworld: false,
    connex: false,
    ready: false
  });

  const { connect } = useWallet();

  // Check environment on mount
  useEffect(() => {
    const checkEnvironment = () => {
      const httpsCheck = isHTTPS();
      const veWorldCheck = isVeWorldBrowser();
      const connexCheck = typeof window.connex !== 'undefined';
      
      // Environment is ready if we have HTTPS and VeWorld browser
      const ready = httpsCheck && veWorldCheck;

      console.log('[ENV CHECK]', {
        https: httpsCheck,
        veworld: veWorldCheck,
        connex: connexCheck,
        ready,
        userAgent: navigator.userAgent
      });

      setEnvironmentStatus({
        https: httpsCheck,
        veworld: veWorldCheck,
        connex: connexCheck,
        ready
      });

      // Auto-load saved wallet if environment is ready
      if (ready) {
        const savedWallet = localStorage.getItem("walletAddress");
        if (savedWallet) {
          setWalletAddress(savedWallet);
        }
      }
    };

    checkEnvironment();

    // Check periodically for provider injection
    const interval = setInterval(checkEnvironment, 1000);
    const timeout = setTimeout(() => clearInterval(interval), 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const connectWallet = useCallback(async () => {
    if (!environmentStatus.ready) {
      setError("Environment not ready for wallet connection");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('=== Production VeWorld Connection ===');
      console.log('Using proven mobile connection logic...');
      
      // Use the working connectVeWorldWallet function
      const { connectVeWorldWallet } = await import('@/utils/veworld-connector');
      const result = await connectVeWorldWallet();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.address) {
        const address = result.address;
        console.log("✅ Wallet connected:", address);
        setWalletAddress(address);
        localStorage.setItem("walletAddress", address);
        
        // Connect to main wallet context
        await connect("connex", address, { skipCelebration: true });
        
        if (onConnect) {
          onConnect();
        }
      } else {
        throw new Error('No wallet address received');
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setError("Connection failed. Please ensure VeWorld wallet is connected and unlocked.");
    } finally {
      setIsConnecting(false);
    }
  }, [environmentStatus.ready, connect, onConnect]);

  const retryEnvironmentCheck = () => {
    window.location.reload();
  };

  // Show environment issues
  if (!environmentStatus.ready) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ReCircleLogoSVG className="w-16 h-16" />
          </div>
          <CardTitle className="text-xl">Connect Mobile Wallet</CardTitle>
          <CardDescription>
            Environment setup required for secure wallet connection
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* HTTPS Check */}
          <div className="flex items-center space-x-3 p-3 rounded-lg border">
            {environmentStatus.https ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium text-sm">HTTPS Connection</p>
              <p className="text-xs text-gray-400">
                {environmentStatus.https ? "Secure connection active" : "Requires HTTPS for security"}
              </p>
            </div>
          </div>

          {/* VeWorld Browser Check */}
          <div className="flex items-center space-x-3 p-3 rounded-lg border">
            {environmentStatus.veworld ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="font-medium text-sm">VeWorld Browser</p>
              <p className="text-xs text-gray-400">
                {environmentStatus.veworld ? "VeWorld detected" : "Please open in VeWorld in-app browser"}
              </p>
            </div>
          </div>

          {/* Connex Check */}
          <div className="flex items-center space-x-3 p-3 rounded-lg border">
            {environmentStatus.connex ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
            )}
            <div>
              <p className="font-medium text-sm">Wallet Provider</p>
              <p className="text-xs text-gray-400">
                {environmentStatus.connex ? "Connex provider ready" : "Loading wallet provider..."}
              </p>
            </div>
          </div>

          {!environmentStatus.https && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This app must be deployed to an HTTPS domain to connect with VeWorld wallet.
                Local development requires using the production deployment URL.
              </AlertDescription>
            </Alert>
          )}

          {!environmentStatus.veworld && environmentStatus.https && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please open this app using the VeWorld wallet's in-app browser.
                <a 
                  href="https://www.vechain.org/wallet/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center ml-2 text-blue-400 hover:text-blue-300"
                >
                  Download VeWorld <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <Button 
            onClick={retryEnvironmentCheck}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Environment Check
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Environment is ready - show wallet connection
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <ReCircleLogoSVG className="w-16 h-16" />
        </div>
        <CardTitle className="text-xl">Connect Mobile Wallet</CardTitle>
        <CardDescription>
          {walletAddress ? (
            <>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</>
          ) : (
            "Connect your VeWorld wallet to start earning B3TR rewards"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="p-3 bg-green-900/20 rounded-lg border border-green-800">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-300">Environment Ready</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              HTTPS ✓ VeWorld ✓ Connex ✓
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {!walletAddress ? (
          <Button
            onClick={connectWallet}
            disabled={isConnecting || !environmentStatus.ready}
            className="w-full py-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Mobile Wallet"
            )}
          </Button>
        ) : (
          <Button
            onClick={() => {
              setWalletAddress(null);
              localStorage.removeItem("walletAddress");
            }}
            variant="outline"
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}