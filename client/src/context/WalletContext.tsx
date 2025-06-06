import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { vechain } from "../lib/vechain";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import type { User } from "../types";
import ConnectionCelebration from "../components/ConnectionCelebration";
import { featureFlags, environment } from "../lib/environment";

interface WalletContextType {
  address: string;
  isConnecting: boolean;
  isConnected: boolean;
  tokenBalance: number;
  userId: number | null;
  connecting: boolean;
  connect: (walletType: string, walletAddress?: string, options?: { skipCelebration?: boolean }) => Promise<boolean>;
  disconnect: () => Promise<boolean>;
  refreshTokenBalance: () => Promise<number>;
  refreshUserData: () => Promise<void>;
  showCelebration: boolean;
}

const WalletContext = createContext<WalletContextType>({
  address: "",
  isConnecting: false,
  isConnected: false,
  tokenBalance: 0,
  userId: null,
  connecting: false,
  connect: async () => false,
  disconnect: async () => false,
  refreshTokenBalance: async () => 0,
  refreshUserData: async () => {},
  showCelebration: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const { toast } = useToast();

  // Check for stored wallet address on load with safety checks
  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    const storedUserId = localStorage.getItem("userId");
    
    // Enhanced recovery logic with fallback user ID
    if (storedAddress) {
      recoverWalletConnection(storedAddress);
    } else if (storedUserId) {
      // If we have a user ID but no wallet, use demo mode
      const userIdNum = parseInt(storedUserId);
      if (!isNaN(userIdNum)) {
        setUserId(userIdNum);
        setIsConnected(true);
        // Don't automatically refresh to prevent infinite loops
        // refreshTokenBalance();
      }
    } else if (featureFlags.useDefaultUser) {
      // Development fallback - use user 1 by default to allow testing
      console.log("[DEV] No user ID found in localStorage, using default user ID 1");
      setUserId(1);
      setIsConnected(true);
      // Don't automatically refresh to prevent infinite loops
      // refreshTokenBalance();
    } else {
      // Production - no default user, require wallet connection
      console.log("[PROD] No user ID found, requiring wallet connection");
      setUserId(null);
      setIsConnected(false);
    }
  }, []);

  const recoverWalletConnection = async (address: string) => {
    try {
      setIsConnecting(true);
      
      // Fetch user data from the API
      const response = await fetch(`/api/users/wallet/${address}`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const userData: User = await response.json();
        setAddress(address);
        setTokenBalance(userData.tokenBalance);
        setUserId(userData.id);
        setIsConnected(true);
        localStorage.setItem("userId", userData.id.toString());
      } else {
        // If user doesn't exist, create a new one
        if (response.status === 404) {
          const username = `user_${Math.random().toString(36).substring(2, 10)}`;
          const newUser = await apiRequest("POST", "/api/users", {
            username,
            password: Math.random().toString(36).substring(2, 15),
            walletAddress: address
          });
          
          if (newUser.ok) {
            const userData: User = await newUser.json();
            setAddress(address);
            setTokenBalance(userData.tokenBalance);
            setUserId(userData.id);
            setIsConnected(true);
            localStorage.setItem("userId", userData.id.toString());
          } else {
            throw new Error("Failed to create user account");
          }
        } else {
          throw new Error("Failed to fetch user data");
        }
      }
    } catch (error) {
      console.error("Error recovering wallet connection:", error);
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("userId");
      // Clear state but don't show error toast - user can try reconnecting
      setAddress("");
      setTokenBalance(0);
      setUserId(null);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const connect = async (walletType: string, walletAddress?: string, options: { skipCelebration?: boolean } = {}): Promise<boolean> => {
    try {
      setConnecting(true);
      
      // If an explicit wallet address is provided (from StandardWalletConnect), use it
      // Otherwise, use our built-in connection method
      const walletInfo = walletAddress 
        ? { address: walletAddress, balance: 0 } 
        : await vechain.connectWallet(walletType);
      
      if (!walletInfo) {
        throw new Error("Failed to connect wallet");
      }
      
      console.log(`Connecting to wallet: ${walletInfo.address} using ${walletType}`);
      
      // Fetch or create user
      const response = await fetch(`/api/users/wallet/${walletInfo.address}`, {
        credentials: "include",
      });
      
      let userData: User;
      
      if (response.ok) {
        userData = await response.json();
      } else if (response.status === 404) {
        // Create new user
        const username = `user_${Math.random().toString(36).substring(2, 10)}`;
        const newUserResponse = await apiRequest("POST", "/api/users", {
          username,
          password: Math.random().toString(36).substring(2, 15),
          walletAddress: walletInfo.address
        });
        
        if (!newUserResponse.ok) {
          throw new Error("Failed to create user account");
        }
        
        userData = await newUserResponse.json();
      } else {
        throw new Error("Failed to fetch or create user");
      }
      
      setAddress(walletInfo.address);
      setTokenBalance(userData.tokenBalance);
      setUserId(userData.id);
      setIsConnected(true);
      
      // Save connection in localStorage
      localStorage.setItem("walletAddress", walletInfo.address);
      
      // Show celebration animation instead of toast for successful connection
      // unless skipCelebration is true
      if (!options.skipCelebration) {
        setShowCelebration(true);
      } else {
        // If we're skipping celebration, show a simple toast instead
        toast({
          title: "Wallet Connected",
          description: "Your VeChain wallet has been connected successfully",
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive"
      });
      return false;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async (): Promise<boolean> => {
    try {
      // Clear wallet connection in any local storage
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("connectedWallet");
      
      // Try to disconnect from the VeChain SDK
      try {
        await vechain.disconnectWallet();
      } catch (err) {
        console.log("Vechain disconnect failed, but continuing with local disconnect");
      }
      
      // Clear all state, regardless of whether the VeChain disconnect succeeded
      setAddress("");
      setTokenBalance(0);
      setUserId(null);
      setIsConnected(false);
      
      // Also clear the wallet state in the hook if window is defined (browser context)
      if (typeof window !== 'undefined') {
        // Clear any wallet connection in the hook
        if (window.clearVeWorldWallet) {
          window.clearVeWorldWallet();
        }
        
        // Always clear all localStorage entries that might contain wallet data
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("connectedWallet");
      }
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
      
      return true;
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect wallet",
        variant: "destructive"
      });
      return false;
    }
  };

  // Refresh token balance from the server
  const refreshTokenBalance = async (): Promise<number> => {
    if (!userId || !isConnected) {
      return tokenBalance;
    }
    
    try {
      // Fetch latest user data with no-cache headers to ensure fresh data
      const response = await fetch(`/api/users/${userId}`, {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        const userData: User = await response.json();
        console.log("Refreshed user token balance:", userData.tokenBalance);
        
        // Update token balance state
        setTokenBalance(userData.tokenBalance);
        return userData.tokenBalance;
      } else {
        throw new Error("Failed to fetch updated user data");
      }
    } catch (error) {
      console.error("Error refreshing token balance:", error);
      return tokenBalance; // Return current balance on error
    }
  };
  
  // Refresh all user data
  const refreshUserData = async (): Promise<void> => {
    if (!userId || !isConnected) {
      return;
    }
    
    try {
      // Refresh the token balance
      await refreshTokenBalance();
      
      console.log("Forcing user data refresh after receipts update");
      
      // Signal to other components that data should be refreshed
      if (typeof window !== 'undefined') {
        // Set a timestamp that components can check to know when to refresh
        localStorage.setItem('forceDataRefresh', Date.now().toString());
        
        // Create and dispatch a custom event that components can listen for
        const refreshEvent = new CustomEvent('userDataRefreshed', {
          detail: { userId, timestamp: Date.now() }
        });
        window.dispatchEvent(refreshEvent);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh user data",
        variant: "destructive"
      });
    }
  };

  // Handler for completing the celebration
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected,
        tokenBalance,
        userId,
        connecting,
        connect,
        disconnect,
        refreshTokenBalance,
        refreshUserData,
        showCelebration,
      }}
    >
      {showCelebration && (
        <ConnectionCelebration
          isVisible={showCelebration}
          onComplete={handleCelebrationComplete}
        />
      )}
      {children}
    </WalletContext.Provider>
  );
};
