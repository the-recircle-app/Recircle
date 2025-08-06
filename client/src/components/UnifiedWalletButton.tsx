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
      // Use the EXACT working connectVeWorldWallet utility
      const { connectVeWorldWallet } = await import('@/utils/veworld-connector');
      const result = await connectVeWorldWallet();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.address) {
        // Connect to app context with the proven working method
        const success = await connect("connex", result.address);
        
        if (success) {
          console.log("🟢 [UNIFIED] Successfully connected:", result.address);
        } else {
          throw new Error("App context connection failed");
        }
      } else {
        throw new Error('No wallet address received');
      }
      
    } catch (error) {
      console.error("🟢 [UNIFIED] Connection failed:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("User rejected") || errorMessage.includes("User denied")) {
        alert("Connection cancelled. Please try again and approve the connection request.");
      } else if (errorMessage.includes("VeWorld not detected")) {
        alert("VeWorld not detected. Use the in-app browser.");
      } else if (errorMessage.includes("Wrong network")) {
        alert("Wrong network. Switch to VeChain testnet.");
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