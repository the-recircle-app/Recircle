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
      // Try VeWorld extension/mobile connection
      if (!window.vechain) {
        throw new Error("VeWorld not detected. Please install VeWorld extension or use VeWorld mobile app.");
      }

      console.log("🟢 [UNIFIED] VeWorld detected, attempting connection...");
      
      let accounts = [];
      
      // Try desktop extension method first
      if (typeof window.vechain.request === "function") {
        console.log("🟢 [UNIFIED] Using desktop extension method");
        accounts = await window.vechain.request({ method: 'eth_requestAccounts' });
      } else if (typeof window.vechain.enable === "function") {
        // Mobile VeWorld method
        console.log("🟢 [UNIFIED] Using mobile enable method");
        await window.vechain.enable();
        
        // Poll for address
        let tries = 0;
        const maxTries = 30;
        
        while (tries < maxTries) {
          const address = window.vechain.selectedAddress || 
                         window.vechain.address || 
                         (window.vechain.accounts && window.vechain.accounts[0]);
          
          if (address && typeof address === 'string' && address.startsWith('0x')) {
            accounts = [address];
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
          tries++;
        }
      } else if (window.vechain.selectedAddress) {
        // Already connected
        accounts = [window.vechain.selectedAddress];
      }
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from VeWorld");
      }
      
      // Connect to app context
      const success = await connect("connex", accounts[0]);
      
      if (success) {
        console.log("🟢 [UNIFIED] Successfully connected wallet:", accounts[0]);
      } else {
        throw new Error("App context connection failed");
      }
      
    } catch (error) {
      console.error("🟢 [UNIFIED] Connection failed:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("User rejected")) {
        alert("Connection cancelled. Please try again and approve the connection request.");
      } else if (errorMessage.includes("VeWorld not detected")) {
        alert("VeWorld not detected. Please install VeWorld extension or use VeWorld mobile app.");
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