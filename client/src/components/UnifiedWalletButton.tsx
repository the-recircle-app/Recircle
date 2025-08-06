import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "../context/WalletContext";

/**
 * Clean Unified Wallet Button
 * Handles both connection and disconnection with fresh DAppKit logic
 * Eliminates the mixed old/new logic causing disconnect issues
 */
export function UnifiedWalletButton() {
  const { connect, disconnect, tokenBalance, isConnected, walletAddress } = useWallet();
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
      // Try VeWorld extension first
      if (window.vechain) {
        console.log("🟢 [UNIFIED] VeWorld extension detected, attempting connection...");
        
        // Request accounts from extension
        const accounts = await window.vechain.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts.length > 0) {
          // Connect to app context
          const success = await connect("extension", accounts[0]);
          
          if (success) {
            console.log("🟢 [UNIFIED] Successfully connected via VeWorld extension:", accounts[0]);
            return;
          } else {
            throw new Error("App context connection failed");
          }
        } else {
          throw new Error("No accounts returned from extension");
        }
      } else {
        // No extension detected - provide instructions
        console.log("🟢 [UNIFIED] No extension detected");
        alert("Please install VeWorld browser extension or use VeWorld mobile app to connect your wallet.");
      }
    } catch (error) {
      console.error("🟢 [UNIFIED] Connection failed:", error);
      
      if (error.message?.includes("User rejected")) {
        alert("Connection cancelled. Please try again and approve the connection request.");
      } else if (error.message?.includes("No accounts")) {
        alert("Please unlock your VeWorld extension and try again.");
      } else {
        alert("Wallet connection failed. Please make sure you have VeWorld installed.");
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