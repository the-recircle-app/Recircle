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
          console.log("🟢 [UNIFIED] Attempting Connex vendor connection (mobile)");
          
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

      // Method 3: Try VeChain enable method (mobile fallback)
      if (!walletAddress && vechain && typeof vechain.enable === "function") {
        try {
          console.log("🟢 [UNIFIED] Attempting VeChain enable method");
          await vechain.enable();
          
          // Poll for address
          let tries = 0;
          const maxTries = 30;
          
          while (tries < maxTries) {
            const address = vechain.selectedAddress || 
                           vechain.address || 
                           (vechain.accounts && vechain.accounts[0]);
            
            if (address && typeof address === 'string' && address.startsWith('0x')) {
              walletAddress = address;
              console.log("🟢 [UNIFIED] Connected via enable method:", walletAddress);
              break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            tries++;
          }
        } catch (error) {
          console.log("🟢 [UNIFIED] Enable method failed:", error);
        }
      }

      // Method 4: Check for already connected address
      if (!walletAddress && vechain && vechain.selectedAddress) {
        walletAddress = vechain.selectedAddress;
        console.log("🟢 [UNIFIED] Using already connected address:", walletAddress);
      }

      if (!walletAddress) {
        throw new Error("No connection method worked. Please make sure VeWorld is installed and unlocked.");
      }
      
      // Connect to app context
      const success = await connect("connex", walletAddress);
      
      if (success) {
        console.log("🟢 [UNIFIED] Successfully connected to app:", walletAddress);
      } else {
        throw new Error("App context connection failed");
      }
      
    } catch (error) {
      console.error("🟢 [UNIFIED] Connection failed:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("User rejected") || errorMessage.includes("User denied")) {
        alert("Connection cancelled. Please try again and approve the connection request.");
      } else if (errorMessage.includes("No connection method")) {
        alert("VeWorld wallet not found. Please install VeWorld extension or use VeWorld mobile app.");
      } else {
        alert("Wallet connection failed. Please make sure VeWorld is unlocked and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    console.log("🔴 [UNIFIED] Starting disconnect...");
    setIsLoading(true);
    
    try {
      await disconnect();
      console.log("🔴 [UNIFIED] Disconnect completed successfully");
    } catch (error) {
      console.error("🔴 [UNIFIED] Disconnect failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-bold text-green-400 mb-2">✅ Wallet Connected</h3>
          <p className="text-gray-300 text-sm mb-4">Balance: {tokenBalance} B3TR</p>
          <Button 
            onClick={handleDisconnect} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
          >
            {isLoading ? "Disconnecting..." : "Disconnect Wallet"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-100 mb-4">Connect Your Wallet</h3>
        <p className="text-gray-300 text-sm mb-4">
          Connect to start earning B3TR tokens
        </p>
        
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