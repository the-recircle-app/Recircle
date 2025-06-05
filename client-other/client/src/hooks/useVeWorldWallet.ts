import { useEffect, useState, useRef } from 'react';

// Add TypeScript declaration for the clearVeWorldWallet global function
declare global {
  interface Window {
    clearVeWorldWallet?: () => void;
    connex?: any;
  }
}

// Maximum time to wait for Connex in production before showing the fallback option
const MAX_WAIT_TIME_MS = 5000; // 5 seconds

export function useVeWorldWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnexReady, setIsConnexReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isCheckingConnex, setIsCheckingConnex] = useState(true);

  // Use ref to track the timeout
  const checkTimeoutRef = useRef<number | null>(null);

  // Cleanup function to clear any timers
  const clearTimers = () => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }
  };

  // Check if Connex is injected
  useEffect(() => {
    let checkCount = 0;
    const maxChecks = 10; // Try 10 times before giving up

    const checkConnex = () => {
      // If Connex is detected, we're good to go
      if (window.connex) {
        console.log("VeWorld Connex ready");
        setIsConnexReady(true);
        setIsCheckingConnex(false);
        clearTimers();
        return;
      }

      // Increment check counter
      checkCount++;
      
      // For development environment, create a mock after 2 seconds
      if (process.env.NODE_ENV === 'development') {
        if (checkCount === 1) { // Only do this once
          console.log("Development mode: Creating mock Connex after delay");
          checkTimeoutRef.current = window.setTimeout(() => {
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
            setIsCheckingConnex(false);
          }, 2000);
        }
      } else {
        // In production, only check for a limited time
        if (checkCount < maxChecks) {
          console.log(`Waiting for VeWorld Connex... (attempt ${checkCount}/${maxChecks})`);
          checkTimeoutRef.current = window.setTimeout(checkConnex, 500);
        } else {
          // After max attempts, stop checking and show a button to retry
          console.log("VeWorld Connex not found after multiple attempts");
          setIsCheckingConnex(false);
          // Don't set an error here, as we'll handle this in the UI
        }
      }
    };

    // Start checking for Connex
    checkConnex();

    // Overall timeout for production
    if (process.env.NODE_ENV !== 'development') {
      checkTimeoutRef.current = window.setTimeout(() => {
        console.log("Timed out waiting for VeWorld Connex");
        setIsCheckingConnex(false);
      }, MAX_WAIT_TIME_MS);
    }

    // Cleanup on unmount
    return clearTimers;
  }, []);

  // Auto reconnect from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('walletAddress') || localStorage.getItem('connectedWallet');
    if (savedWallet) {
      setWalletAddress(savedWallet);
    }
    
    // Register the global disconnect function
    window.clearVeWorldWallet = () => {
      console.log("Global wallet disconnect called");
      setWalletAddress(null);
      setConnectionError(null);
    };
    
    // Cleanup on unmount
    return () => {
      window.clearVeWorldWallet = undefined;
    };
  }, []);

  // Force a check for Connex - useful if user installs/opens VeWorld after initially loading the page
  const checkForConnex = () => {
    if (window.connex) {
      console.log("VeWorld Connex found on manual check");
      setIsConnexReady(true);
      return true;
    }
    
    console.log("VeWorld Connex still not available");
    setConnectionError("VeWorld wallet not available. Please open in the VeWorld in-app browser.");
    return false;
  };

  const connectWallet = async () => {
    // Check again just to be sure Connex is available
    if (!window.connex && !checkForConnex()) {
      return;
    }

    setIsConnecting(true);
    try {
      // Safe to use connex since we checked it exists above
      const connex = window.connex!;
      const account = await connex.thor.account.getSelected();

      if (account?.address) {
        console.log("Connected:", account.address);
        setWalletAddress(account.address);
        // Use the same key as WalletContext to be consistent
        localStorage.setItem('walletAddress', account.address);
        setConnectionError(null);
      } else {
        setConnectionError("No wallet selected. Please select a wallet in VeWorld app.");
      }
    } catch (err) {
      console.error("Connection error", err);
      setConnectionError("Connection failed. Please refresh and try again in VeWorld.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect function to clear the wallet state
  const disconnectWallet = () => {
    // Clear the wallet address from state
    setWalletAddress(null);
    
    // Remove from localStorage (both keys for backward compatibility)
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('connectedWallet');
    
    console.log("Wallet connection cleared from useVeWorldWallet");
  };

  return {
    walletAddress,
    isConnexReady,
    isConnecting,
    connectionError,
    connectWallet,
    disconnectWallet,
    isCheckingConnex,
    checkForConnex
  };
}