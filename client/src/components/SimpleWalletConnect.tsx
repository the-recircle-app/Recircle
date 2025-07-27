import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

interface SimpleWalletConnectProps {
  onConnect?: () => void;
}

const SimpleWalletConnect: React.FC<SimpleWalletConnectProps> = ({ onConnect }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnexReady, setIsConnexReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { connect } = useWallet();

  // Improved Connex detection (DAO Production Safe)
  useEffect(() => {
    const detectConnex = () => {
      if (window.connex) {
        console.log("✅ VeWorld wallet detected!");
        setIsConnexReady(true);
        setError(null);
      } else {
        console.log("⏳ VeWorld wallet not detected yet... retrying...");
        setTimeout(detectConnex, 500);
      }
    };

    // Check for saved wallet address
    const savedWallet = localStorage.getItem("walletAddress") || localStorage.getItem("connectedWallet");
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }

    // Ensure wallet provider injected AFTER page fully loaded
    if (document.readyState === "complete") {
      detectConnex();
    } else {
      window.addEventListener("load", detectConnex);
      return () => window.removeEventListener("load", detectConnex);
    }
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.connex) {
      setError("VeWorld wallet not detected. Please open in VeWorld in-app browser and try again.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const connex = window.connex;
      const account = await connex.thor.account.getSelected();

      if (account && account.address) {
        console.log("✅ Connected wallet:", account.address);
        setWalletAddress(account.address);
        
        // Save to localStorage for persistence
        localStorage.setItem("walletAddress", account.address);
        
        // Connect to main wallet context
        await connect("connex", account.address, { skipCelebration: true });
        
        // Call onConnect callback if provided
        if (onConnect) {
          onConnect();
        }
      } else {
        setError("No wallet selected. Please select your wallet address in VeWorld app.");
      }
    } catch (err) {
      console.error("❌ Wallet connection error:", err);
      setError("Wallet connection failed. Please try again.");
    }

    setIsConnecting(false);
  };

  const handleRetry = () => {
    setRetryCount(retryCount + 1);
    setError(null);
    
    if (window.connex) {
      setIsConnexReady(true);
    } else {
      // If using development mode, mock the window.connex object
      if (process.env.NODE_ENV === 'development') {
        console.log("Creating mock Connex for development");
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
        setIsConnexReady(true);
      } else {
        // In production, just retry the detection
        setTimeout(() => {
          if (!window.connex) {
            setError("VeWorld wallet not detected after retry. Please make sure you're using the VeWorld in-app browser.");
          }
        }, 1000);
      }
    }
  };

  return (
    <div className="p-5 border rounded-lg shadow-sm">
      {error && (
        <div className="rounded-md bg-destructive/15 p-4 mb-4">
          <p className="text-destructive text-sm text-center">{error}</p>
        </div>
      )}
      
      {!isConnexReady && !walletAddress ? (
        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Detecting VeWorld wallet...</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRetry}
            className="flex items-center gap-2 mt-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Detection
          </Button>
        </div>
      ) : walletAddress ? (
        <div className="flex flex-col items-center py-4">
          <p className="font-medium mb-2">Connected Wallet:</p>
          <p className="text-xs text-muted-foreground font-mono break-all mb-4">{walletAddress}</p>
          <p className="text-green-600 font-medium">✅ Ready to use the app!</p>
        </div>
      ) : (
        <div className="flex flex-col items-center py-4 space-y-4">
          <p className="text-center">Connect your wallet to start earning rewards.</p>
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
              'Connect VeWorld Wallet'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

// Add TypeScript declaration for the window.connex property
declare global {
  interface Window {
    connex?: any;
  }
}

export default SimpleWalletConnect;