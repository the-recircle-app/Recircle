import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ReCircleLogoSVG from "@/components/ReCircleLogoSVG";
import { Recycle } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { Loader2, RefreshCw } from "lucide-react";

type DAOWalletConnectProps = {
  onConnect?: () => void;
};

/**
 * DAOWalletConnect - A production-ready wallet connection component for VeWorld
 * 
 * Features:
 * - Smart Connex auto-detect with timeout and retry
 * - Automatic wallet connect after Connex becomes available
 * - Retry button for manual retry if Connex didn't inject fast enough
 * - Clean UI messaging for users
 * - LocalStorage persistence for returning users
 */
export default function DAOWalletConnect({ onConnect }: DAOWalletConnectProps) {
  const [connexReady, setConnexReady] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [detectionTries, setDetectionTries] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const MAX_TRIES = 20; // Maximum number of detection attempts
  const { connect } = useWallet(); // Use the main wallet context for actual connection
  
  // Check if we're in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode detected, creating mock Connex");
      // In development mode, create a mock Connex provider for testing
      window.connex = {
        thor: {
          account: {
            getSelected: async () => {
              await new Promise(resolve => setTimeout(resolve, 500));
              return { address: '0x7dE3085b3190B3a787822Ee16F23be010f5F8686' };
            }
          }
        }
      } as any;
      setConnexReady(true);
      setError(null);
    }
  }, []);

  // Load saved wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("walletAddress") || localStorage.getItem("connectedWallet");
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
  }, []);

  // Connect wallet function - this is the critical function that triggers the permission flow
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // When user clicks connect, check for window.connex
      // This initial check will trigger VeWorld to prompt for permissions if not granted yet
      if (!window.connex) {
        // In development, we already mocked connex
        if (process.env.NODE_ENV !== 'development') {
          console.log("No Connex detected. In VeWorld, this should trigger the permission prompt.");
          setError("Please allow this site to connect to VeWorld when prompted.");
          
          // Wait briefly to see if permission is granted and connex becomes available
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Check again after the user potentially granted permission
          if (!window.connex) {
            setError("VeWorld wallet not detected. Please use the VeWorld in-app browser and allow access when prompted.");
            setIsConnecting(false);
            return;
          }
        }
      }

      // At this point, window.connex should be available (either real or mocked)
      console.log("Connex detected, attempting to get selected account");
      const connex = window.connex;
      const account = await connex.thor.account.getSelected();

      if (account && account.address) {
        console.log("✅ Wallet connected:", account.address);
        setWalletAddress(account.address);
        setConnexReady(true);
        
        // Save wallet to localStorage for auto-login later
        localStorage.setItem("walletAddress", account.address);
        
        // Connect to the main wallet context with skipCelebration=true to avoid double confetti
        await connect("connex", account.address, { skipCelebration: true });
        
        // Call onConnect callback if provided
        if (onConnect) {
          onConnect();
        }
      } else {
        setError("No wallet selected. Please select a wallet in VeWorld app.");
      }
    } catch (err) {
      console.error("❌ Wallet connection failed:", err);
      setError("Connection failed. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Reset detection and try again
  const handleRetry = () => {
    setDetectionTries(0);
    setError(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Recycle className="h-10 w-10 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center">Connect Your VeChain Wallet</CardTitle>
        <CardDescription className="text-center">
          Connect your wallet to start earning B3TR tokens for sustainable shopping.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="rounded-md bg-destructive/15 p-4 mb-4">
            <p className="text-destructive text-sm text-center">{error}</p>
          </div>
        )}

        {/* In development, we always show the connect button since we have the mock */}
        {process.env.NODE_ENV === 'development' && !walletAddress && (
          <div className="flex justify-center py-4">
            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Wallet (Dev Mode)'
              )}
            </Button>
          </div>
        )}
        
        {/* In production, we just show the connect button - no detection */}
        {process.env.NODE_ENV !== 'development' && !walletAddress && (
          <div className="flex flex-col justify-center py-4 space-y-4">
            <p className="text-center text-sm mb-2">
              Click connect to allow VeWorld to access this site. This will trigger a permission request.
            </p>
            
            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Mobile Wallet'
              )}
            </Button>
          </div>
        )}
      </CardContent>
      
      {walletAddress && (
        <CardFooter className="flex flex-col">
          <p className="text-sm font-medium mb-1">Wallet Connected:</p>
          <p className="text-xs text-muted-foreground font-mono break-all">{walletAddress}</p>
        </CardFooter>
      )}
    </Card>
  );
}

// Add TypeScript declaration for the window.connex property
declare global {
  interface Window {
    connex?: any;
  }
}