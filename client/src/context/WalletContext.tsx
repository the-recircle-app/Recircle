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
      // If we have a user ID but no wallet address, don't set as connected
      const userIdNum = parseInt(storedUserId);
      if (!isNaN(userIdNum)) {
        console.log("[WALLET] Found stored userId but no wallet address - requiring wallet connection");
        setUserId(userIdNum);
        setIsConnected(false); // Keep disconnected until real wallet connects
        // Clear the stored userId since we need a proper wallet connection
        localStorage.removeItem("userId");
      }
    } else {
      // Always require real wallet connection - no development fallbacks
      console.log("[WALLET] No stored wallet found - requiring real wallet connection");
      setUserId(null);
      setIsConnected(false);
      // Clear any existing localStorage data for clean state
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("userId");
      localStorage.removeItem("connectedWallet");
    }
    
    // Legacy fallback block - now disabled
    if (false && featureFlags.useDefaultUser) {
      // Development fallback - disabled to force real wallet connections
      console.log("[DEV] Development fallback disabled - requiring real wallet");
    } else if (false) {
      // Production - no default user, require wallet connection
      console.log("[WALLET TEST] No user ID found, requiring real wallet connection");
      setUserId(null);
      setIsConnected(false);
      // Clear any existing localStorage data for clean testing
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("userId");
      localStorage.removeItem("connectedWallet");
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
      console.log(`[WALLET] Connect called with walletType: ${walletType}, explicit address: ${walletAddress}`);
      setConnecting(true);
      
      // If an explicit wallet address is provided (from DAppKit or StandardWalletConnect), use it
      // Otherwise, use our built-in connection method
      let walletInfo;
      if (walletAddress) {
        walletInfo = { address: walletAddress, balance: 0 };
      } else if (walletType === "dappkit") {
        // DAppKit handles the connection, we just need the address
        throw new Error("DAppKit connections require explicit address");
      } else {
        walletInfo = await vechain.connectWallet(walletType);
      }
      
      if (!walletInfo) {
        throw new Error("Failed to connect wallet");
      }
      
      console.log(`[WALLET] Connecting to wallet: ${walletInfo.address} using ${walletType}`);
      
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
      
      // Save connection in localStorage with multiple keys for reliability
      localStorage.setItem("walletAddress", walletInfo.address);
      localStorage.setItem("connectedWallet", walletType);
      localStorage.setItem("userId", userData.id.toString());
      
      // Show celebration only once per session to prevent loops
      if (!options.skipCelebration && !sessionStorage.getItem('celebrationShown')) {
        setShowCelebration(true);
        sessionStorage.setItem('celebrationShown', 'true');
      } else {
        // Show simple toast without celebration
        toast({
          title: "Wallet Connected",
          description: "Your VeChain wallet has been connected successfully",
        });
      }
      
      return true;
    } catch (error) {
      console.error("[WALLET] Error connecting wallet:", error);
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
      // Clear all wallet connection data from localStorage first
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("connectedWallet");
      localStorage.removeItem("userId");
      localStorage.removeItem("veworld-connected");
      localStorage.removeItem("veworld-address");
      
      // Clear VeChainKit and Privy related storage
      localStorage.removeItem("privy:token");
      localStorage.removeItem("privy:refresh_token");
      localStorage.removeItem("privy:did_token");
      localStorage.removeItem("vechain-kit-account");
      
      // Try to disconnect from the VeChain SDK and DAppKit
      try {
        await vechain.disconnectWallet();
        
        // Also clear DAppKit data if available
        if (typeof window !== 'undefined' && window.localStorage) {
          // Clear DAppKit storage keys
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('dappkit') || key.includes('vechain') || key.includes('@vechain'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }
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
