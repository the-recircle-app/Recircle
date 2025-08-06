import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "../context/WalletContext";

/**
 * Clean Unified Wallet Button
 * Handles both connection and disconnection with fresh DAppKit logic
 * Eliminates the mixed old/new logic causing disconnect issues
 */
export function UnifiedWalletButton() {
  const { connect, disconnect, tokenBalance, isConnected, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  // Check for VeWorld extension on component mount
  useEffect(() => {
    const checkVeWorldExtension = () => {
      if (window.vechain) {
        console.log("🟢 [UNIFIED] VeWorld extension detected");
      }
    };
    
    checkVeWorldExtension();
  }, []);

  const handleConnect = async () => {
    console.log("🟢 [UNIFIED] Starting wallet connection...");
    setIsLoading(true);
    
    try {
      // Wait for VeWorld providers to be available
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const connex = (window as any).connex;
      const vechain = (window as any).vechain;
      
      let walletAddress = null;

      // Method 1: Try desktop VeWorld extension first
      if (vechain && typeof vechain.request === "function") {
        try {
          console.log("🟢 [UNIFIED] Attempting desktop extension connection");
          const accounts = await vechain.request({ method: 'eth_requestAccounts' });
          
          if (accounts && accounts.length > 0) {
            walletAddress = accounts[0];
            console.log("🟢 [UNIFIED] Connected via desktop extension:", walletAddress);
          }
        } catch (error) {
          console.log("🟢 [UNIFIED] Desktop extension failed:", error);
        }
      }

      // Method 2: Try Connex vendor API (VeWorld mobile primary method)
      if (!walletAddress && connex && connex.vendor && connex.vendor.sign) {
        try {
          console.log("🟢 [UNIFIED] Attempting Connex vendor connection");
          
          const certResult = await connex.vendor.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Connect to ReCircle - Sustainable Transportation Rewards'
            }
          }).request();
          
          if (certResult && certResult.annex && certResult.annex.signer) {
            walletAddress = certResult.annex.signer;
            console.log("🟢 [UNIFIED] Connected via Connex vendor:", walletAddress);
          }
        } catch (error) {
          console.log("🟢 [UNIFIED] Connex vendor failed:", error);
        }
      }

      // Method 3: Try VeChain direct request (fallback for older mobile versions)
      if (!walletAddress && vechain && vechain.request) {
        try {
          console.log("🟢 [UNIFIED] Attempting VeChain direct request");
          
          const accounts = await vechain.request({
            method: 'eth_requestAccounts'
          });
          
          if (accounts && accounts.length > 0) {
            walletAddress = accounts[0];
            console.log("🟢 [UNIFIED] Connected via VeChain request:", walletAddress);
          }
        } catch (error) {
          console.log("🟢 [UNIFIED] VeChain request failed:", error);
        }
      }

      // Method 4: Try legacy VeChain sign method
      if (!walletAddress && vechain && vechain.sign) {
        try {
          console.log("🟢 [UNIFIED] Attempting VeChain sign method");
          
          const signResult = await vechain.sign('cert', {
            purpose: 'identification',
            payload: {
              type: 'text',
              content: 'Connect to ReCircle'
            }
          });
          
          if (signResult && signResult.annex && signResult.annex.signer) {
            walletAddress = signResult.annex.signer;
            console.log("🟢 [UNIFIED] Connected via VeChain sign:", walletAddress);
          }
        } catch (error) {
          console.log("🟢 [UNIFIED] VeChain sign failed:", error);
        }
      }

      if (walletAddress) {
        // Connect to the app with the wallet address - use "VeWorld" as the method name
        const success = await connect('VeWorld', walletAddress, { skipCelebration: false });
        
        if (!success) {
          throw new Error('Failed to register wallet with app');
        }
        
        console.log("🟢 [UNIFIED] Successfully connected:", walletAddress);
      } else {
        throw new Error('No connection method worked. VeWorld providers may not be available.');
      }

    } catch (error) {
      console.error("🟢 [UNIFIED] Connection failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      alert(`VeWorld connection failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    console.log("🟢 [UNIFIED] Disconnecting wallet...");
    await disconnect();
  };

  if (isConnected && address) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md mx-auto">
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-white font-semibold mb-2">Wallet Connected</h3>
            <p className="text-gray-400 text-sm break-all">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
          
          <div className="mb-4 p-3 bg-green-900/30 rounded-lg border border-green-700/50">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-400 font-bold text-lg">{tokenBalance}</span>
              <span className="text-green-300 text-sm">B3TR</span>
            </div>
            <p className="text-green-400 text-xs mt-1">Your Balance</p>
          </div>
          
          <Button
            onClick={handleDisconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md mx-auto">
      <div className="text-center">
        <h3 className="text-white font-semibold mb-4">Connect Your Wallet</h3>
        
        <Button
          onClick={handleConnect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>
        
        <p className="text-gray-400 text-xs mt-3">
          By connecting your wallet you are agreeing to our{" "}
          <a 
            href="/terms-of-service" 
            className="text-blue-400 hover:text-blue-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            terms of service
          </a>
        </p>
      </div>
    </div>
  );
}

export default UnifiedWalletButton;